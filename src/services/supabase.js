import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://lwobxjytcrvuqfnqudat.supabase.co'

const supabaseKey = 'sb_publishable_CUNInXAy0zwINsPk9r0JNg_hZLAeY5y'

export const supabase = createClient(
  supabaseUrl,
  supabaseKey
)