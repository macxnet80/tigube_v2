-- Fix: Allow anonymous users to search for caretakers
-- This migration fixes the issue where non-authenticated users cannot see caretaker search results
-- Created: 2025-02-08

-- 1. Add a new RLS policy for users table to allow public read access to caretaker profiles
-- This is needed because the caretaker_search_view joins with the users table

-- Drop existing restrictive policy
DROP POLICY IF EXISTS "Benutzer können nur ihre eigenen Daten sehen" ON public.users;

-- Create new policy that allows public read access to basic user info for caretakers
CREATE POLICY "Public can view caretaker profile info" 
  ON public.users 
  FOR SELECT 
  USING (
    -- Allow access to users who are caretakers (for public search)
    user_type = 'caretaker'
    OR
    -- Allow users to see their own data
    auth.uid() = id
  );

-- 2. Ensure the caretaker_search_view has proper permissions
-- The view should already have these permissions, but let's make sure
GRANT SELECT ON caretaker_search_view TO anon;
GRANT SELECT ON caretaker_search_view TO authenticated;

-- 3. Verify the caretaker_profiles table has public read access
-- This should already be in place from previous migrations
-- But let's double-check the policy exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies 
    WHERE tablename = 'caretaker_profiles' 
    AND policyname = 'Enable read access for all users'
  ) THEN
    -- Create the policy if it doesn't exist
    CREATE POLICY "Enable read access for all users" 
      ON caretaker_profiles 
      FOR SELECT 
      USING (true);
  END IF;
END $$;

-- 4. Add comment to document the change
COMMENT ON POLICY "Public can view caretaker profile info" ON public.users IS 
  'Allows anonymous users to view basic profile information of caretakers for public search functionality';

-- 5. Verify the changes
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual
FROM pg_policies 
WHERE tablename = 'users' 
ORDER BY cmd;
