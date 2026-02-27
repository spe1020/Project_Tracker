-- ============================================
-- Migration 006: Restructure for Project-First Architecture
-- ============================================
-- Changes:
-- 1. Add new columns to projects (dates, planning status)
-- 2. Add new columns to process_steps (facility_type, step_owner, specs, quantity, deliverable)
-- 3. Create legacy project for orphaned trials
-- 4. Migrate orphaned trials to legacy project
-- 5. Change project_id FK from SET NULL to CASCADE, make NOT NULL

-- ─── 1. Projects: Add date columns ──────────────────────

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS start_date DATE,
  ADD COLUMN IF NOT EXISTS target_completion_date DATE,
  ADD COLUMN IF NOT EXISTS actual_completion_date DATE;

-- Add 'planning' to status CHECK constraint
ALTER TABLE projects DROP CONSTRAINT IF EXISTS projects_status_check;
ALTER TABLE projects ADD CONSTRAINT projects_status_check
  CHECK (status IN ('planning', 'active', 'completed', 'on_hold', 'cancelled'));

-- ─── 2. Process Steps: Add new columns ──────────────────

ALTER TABLE process_steps
  ADD COLUMN IF NOT EXISTS facility_type TEXT,
  ADD COLUMN IF NOT EXISTS step_owner TEXT,
  ADD COLUMN IF NOT EXISTS input_specification TEXT,
  ADD COLUMN IF NOT EXISTS output_specification TEXT,
  ADD COLUMN IF NOT EXISTS quantity NUMERIC(12,2),
  ADD COLUMN IF NOT EXISTS quantity_units TEXT,
  ADD COLUMN IF NOT EXISTS deliverable TEXT;

-- ─── 3. Create legacy project for orphaned trials ───────

INSERT INTO projects (project_number, product_name, project_description, status)
SELECT 'PIG-LEGACY-001', 'Legacy Trials', 'Auto-created project for trials that existed before the project-first restructuring.', 'active'
WHERE NOT EXISTS (
  SELECT 1 FROM projects WHERE project_number = 'PIG-LEGACY-001'
);

-- ─── 4. Migrate orphaned trials ─────────────────────────

UPDATE trials
SET project_id = (SELECT id FROM projects WHERE project_number = 'PIG-LEGACY-001')
WHERE project_id IS NULL;

-- ─── 5. Change FK constraint and make NOT NULL ──────────

-- Drop existing FK constraint on project_id
ALTER TABLE trials DROP CONSTRAINT IF EXISTS trials_project_id_fkey;

-- Make project_id NOT NULL
ALTER TABLE trials ALTER COLUMN project_id SET NOT NULL;

-- Re-add FK with CASCADE
ALTER TABLE trials
  ADD CONSTRAINT trials_project_id_fkey
  FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE;
