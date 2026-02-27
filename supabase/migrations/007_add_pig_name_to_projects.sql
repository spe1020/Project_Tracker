-- ============================================
-- Migration 007: Add pig_name to projects
-- ============================================

ALTER TABLE projects
  ADD COLUMN IF NOT EXISTS pig_name TEXT;
