import { useState, useEffect } from 'react';
import { supabase, BUCKET_PHOTOS, getPublicUrl } from '../lib/supabase';

function extractPhotoStorageKey(feedback) {
  const path = feedback.photoPath || null;
  if (path) return path.startsWith('feedback_photos/') ? path.slice(16) : path;
  const url = feedback.photoUrl;
  return url && typeof url === 'string' && !url.startsWith('http') ? url : null;
}

export function FeedbackPhoto({ feedback, className, alt }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);
  const { photoUrl, photoPath } = feedback || {};

  useEffect(() => {
    setFailed(false);
    if (!photoUrl && !photoPath) {
      setUrl(null);
      setFailed(true);
      return;
    }

    if (photoUrl && photoUrl.startsWith('http')) {
      setUrl(photoUrl);
      return;
    }

    const key = extractPhotoStorageKey({ photoUrl, photoPath });
    if (key) {
      setUrl(getPublicUrl(BUCKET_PHOTOS, key));
    } else {
      setUrl(null);
      setFailed(true);
    }
  }, [photoUrl, photoPath]);

  const handleError = () => {
    const key = extractPhotoStorageKey({ photoUrl, photoPath });
    if (key && url !== getPublicUrl(BUCKET_PHOTOS, key)) {
      setUrl(getPublicUrl(BUCKET_PHOTOS, key));
      return;
    }
    setFailed(true);
  };

  if (failed) {
    return (
      <div className={`flex items-center justify-center bg-sand-100 dark:bg-ink-800 text-ink-300 dark:text-ink-600 ${className || ''}`}>
        <svg className="w-1/2 h-1/2" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
        </svg>
      </div>
    );
  }

  if (!url) {
    return (
      <div className={`flex items-center justify-center bg-sand-50 dark:bg-ink-900 ${className || ''}`}>
        <svg className="w-1/3 h-1/3 animate-pulse text-ink-200 dark:text-ink-700" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 16l4.6-4.6a2 2 0 0 1 2.8 0L16 16m-2-2 1.6-1.6a2 2 0 0 1 2.8 0L20 14M14 8h.01M6 20h12a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2z" />
        </svg>
      </div>
    );
  }

  return <img src={url} alt={alt || ''} onError={handleError} className={className} loading="lazy" />;
}

export default FeedbackPhoto;
