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

async function transfer() {
  const oldEmail = 'test@example.com';
  const newEmail = 'manuamado19@gmail.com';

  console.log(`Buscando usuario antiguo: ${oldEmail}...`);
  const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
  if (fetchError) throw fetchError;

  const oldUser = users.find(u => u.email.toLowerCase() === oldEmail.toLowerCase());
  if (!oldUser) {
    console.log('Usuario antiguo no encontrado. Asegúrate de que el correo sea correcto.');
    return;
  }
  console.log('Usuario antiguo encontrado:', oldUser.id);

  let newUser = users.find(u => u.email.toLowerCase() === newEmail.toLowerCase());
  if (!newUser) {
    console.log(`Usuario nuevo (${newEmail}) no encontrado. Creándolo...`);
    const { data: createdData, error: createError } = await supabase.auth.admin.createUser({
      email: newEmail,
      password: 'Password123!', // Contraseña temporal
      email_confirm: true
    });
    if (createError) throw createError;
    newUser = createdData.user;
    console.log('Usuario nuevo creado:', newUser.id);
  } else {
    console.log('Usuario nuevo ya existe:', newUser.id);
  }

  // 1. Transferir Granja
  console.log('Transfiriendo granjas...');
  const { error: granjaError } = await supabase
    .from('granjas')
    .update({ propietario_id: newUser.id })
    .eq('propietario_id', oldUser.id);
  if (granjaError) throw granjaError;

  // 2. Actualizar tabla usuarios
  console.log('Transfiriendo perfil de usuario...');
  const { error: usuarioError } = await supabase
    .from('usuarios')
    .update({ 
      auth_user_id: newUser.id,
      email: newEmail 
    })
    .eq('auth_user_id', oldUser.id);
  if (usuarioError) throw usuarioError;

  // 3. Borrar usuario antiguo
  console.log('Borrando usuario antiguo de Auth...');
  const { error: deleteError } = await supabase.auth.admin.deleteUser(oldUser.id);
  if (deleteError) throw deleteError;

  console.log('\n✅ Transferencia completada con éxito.');
  console.log(`Toda la información ahora pertenece a: ${newEmail}`);
  console.log(`Si el usuario es nuevo, su contraseña temporal es: Password123!`);
}

transfer().catch(console.error);
