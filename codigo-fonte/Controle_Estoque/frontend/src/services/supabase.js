import { createClient } from '@supabase/supabase-js';

// Use exatamente esta URL que o erro mostrou:
const supabaseUrl = 'https://ujemtdpdhmuxbddyqwii.supabase.co';

// AQUI: Apague tudo o que estiver entre as aspas e cole a chave "ANON"
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVqZW10ZHBkaG11eGJkZHlxd2lpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc0Njk5OTMsImV4cCI6MjA5MzA0NTk5M30.h1QS-gZb143ceB0gw7Z6C4AV6PF1zTV-V3mZBAHCnd0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);