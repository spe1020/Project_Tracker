-- Trial suppliers table
CREATE TABLE trial_suppliers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  supplier_name TEXT,
  contact_name TEXT,
  role TEXT,
  site_location TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index on foreign key
CREATE INDEX idx_trial_suppliers_trial_id ON trial_suppliers(trial_id);

-- RLS policies (matching existing tables)
ALTER TABLE trial_suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on trial_suppliers"
  ON trial_suppliers
  FOR ALL
  USING (true)
  WITH CHECK (true);
