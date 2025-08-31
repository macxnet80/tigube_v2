-- Create advertisement-images bucket for storing advertisement images
INSERT INTO storage.buckets (id, name, public)
VALUES ('advertisement-images', 'advertisement-images', true)
ON CONFLICT (id) DO NOTHING;

-- Enable RLS on storage.objects if not already enabled
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for advertisement-images bucket

-- Allow admins to upload advertisement images
CREATE POLICY "Allow admin uploads to advertisement-images bucket"
ON storage.objects FOR INSERT 
WITH CHECK (
  bucket_id = 'advertisement-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  )
);

-- Allow public read access to advertisement images
CREATE POLICY "Allow public read access to advertisement-images bucket"
ON storage.objects FOR SELECT 
USING (bucket_id = 'advertisement-images');

-- Allow admins to update advertisement images
CREATE POLICY "Allow admin updates to advertisement-images bucket"
ON storage.objects FOR UPDATE 
USING (
  bucket_id = 'advertisement-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  )
);

-- Allow admins to delete advertisement images
CREATE POLICY "Allow admin deletes from advertisement-images bucket"
ON storage.objects FOR DELETE 
USING (
  bucket_id = 'advertisement-images' AND
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE public.users.id = auth.uid() 
    AND public.users.is_admin = true
  )
);