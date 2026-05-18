import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://eieuctnixxjgknmvroap.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVpZXVjdG5peHhqZ2tubXZyb2FwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwNjY0OTAsImV4cCI6MjA5NDY0MjQ5MH0.U4ijvR1EaI9xWOXTL9pRXO8DDTZzq2DNLQk75ZIS9zw";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY);
