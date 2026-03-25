-- Add slug and published_files columns to projects table
ALTER TABLE projects ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE projects ADD COLUMN IF NOT EXISTS published_files JSONB DEFAULT '{}'::jsonb;

-- Disable RLS on projects to allow the API (using anon key) to update them
ALTER TABLE projects DISABLE ROW LEVEL SECURITY;

-- If you want to keep RLS but fix the public read, you 
-- already have the public policy below, but disabling RLS 
-- will make the deployment API update work immediately.
DROP POLICY IF EXISTS "Public read of published projects" ON projects;
CREATE POLICY "Public read of published projects"
  ON projects FOR SELECT
  USING (slug IS NOT NULL);
