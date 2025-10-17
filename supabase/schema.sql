-- VoidSEO Database Schema
-- INSTRUCTIONS :
-- 1. Copier TOUT ce fichier
-- 2. Aller dans Supabase → SQL Editor
-- 3. Coller et cliquer "Run"

-- Enable RLS (Row Level Security)

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT,
  role TEXT DEFAULT 'free' CHECK (role IN ('free', 'builder', 'admin')),
  newsletter_opt_in BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_login TIMESTAMP WITH TIME ZONE,
  is_approved BOOLEAN DEFAULT true,
  metadata JSONB DEFAULT '{}'::jsonb
);

-- Enable RLS on profiles
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- TEMPORARILY DISABLE RLS FOR TESTING
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Create API usage tracking table
CREATE TABLE IF NOT EXISTS api_usage (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- TEMPORARILY DISABLE RLS FOR TESTING
ALTER TABLE api_usage DISABLE ROW LEVEL SECURITY;

-- Create download logs table
CREATE TABLE IF NOT EXISTS download_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_type TEXT,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- TEMPORARILY DISABLE RLS FOR TESTING
ALTER TABLE download_logs DISABLE ROW LEVEL SECURITY;

-- Create admin logs table
CREATE TABLE IF NOT EXISTS admin_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  admin_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  target_user_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  details JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  ip_address INET
);

-- TEMPORARILY DISABLE RLS FOR TESTING
ALTER TABLE admin_logs DISABLE ROW LEVEL SECURITY;

-- Create waitlist table
CREATE TABLE IF NOT EXISTS waitlist (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  plan TEXT NOT NULL CHECK (plan IN ('builder', 'studio', 'partner')),
  name TEXT,
  company TEXT,
  message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'contacted', 'converted')),
  metadata JSONB DEFAULT '{}'::jsonb
);

-- TEMPORARILY DISABLE RLS FOR TESTING
ALTER TABLE waitlist DISABLE ROW LEVEL SECURITY;

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, email, name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1))
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    name = COALESCE(EXCLUDED.name, profiles.name),
    updated_at = NOW();
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log error but don't fail the auth
    RAISE WARNING 'Error in handle_new_user: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger for updated_at on profiles
DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_user_endpoint ON api_usage(user_id, endpoint);
CREATE INDEX IF NOT EXISTS idx_api_usage_created_at ON api_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_download_logs_user_id ON download_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_admin_logs_admin_id ON admin_logs(admin_id);

-- Create view for admin dashboard stats
CREATE OR REPLACE VIEW admin_stats AS
SELECT 
  (SELECT COUNT(*) FROM profiles) as total_users,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '24 hours') as daily_signups,
  (SELECT COUNT(*) FROM profiles WHERE created_at >= NOW() - INTERVAL '7 days') as weekly_signups,
  (SELECT COUNT(*) FROM profiles WHERE last_login >= NOW() - INTERVAL '7 days') as active_users_7d,
  (SELECT COUNT(*) FROM profiles WHERE newsletter_opt_in = true) as newsletter_subscribers,
  (SELECT COUNT(*) FROM profiles WHERE role = 'free') as free_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'builder') as builder_users,
  (SELECT COUNT(*) FROM profiles WHERE role = 'admin') as admin_users;

-- Grant access to admin_stats view
GRANT SELECT ON admin_stats TO authenticated;

-- Insert default admin user (replace with your email)
-- Run this after creating your first user through the signup flow
-- UPDATE profiles SET role = 'admin' WHERE email = 'your-admin-email@example.com';
