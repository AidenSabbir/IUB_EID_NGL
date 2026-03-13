import { createClient } from '@supabase/supabase-js';
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  const { data: appSettings, error: err1 } = await supabase.from('app_settings').select('*').limit(1);
  console.log('app_settings:', appSettings, err1);
  
  // Test RPC with dummy token just to see signature/columns if possible
  const { data: msg, error: err2 } = await supabase.rpc('get_inbox_messages');
  console.log('get_inbox_messages error:', err2);
}
test();
