-- Supabase SQL Setup for Tacticx.app
-- This script creates all the necessary tables and sets up Row Level Security (RLS)

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  username TEXT UNIQUE,
  avatar_url TEXT,
  bio TEXT,
  social_links JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create tactics table
CREATE TABLE IF NOT EXISTS tactics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL DEFAULT 'Untitled Tactic',
  description TEXT,
  is_public BOOLEAN DEFAULT false,
  players JSONB DEFAULT '[]'::jsonb,
  arrows JSONB DEFAULT '[]'::jsonb,
  textAnnotations JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create sharing table for more granular sharing permissions (optional for future use)
CREATE TABLE IF NOT EXISTS tactic_shares (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tactic_id UUID REFERENCES tactics(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_level TEXT CHECK (permission_level IN ('read', 'edit', 'admin')) NOT NULL DEFAULT 'read',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (tactic_id, user_id)
);

-- Set up Row Level Security (RLS)

-- Profiles: Users can read any profile but only update their own
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone"
  ON profiles FOR SELECT
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Tactics: Users can read public tactics or their own, and only modify their own
ALTER TABLE tactics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public tactics are viewable by everyone"
  ON tactics FOR SELECT
  USING (is_public = true OR auth.uid() = user_id);

CREATE POLICY "Users can update their own tactics"
  ON tactics FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tactics"
  ON tactics FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own tactics"
  ON tactics FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Tactic Shares: Users can view shares for tactics they own or are shared with them
ALTER TABLE tactic_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Visible to tactic owners and invited users"
  ON tactic_shares FOR SELECT
  USING (
    auth.uid() IN (
      SELECT user_id FROM tactics WHERE id = tactic_id
      UNION
      SELECT user_id FROM tactic_shares WHERE tactic_id = tactic_shares.tactic_id
    )
  );

CREATE POLICY "Only tactic owners can manage shares"
  ON tactic_shares FOR ALL
  USING (
    auth.uid() IN (
      SELECT user_id FROM tactics WHERE id = tactic_id
    )
  );

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON profiles
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tactics_updated_at
BEFORE UPDATE ON tactics
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tactic_shares_updated_at
BEFORE UPDATE ON tactic_shares
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Create function to handle new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, username, avatar_url)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'username',
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile when a new user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Indexes for performance
CREATE INDEX tactics_user_id_idx ON tactics (user_id);
CREATE INDEX tactics_is_public_idx ON tactics (is_public);
CREATE INDEX tactic_shares_tactic_id_idx ON tactic_shares (tactic_id);
CREATE INDEX tactic_shares_user_id_idx ON tactic_shares (user_id);
