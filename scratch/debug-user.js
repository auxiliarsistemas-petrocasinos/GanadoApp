const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

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

async function fixUser() {
  const email = 'manuamado19@gmail.com';
  
  const { data: { users }, error: fetchError } = await supabase.auth.admin.listUsers();
  if (fetchError) throw fetchError;

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (!user) { console.log('No user found'); return; }
  console.log('User ID:', user.id);

  // Ver granjas
  const { data: granjas, error: errGranjas } = await supabase.from('granjas').select('*').eq('propietario_id', user.id);
  console.log('Granjas:', granjas);
  
  if (!granjas || granjas.length === 0) {
      console.log('Este usuario NO tiene granja asignada como propietario.');
  }

  // Ver usuarios table
  const { data: perfiles, error: errPerfiles } = await supabase.from('usuarios').select('*').eq('auth_user_id', user.id);
  console.log('Perfiles (usuarios tabla):', perfiles);
  
  if (perfiles && perfiles.length > 1) {
      console.log('Tiene MAS DE UN PERFIL en la tabla de usuarios.');
      // Dejar solo el que tiene la granja correcta
      if (granjas && granjas.length > 0) {
         const correctGranjaId = granjas[0].id;
         const profileToKeep = perfiles.find(p => p.granja_id === correctGranjaId);
         if (profileToKeep) {
             const toDelete = perfiles.filter(p => p.id !== profileToKeep.id);
             for(let td of toDelete) {
                 await supabase.from('usuarios').delete().eq('id', td.id);
                 console.log('Deleted duplicate profile:', td.id);
             }
         }
      }
  } else if (perfiles && perfiles.length === 1) {
      const p = perfiles[0];
      if (granjas && granjas.length > 0 && p.granja_id !== granjas[0].id) {
          console.log('El perfil no apunta a la granja que le pertenece. Actualizando...');
          await supabase.from('usuarios').update({ granja_id: granjas[0].id }).eq('id', p.id);
          console.log('Actualizado!');
      }
  }

  // Double check
  const { data: doubleCheck } = await supabase.from('usuarios').select('*').eq('auth_user_id', user.id);
  console.log('Perfiles final:', doubleCheck);

}

fixUser().catch(console.error);
