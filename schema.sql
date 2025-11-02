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






-- Add this RPC function to the schema (place after the existing HELPER FUNCTIONS section)
-- ============================================
-- MIGRATION HELPER: Delete user and all related data (bypasses RLS for trusted cleanup)
-- ============================================
CREATE OR REPLACE FUNCTION delete_user_and_data(p_user_id UUID)
RETURNS void AS $$
BEGIN
  -- Delete related stats first (cascade if set, but explicit for safety)
  DELETE FROM user_stats WHERE user_id = p_user_id;
  DELETE FROM subject_stats WHERE user_id = p_user_id;
  DELETE FROM percentile_cache WHERE user_id = p_user_id;
  
  -- Delete grades
  DELETE FROM grades WHERE user_id = p_user_id;
  
  -- Delete user
  DELETE FROM users WHERE id = p_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated and anon users (for migration flow)
GRANT EXECUTE ON FUNCTION delete_user_and_data(UUID) TO authenticated, anon;

-- Optional: Add a trigger to auto-cleanup stats on user delete (if not using CASCADE everywhere)
-- But since ON DELETE CASCADE is on grades/user_stats/etc., it's covered.



-- 1) get_user_groups: ensure COUNT cast and GROUP BY includes non-aggregates
CREATE OR REPLACE FUNCTION get_user_groups(p_user_id UUID)
RETURNS TABLE(
  id UUID,
  name VARCHAR(100),
  description TEXT,
  creator_id UUID,
  invite_code VARCHAR(32),
  member_count INTEGER,
  average_overall DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.description,
    g.creator_id,
    g.invite_code,
    COUNT(gm.user_id)::INTEGER AS member_count,
    gs.average_overall,
    g.created_at
  FROM groups g
  JOIN group_members gm ON g.id = gm.group_id
  LEFT JOIN group_stats gs ON g.id = gs.group_id
  WHERE gm.user_id = p_user_id
  GROUP BY
    g.id,
    g.name,
    g.description,
    g.creator_id,
    g.invite_code,
    g.created_at,
    gs.average_overall
  ORDER BY g.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2) get_group_rankings: simplified, uses window functions
CREATE OR REPLACE FUNCTION get_group_rankings(p_group_id UUID)
RETURNS TABLE(
  user_id UUID,
  nickname VARCHAR(15),
  role VARCHAR(10),
  joined_at TIMESTAMP WITH TIME ZONE,
  percentile DECIMAL(5,2),
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH member_averages AS (
    SELECT 
      gm.user_id,
      u.nickname,
      gm.role,
      gm.joined_at,
      COALESCE(calculate_user_average(gm.user_id), 0) AS avg_score
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = p_group_id
      AND EXISTS (SELECT 1 FROM grades g WHERE g.user_id = gm.user_id)
  ),
  ranked_members AS (
    SELECT 
      ma.user_id,
      ma.nickname,
      ma.role,
      ma.joined_at,
      ma.avg_score,
      COUNT(*) OVER () AS total_count,
      COUNT(*) FILTER (WHERE avg_score < ma.avg_score) OVER () AS better_count,
      ROW_NUMBER() OVER (ORDER BY ma.avg_score DESC) AS rank_num
    FROM member_averages ma
  )
  SELECT 
    rm.user_id,
    rm.nickname,
    rm.role,
    rm.joined_at,
    CASE 
      WHEN rm.total_count > 0 THEN (rm.better_count::DECIMAL / rm.total_count * 100)
      ELSE 0 
    END AS percentile,
    rm.rank_num AS rank
  FROM ranked_members rm
  ORDER BY rm.rank_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3) Trigger wrapper: call update_group_stats(NEW.group_id) safely from a trigger
-- This wrapper assumes update_group_stats(uuid) exists as a normal function.
CREATE OR REPLACE FUNCTION group_members_after_insert_trigger()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- call the non-trigger function update_group_stats with NEW.group_id
  PERFORM update_group_stats(NEW.group_id);
  RETURN NEW;
END;
$$;

-- Drop existing trigger (if any) then create a proper trigger that invokes the wrapper
DROP TRIGGER IF EXISTS update_group_stats_after_member_insert ON group_members;

CREATE TRIGGER update_group_stats_after_member_insert
AFTER INSERT ON group_members
FOR EACH ROW
EXECUTE FUNCTION group_members_after_insert_trigger();

-- 4) create_group: create group, auto-join creator and update stats
CREATE OR REPLACE FUNCTION create_group(
  p_creator_id UUID,
  p_name VARCHAR(100),
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(group_id UUID, invite_code VARCHAR(32)) AS $$
DECLARE
  new_group_id UUID;
BEGIN
  -- Insert group
  INSERT INTO groups (creator_id, name, description)
  VALUES (p_creator_id, p_name, p_description)
  RETURNING id INTO new_group_id;

  -- Auto-join creator as admin
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (new_group_id, p_creator_id, 'admin');

  -- Update stats (trigger will also fire for the insert into group_members, but calling directly is safe)
  PERFORM update_group_stats(new_group_id);

  -- Return group id and invite code
  RETURN QUERY
  SELECT g.id, g.invite_code
  FROM groups g
  WHERE g.id = new_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5) join_group: join by invite code, update stats if inserted
CREATE OR REPLACE FUNCTION join_group(
  p_user_id UUID,
  p_invite_code VARCHAR(32),
  p_role VARCHAR(10) DEFAULT 'member'
)
RETURNS TABLE(success BOOLEAN) AS $$
DECLARE
  target_group UUID;
  inserted BOOLEAN := false;
BEGIN
  -- Find group by invite code
  SELECT id INTO target_group
  FROM groups
  WHERE invite_code = p_invite_code;

  IF target_group IS NULL THEN
    RETURN QUERY SELECT false;
    RETURN;
  END IF;

  -- Insert membership if not exists
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (target_group, p_user_id, p_role)
  ON CONFLICT (group_id, user_id) DO NOTHING
  RETURNING true INTO inserted;

  -- Update stats if inserted
  IF inserted THEN
    PERFORM update_group_stats(target_group);
  END IF;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- Add SECURITY DEFINER function to check group membership without RLS recursion
CREATE OR REPLACE FUNCTION is_group_member(p_user_id UUID, p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members 
    WHERE user_id = p_user_id AND group_id = p_group_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

-- Update policies to use the function instead of recursive subqueries
DROP POLICY IF EXISTS "Users can view own groups" ON groups;
CREATE POLICY "Users can view own groups" ON groups
  FOR SELECT USING (
    is_group_member(auth.uid(), id)
    OR invite_code = current_setting('app.current_invite_code', true)
  );

DROP POLICY IF EXISTS "Members can view group members" ON group_members;
CREATE POLICY "Members can view group members" ON group_members
  FOR SELECT USING (
    is_group_member(auth.uid(), group_id)
  );

-- For INSERT on group_members, keep as is, but ensure creator can insert
-- Existing policy is fine

-- Grant execute on the function
GRANT EXECUTE ON FUNCTION is_group_member(UUID, UUID) TO authenticated, anon;


-- Updated Supabase SQL Schema: Add the new RPC for get_group_by_invite
-- Add this after the existing HELPER FUNCTIONS section

-- ============================================
-- RPC: Get group details by invite code (public for sharing)
-- ============================================
CREATE OR REPLACE FUNCTION get_group_by_invite(p_invite_code VARCHAR(32))
RETURNS TABLE(
  id UUID,
  name VARCHAR(100),
  description TEXT,
  creator_id UUID,
  invite_code VARCHAR(32),
  member_count INTEGER,
  average_overall DECIMAL(5,2),
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    g.id,
    g.name,
    g.description,
    g.creator_id,
    g.invite_code,
    COUNT(gm.user_id)::INTEGER AS member_count,
    gs.average_overall,
    g.created_at
  FROM groups g
  LEFT JOIN group_members gm ON g.id = gm.group_id
  LEFT JOIN group_stats gs ON g.id = gs.group_id
  WHERE g.invite_code = p_invite_code
  GROUP BY g.id, g.name, g.description, g.creator_id, g.invite_code, g.created_at, gs.average_overall;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_group_by_invite(VARCHAR(32)) TO authenticated, anon;




-- Enhanced RPC: Get comprehensive group stats for the UI
CREATE OR REPLACE FUNCTION get_group_comprehensive_stats(p_group_id UUID)
RETURNS TABLE(
  average_overall DECIMAL(5,2),
  top_performer_percentile DECIMAL(5,2),
  most_improved DECIMAL(5,2),
  consistency_avg DECIMAL(5,2),
  subjects_breakdown JSONB,  -- Array of {subject: string, avg: number, top_member: string}
  trends JSONB,  -- Array of {period: string, change: number}
  vs_school_avg DECIMAL(5,2),
  vs_school_difference DECIMAL(5,2),
  total_grades INTEGER,
  active_members INTEGER
) AS $$
DECLARE
  school_code VARCHAR(50);
  school_avg DECIMAL(5,2);
BEGIN
  -- Get school code from creator or first member
  SELECT u.school_code INTO school_code
  FROM groups g
  JOIN users u ON g.creator_id = u.id
  WHERE g.id = p_group_id
  LIMIT 1;

  -- Get school avg if available
  SELECT average_overall INTO school_avg
  FROM school_stats
  WHERE school_code = school_code
    AND level = (SELECT level FROM users WHERE id = (SELECT creator_id FROM groups WHERE id = p_group_id))
  LIMIT 1;

  -- Main query for stats
  RETURN QUERY
  WITH member_stats AS (
    SELECT 
      gm.user_id,
      COALESCE(us.overall_average, 0) AS overall_avg,
      us.consistency_score,
      calculate_user_average(gm.user_id) AS calc_avg,
      -- Improvement: compare to their own historical (simplified: assume recent vs all-time)
      (AVG(g.percentage) OVER (PARTITION BY gm.user_id ORDER BY g.assessment_date DESC ROWS BETWEEN 3 PRECEDING AND CURRENT ROW) - 
       AVG(g.percentage) OVER (PARTITION BY gm.user_id)) AS improvement
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    LEFT JOIN user_stats us ON gm.user_id = us.user_id
    LEFT JOIN grades g ON g.user_id = gm.user_id
    WHERE gm.group_id = p_group_id
      AND u.opted_in_cohort = true
    GROUP BY gm.user_id, us.overall_average, us.consistency_score
  ),
  subject_breakdown AS (
    SELECT 
      g.subject,
      AVG(g.percentage) AS avg_score,
      u.nickname AS top_nickname
    FROM group_members gm
    JOIN grades g ON gm.user_id = g.user_id
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = p_group_id
    GROUP BY g.subject, u.nickname
    HAVING AVG(g.percentage) = (SELECT MAX(AVG(g2.percentage)) FROM grades g2 WHERE g2.subject = g.subject AND g2.user_id IN (SELECT user_id FROM group_members WHERE group_id = p_group_id))
    ORDER BY avg_score DESC
    LIMIT 5  -- Top subjects
  ),
  trends_data AS (
    -- Simplified trends: last week vs previous
    SELECT 
      'Weekly' AS period,
      (AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '7 days') - 
       AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '14 days' AND g.assessment_date < CURRENT_DATE - INTERVAL '7 days')) AS change
    FROM grades g
    JOIN users u ON g.user_id = u.id
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
    UNION ALL
    SELECT 
      'Monthly' AS period,
      (AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '30 days') - 
       AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '60 days' AND g.assessment_date < CURRENT_DATE - INTERVAL '30 days')) AS change
    FROM grades g
    JOIN users u ON g.user_id = u.id
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
  )
  SELECT 
    AVG(ms.overall_avg) AS average_overall,
    MAX(ms.overall_avg) AS top_performer_percentile,  -- Simplified; use percentiles from rankings if needed
    MAX(ms.improvement) AS most_improved,
    AVG(ms.consistency_score) AS consistency_avg,
    (SELECT jsonb_agg(jsonb_build_object('subject', sb.subject, 'avg', sb.avg_score, 'top_member', sb.top_nickname)) FROM subject_breakdown sb) AS subjects_breakdown,
    (SELECT jsonb_agg(jsonb_build_object('period', td.period, 'change', td.change)) FROM trends_data td) AS trends,
    COALESCE(school_avg, 0) AS vs_school_avg,
    (AVG(ms.overall_avg) - COALESCE(school_avg, 0)) AS vs_school_difference,
    (SELECT COUNT(*) FROM grades g JOIN users u ON g.user_id = u.id JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = p_group_id) AS total_grades,
    COUNT(DISTINCT ms.user_id) FILTER (WHERE ms.overall_avg > 0) AS active_members
  FROM member_stats ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_group_comprehensive_stats(UUID) TO authenticated, anon;








-- Fixed: get_group_comprehensive_stats - Resolved ambiguity on "average_overall", fixed CTEs for proper aggregation and window functions
-- Place this after the existing HELPER FUNCTIONS section in your schema
CREATE OR REPLACE FUNCTION get_group_comprehensive_stats(p_group_id UUID)
RETURNS TABLE(
  average_overall DECIMAL(5,2),
  top_performer_percentile DECIMAL(5,2),
  most_improved DECIMAL(5,2),
  consistency_avg DECIMAL(5,2),
  subjects_breakdown JSONB,  -- Array of {subject: string, avg: number, top_member: string}
  trends JSONB,  -- Array of {period: string, change: number}
  vs_school_avg DECIMAL(5,2),
  vs_school_difference DECIMAL(5,2),
  total_grades INTEGER,
  active_members INTEGER
) AS $$
DECLARE
  v_school_code VARCHAR(50);
  v_school_avg DECIMAL(5,2);
  v_level VARCHAR(20);
BEGIN
  -- Get school code and level from creator
  SELECT u.school_code, u.level INTO v_school_code, v_level
  FROM groups g
  JOIN users u ON g.creator_id = u.id
  WHERE g.id = p_group_id
  LIMIT 1;

  -- Get school avg (qualified to avoid ambiguity)
  SELECT ss.average_overall INTO v_school_avg
  FROM school_stats ss
  WHERE ss.school_code = v_school_code
    AND ss.level = v_level
  LIMIT 1;

  -- Main query for stats
  RETURN QUERY
  WITH all_member_avgs AS (
    SELECT 
      gm.user_id, 
      COALESCE(calculate_user_average(gm.user_id), 0) AS avg_score
    FROM group_members gm
    WHERE gm.group_id = p_group_id
      AND EXISTS (SELECT 1 FROM grades g WHERE g.user_id = gm.user_id)
  ),
  member_stats AS (
    SELECT 
      ama.user_id,
      ama.avg_score AS overall_avg,
      COALESCE(us.consistency_score, 0) AS consistency_score,
      -- Improvement: recent (last 30 days) vs historical
      COALESCE(
        (SELECT AVG(g.percentage) FROM grades g WHERE g.user_id = ama.user_id AND g.assessment_date >= CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) - COALESCE(
        (SELECT AVG(g.percentage) FROM grades g WHERE g.user_id = ama.user_id AND g.assessment_date < CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) AS improvement,
      -- Internal group percentile (higher avg = higher percentile)
      COALESCE(
        (SELECT COUNT(ama2.avg_score) FROM all_member_avgs ama2 WHERE ama2.avg_score < ama.avg_score)::DECIMAL / 
        GREATEST((SELECT COUNT(*) FROM all_member_avgs), 1) * 100, 
        0
      ) AS percentile
    FROM all_member_avgs ama
    LEFT JOIN user_stats us ON ama.user_id = us.user_id
  ),
  subject_breakdown AS (
    SELECT 
      subject,
      avg_score,
      top_nickname
    FROM (
      SELECT 
        g.subject,
        AVG(g.percentage) AS avg_score,
        u.nickname AS top_nickname,
        ROW_NUMBER() OVER (PARTITION BY g.subject ORDER BY AVG(g.percentage) DESC) AS rn
      FROM group_members gm
      JOIN grades g ON gm.user_id = g.user_id
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = p_group_id
      GROUP BY g.subject, u.nickname
    ) sub
    WHERE rn = 1
    ORDER BY avg_score DESC
    LIMIT 5
  ),
  trends_data AS (
    -- Weekly trend
    SELECT 
      'Weekly' AS period,
      COALESCE(
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '7 days') - 
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '14 days' AND g.assessment_date < CURRENT_DATE - INTERVAL '7 days'), 
        0
      ) AS change
    FROM grades g
    JOIN users u ON g.user_id = u.id
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
    UNION ALL
    SELECT 
      'Monthly' AS period,
      COALESCE(
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '30 days') - 
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '60 days' AND g.assessment_date < CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) AS change
    FROM grades g
    JOIN users u ON g.user_id = u.id
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
  )
  SELECT 
    COALESCE(AVG(ms.overall_avg), 0) AS average_overall,
    COALESCE(MAX(ms.percentile), 0) AS top_performer_percentile,
    COALESCE(MAX(ms.improvement), 0) AS most_improved,
    COALESCE(AVG(ms.consistency_score), 0) AS consistency_avg,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('subject', sb.subject, 'avg', sb.avg_score, 'top_member', sb.top_nickname)) FROM subject_breakdown sb), '[]'::jsonb) AS subjects_breakdown,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('period', td.period, 'change', td.change)) FROM trends_data td), '[]'::jsonb) AS trends,
    COALESCE(v_school_avg, 0) AS vs_school_avg,
    (COALESCE(AVG(ms.overall_avg), 0) - COALESCE(v_school_avg, 0)) AS vs_school_difference,
    COALESCE((SELECT COUNT(g.id) FROM grades g JOIN users u ON g.user_id = u.id JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = p_group_id), 0) AS total_grades,
    COALESCE((SELECT COUNT(DISTINCT ms2.user_id) FROM member_stats ms2), 0) AS active_members
  FROM member_stats ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_group_comprehensive_stats(UUID) TO authenticated, anon;



-- Fixed: get_group_comprehensive_stats - Cast COUNT results to INTEGER to match return type
CREATE OR REPLACE FUNCTION get_group_comprehensive_stats(p_group_id UUID)
RETURNS TABLE(
  average_overall DECIMAL(5,2),
  top_performer_percentile DECIMAL(5,2),
  most_improved DECIMAL(5,2),
  consistency_avg DECIMAL(5,2),
  subjects_breakdown JSONB,  -- Array of {subject: string, avg: number, top_member: string}
  trends JSONB,  -- Array of {period: string, change: number}
  vs_school_avg DECIMAL(5,2),
  vs_school_difference DECIMAL(5,2),
  total_grades INTEGER,
  active_members INTEGER
) AS $$
DECLARE
  v_school_code VARCHAR(50);
  v_school_avg DECIMAL(5,2);
  v_level VARCHAR(20);
BEGIN
  -- Get school code and level from creator
  SELECT u.school_code, u.level INTO v_school_code, v_level
  FROM groups g
  JOIN users u ON g.creator_id = u.id
  WHERE g.id = p_group_id
  LIMIT 1;

  -- Get school avg (qualified to avoid ambiguity)
  SELECT ss.average_overall INTO v_school_avg
  FROM school_stats ss
  WHERE ss.school_code = v_school_code
    AND ss.level = v_level
  LIMIT 1;

  -- Main query for stats
  RETURN QUERY
  WITH all_member_avgs AS (
    SELECT 
      gm.user_id, 
      COALESCE(calculate_user_average(gm.user_id), 0) AS avg_score
    FROM group_members gm
    WHERE gm.group_id = p_group_id
      AND EXISTS (SELECT 1 FROM grades g WHERE g.user_id = gm.user_id)
  ),
  member_stats AS (
    SELECT 
      ama.user_id,
      ama.avg_score AS overall_avg,
      COALESCE(us.consistency_score, 0) AS consistency_score,
      -- Improvement: recent (last 30 days) vs historical
      COALESCE(
        (SELECT AVG(g.percentage) FROM grades g WHERE g.user_id = ama.user_id AND g.assessment_date >= CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) - COALESCE(
        (SELECT AVG(g.percentage) FROM grades g WHERE g.user_id = ama.user_id AND g.assessment_date < CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) AS improvement,
      -- Internal group percentile (higher avg = higher percentile)
      COALESCE(
        (SELECT COUNT(ama2.avg_score) FROM all_member_avgs ama2 WHERE ama2.avg_score < ama.avg_score)::DECIMAL / 
        GREATEST((SELECT COUNT(*) FROM all_member_avgs), 1) * 100, 
        0
      ) AS percentile
    FROM all_member_avgs ama
    LEFT JOIN user_stats us ON ama.user_id = us.user_id
  ),
  subject_breakdown AS (
    SELECT 
      subject,
      avg_score,
      top_nickname
    FROM (
      SELECT 
        g.subject,
        AVG(g.percentage) AS avg_score,
        u.nickname AS top_nickname,
        ROW_NUMBER() OVER (PARTITION BY g.subject ORDER BY AVG(g.percentage) DESC) AS rn
      FROM group_members gm
      JOIN grades g ON gm.user_id = g.user_id
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = p_group_id
      GROUP BY g.subject, u.nickname
    ) sub
    WHERE rn = 1
    ORDER BY avg_score DESC
    LIMIT 5
  ),
  trends_data AS (
    -- Weekly trend
    SELECT 
      'Weekly' AS period,
      COALESCE(
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '7 days') - 
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '14 days' AND g.assessment_date < CURRENT_DATE - INTERVAL '7 days'), 
        0
      ) AS change
    FROM grades g
    JOIN users u ON g.user_id = u.id
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
    UNION ALL
    SELECT 
      'Monthly' AS period,
      COALESCE(
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '30 days') - 
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '60 days' AND g.assessment_date < CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) AS change
    FROM grades g
    JOIN users u ON g.user_id = u.id
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
  )
  SELECT 
    COALESCE(AVG(ms.overall_avg), 0) AS average_overall,
    COALESCE(MAX(ms.percentile), 0) AS top_performer_percentile,
    COALESCE(MAX(ms.improvement), 0) AS most_improved,
    COALESCE(AVG(ms.consistency_score), 0) AS consistency_avg,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('subject', sb.subject, 'avg', sb.avg_score, 'top_member', sb.top_nickname)) FROM subject_breakdown sb), '[]'::jsonb) AS subjects_breakdown,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('period', td.period, 'change', td.change)) FROM trends_data td), '[]'::jsonb) AS trends,
    COALESCE(v_school_avg, 0) AS vs_school_avg,
    (COALESCE(AVG(ms.overall_avg), 0) - COALESCE(v_school_avg, 0)) AS vs_school_difference,
    COALESCE((SELECT COUNT(g.id)::INTEGER FROM grades g JOIN users u ON g.user_id = u.id JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = p_group_id), 0) AS total_grades,
    COALESCE((SELECT COUNT(DISTINCT ms2.user_id)::INTEGER FROM member_stats ms2), 0) AS active_members
  FROM member_stats ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_group_comprehensive_stats(UUID) TO authenticated, anon;



-- ============================================
-- GROUPS TABLE (Safe creation - idempotent)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'groups') THEN
    CREATE TABLE groups (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      name VARCHAR(100) NOT NULL,
      description TEXT,
      creator_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      invite_code VARCHAR(32) UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
      created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    CREATE INDEX IF NOT EXISTS idx_groups_creator ON groups(creator_id);
    CREATE INDEX IF NOT EXISTS idx_groups_invite ON groups(invite_code);
  END IF;
END $$;

-- ============================================
-- GROUP_MEMBERS TABLE (Safe creation - idempotent)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_members') THEN
    CREATE TABLE group_members (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
      role VARCHAR(10) NOT NULL DEFAULT 'member' CHECK (role IN ('admin', 'member')),
      joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      UNIQUE(group_id, user_id)
    );
    
    CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
    CREATE INDEX IF NOT EXISTS idx_group_members_user ON group_members(user_id);
  END IF;
END $$;

-- ============================================
-- GROUP_STATS TABLE (Safe creation - idempotent)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_stats') THEN
    CREATE TABLE group_stats (
      group_id UUID PRIMARY KEY REFERENCES groups(id) ON DELETE CASCADE,
      average_overall DECIMAL(5,2),
      total_grades INTEGER DEFAULT 0,
      active_members INTEGER DEFAULT 0,
      last_calculated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
  END IF;
END $$;

-- ============================================
-- RLS FOR GROUPS AND GROUP_MEMBERS (Drop and recreate to ensure consistency)
-- ============================================
DO $$
BEGIN
  -- Enable RLS if not already
  ALTER TABLE IF EXISTS groups ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS group_members ENABLE ROW LEVEL SECURITY;
  ALTER TABLE IF EXISTS group_stats ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies to avoid conflicts
  DROP POLICY IF EXISTS "Members can view groups" ON groups;
  DROP POLICY IF EXISTS "Members can view group members" ON group_members;
  DROP POLICY IF EXISTS "Members can view group stats" ON group_stats;
  DROP POLICY IF EXISTS "Members can join groups" ON group_members;
  DROP POLICY IF EXISTS "Admins can update members" ON group_members;
  DROP POLICY IF EXISTS "Admins can delete members" ON group_members;

  -- Recreate policies
  CREATE POLICY "Members can view groups" ON groups
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM group_members WHERE group_id = groups.id AND user_id = auth.uid())
      OR creator_id = auth.uid()
    );

  CREATE POLICY "Members can view group members" ON group_members
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM group_members WHERE group_id = group_members.group_id AND user_id = auth.uid())
    );

  CREATE POLICY "Members can view group stats" ON group_stats
    FOR SELECT USING (
      EXISTS (SELECT 1 FROM group_members WHERE group_id = group_stats.group_id AND user_id = auth.uid())
    );

  CREATE POLICY "Members can join groups" ON group_members
    FOR INSERT WITH CHECK (
      EXISTS (SELECT 1 FROM groups WHERE id = group_members.group_id)
      AND user_id = auth.uid()
    );

  CREATE POLICY "Admins can update members" ON group_members
    FOR UPDATE USING (
      EXISTS (
        SELECT 1 FROM group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
      )
    );

  CREATE POLICY "Admins can delete members" ON group_members
    FOR DELETE USING (
      EXISTS (
        SELECT 1 FROM group_members gm 
        WHERE gm.group_id = group_members.group_id 
        AND gm.user_id = auth.uid() 
        AND gm.role = 'admin'
      )
    );
END $$;

-- ============================================
-- UPDATE GROUP STATS FUNCTION (CREATE OR REPLACE)
-- ============================================
CREATE OR REPLACE FUNCTION update_group_stats(p_group_id UUID)
RETURNS void AS $$
BEGIN
  WITH group_aggregates AS (
    SELECT 
      AVG(COALESCE(calculate_user_average(gm.user_id), 0)) AS avg_overall,
      COUNT(DISTINCT gm.user_id) FILTER (WHERE EXISTS (SELECT 1 FROM grades g WHERE g.user_id = gm.user_id AND g.percentage > 0))::INTEGER AS active_members,
      COALESCE((SELECT COUNT(g.id)::INTEGER FROM grades g JOIN group_members gm2 ON g.user_id = gm2.user_id WHERE gm2.group_id = p_group_id), 0) AS total_grades
    FROM group_members gm
    WHERE gm.group_id = p_group_id
  )
  INSERT INTO group_stats (group_id, average_overall, active_members, total_grades, last_calculated_at, updated_at)
  SELECT p_group_id, ga.avg_overall, ga.active_members, ga.total_grades, NOW(), NOW()
  FROM group_aggregates ga
  ON CONFLICT (group_id) DO UPDATE SET
    average_overall = EXCLUDED.average_overall,
    active_members = EXCLUDED.active_members,
    total_grades = EXCLUDED.total_grades,
    last_calculated_at = NOW(),
    updated_at = NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant if not already (idempotent)
GRANT EXECUTE ON FUNCTION update_group_stats(UUID) TO authenticated, anon;

-- ============================================
-- CREATE_GROUP FUNCTION (CREATE OR REPLACE)
-- ============================================
CREATE OR REPLACE FUNCTION create_group(
  p_creator_id UUID,
  p_name VARCHAR(100),
  p_description TEXT DEFAULT NULL
)
RETURNS TABLE(group_id UUID, invite_code VARCHAR(32)) AS $$
DECLARE
  new_group_id UUID;
BEGIN
  -- Insert group (invite_code auto-generated via default)
  INSERT INTO groups (creator_id, name, description)
  VALUES (p_creator_id, p_name, p_description)
  RETURNING id INTO new_group_id;

  -- Auto-join creator as admin
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (new_group_id, p_creator_id, 'admin')
  ON CONFLICT (group_id, user_id) DO NOTHING;

  -- Update stats immediately
  PERFORM update_group_stats(new_group_id);

  -- Return group id and invite code
  RETURN QUERY
  SELECT g.id, g.invite_code
  FROM groups g
  WHERE g.id = new_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant if not already (idempotent)
GRANT EXECUTE ON FUNCTION create_group(UUID, VARCHAR(100), TEXT) TO authenticated, anon;


-- Remove redundant join call from create_group RPC (already handled by direct INSERT)
-- But since the TSX calls it separately, fix by dropping the optional p_role param to match call, or remove TSX call
-- Better: Update join_group to not require p_role if default

-- Ensure function exists without issues
DROP FUNCTION IF EXISTS join_group(UUID, VARCHAR(32), VARCHAR(10));

CREATE OR REPLACE FUNCTION join_group(
  p_user_id UUID,
  p_invite_code VARCHAR(32)
)
RETURNS TABLE(success BOOLEAN) AS $$
DECLARE
  target_group UUID;
  inserted BOOLEAN := false;
BEGIN
  -- Find group by invite code
  SELECT id INTO target_group
  FROM groups
  WHERE invite_code = p_invite_code;

  IF target_group IS NULL THEN
    RETURN QUERY SELECT false;
    RETURN;
  END IF;

  -- Insert membership if not exists (default role 'member')
  INSERT INTO group_members (group_id, user_id, role)
  VALUES (target_group, p_user_id, 'member')
  ON CONFLICT (group_id, user_id) DO NOTHING
  RETURNING true INTO inserted;

  -- Update stats if inserted
  IF inserted THEN
    PERFORM update_group_stats(target_group);
  END IF;

  RETURN QUERY SELECT true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- For admin join, keep separate or use direct update; but for now, since create_group uses direct INSERT, update TSX to not call for creator

-- Grant
GRANT EXECUTE ON FUNCTION join_group(UUID, VARCHAR(32)) TO authenticated, anon;


-- Fixed: get_group_rankings - Cast ROW_NUMBER() to INTEGER to match return type
CREATE OR REPLACE FUNCTION get_group_rankings(p_group_id UUID)
RETURNS TABLE(
  user_id UUID,
  nickname VARCHAR(15),
  role VARCHAR(10),
  joined_at TIMESTAMP WITH TIME ZONE,
  percentile DECIMAL(5,2),
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH member_averages AS (
    SELECT 
      gm.user_id,
      u.nickname,
      gm.role,
      gm.joined_at,
      COALESCE(calculate_user_average(gm.user_id), 0) AS avg_score
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = p_group_id
      AND EXISTS (SELECT 1 FROM grades g WHERE g.user_id = gm.user_id)
  ),
  ranked_members AS (
    SELECT 
      ma.user_id,
      ma.nickname,
      ma.role,
      ma.joined_at,
      ma.avg_score,
      COUNT(*) OVER () AS total_count,
      COUNT(*) FILTER (WHERE avg_score < ma.avg_score) OVER () AS better_count,
      ROW_NUMBER() OVER (ORDER BY ma.avg_score DESC) AS rank_num
    FROM member_averages ma
  )
  SELECT 
    rm.user_id,
    rm.nickname,
    rm.role,
    rm.joined_at,
    CASE 
      WHEN rm.total_count > 0 THEN (rm.better_count::DECIMAL / rm.total_count * 100)
      ELSE 0 
    END AS percentile,
    rm.rank_num::INTEGER AS rank
  FROM ranked_members rm
  ORDER BY rm.rank_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission (idempotent)
GRANT EXECUTE ON FUNCTION get_group_rankings(UUID) TO authenticated, anon;


CREATE TABLE IF NOT EXISTS group_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  date TIMESTAMP WITH TIME ZONE NOT NULL,
  attendees INTEGER DEFAULT 0,
  created_by UUID NOT NULL REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_group_events_group ON group_events(group_id);
CREATE INDEX IF NOT EXISTS idx_group_events_date ON group_events(date);

ALTER TABLE group_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Group members can view events" ON group_events
  FOR ALL USING (is_group_member(auth.uid(), group_id));

  -- ============================================
-- GROUP_RESOURCES TABLE (Safe creation - idempotent)
-- ============================================
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'group_resources') THEN
    CREATE TABLE group_resources (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
      name VARCHAR(255) NOT NULL,
      size VARCHAR(50),
      uploaded_by UUID NOT NULL REFERENCES users(id),
      uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
      file_url TEXT
    );
    
    CREATE INDEX idx_group_resources_group ON group_resources(group_id);
    CREATE INDEX idx_group_resources_uploaded ON group_resources(uploaded_at);
    
    ALTER TABLE group_resources ENABLE ROW LEVEL SECURITY;
    CREATE POLICY "Group members can view resources" ON group_resources
      FOR ALL USING (is_group_member(auth.uid(), group_id));
  END IF;
END $$;

-- Grant execute on is_group_member if not already
GRANT EXECUTE ON FUNCTION is_group_member(UUID, UUID) TO authenticated, anon;

-- Drop the broken policy
DROP POLICY IF EXISTS "Members can view group members" ON group_members;

-- Recreate with a SECURITY DEFINER function to avoid recursion
CREATE OR REPLACE FUNCTION is_group_member(p_user_id UUID, p_group_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM group_members 
    WHERE user_id = p_user_id AND group_id = p_group_id
  );
$$ LANGUAGE sql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION is_group_member(UUID, UUID) TO authenticated, anon;

CREATE POLICY "Members can view group members" ON group_members
  FOR SELECT USING (is_group_member(auth.uid(), group_id));



-- Add this new RPC function for subject-specific group rankings
-- Place after the existing get_group_rankings function in your schema

CREATE OR REPLACE FUNCTION get_group_subject_rankings(p_group_id UUID, p_subject VARCHAR(50))
RETURNS TABLE(
  user_id UUID,
  nickname VARCHAR(15),
  role VARCHAR(10),
  joined_at TIMESTAMP WITH TIME ZONE,
  percentile DECIMAL(5,2),
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH member_averages AS (
    SELECT 
      gm.user_id,
      u.nickname,
      gm.role,
      gm.joined_at,
      COALESCE(calculate_subject_average(gm.user_id, p_subject), 0) AS avg_score
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = p_group_id
      AND EXISTS (SELECT 1 FROM grades g WHERE g.user_id = gm.user_id AND g.subject = p_subject)
  ),
  ranked_members AS (
    SELECT 
      ma.user_id,
      ma.nickname,
      ma.role,
      ma.joined_at,
      ma.avg_score,
      COUNT(*) OVER () AS total_count,
      COUNT(*) FILTER (WHERE avg_score < ma.avg_score) OVER () AS better_count,
      ROW_NUMBER() OVER (ORDER BY ma.avg_score DESC) AS rank_num
    FROM member_averages ma
  )
  SELECT 
    rm.user_id,
    rm.nickname,
    rm.role,
    rm.joined_at,
    CASE 
      WHEN rm.total_count > 0 THEN (rm.better_count::DECIMAL / rm.total_count * 100)
      ELSE 0 
    END AS percentile,
    rm.rank_num::INTEGER AS rank
  FROM ranked_members rm
  ORDER BY rm.rank_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_group_subject_rankings(UUID, VARCHAR(50)) TO authenticated, anon;

-- Add RPC for deleting a group (admin only)
CREATE OR REPLACE FUNCTION delete_group(p_group_id UUID)
RETURNS void AS $$
BEGIN
  -- Check if caller is admin
  IF NOT EXISTS (
    SELECT 1 FROM group_members gm 
    WHERE gm.group_id = p_group_id AND gm.user_id = auth.uid() AND gm.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Only admins can delete the group';
  END IF;

  -- Delete group and cascades
  DELETE FROM groups WHERE id = p_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION delete_group(UUID) TO authenticated, anon;


-- Updated RPC: Include all group members in subject rankings, with 0 avg if no grades in subject
CREATE OR REPLACE FUNCTION get_group_subject_rankings(p_group_id UUID, p_subject VARCHAR(50))
RETURNS TABLE(
  user_id UUID,
  nickname VARCHAR(15),
  role VARCHAR(10),
  joined_at TIMESTAMP WITH TIME ZONE,
  percentile DECIMAL(5,2),
  rank INTEGER
) AS $$
BEGIN
  RETURN QUERY
  WITH member_averages AS (
    SELECT 
      gm.user_id,
      u.nickname,
      gm.role,
      gm.joined_at,
      COALESCE(calculate_subject_average(gm.user_id, p_subject), 0) AS avg_score
    FROM group_members gm
    JOIN users u ON gm.user_id = u.id
    WHERE gm.group_id = p_group_id
  ),
  ranked_members AS (
    SELECT 
      ma.user_id,
      ma.nickname,
      ma.role,
      ma.joined_at,
      ma.avg_score,
      COUNT(*) OVER () AS total_count,
      COUNT(*) FILTER (WHERE avg_score < ma.avg_score OR (avg_score = ma.avg_score AND ma.user_id < ma.user_id)) OVER () AS better_count,  -- Tiebreaker by user_id
      ROW_NUMBER() OVER (ORDER BY ma.avg_score DESC, ma.user_id ASC) AS rank_num
    FROM member_averages ma
  )
  SELECT 
    rm.user_id,
    rm.nickname,
    rm.role,
    rm.joined_at,
    CASE 
      WHEN rm.total_count > 0 THEN (rm.better_count::DECIMAL / rm.total_count * 100)
      ELSE 0 
    END AS percentile,
    rm.rank_num::INTEGER AS rank
  FROM ranked_members rm
  ORDER BY rm.rank_num;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_group_subject_rankings(UUID, VARCHAR(50)) TO authenticated, anon;


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
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION calculate_subject_average(p_user_id UUID, p_subject VARCHAR)
RETURNS DECIMAL(5,2) AS $$
DECLARE
  avg_score DECIMAL(5,2);
BEGIN
  SELECT AVG(percentage) INTO avg_score
  FROM grades
  WHERE user_id = p_user_id AND LOWER(subject) = LOWER(p_subject);
  
  RETURN COALESCE(avg_score, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

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
        AND LOWER(g.subject) = LOWER(p_subject);

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
        AND LOWER(g.subject) = LOWER(p_subject);

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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Fixed: get_group_comprehensive_stats - Use LOWER for subject to make case-insensitive
CREATE OR REPLACE FUNCTION get_group_comprehensive_stats(p_group_id UUID)
RETURNS TABLE(
  average_overall DECIMAL(5,2),
  top_performer_percentile DECIMAL(5,2),
  most_improved DECIMAL(5,2),
  consistency_avg DECIMAL(5,2),
  subjects_breakdown JSONB,  -- Array of {subject: string, avg: number, top_member: string}
  trends JSONB,  -- Array of {period: string, change: number}
  vs_school_avg DECIMAL(5,2),
  vs_school_difference DECIMAL(5,2),
  total_grades INTEGER,
  active_members INTEGER
) AS $$
DECLARE
  v_school_code VARCHAR(50);
  v_school_avg DECIMAL(5,2);
  v_level VARCHAR(20);
BEGIN
  -- Get school code and level from creator
  SELECT u.school_code, u.level INTO v_school_code, v_level
  FROM groups g
  JOIN users u ON g.creator_id = u.id
  WHERE g.id = p_group_id
  LIMIT 1;

  -- Get school avg (qualified to avoid ambiguity)
  SELECT ss.average_overall INTO v_school_avg
  FROM school_stats ss
  WHERE ss.school_code = v_school_code
    AND ss.level = v_level
  LIMIT 1;

  -- Main query for stats
  RETURN QUERY
  WITH all_member_avgs AS (
    SELECT 
      gm.user_id, 
      COALESCE(calculate_user_average(gm.user_id), 0) AS avg_score
    FROM group_members gm
    WHERE gm.group_id = p_group_id
      AND EXISTS (SELECT 1 FROM grades g WHERE g.user_id = gm.user_id)
  ),
  member_stats AS (
    SELECT 
      ama.user_id,
      ama.avg_score AS overall_avg,
      COALESCE(us.consistency_score, 0) AS consistency_score,
      -- Improvement: recent (last 30 days) vs historical
      COALESCE(
        (SELECT AVG(g.percentage) FROM grades g WHERE g.user_id = ama.user_id AND g.assessment_date >= CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) - COALESCE(
        (SELECT AVG(g.percentage) FROM grades g WHERE g.user_id = ama.user_id AND g.assessment_date < CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) AS improvement,
      -- Internal group percentile (higher avg = higher percentile)
      COALESCE(
        (SELECT COUNT(ama2.avg_score) FROM all_member_avgs ama2 WHERE ama2.avg_score < ama.avg_score)::DECIMAL / 
        GREATEST((SELECT COUNT(*) FROM all_member_avgs), 1) * 100, 
        0
      ) AS percentile
    FROM all_member_avgs ama
    LEFT JOIN user_stats us ON ama.user_id = us.user_id
  ),
  subject_breakdown AS (
    SELECT 
      lower_subject,
      avg_score,
      top_nickname
    FROM (
      SELECT 
        LOWER(g.subject) AS lower_subject,
        AVG(g.percentage) AS avg_score,
        u.nickname AS top_nickname,
        ROW_NUMBER() OVER (PARTITION BY LOWER(g.subject) ORDER BY AVG(g.percentage) DESC) AS rn
      FROM group_members gm
      JOIN grades g ON gm.user_id = g.user_id
      JOIN users u ON gm.user_id = u.id
      WHERE gm.group_id = p_group_id
      GROUP BY LOWER(g.subject), u.nickname
    ) sub
    WHERE rn = 1
    ORDER BY avg_score DESC
    LIMIT 5
  ),
  trends_data AS (
    -- Weekly trend
    SELECT 
      'Weekly' AS period,
      COALESCE(
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '7 days') - 
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '14 days' AND g.assessment_date < CURRENT_DATE - INTERVAL '7 days'), 
        0
      ) AS change
    FROM grades g
    JOIN users u ON g.user_id = u.id
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
    UNION ALL
    SELECT 
      'Monthly' AS period,
      COALESCE(
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '30 days') - 
        AVG(g.percentage) FILTER (WHERE g.assessment_date >= CURRENT_DATE - INTERVAL '60 days' AND g.assessment_date < CURRENT_DATE - INTERVAL '30 days'), 
        0
      ) AS change
    FROM grades g
    JOIN users u ON g.user_id = u.id
    JOIN group_members gm ON u.id = gm.user_id
    WHERE gm.group_id = p_group_id
  )
  SELECT 
    COALESCE(AVG(ms.overall_avg), 0) AS average_overall,
    COALESCE(MAX(ms.percentile), 0) AS top_performer_percentile,
    COALESCE(MAX(ms.improvement), 0) AS most_improved,
    COALESCE(AVG(ms.consistency_score), 0) AS consistency_avg,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('subject', sb.lower_subject, 'avg', sb.avg_score, 'top_member', sb.top_nickname)) FROM subject_breakdown sb), '[]'::jsonb) AS subjects_breakdown,
    COALESCE((SELECT jsonb_agg(jsonb_build_object('period', td.period, 'change', td.change)) FROM trends_data td), '[]'::jsonb) AS trends,
    COALESCE(v_school_avg, 0) AS vs_school_avg,
    (COALESCE(AVG(ms.overall_avg), 0) - COALESCE(v_school_avg, 0)) AS vs_school_difference,
    COALESCE((SELECT COUNT(g.id)::INTEGER FROM grades g JOIN users u ON g.user_id = u.id JOIN group_members gm ON u.id = gm.user_id WHERE gm.group_id = p_group_id), 0) AS total_grades,
    COALESCE((SELECT COUNT(DISTINCT ms2.user_id)::INTEGER FROM member_stats ms2), 0) AS active_members
  FROM member_stats ms;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

GRANT EXECUTE ON FUNCTION get_group_comprehensive_stats(UUID) TO authenticated, anon;