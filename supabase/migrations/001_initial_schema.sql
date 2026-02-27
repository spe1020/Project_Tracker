-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Trials table
CREATE TABLE trials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_number TEXT UNIQUE NOT NULL,
  date DATE,
  department TEXT,
  lead_name TEXT,
  product_process TEXT,
  duration TEXT,
  production_line TEXT,
  team_members TEXT,
  primary_goal TEXT,
  success_criteria TEXT,
  results_vs_objectives TEXT,
  key_learnings TEXT,
  recommendations TEXT,
  recommendation_status TEXT CHECK (recommendation_status IN ('proceed', 'additional_trials', 'discontinue')),
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'completed')),
  estimated_total_cost DECIMAL(10,2),
  actual_total_cost DECIMAL(10,2),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trial materials table
CREATE TABLE trial_materials (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  material_name TEXT,
  specification TEXT,
  supplier_lot TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trial parameters table
CREATE TABLE trial_parameters (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  parameter_name TEXT,
  target_value TEXT,
  actual_value TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trial costs table
CREATE TABLE trial_costs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  trial_id UUID NOT NULL REFERENCES trials(id) ON DELETE CASCADE,
  category TEXT CHECK (category IN ('materials', 'labor', 'downtime')),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  notes TEXT,
  order_index INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes on foreign keys
CREATE INDEX idx_trial_materials_trial_id ON trial_materials(trial_id);
CREATE INDEX idx_trial_parameters_trial_id ON trial_parameters(trial_id);
CREATE INDEX idx_trial_costs_trial_id ON trial_costs(trial_id);

-- Index on trials status for filtering
CREATE INDEX idx_trials_status ON trials(status);
CREATE INDEX idx_trials_department ON trials(department);
CREATE INDEX idx_trials_date ON trials(date);

-- Updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to trials table
CREATE TRIGGER update_trials_updated_at
  BEFORE UPDATE ON trials
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
