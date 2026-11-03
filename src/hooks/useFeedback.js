import { useState, useEffect, useCallback } from 'react';
import { supabase, mapFeedbackFromRow } from '../lib/supabase';

const UPDATE_FIELD_MAP = {
  status: 'status',
  priority: 'priority',
  adminNotes: 'admin_notes',
  category: 'category',
  location: 'location',
  locationId: 'location_id',
  assigneeUid: 'assignee_uid',
  assigneeName: 'assignee_name',
  rootCause: 'root_cause',
  correctiveAction: 'corrective_action',
  isAnonymous: 'is_anonymous',
  photoUrl: 'photo_url',
  photoPath: 'photo_path',
};

const ACTION_MAP = {
  status: 'status_changed',
  priority: 'priority_changed',
  adminNotes: 'notes_updated',
  category: 'category_changed',
  assigneeUid: 'assigned',
  rootCause: 'root_cause_set',
  correctiveAction: 'action_set',
};

/**
 * Hook pengurusan data maklum balas (real-time via Supabase).
 */
export function useFeedback(adminUser) {
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFeedbacks = useCallback(async () => {
    const { data, error: err } = await supabase
      .from('feedback')
      .select('*')
      .order('submitted_at', { ascending: false });

    if (err) {
      console.error('Error loading feedbacks:', err);
      setError(err.message);
      setLoading(false);
      return;
    }
    setFeedbacks((data || []).map(mapFeedbackFromRow));
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!adminUser) return;
    setLoading(true);
    fetchFeedbacks();

    const channel = supabase
      .channel('feedback-admin-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'feedback' }, () => {
        fetchFeedbacks();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [adminUser, fetchFeedbacks]);

  const updateFeedback = async (id, updates, actor = adminUser) => {
    const rowUpdates = { updated_at: new Date().toISOString() };
    for (const [key, val] of Object.entries(updates)) {
      const col = UPDATE_FIELD_MAP[key] || key;
      rowUpdates[col] = val;
    }

    const oldItem = feedbacks.find((f) => f.id === id);
    const { error: updateError } = await supabase
      .from('feedback')
      .update(rowUpdates)
      .eq('id', id);

    if (updateError) throw updateError;

    // Local optimistic update
    setFeedbacks((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...updates, updatedAt: rowUpdates.updated_at } : f))
    );

    // Audit trail in feedback_events
    try {
      const events = Object.entries(updates)
        .filter(([k]) => ACTION_MAP[k] && oldItem && String(oldItem[k] ?? '') !== String(updates[k] ?? ''))
        .map(([k, val]) => ({
          feedback_id: id,
          actor_uid: actor?.uid || null,
          actor_name: actor?.name || actor?.email || null,
          action: ACTION_MAP[k],
          field: UPDATE_FIELD_MAP[k] || k,
          old_value: oldItem[k] === null || oldItem[k] === undefined ? null : String(oldItem[k]),
          new_value: val === null || val === undefined ? null : String(val),
        }));

      if (events.length) {
        await supabase.from('feedback_events').insert(events);
      }
    } catch (e) {
      console.warn('Failed to record feedback event:', e);
    }
  };

  return { feedbacks, loading, error, updateFeedback };
}

export default useFeedback;
