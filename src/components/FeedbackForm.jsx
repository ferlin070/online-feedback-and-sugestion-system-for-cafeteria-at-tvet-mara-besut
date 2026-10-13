import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { validateDescription } from '../utils';
import { detectCategory, detectPriority } from '../lib/autoTag';

const CATEGORIES = ['Umum', 'Makanan', 'Kebersihan', 'Kemudahan', 'Perkhidmatan'];

const SUBMIT_COOLDOWN_MS = 30 * 1000;
const RECENT_WINDOW_MS = 5 * 60 * 1000;
const LOCAL_SUBMIT_LIMIT = 5;

function getRecentSubmitCount() {
  try {
    const raw = localStorage.getItem('fb_submissions');
    if (!raw) return [];
    const arr = JSON.parse(raw);
    if (!Array.isArray(arr)) return [];
    const cutoff = Date.now() - RECENT_WINDOW_MS;
    const recent = arr.filter(ts => typeof ts === 'number' && ts >= cutoff);
    if (recent.length !== arr.length) localStorage.setItem('fb_submissions', JSON.stringify(recent));
    return recent;
  } catch {
    return [];
  }
}

function recordSubmit() {
  try {
    const recent = getRecentSubmitCount();
    recent.push(Date.now());
    localStorage.setItem('fb_submissions', JSON.stringify(recent));
  } catch {
    // ignore storage errors (e.g. private mode)
  }
}

export function FeedbackForm({ currentLocation, onBack, onSuccess, initialError }) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    category: 'Umum',
    description: '',
    location: currentLocation?.name || '',
    locationId: currentLocation?.id || null,
    isAnonymous: false,
  });
  const [photo, setPhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(initialError || null);
  const fileInputRef = useRef(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError(t('form.err_image_only', 'Sila pilih fail imej sahaja (PNG, JPG, JPEG).'));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError(t('form.err_image_size', 'Saiz imej mestilah kurang daripada 5MB.'));
      return;
    }
    setError(null);
    setPhoto(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleRemovePhoto = () => {
    setPhoto(null);
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validation = validateDescription(formData.description, t);
    if (!validation.isValid) {
      setError(validation.error);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    const localRecent = getRecentSubmitCount();
    if (localRecent.length > 0) {
      const last = localRecent[localRecent.length - 1];
      const elapsed = Date.now() - last;
      if (elapsed < SUBMIT_COOLDOWN_MS) {
        setError(t('form.err_cooldown', 'Sila tunggu sebentar sebelum hantar lagi.'));
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }
    if (localRecent.length >= LOCAL_SUBMIT_LIMIT) {
      setError(t('form.err_rate_limit', 'Terlalu banyak aduan baru-baru ini. Sila cuba sebentar lagi.'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const feedbackColRef = collection(db, 'feedback');
      const newRef = doc(feedbackColRef);
      const feedbackId = newRef.id;

      let uploadedPhotoUrl = null;
      let uploadedPhotoPath = null;
      if (photo) {
        const ext = photo.name.split('.').pop();
        const storagePath = `feedback_photos/${feedbackId}.${ext}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, photo, { contentType: photo.type });
        uploadedPhotoUrl = await getDownloadURL(storageRef);
        uploadedPhotoPath = storagePath;
      }

      const detectedCat = detectCategory(formData.description, formData.category);
      const detectedPrio = detectPriority(formData.description, 'medium');

      await setDoc(newRef, {
        id: feedbackId,
        category: detectedCat,
        priority: detectedPrio,
        description: formData.description.trim(),
        photoUrl: uploadedPhotoUrl,
        photoPath: uploadedPhotoPath,
        location: formData.location.trim() || null,
        locationId: formData.locationId || null,
        status: 'new',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminNotes: null,
        isAnonymous: formData.isAnonymous,
      });
      onSuccess(feedbackId);
      recordSubmit();
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(`${t('form.err_submit', 'Gagal menghantar maklum balas')}: ${err.message || ''}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="w-full max-w-xl mx-auto py-6 sm:py-10 px-1">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[12px] text-ink-400 hover:text-mara-blue-600 dark:hover:text-mara-blue-400 transition-colors mb-4 cursor-pointer"
      >
        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 12H5M11 18l-6-6 6-6" />
        </svg>
        {t('form.back_btn')}
      </button>

      <div className="mb-6">
        <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-mara-blue-500">
          {t('form.eyebrow', 'Borang Baharu')}
        </span>
        <h1 className="font-display text-3xl sm:text-4xl tracking-tight text-[var(--heading-color)] mt-1">
          {t('form.title')}
        </h1>
        <p className="text-[14px] text-ink-500 dark:text-ink-400 mt-2 max-w-md leading-relaxed">
          {t('form.lede', 'Isi ikut kepintaran anda. Semua yang anda tulis akan dibaca oleh pengurusan kafeteria.')}
        </p>
      </div>

      <div className="card-warm p-5 sm:p-7">
        {error && (
          <div role="alert" className="mb-5 flex items-start gap-2.5 px-4 py-3 rounded-md border border-red-200 bg-red-50 text-red-700 text-[13px] dark:bg-red-500/10 dark:border-red-500/30 dark:text-red-400">
            <svg className="w-4 h-4 mt-0.5 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="10" />
              <path strokeLinecap="round" d="M12 8v4M12 16h.01" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {currentLocation && (
          <div className="mb-5 flex items-start gap-3 px-4 py-3 rounded-md bg-mara-blue-50 dark:bg-mara-blue-900/30 border border-mara-blue-200 dark:border-mara-blue-800">
            <svg className="w-4 h-4 mt-0.5 text-mara-blue-500 shrink-0" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 21s-7-5.2-7-11a7 7 0 1 1 14 0c0 5.8-7 11-7 11z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            <div>
              <p className="text-[10px] font-mono uppercase tracking-wider text-ink-400">
                {t('locations.prefilled_info')}
              </p>
              <p className="text-[15px] font-semibold text-[var(--heading-color)] mt-0.5">
                {currentLocation.name}
              </p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="category" className="block text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1.5">
              {t('form.category')}
            </label>
            <select
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              className="input-warm w-full px-4 py-2.5 text-sm cursor-pointer"
            >
              {CATEGORIES.map(c => (
                <option key={c} value={c}>{t(`categories.${c}`)}</option>
              ))}
            </select>
          </div>

          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <label htmlFor="description" className="text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400">
                {t('form.description')} <span className="text-mara-blue-500 normal-case">*</span>
              </label>
              <span className={`text-[11px] font-mono ${formData.description.length > 500 ? 'text-red-500' : 'text-ink-400'}`}>
                {formData.description.length}/500
              </span>
            </div>
            <textarea
              id="description"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              required
              rows="5"
              maxLength="500"
              placeholder={t('form.description_placeholder')}
              className="input-warm w-full px-4 py-3 text-[15px] leading-relaxed resize-y min-h-[140px]"
            />
          </div>

          {!currentLocation && (
            <div>
              <label htmlFor="location" className="block text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1.5">
                {t('form.location')}
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleInputChange}
                placeholder={t('form.location_placeholder')}
                className="input-warm w-full px-4 py-2.5 text-sm"
              />
            </div>
          )}

          <div>
            <label className="block text-[11px] font-semibold uppercase tracking-wider text-ink-500 dark:text-ink-400 mb-1.5">
              {t('form.photo')}
            </label>
            {!photoPreview ? (
              <label
                htmlFor="photo"
                className="flex flex-col items-center justify-center gap-2 py-7 cursor-pointer rounded-md border border-dashed border-sand-400 dark:border-ink-700 hover:border-mara-blue-400 hover:bg-mara-blue-50/40 dark:hover:bg-mara-blue-900/20 transition-colors"
              >
                <svg className="w-7 h-7 text-ink-300 dark:text-ink-600" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
                </svg>
                <span className="text-[12px] text-ink-400">{t('form.photo_select', 'Klik untuk pilih gambar')}</span>
              </label>
            ) : (
              <div className="flex items-center gap-3 p-3 rounded-md border border-[var(--border-color)] bg-sand-50 dark:bg-ink-900/40">
                <img src={photoPreview} alt="Pratonton" className="w-14 h-14 object-cover rounded-md border border-[var(--border-color)]" />
                <div className="flex-1 min-w-0">
                  <p className="text-[12px] font-medium text-[var(--text-color)] truncate">{photo.name}</p>
                  <p className="text-[10px] font-mono text-ink-400">{(photo.size / 1024).toFixed(1)} KB</p>
                </div>
                <button
                  type="button"
                  onClick={handleRemovePhoto}
                  className="p-1.5 rounded-md text-ink-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors cursor-pointer"
                  aria-label={t('form.photo_remove')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 6l12 12M6 18L18 6" />
                  </svg>
                </button>
              </div>
            )}
            <input ref={fileInputRef} id="photo" name="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer select-none pt-1">
            <input
              type="checkbox"
              name="isAnonymous"
              checked={formData.isAnonymous}
              onChange={handleInputChange}
              className="mt-0.5 w-4 h-4 rounded border-sand-400 text-mara-blue-500 focus:ring-mara-blue-400 cursor-pointer"
            />
            <span className="text-[13px] text-ink-600 dark:text-ink-300 leading-snug">
              {t('form.anonymous_hint', 'Hantar tanpa nama. Identiti anda tidak akan direkodkan.')}
            </span>
          </label>

          <div className="pt-3 border-t border-[var(--border-color)]">
            <button
              type="submit"
              disabled={submitting}
              className="btn-clay w-full py-3 text-sm inline-flex justify-center items-center gap-2 cursor-pointer disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.4 0 0 5.4 0 12h4z" />
                  </svg>
                  {t('form.submitting')}
                </>
              ) : (
                <>
                  {t('form.submit_btn')}
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.2" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </section>
  );
}
