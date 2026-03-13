import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: keys, error: e1 } = await supabase.from('app_settings').select('key, value').limit(1);
  console.log('key/value:', e1);
  const { data: cols, error: e2 } = await supabase.from('app_settings').select('eid_unlock_time').limit(1);
  console.log('eid_unlock_time:', e2);
}
test();
