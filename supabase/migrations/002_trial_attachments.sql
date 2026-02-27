-- Trial attachments table
CREATE TABLE trial_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  file_size BIGINT,
  description TEXT,
  storage_path TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on foreign key
CREATE INDEX idx_trial_attachments_trial_id ON trial_attachments(trial_id);

-- RLS policies (matching existing tables)
ALTER TABLE trial_attachments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on trial_attachments"
  ON trial_attachments
  FOR ALL
  USING (true)
  WITH CHECK (true);
