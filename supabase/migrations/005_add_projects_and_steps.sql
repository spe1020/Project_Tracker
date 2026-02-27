-- ============================================
-- Migration 005: Add Projects & Process Steps
-- ============================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_number TEXT NOT NULL UNIQUE,
  product_name TEXT NOT NULL,
  project_description TEXT,
  project_lead TEXT,
  department TEXT,
  status TEXT NOT NULL DEFAULT 'active'
    CHECK (status IN ('active', 'completed', 'on_hold', 'cancelled')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Process steps table
CREATE TABLE IF NOT EXISTS process_steps (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  step_number INTEGER NOT NULL,
  step_name TEXT NOT NULL,
  step_type TEXT NOT NULL DEFAULT 'material'
    CHECK (step_type IN ('material', 'service')),
  -- Facility
  facility_name TEXT,
  facility_location TEXT,
  -- Date tracking
  scheduled_start_date DATE,
  scheduled_end_date DATE,
  actual_start_date DATE,
  actual_end_date DATE,
  delay_reason TEXT,
  -- Material flow fields (used when step_type = 'material')
  material_input TEXT,
  material_output TEXT,
  -- Service fields (used when step_type = 'service')
  service_provider TEXT,
  service_description TEXT,
  -- Cost tracking
  estimated_cost NUMERIC(12,2),
  actual_cost NUMERIC(12,2),
  -- Notes
  lessons_learned TEXT,
  notes TEXT,
  -- Status
  status TEXT NOT NULL DEFAULT 'not_started'
    CHECK (status IN ('not_started', 'in_progress', 'completed', 'delayed', 'blocked')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(project_id, step_number)
);

-- Add project/step FKs to trials (nullable — trials can exist without a project)
ALTER TABLE trials
  ADD COLUMN IF NOT EXISTS project_id UUID REFERENCES projects(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS process_step_id UUID REFERENCES process_steps(id) ON DELETE SET NULL;

-- Indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);
CREATE INDEX IF NOT EXISTS idx_process_steps_project_id ON process_steps(project_id);
CREATE INDEX IF NOT EXISTS idx_process_steps_status ON process_steps(status);
CREATE INDEX IF NOT EXISTS idx_trials_project_id ON trials(project_id);
CREATE INDEX IF NOT EXISTS idx_trials_process_step_id ON trials(process_step_id);

-- Updated-at triggers (reuse existing function)
CREATE TRIGGER set_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER set_process_steps_updated_at
  BEFORE UPDATE ON process_steps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS (matching existing permissive pattern)
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE process_steps ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow all operations on projects" ON projects
  FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all operations on process_steps" ON process_steps
  FOR ALL USING (true) WITH CHECK (true);
