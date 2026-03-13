import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: '11111111-1111-1111-1111-111111111111',
        username: 'e2e-test-user',
        full_name: 'E2E Test User',
        avatar_url: null
      }
    ])
    .select();
  
  if (error) {
    console.error(error);
  } else {
    console.log('User created:', data);
  }
}

main();
