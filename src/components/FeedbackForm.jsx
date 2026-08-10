import { useState, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase';
import { validateDescription } from '../utils';
import { detectCategory, detectPriority } from '../lib/autoTag';

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
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Sila pilih fail imej sahaja (PNG, JPG, JPEG).');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError('Saiz imej mestilah kurang daripada 5MB.');
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
    setSubmitting(true);
    setError(null);
    try {
      const feedbackColRef = collection(db, 'feedback');
      const newFeedbackDocRef = doc(feedbackColRef);
      const feedbackId = newFeedbackDocRef.id;

      let uploadedPhotoUrl = null;
      if (photo) {
        const fileExtension = photo.name.split('.').pop();
        const storagePath = `feedback_photos/${feedbackId}.${fileExtension}`;
        const storageRef = ref(storage, storagePath);
        await uploadBytes(storageRef, photo, { contentType: photo.type });
        uploadedPhotoUrl = await getDownloadURL(storageRef);
      }

      const detectedCat = detectCategory(formData.description, formData.category);
      const detectedPrio = detectPriority(formData.description, 'medium');

      const feedbackData = {
        id: feedbackId,
        category: detectedCat,
        priority: detectedPrio,
        description: formData.description.trim(),
        photoUrl: uploadedPhotoUrl,
        location: formData.location.trim() || null,
        locationId: formData.locationId || null,
        status: 'new',
        submittedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        adminNotes: null,
        isAnonymous: formData.isAnonymous,
      };

      await setDoc(newFeedbackDocRef, feedbackData);
      onSuccess(feedbackId);
    } catch (err) {
      console.error('Error submitting feedback:', err);
      setError(`Gagal menghantar maklum balas: ${err.message || 'Sila cuba lagi.'}`);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-lg w-full glass-card p-5 sm:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-5 my-4 sm:my-6 overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800/60 pb-4">
        <h2 className="text-xl sm:text-2xl font-bold font-display text-slate-900 dark:text-white">
          {t('form.title')}
        </h2>
        <button onClick={onBack} className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition-colors">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-1.5">
          <label htmlFor="category" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
            {t('form.category')}
          </label>
          <select
            id="category"
            name="category"
            value={formData.category}
            onChange={handleInputChange}
            className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 text-base cursor-pointer bg-white dark:bg-slate-900"
          >
            <option value="Umum" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Umum')}</option>
            <option value="Makanan" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Makanan')}</option>
            <option value="Kebersihan" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Kebersihan')}</option>
            <option value="Kemudahan" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Kemudahan')}</option>
            <option value="Perkhidmatan" className="bg-white text-slate-900 dark:bg-slate-900 dark:text-slate-100">{t('categories.Perkhidmatan')}</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <div className="flex justify-between items-center">
            <label htmlFor="description" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('form.description')} <span className="text-sky-500">*</span>
            </label>
            <span className={`text-xs ${formData.description.length > 500 ? 'text-red-500 dark:text-red-400' : 'text-slate-500'}`}>
              {formData.description.length}/500
            </span>
          </div>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            required
            rows="4"
            maxLength="500"
            autoCapitalize="sentences"
            autoCorrect="on"
            placeholder={t('form.description_placeholder')}
            className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-sky-500 text-base transition-colors resize-y min-h-[120px]"
          />
        </div>

        {currentLocation ? (
          <div className="p-4 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-600 dark:text-sky-400 text-sm font-medium flex items-center gap-3">
            <svg className="w-5 h-5 animate-pulse shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <div>
              <span className="block text-[10px] uppercase text-slate-500 dark:text-slate-400 font-semibold tracking-wider">{t('locations.prefilled_info')}</span>
              <span className="text-base font-bold text-slate-900 dark:text-white">{currentLocation.name}</span>
            </div>
          </div>
        ) : (
          <div className="space-y-1.5">
            <label htmlFor="location" className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider">
              {t('form.location')}
            </label>
            <input
              id="location"
              name="location"
              type="text"
              value={formData.location}
              onChange={handleInputChange}
              placeholder={t('form.location_placeholder')}
              className="w-full px-4 py-3 rounded-xl glass-input text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:ring-sky-500 text-base"
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
            {t('form.photo')}
          </label>
          {!photoPreview ? (
            <label htmlFor="photo" className="border-2 border-dashed border-slate-300 dark:border-slate-800 hover:border-sky-500/50 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition-colors bg-slate-100/50 dark:bg-slate-950/20">
              <svg className="w-8 h-8 text-slate-400 dark:text-slate-500 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <span className="text-xs text-slate-500 dark:text-slate-400">{t('form.photo_select', 'Klik untuk pilih gambar')}</span>
            </label>
          ) : (
            <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 bg-slate-100/80 dark:bg-slate-950/50 p-2 flex items-center gap-4">
              <img src={photoPreview} alt="Preview" className="w-16 h-16 object-cover rounded-lg border border-slate-200 dark:border-slate-800" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-slate-700 dark:text-slate-300 truncate">{photo.name}</p>
                <p className="text-[10px] text-slate-500">{(photo.size / (1024 * 1024)).toFixed(2)} MB</p>
              </div>
              <button type="button" onClick={handleRemovePhoto} className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800/80 rounded-lg text-red-500 dark:text-red-400 hover:text-red-600 dark:hover:text-red-300 transition-colors" title={t('form.photo_remove')}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </button>
            </div>
          )}
          <input ref={fileInputRef} id="photo" name="photo" type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <input id="isAnonymous" name="isAnonymous" type="checkbox" checked={formData.isAnonymous} onChange={handleInputChange} className="w-4 h-4 rounded border-slate-300 dark:border-slate-800 text-sky-500 focus:ring-sky-500 focus:ring-offset-white dark:focus:ring-offset-slate-950 bg-white dark:bg-slate-950" />
          <label htmlFor="isAnonymous" className="text-sm text-slate-600 dark:text-slate-400 cursor-pointer select-none">
            {t('form.anonymous')}
          </label>
        </div>

        <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-900">
          <button type="button" onClick={onBack} className="flex-1 py-3 px-4 bg-slate-200 hover:bg-slate-300 dark:bg-slate-900 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl transition-colors border border-slate-300 dark:border-slate-800 font-medium">
            {t('form.back_btn')}
          </button>
          <button type="submit" disabled={submitting} className="flex-1 btn-primary flex justify-center items-center gap-2">
            {submitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                {t('form.submitting')}
              </>
            ) : t('form.submit_btn')}
          </button>
        </div>
      </form>
    </div>
  );
}
