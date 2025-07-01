/*
  # Add face signature storage for registered faces

  1. New Tables
    - `face_signatures`
      - `id` (uuid, primary key)
      - `user_id` (references profiles)
      - `faceio_face_id` (text, unique identifier from FaceIO)
      - `signature_hash` (text, encrypted signature data)
      - `registration_timestamp` (timestamp)
      - `last_used` (timestamp)
      - `is_active` (boolean)
      - `metadata` (jsonb, additional face data)

  2. Updates to existing tables
    - Add `face_registered` boolean to profiles table
    - Add `face_signature_id` reference to profiles table

  3. Security
    - Enable RLS on new tables
    - Add policies for user access to their own face signatures
    - Add policies for admin access
*/

-- Create face signatures table
CREATE TABLE IF NOT EXISTS face_signatures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  faceio_face_id text UNIQUE,
  signature_hash text NOT NULL,
  registration_timestamp timestamptz DEFAULT now(),
  last_used timestamptz,
  is_active boolean DEFAULT true,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Add face registration fields to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS face_registered boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS face_signature_id uuid REFERENCES face_signatures(id);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_face_signatures_user_id ON face_signatures(user_id);
CREATE INDEX IF NOT EXISTS idx_face_signatures_faceio_id ON face_signatures(faceio_face_id);
CREATE INDEX IF NOT EXISTS idx_profiles_face_registered ON profiles(face_registered);

-- Enable RLS
ALTER TABLE face_signatures ENABLE ROW LEVEL SECURITY;

-- Policies for face_signatures
CREATE POLICY "Users can view their own face signatures"
  ON face_signatures
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own face signatures"
  ON face_signatures
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own face signatures"
  ON face_signatures
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all face signatures"
  ON face_signatures
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.is_admin = true
    )
  );

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_face_signatures_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to automatically update updated_at
CREATE TRIGGER update_face_signatures_updated_at
  BEFORE UPDATE ON face_signatures
  FOR EACH ROW
  EXECUTE FUNCTION update_face_signatures_updated_at();