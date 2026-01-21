
import { createClient } from '@supabase/supabase-js'

// const supabaseUrl = process.env.SUPABASE_URL
// const supabaseKey = process.env.SUPABASE_PUBLIC_KEY
const supabaseUrl = 'https://hlsbqacbbdmqupnaongq.supabase.co'
const supabaseKey = 'sb_publishable_nThno7zKNtZA7TnLGMms6w_sX0K4crM'
console.log(supabaseUrl, supabaseKey);
const supabase = createClient(supabaseUrl, supabaseKey)

export default supabase