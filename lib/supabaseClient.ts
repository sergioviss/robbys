import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://krarkgpavhllmttfsxfv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImtyYXJrZ3BhdmhsbG10dGZzeGZ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzk1NjI4MzUsImV4cCI6MjA1NTEzODgzNX0.nFSwnZnrG14jPMSTgFXOb9_juZbJ5dZHWEIg1Z-I0tM';

export const supabase = createClient(supabaseUrl, supabaseAnonKey); 