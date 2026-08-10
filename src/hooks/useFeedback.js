import { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

/**
 * Hook pengurusan data maklum balas (real-time).
 * Hanya melanggan jika adminUser wujud.
 */
export function useFeedback(adminUser) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!adminUser) return;
    setLoading(true);
    const feedbackColRef = collection(db, 'feedback');
    const q = query(feedbackColRef, orderBy('submittedAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = [];
      snapshot.forEach((d) => {
        docs.push({ id: d.id, ...d.data() });
      });
      setFeedbacks(docs);
      setLoading(false);
    }, (err) => {
      console.error('Error loading feedbacks:', err);
      setError(err.message);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [adminUser]);

  const updateFeedback = async (id, updates) => {
    const ref = doc(db, 'feedback', id);
    await updateDoc(ref, { ...updates, updatedAt: serverTimestamp() });
  };

  return { feedbacks, loading, error, updateFeedback };
}
