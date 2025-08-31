-- Add approval_status field to caretaker_profiles table
-- This field is needed to control which caretaker profiles are publicly visible

-- Add the approval_status column
ALTER TABLE caretaker_profiles 
ADD COLUMN IF NOT EXISTS approval_status text DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected'));

-- Add comment for documentation
COMMENT ON COLUMN caretaker_profiles.approval_status IS 'Status of profile approval: pending, approved, rejected';

-- Set existing profiles to approved by default (for backward compatibility)
UPDATE caretaker_profiles 
SET approval_status = 'approved' 
WHERE approval_status IS NULL OR approval_status = 'pending';

-- Create index for better performance on approval status queries
CREATE INDEX IF NOT EXISTS idx_caretaker_profiles_approval_status 
ON caretaker_profiles(approval_status);

-- Verify the column was added
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'caretaker_profiles' 
AND column_name = 'approval_status';
