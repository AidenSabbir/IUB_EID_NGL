import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: '00000000-0000-0000-0000-000000000000',
        username: 'testuser',
        full_name: 'Test User',
        avatar_url: 'https://example.com/avatar.png'
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
