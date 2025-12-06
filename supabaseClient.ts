import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://eaujciqckwarsydnztmq.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVhdWpjaXFja3dhcnN5ZG56dG1xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzM0OTEwMTksImV4cCI6MjA0OTA2NzAxOX0.XKqVKz5u5Pb_vB0WGLVnAFxqOZE_sFP0dVGAipTBW_Y';

export const supabase = createClient(supabaseUrl, supabaseKey);
