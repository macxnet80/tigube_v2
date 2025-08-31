-- Fix RLS Policies for caretaker_profiles table
-- Ensure all users can view approved caretaker profiles

-- Enable RLS on caretaker_profiles if not already enabled
ALTER TABLE caretaker_profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Enable read access for all users" ON caretaker_profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON caretaker_profiles;
DROP POLICY IF EXISTS "Enable update for users based on id" ON caretaker_profiles;
DROP POLICY IF EXISTS "Enable delete for users based on id" ON caretaker_profiles;

-- Create new policies for caretaker_profiles

-- Allow all users to read caretaker profiles (public access)
CREATE POLICY "Enable read access for all users" 
  ON caretaker_profiles 
  FOR SELECT 
  USING (true);

-- Allow authenticated users to insert their own profile
CREATE POLICY "Enable insert for authenticated users only" 
  ON caretaker_profiles 
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Allow users to update their own profile
CREATE POLICY "Enable update for users based on id" 
  ON caretaker_profiles 
  FOR UPDATE 
  USING (auth.uid() = id);

-- Allow users to delete their own profile
CREATE POLICY "Enable delete for users based on id" 
  ON caretaker_profiles 
  FOR DELETE 
  USING (auth.uid() = id);

-- Verify the policies were created
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive, 
  roles, 
  cmd, 
  qual, 
  with_check
FROM pg_policies 
WHERE tablename = 'caretaker_profiles'
ORDER BY cmd;
