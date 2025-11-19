# Supabase Migration Guide

## Overview
This guide will help you migrate your Feather Fashions application from Lovable Cloud to your own Supabase account.

## Your New Supabase Credentials
- **Project URL**: https://evatnzestvdodljghxcb.supabase.co
- **Project ID**: evatnzestvdodljghxcb
- **Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2YXRuemVzdHZkb2RsamdoeGNiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM1MjIxNDUsImV4cCI6MjA3OTA5ODE0NX0.9qRP3sehRX4gYf-9PTnp7PatmdqMsdsKcNpgfWPHTYs
- **Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2YXRuemVzdHZkb2RsamdoeGNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjE0NSwiZXhwIjoyMDc5MDk4MTQ1fQ.bA1KnVfOSPqYy2FguE9cDNo3jzwrVGl6oXyLuthVUqM

## Migration Steps

### Step 1: Configure Supabase Project Settings
1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/evatnzestvdodljghxcb
2. Navigate to **Authentication** → **Settings**
3. Enable **Email Provider**
4. **IMPORTANT**: Enable **Confirm email** to OFF (auto-confirm emails for development)
5. Set **Site URL** to your application URL

### Step 2: Run Database Migrations
1. Go to **SQL Editor** in your Supabase Dashboard
2. Copy and paste the SQL scripts from `MIGRATION_SQL.sql` file
3. Execute the script (it will create all tables, functions, triggers, and RLS policies)

### Step 3: Create Storage Bucket
1. Go to **Storage** in your Supabase Dashboard
2. Create a new bucket named: `style-images`
3. Make it **Public**
4. Set up the following RLS policies for the bucket:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'style-images');

-- Allow authenticated users to upload
CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'style-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to update their uploads
CREATE POLICY "Authenticated users can update"
ON storage.objects FOR UPDATE
USING (bucket_id = 'style-images' AND auth.role() = 'authenticated');

-- Allow authenticated users to delete
CREATE POLICY "Authenticated users can delete"
ON storage.objects FOR DELETE
USING (bucket_id = 'style-images' AND auth.role() = 'authenticated');
```

### Step 4: Configure Edge Function Secrets
Go to **Settings** → **Edge Functions** → **Secrets** and add:

1. **RESEND_API_KEY**: Your Resend API key for email notifications
2. **LOVABLE_API_KEY**: Your Lovable AI API key for image generation
3. **SUPABASE_URL**: https://evatnzestvdodljghxcb.supabase.co
4. **SUPABASE_SERVICE_ROLE_KEY**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV2YXRuemVzdHZkb2RsamdoeGNiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MzUyMjE0NSwiZXhwIjoyMDc5MDk4MTQ1fQ.bA1KnVfOSPqYy2FguE9cDNo3jzwrVGl6oXyLuthVUqM

### Step 5: Deploy Edge Functions
The edge functions in `supabase/functions/` will be automatically deployed when you push your code.

Functions to be deployed:
- generate-product-image
- product-color-image
- send-contact-notification
- send-low-stock-alert
- send-order-alert
- send-password-reset
- seed-products

### Step 6: Create Super Admin User
1. Go to **Authentication** → **Users**
2. Create a new user with email: `info.featherfashions@gmail.com`
3. This user will automatically have super admin privileges based on the `is_super_admin` function

### Step 7: Test the Application
1. Clear your browser cache and local storage
2. Reload the application
3. Try signing up/logging in
4. Test creating products, orders, etc.

## Data Migration (Optional)
If you need to migrate existing data from Lovable Cloud:
1. Export data from old database using Supabase CLI or dashboard
2. Import data using SQL INSERT statements in the new database
3. Ensure all foreign key relationships are maintained

## Troubleshooting

### Authentication Issues
- Make sure auto-confirm is enabled
- Check that the Site URL is correctly set
- Verify JWT secrets are properly configured

### RLS Policy Issues
- If you get permission denied errors, check RLS policies
- Ensure user_roles table is properly populated
- Verify the `has_role` function is working

### Storage Issues
- Verify bucket is public if images aren't loading
- Check RLS policies on storage.objects table
- Ensure image URLs are using the correct domain

## Need Help?
If you encounter issues:
1. Check Supabase logs in Dashboard → Logs
2. Check browser console for errors
3. Verify all environment variables are correct
4. Ensure all SQL scripts executed successfully

## Important Notes
- The `.env` file has been updated with your new credentials
- `supabase/config.toml` needs to be updated with project_id (see next step)
- All edge function secrets need to be configured in your new Supabase project
- Storage bucket must be created manually
- RLS policies are included in the SQL migration script
