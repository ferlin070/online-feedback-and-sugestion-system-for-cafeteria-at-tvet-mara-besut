import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://afbqctdtqklqpzbsmvdw.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFmYnFjdGR0cWtscXB6YnNtdmR3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI2ODk5NjksImV4cCI6MjEwODI2NTk2OX0.dwykBt5EuVB98Cw0rmtu0YD8uQIm2ljLnAE3iCI1nwQ';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export function createAdminClient() {
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      storageKey: 'tvetmara-admin-create',
    },
  });
}

export const BUCKET_PHOTOS = 'feedback_photos';
export const BUCKET_QR = 'qr_codes';

export function getPublicUrl(bucket, path) {
  if (!path) return null;
  const { data } = supabase.storage.from(bucket).getPublicUrl(path);
  return data?.publicUrl || null;
}

export function mapFeedbackFromRow(e) {
  if (!e) return null;
  return {
    id: e.id,
    category: e.category,
    priority: e.priority,
    description: e.description,
    photoUrl: e.photo_url,
    photoPath: e.photo_path,
    location: e.location,
    locationId: e.location_id,
    cafeteriaId: e.cafeteria_id || 'kafeteria-utama',
    status: e.status,
    submittedAt: e.submitted_at,
    updatedAt: e.updated_at,
    adminNotes: e.admin_notes,
    isAnonymous: e.is_anonymous,
    sentiment: e.sentiment || null,
    urgencyScore: e.urgency_score ?? null,
    aiReason: e.ai_reason || null,
    rating: e.rating ?? null,
    csatRating: e.csat_rating ?? null,
    assigneeUid: e.assignee_uid || null,
    assigneeName: e.assignee_name || null,
    rootCause: e.root_cause || null,
    correctiveAction: e.corrective_action || null,
    issueGroupId: e.issue_group_id ?? null,
  };
}

export function mapLocationFromRow(e) {
  if (!e) return null;
  return {
    id: e.id,
    name: e.name,
    qrCodeUrl: e.qr_code_url,
    active: e.active,
    createdAt: e.created_at,
    cafeteriaId: e.cafeteria_id || 'kafeteria-utama',
  };
}

export function mapCafeteriaFromRow(e) {
  if (!e) return null;
  return {
    id: e.id,
    name: e.name,
    active: e.active,
    createdAt: e.created_at,
  };
}

export function mapAdminFromRow(e) {
  if (!e) return null;
  return {
    uid: e.uid,
    name: e.name,
    email: e.email,
    role: e.role,
    cafeteriaId: e.cafeteria_id || null,
    telegramChatId: e.telegram_chat_id ?? null,
  };
}

export default supabase;
