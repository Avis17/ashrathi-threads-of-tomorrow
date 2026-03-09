import { createClient } from '@supabase/supabase-js';

const EXTERNAL_SUPABASE_URL = 'https://omldaastsqglsmtcdqqe.supabase.co';
const EXTERNAL_SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9tbGRhYXN0c3FnbHNtdGNkcXFlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzMwMDYxNTksImV4cCI6MjA4ODU4MjE1OX0.sowpWMa0QUQVV-XOCe8z8EQdnlawyyylYfoYEaQwP-k';

export const externalSupabase = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
