-- Skema Pangkalan Data Supabase untuk Sistem Aduan TVETMARA Besut
-- Project Ref: afbqctdtqklqpzbsmvdw

-- 1. Lokasi / Kafeteria
CREATE TABLE IF NOT EXISTS cafeterias (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS locations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  qr_code_url TEXT,
  active BOOLEAN DEFAULT TRUE,
  cafeteria_id TEXT REFERENCES cafeterias(id) DEFAULT 'kafeteria-utama',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Pentadbir (Admins)
CREATE TABLE IF NOT EXISTS admins (
  uid TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  role TEXT DEFAULT 'admin', -- 'admin' | 'superadmin'
  cafeteria_id TEXT REFERENCES cafeterias(id),
  telegram_chat_id BIGINT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Kumpulan Isu
CREATE TABLE IF NOT EXISTS issue_groups (
  id SERIAL PRIMARY KEY,
  label TEXT NOT NULL,
  category TEXT,
  location TEXT,
  location_id TEXT REFERENCES locations(id),
  cafeteria_id TEXT REFERENCES cafeterias(id),
  status TEXT DEFAULT 'open',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Maklum Balas / Aduan (Feedback)
CREATE TABLE IF NOT EXISTS feedback (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  priority TEXT DEFAULT 'medium',
  description TEXT NOT NULL,
  photo_url TEXT,
  photo_path TEXT,
  location TEXT,
  location_id TEXT REFERENCES locations(id),
  cafeteria_id TEXT REFERENCES cafeterias(id) DEFAULT 'kafeteria-utama',
  status TEXT DEFAULT 'new', -- 'new' | 'under_review' | 'resolved' | 'dismissed'
  admin_notes TEXT,
  is_anonymous BOOLEAN DEFAULT FALSE,
  sentiment TEXT,
  urgency_score INTEGER,
  ai_reason TEXT,
  sentiment_at TIMESTAMPTZ,
  rating INTEGER,
  csat_rating INTEGER,
  csat_at TIMESTAMPTZ,
  assignee_uid TEXT REFERENCES admins(uid),
  assignee_name TEXT,
  root_cause TEXT,
  corrective_action TEXT,
  issue_group_id INTEGER REFERENCES issue_groups(id),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Sejarah Perubahan (Audit Trail)
CREATE TABLE IF NOT EXISTS feedback_events (
  id SERIAL PRIMARY KEY,
  feedback_id TEXT REFERENCES feedback(id) ON DELETE CASCADE,
  actor_uid TEXT,
  actor_name TEXT,
  action TEXT NOT NULL,
  field TEXT,
  old_value TEXT,
  new_value TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Mesej Maklum Balas (Public Chat / Replies)
CREATE TABLE IF NOT EXISTS feedback_messages (
  id SERIAL PRIMARY KEY,
  feedback_id TEXT REFERENCES feedback(id) ON DELETE CASCADE,
  sender TEXT NOT NULL, -- 'admin' | 'user'
  body TEXT NOT NULL,
  author_name TEXT,
  delivered BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Senarai Semak (Checklists)
CREATE TABLE IF NOT EXISTS checklists (
  id SERIAL PRIMARY KEY,
  check_date DATE NOT NULL,
  cafeteria_id TEXT REFERENCES cafeterias(id),
  items JSONB,
  checked_by TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(check_date, cafeteria_id)
);

-- Storage Buckets:
-- - feedback_photos (Public)
-- - qr_codes (Public)
