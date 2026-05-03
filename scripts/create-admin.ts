import {createClient} from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({path: '.env.local'});

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const email = process.argv[2];
const password = process.argv[3];

if (!email || !password) {
  console.error('Usage: npm run create-admin <email> <password>');
  console.error('Example: npm run create-admin walidkalikali02@gmail.com mypassword123');
  process.exit(1);
}

if (!supabaseUrl || !serviceRoleKey) {
  console.error('Error: Missing required environment variables.');
  console.error('Add SUPABASE_SERVICE_ROLE_KEY to your .env.local file.');
  console.error('Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function createAdmin() {
  console.log(`Creating admin user: ${email}`);

  const {data, error} = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      role: 'admin',
      first_name: 'Admin',
    },
  });

  if (error) {
    console.error('Error creating admin:', error.message);
    process.exit(1);
  }

  console.log('✅ Admin user created successfully!');
  console.log(`   User ID: ${data.user.id}`);
  console.log(`   Email: ${data.user.email}`);
  console.log(`   Role: ${data.user.user_metadata.role}`);
}

createAdmin();
