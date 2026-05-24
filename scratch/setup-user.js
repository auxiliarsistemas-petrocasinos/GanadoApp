const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Leer variables de entorno
const envPath = path.resolve(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) env[match[1]] = match[2].trim();
});

const supabase = createClient(
  env['NEXT_PUBLIC_SUPABASE_URL'],
  env['SUPABASE_SERVICE_ROLE_KEY']
);

async function setup() {
  const { data: { users }, error: authError } = await supabase.auth.admin.listUsers();
  if (authError) { console.error('Error fetching users:', authError); return; }
  
  if (!users || users.length === 0) { console.log('No users found in Auth'); return; }
  
  const user = users[0]; // Tomar el primer usuario

  // Verificar si ya tiene granja
  const { data: granjas } = await supabase.from('granjas').select('*').eq('propietario_id', user.id);
  let granja = granjas && granjas.length > 0 ? granjas[0] : null;

  if (!granja) {
    console.log('Creating granja...');
    const { data: newGranja, error: granjaError } = await supabase
      .from('granjas')
      .insert({ nombre: 'Granja Principal', propietario_id: user.id })
      .select().single();
    
    if (granjaError) { console.error('Error creating granja:', granjaError); return; }
    granja = newGranja;
  }

  // Verificar si ya está en usuarios
  const { data: perfiles } = await supabase.from('usuarios').select('*').eq('auth_user_id', user.id);
  
  if (!perfiles || perfiles.length === 0) {
    console.log('Creating user profile...');
    const { error: userError } = await supabase
      .from('usuarios')
      .insert({
        email: user.email,
        nombre: 'Administrador',
        rol: 'admin',
        granja_id: granja.id,
        auth_user_id: user.id
      });
    
    if (userError) { console.error('Error creating profile:', userError); return; }
  }

  console.log('Setup successfully completed for user:', user.email);
}

setup();
