-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nickname VARCHAR(15) NOT NULL UNIQUE,
  school_code VARCHAR(50) NOT NULL,
  school_name VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL, -- 'sec_1', 'sec_2', 'sec_3', 'sec_4', 'jc_1', 'jc_2'
  avatar_seed VARCHAR(50), -- For generating consistent avatar
  opted_in_cohort BOOLEAN DEFAULT true, -- Share data with cohort
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_users_school_code ON users(school_code);
CREATE INDEX idx_users_level ON users(level);
CREATE INDEX idx_users_school_level ON users(school_code, level);

-- ============================================
-- GRADES TABLE
-- ============================================
CREATE TABLE grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL, -- 'mathematics', 'physics', 'chemistry', etc.
  assessment_name VARCHAR(100) NOT NULL,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0), -- e.g., 85.50
  max_score DECIMAL(5,2) NOT NULL DEFAULT 100 CHECK (max_score > 0),
  percentage DECIMAL(5,2) GENERATED ALWAYS AS (score / max_score * 100) STORED,
  weight DECIMAL(5,2) DEFAULT 1.0 CHECK (weight > 0), -- For weighted averages
  assessment_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_grades_user_id ON grades(user_id);
CREATE INDEX idx_grades_subject ON grades(subject);
CREATE INDEX idx_grades_user_subject ON grades(user_id, subject);
CREATE INDEX idx_grades_date ON grades(assessment_date);

-- ============================================
-- USER_STATS TABLE (Cached aggregated stats)
-- ============================================
CREATE TABLE user_stats (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  overall_average DECIMAL(5,2),
  total_grades INTEGER DEFAULT 0,
  subjects_count INTEGER DEFAULT 0,
  best_subject VARCHAR(50),
  best_subject_average DECIMAL(5,2),
  most_improved_subject VARCHAR(50),
  improvement_amount DECIMAL(5,2),
  consistency_score DECIMAL(3,2), -- 0.00 to 10.00
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ============================================
-- SUBJECT_STATS TABLE (Per-subject stats)
-- ============================================
CREATE TABLE subject_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(50) NOT NULL,
  average DECIMAL(5,2),
  grade_count INTEGER DEFAULT 0,
  highest_score DECIMAL(5,2),
  lowest_score DECIMAL(5,2),
  trend VARCHAR(10), -- 'up', 'down', 'stable'
  trend_amount DECIMAL(5,2), -- Points changed
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, subject)
);

CREATE INDEX idx_subject_stats_user ON subject_stats(user_id);

-- ============================================
-- PERCENTILE_CACHE TABLE (For performance)
-- ============================================
CREATE TABLE percentile_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scope VARCHAR(20) NOT NULL, -- 'school', 'national'
  subject VARCHAR(50), -- NULL for overall, specific for subject
  percentile DECIMAL(5,2) NOT NULL,
  rank INTEGER,
  total_users INTEGER,
  average DECIMAL(5,2),
  cohort_average DECIMAL(5,2),
  calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, scope, subject)
);

CREATE INDEX idx_percentile_user_scope ON percentile_cache(user_id, scope);

-- ============================================
-- SCHOOL_STATS TABLE (School-level aggregates)
-- ============================================
CREATE TABLE school_stats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  school_code VARCHAR(50) NOT NULL,
  school_name VARCHAR(100) NOT NULL,
  level VARCHAR(20) NOT NULL,
  total_students INTEGER DEFAULT 0,
  average_overall DECIMAL(5,2),
  national_rank INTEGER,
  best_subject VARCHAR(50),
  best_subject_average DECIMAL(5,2),
  most_improved_subject VARCHAR(50),
  improvement_amount DECIMAL(5,2),
  last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(school_code, level)
);

CREATE INDEX idx_school_stats_code ON school_stats(school_code);
CREATE INDEX idx_school_stats_rank ON school_stats(national_rank);

-- ============================================
-- ACTIVITY_FEED TABLE (For real-time updates)
-- ============================================
CREATE TABLE activity_feed (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  activity_type VARCHAR(50) NOT NULL, -- 'new_user', 'percentile_milestone', 'rank_change'
  school_code VARCHAR(50),
  level VARCHAR(20),
  anonymous_label VARCHAR(100), -- e.g., "Someone from RI"
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activity_school ON activity_feed(school_code);
CREATE INDEX idx_activity_created ON activity_feed(created_at DESC);

-- Auto-delete old activity (keep last 7 days)
CREATE OR REPLACE FUNCTION cleanup_old_activity()
RETURNS void AS $$
BEGIN
  DELETE FROM activity_feed WHERE created_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- TRIGGERS
-- ============================================

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER grades_updated_at BEFORE UPDATE ON grades
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Trigger to recalculate stats when grade is added/updated/deleted
CREATE OR REPLACE FUNCTION recalculate_user_stats()
RETURNS TRIGGER AS $$
BEGIN
  -- This will be called by application code or edge function
  -- Just log that recalculation is needed
  PERFORM pg_notify('recalculate_stats', NEW.user_id::text);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER grades_changed AFTER INSERT OR UPDATE OR DELETE ON grades
  FOR EACH ROW EXECUTE FUNCTION recalculate_user_stats();

-- ============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE subject_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE percentile_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed ENABLE ROW LEVEL SECURITY;

-- Users can only see and edit their own data
CREATE POLICY "Users can view own profile" ON users
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update own profile" ON users
  FOR UPDATE USING (id = auth.uid());

-- Grades policies
CREATE POLICY "Users can view own grades" ON grades
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert own grades" ON grades
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update own grades" ON grades
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete own grades" ON grades
  FOR DELETE USING (user_id = auth.uid());

-- Stats are readable by owner only
CREATE POLICY "Users can view own stats" ON user_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own subject stats" ON subject_stats
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can view own percentile" ON percentile_cache
  FOR SELECT USING (user_id = auth.uid());

-- School stats and activity feed are public (anonymized)
CREATE POLICY "School stats are public" ON school_stats
  FOR SELECT USING (true);

CREATE POLICY "Activity feed is public" ON activity_feed
  FOR SELECT USING (true);

-- ============================================
-- HELPER FUNCTIONS
-- ============================================

-- Function to calculate overall average for a user
CREATE OR REPLACE FUNCTION calculate_user_average(p_user_id UUID)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  avg_score DECIMAL(5,2);
BEGIN
  SELECT AVG(percentage) INTO avg_score
  FROM grades
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to calculate subject average
CREATE OR REPLACE FUNCTION calculate_subject_average(p_user_id UUID, p_subject VARCHAR)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  avg_score DECIMAL(5,2);
BEGIN
  SELECT AVG(percentage) INTO avg_score
  FROM grades
  WHERE user_id = p_user_id AND subject = p_subject;
  
  RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql;

-- Function to get percentile rank
CREATE OR REPLACE FUNCTION calculate_percentile(
  p_user_id UUID,
  p_school_code VARCHAR DEFAULT NULL,
  p_subject VARCHAR DEFAULT NULL
)
RETURNS TABLE(percentile DECIMAL(5,2), rank INTEGER, total INTEGER) AS $$
DECLARE
  user_avg DECIMAL(5,2);
  better_count INTEGER;
  total_count INTEGER;
BEGIN
  -- Get user's average
  IF p_subject IS NULL THEN
    SELECT calculate_user_average(p_user_id) INTO user_avg;
  ELSE
    SELECT calculate_subject_average(p_user_id, p_subject) INTO user_avg;
  END IF;

  -- Count users with opted_in_cohort = true
  -- If school_code provided, filter by school
  IF p_school_code IS NOT NULL THEN
    -- School scope
    IF p_subject IS NULL THEN
      SELECT COUNT(*) INTO total_count
      FROM users u
      WHERE u.school_code = p_school_code 
        AND u.opted_in_cohort = true
        AND EXISTS (SELECT 1 FROM grades g WHERE g.user_id = u.id);

      SELECT COUNT(*) INTO better_count
      FROM users u
      WHERE u.school_code = p_school_code
        AND u.opted_in_cohort = true
        AND calculate_user_average(u.id) < user_avg;
    ELSE
      -- Subject-specific school scope
      SELECT COUNT(DISTINCT u.id) INTO total_count
      FROM users u
      JOIN grades g ON g.user_id = u.id
      WHERE u.school_code = p_school_code
        AND u.opted_in_cohort = true
        AND g.subject = p_subject;

      SELECT COUNT(DISTINCT u.id) INTO better_count
      FROM users u
      WHERE u.school_code = p_school_code
        AND u.opted_in_cohort = true
        AND calculate_subject_average(u.id, p_subject) < user_avg;
    END IF;
  ELSE
    -- National scope
    IF p_subject IS NULL THEN
      SELECT COUNT(*) INTO total_count
      FROM users u
      WHERE u.opted_in_cohort = true
        AND EXISTS (SELECT 1 FROM grades g WHERE g.user_id = u.id);

      SELECT COUNT(*) INTO better_count
      FROM users u
      WHERE u.opted_in_cohort = true
        AND calculate_user_average(u.id) < user_avg;
    ELSE
      -- Subject-specific national scope
      SELECT COUNT(DISTINCT u.id) INTO total_count
      FROM users u
      JOIN grades g ON g.user_id = u.id
      WHERE u.opted_in_cohort = true
        AND g.subject = p_subject;

      SELECT COUNT(DISTINCT u.id) INTO better_count
      FROM users u
      WHERE u.opted_in_cohort = true
        AND calculate_subject_average(u.id, p_subject) < user_avg;
    END IF;
  END IF;

  -- Calculate percentile
  RETURN QUERY SELECT 
    CASE 
      WHEN total_count > 0 THEN (better_count::DECIMAL / total_count * 100)
      ELSE 0 
    END AS percentile,
    (total_count - better_count) AS rank,
    total_count AS total;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 
-- ============================================

ALTER TABLE user_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE activity_feed DISABLE ROW LEVEL SECURITY;
ALTER TABLE grades DISABLE ROW LEVEL SECURITY;
ALTER TABLE percentile_cache DISABLE ROW LEVEL SECURITY;
ALTER TABLE school_stats DISABLE ROW LEVEL SECURITY;
ALTER TABLE subject_stats DISABLE ROW LEVEL SECURITY;

-- Add RLS policies for aggregate reads (allows opted-in data access)
DROP POLICY IF EXISTS "Public select opted-in users for stats" ON users;
CREATE POLICY "Public select opted-in users for stats" ON users
FOR SELECT USING (opted_in_cohort = true);

DROP POLICY IF EXISTS "Public select grades for opted-in users" ON grades;
CREATE POLICY "Public select grades for opted-in users" ON grades
FOR SELECT USING (
  EXISTS (SELECT 1 FROM users u WHERE u.id = grades.user_id AND u.opted_in_cohort = true)
);

-- Updated RPC: Simpler CTE, handles empty, no temp table
CREATE OR REPLACE FUNCTION update_school_stats_by_level(p_level VARCHAR)
RETURNS TABLE(
  school_code VARCHAR(50),
  school_name VARCHAR(100),
  average_overall DECIMAL(5,2),
  national_rank INTEGER,
  total_students INTEGER
) AS $$
BEGIN
  -- CTE for aggregates (JOIN only opted-in with grades)
  WITH school_aggregates AS (
    SELECT 
      u.school_code,
      MAX(u.school_name) AS school_name,  -- Consistent name per school
      AVG(g.percentage) AS average_overall,
      COUNT(DISTINCT u.id)::INTEGER AS total_students,
      DENSE_RANK() OVER (ORDER BY AVG(g.percentage) DESC NULLS LAST) AS national_rank
    FROM users u
    JOIN grades g ON g.user_id = u.id
    WHERE u.level = p_level 
      AND u.opted_in_cohort = true
      AND u.school_code IS NOT NULL
    GROUP BY u.school_code
    HAVING COUNT(DISTINCT u.id) > 0  -- Only schools with grades
  )
  -- Upsert (safe, no error on empty)
  INSERT INTO school_stats (school_code, school_name, level, average_overall, total_students, national_rank, last_calculated_at, updated_at)
  SELECT 
    school_code, school_name, p_level, average_overall, total_students, national_rank, NOW(), NOW()
  FROM school_aggregates
  ON CONFLICT (school_code, level) 
  DO UPDATE SET 
    average_overall = EXCLUDED.average_overall,
    total_students = EXCLUDED.total_students,
    national_rank = EXCLUDED.national_rank,
    last_calculated_at = NOW(),
    updated_at = NOW();

  -- Return updated stats (empty if no data)
  RETURN QUERY
  SELECT sa.school_code, sa.school_name, sa.average_overall, sa.national_rank, sa.total_students
  FROM school_stats sa
  WHERE sa.level = p_level
  ORDER BY sa.average_overall DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test/Seed: Run this for your level (e.g., 'sec_4')
-- SELECT * FROM update_school_stats_by_level('sec_4');

-- Populate for your level (runs aggregates, upserts to school_stats)
SELECT * FROM update_school_stats_by_level('sec_4');



-- Check users for your level (opted-in)
SELECT school_code, school_name, COUNT(*) AS user_count
FROM users 
WHERE level = 'sec_4' AND opted_in_cohort = true
GROUP BY school_code, school_name
ORDER BY user_count DESC;

-- Check grades for those users
SELECT u.school_code, COUNT(g.id) AS grade_count
FROM users u
LEFT JOIN grades g ON g.user_id = u.id
WHERE u.level = 'sec_4' AND u.opted_in_cohort = true
GROUP BY u.school_code
ORDER BY grade_count DESC;

-- Check if school_stats is truly empty
SELECT * FROM school_stats WHERE level = 'sec_4';

-- Populate for your level (runs aggregates, upserts to school_stats)
SELECT * FROM update_school_stats_by_level('sec_4');