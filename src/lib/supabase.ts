import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  'https://aiszwapbmfsfpwcdtoev.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFpc3p3YXBibWZzZnB3Y2R0b2V2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzUzMDE5MzksImV4cCI6MjA5MDg3NzkzOX0.J_vWG4id7_K8MXCYTd0nRMd4iZSuyd8dmkHxi_ckczk',
  { auth: { persistSession: true, storageKey: 'cardiosport-auth' } }
);