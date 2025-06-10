import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://qtdezvbginizovlzgtdn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF0ZGV6dmJnaW5pem92bHpndGRuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY2Mjk4NzUsImV4cCI6MjA2MjIwNTg3NX0.WL6HjqqO3y_cIkZ7BrW0CThwgWzyrXSogrEXzDSSddk'
export const supabase = createClient(supabaseUrl, supabaseKey)
