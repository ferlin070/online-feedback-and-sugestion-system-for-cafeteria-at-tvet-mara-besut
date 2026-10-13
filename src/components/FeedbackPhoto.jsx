import { useState, useEffect } from 'react';
import { getDownloadURL, ref } from 'firebase/storage';
import { storage } from '../firebase';

function extractStoragePath(url) {
  if (!url || typeof url !== 'string') return null;
  if (url.startsWith('feedback_photos/') || url.startsWith('qr_codes/')) return url;
  const marker = '/o/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  const path = url.substring(idx + marker.length).split('?')[0];
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
}

export function FeedbackPhoto({ feedback, className, alt }) {
  const [url, setUrl] = useState(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setFailed(false);
    setUrl(null);

    const path = feedback.photoPath || extractStoragePath(feedback.photoUrl);

    async function resolve() {
      if (!feedback.photoUrl && !path) {
        setFailed(true);
        return;
      }
      if (feedback.photoUrl && feedback.photoUrl.startsWith('http')) {
        setUrl(feedback.photoUrl);
        return;
      }
      if (path) {
        try {
          const fresh = await getDownloadURL(ref(storage, path));
          if (!cancelled) setUrl(fresh);
        } catch {
          if (!cancelled) setFailed(true);
        }
      } else {
        setFailed(true);
      }
    }

    resolve();
    return () => { cancelled = true; };
  }, [feedback.photoUrl, feedback.photoPath]);

  const handleError = async () => {
    const path = feedback.photoPath || extractStoragePath(feedback.photoUrl);
    if (path) {
      try {
        const fresh = await getDownloadURL(ref(storage, path));
        setUrl(fresh);
        return;
      } catch {
        // fall through
      }
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
