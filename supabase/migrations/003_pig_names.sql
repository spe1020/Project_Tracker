-- Add pig_name column to trials table
ALTER TABLE trials ADD COLUMN pig_name TEXT;

-- Index for searching by pig name
CREATE INDEX idx_trials_pig_name ON trials(pig_name);
