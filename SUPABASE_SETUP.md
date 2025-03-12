# Supabase Setup for Tacticx.app

This guide walks you through setting up your Supabase project for Tacticx.app.

## 1. Create a Supabase Project

1. Go to [https://app.supabase.io](https://app.supabase.io) and sign in
2. Click "New Project"
3. Enter your project details:
   - Name: Tacticx (or your preferred name)
   - Database Password: Create a strong password
   - Region: Choose one closest to your target audience

## 2. Set Up Database Tables

You can set up the database tables in two ways:

### Option 1: Using the SQL Editor

1. In your Supabase project dashboard, navigate to the "SQL Editor" section
2. Copy the contents of the `supabase_tables.sql` file in this repository
3. Paste it into the SQL Editor
4. Click "Run" to execute the SQL

### Option 2: Using the Supabase Migration System

If you're using the Supabase CLI:

1. Install Supabase CLI if you haven't already
   ```
   npm install -g supabase
   ```
2. Log in to Supabase
   ```
   supabase login
   ```
3. Link your project
   ```
   supabase link --project-ref your-project-ref
   ```
4. Create a migration
   ```
   supabase migration new initial_schema
   ```
5. Copy the SQL into the generated migration file
6. Push the migration
   ```
   supabase migration up
   ```

## 3. Configure Authentication

1. Go to the "Authentication" section in your Supabase dashboard
2. Under "Providers" enable:
   - Email (with "Confirm email" option)
   - Google (Optional: Set up Google OAuth)
3. Under "Settings" customize:
   - Site URL (your production URL)
   - Redirect URLs (add your local development URL)

## 4. Set Up Storage

1. Go to the "Storage" section in your Supabase dashboard
2. Create a new bucket named "avatars" for profile pictures
3. Set the bucket's public access to "Private"
4. Configure Storage RLS:
   ```sql
   -- Allow public access to avatars
   CREATE POLICY "Avatar images are publicly accessible." 
   ON storage.objects FOR SELECT 
   USING (bucket_id = 'avatars');

   -- Allow users to upload their own avatar
   CREATE POLICY "Users can upload their own avatar." 
   ON storage.objects FOR INSERT 
   WITH CHECK (bucket_id = 'avatars' AND auth.uid() = owner);

   -- Allow users to update their own avatar
   CREATE POLICY "Users can update their own avatar." 
   ON storage.objects FOR UPDATE 
   USING (bucket_id = 'avatars' AND auth.uid() = owner);

   -- Allow users to delete their own avatar
   CREATE POLICY "Users can delete their own avatar." 
   ON storage.objects FOR DELETE 
   USING (bucket_id = 'avatars' AND auth.uid() = owner);
   ```

## 5. Update Environment Variables

Update your `.env.local` file with your Supabase project details:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

You can find these values in your Supabase project settings under "API".

## Database Schema Overview

### Profiles Table

Stores user profile information:
- `id`: UUID (references auth.users)
- `username`: Unique username
- `avatar_url`: URL to profile picture
- `bio`: Optional user biography
- `social_links`: JSONB for social media links
- `created_at` and `updated_at`: Timestamps

### Tactics Table

Stores the tactical board data:
- `id`: UUID
- `user_id`: UUID (references auth.users)
- `title`: Tactic title
- `description`: Tactic description
- `is_public`: Boolean for sharing settings
- `players`, `arrows`, `textAnnotations`: JSONB for the tactical elements
- `created_at` and `updated_at`: Timestamps

### Tactic Shares Table (Optional)

Enables more granular sharing permissions:
- `id`: UUID
- `tactic_id`: UUID (references tactics)
- `user_id`: UUID (references auth.users)
- `permission_level`: Text ('read', 'edit', 'admin')
- `created_at` and `updated_at`: Timestamps

## Row Level Security (RLS)

The setup includes RLS policies to ensure:
- Public tactics are viewable by everyone
- Private tactics are only viewable by their owners or shared users
- Users can only edit their own tactics
- Profiles are public for viewing but can only be updated by their owners 