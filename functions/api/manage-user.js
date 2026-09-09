
const SUPABASE_URL='https://kmussdssbssgkvxcqlsk.supabase.co';
const AUTH_DOMAIN='inovargondolas.app';

const json=(data,status=200)=>new Response(JSON.stringify(data),{
  status,headers:{'content-type':'application/json; charset=utf-8','cache-control':'no-store'}
});

async function adminFetch(path,secret,init={}){
  const headers=new Headers(init.headers||{});
  headers.set('apikey',secret);
  headers.set('Authorization',`Bearer ${secret}`);
  headers.set('Content-Type','application/json');
  return fetch(`${SUPABASE_URL}${path}`,{...init,headers});
}

async function callerFromToken(token,secret){
  const r=await fetch(`${SUPABASE_URL}/auth/v1/user`,{
    headers:{apikey:secret,Authorization:`Bearer ${token}`}
  });
  if(!r.ok)return null;
  const user=await r.json();
  const p=await adminFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(user.id)}&select=id,username,role,active,must_change_password,seller_id`,secret);
  if(!p.ok)return null;
  const profile=(await p.json())?.[0];
  if(!profile||profile.active!==true)return null;
  return {user,profile};
}

async function getProfile(userId,secret){
  const r=await adminFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}&select=id,username,full_name,email,role,active,must_change_password,seller_id`,secret);
  if(!r.ok)throw new Error('Falha ao consultar perfil.');
  return (await r.json())?.[0]||null;
}

async function getSeller(sellerId,secret){
  if(!sellerId)return null;
  const r=await adminFetch(`/rest/v1/seller_profiles?id=eq.${encodeURIComponent(sellerId)}&select=id,user_id,name,phone,email,commission,goal,active,access_role,notes`,secret);
  if(!r.ok)throw new Error('Falha ao consultar cadastro comercial.');
  return (await r.json())?.[0]||null;
}

async function patchProfile(userId,body,secret){
  const r=await adminFetch(`/rest/v1/profiles?id=eq.${encodeURIComponent(userId)}`,secret,{
    method:'PATCH',headers:{Prefer:'return=minimal'},body:JSON.stringify(body)
  });
  if(!r.ok)throw new Error('Falha ao atualizar perfil de acesso.');
}

async function upsertSeller(row,secret){
  const r=await adminFetch('/rest/v1/seller_profiles?on_conflict=id',secret,{
    method:'POST',
    headers:{Prefer:'resolution=merge-duplicates,return=minimal'},
    body:JSON.stringify([row])
  });
  if(!r.ok)throw new Error('Falha ao atualizar cadastro comercial.');
}

export async function onRequestPost({request,env}){
  const secret=env.SUPABASE_SECRET_KEY;
  if(!secret)return json({error:'Cloudflare sem SUPABASE_SECRET_KEY configurada.'},503);

  const auth=request.headers.get('authorization')||'';
  const token=auth.startsWith('Bearer ')?auth.slice(7):'';
  if(!token)return json({error:'Sessão não informada.'},401);

  const caller=await callerFromToken(token,secret);
  if(!caller)return json({error:'Sessão inválida ou perfil inativo.'},401);
  const callerRole=String(caller.profile.role||'seller').toLowerCase();

  let body;
  try{body=await request.json()}catch{return json({error:'Dados inválidos.'},400)}
  const action=String(body.action||'').toLowerCase();

  if(action==='create'){
    if(!['owner','admin','manager'].includes(callerRole))return json({error:'Sem permissão para criar logins.'},403);
    const fullName=String(body.fullName||'').trim();
    const username=String(body.username||'').trim().toLowerCase().replace(/[^a-z0-9._-]/g,'');
    const role=String(body.role||'seller').toLowerCase();
    const password=String(body.password||'');
    const phone=String(body.phone||'').trim();
    const contactEmail=String(body.contactEmail||'').trim();
    const commission=Number(body.commission||0);
    const goal=Number(body.goal||0);
    if(!fullName||username.length<3)return json({error:'Nome e usuário são obrigatórios.'},400);
    if(password.length<8)return json({error:'Senha mínima: 8 caracteres.'},400);
    if(!['owner','admin','manager','seller'].includes(role))return json({error:'Perfil inválido.'},400);
    if(callerRole==='manager'&&role!=='seller')return json({error:'Gerente pode criar apenas vendedor.'},403);

    const email=`${username}@${AUTH_DOMAIN}`;
    const sellerId=String(body.sellerId||'').trim()||`seller_${username.replace(/[^a-z0-9_-]/g,'_')}`;
    let createdId=null;
    try{
      const create=await adminFetch('/auth/v1/admin/users',secret,{
        method:'POST',
        body:JSON.stringify({email,password,email_confirm:true,user_metadata:{username,full_name:fullName}})
      });
      const created=await create.json().catch(()=>({}));
      if(!create.ok)return json({error:created.msg||created.message||created.error||'Falha ao criar usuário.'},create.status);
      createdId=created.id||created.user?.id;
      if(!createdId)throw new Error('Supabase não retornou o ID do usuário.');

      await patchProfile(createdId,{username,full_name:fullName,email,role,active:true,must_change_password:true,seller_id:sellerId},secret);
      await upsertSeller({id:sellerId,user_id:createdId,name:fullName,phone:phone||null,email:contactEmail||null,commission,goal,active:true,access_role:role,notes:'Usuário com login no sistema'},secret);
      return json({ok:true,userId:createdId,sellerId});
    }catch(e){
      if(createdId){try{await adminFetch(`/auth/v1/admin/users/${encodeURIComponent(createdId)}`,secret,{method:'DELETE'})}catch{}}
      return json({error:e.message||'Falha ao criar usuário.'},500);
    }
  }

  if(!['owner','admin'].includes(callerRole))
    return json({error:'Somente ADM/Dono pode administrar logins existentes.'},403);

  const userId=String(body.userId||'').trim();
  if(!userId)return json({error:'Usuário não informado.'},400);

  if(action==='get'){
    const profile=await getProfile(userId,secret);
    if(!profile)return json({error:'Perfil não encontrado.'},404);
    const seller=await getSeller(profile.seller_id,secret);
    return json({
      ok:true,
      user:{
        id:profile.id,username:profile.username||'',fullName:profile.full_name||'',
        email:profile.email||'',role:profile.role||'seller',active:profile.active!==false,
        mustChange:profile.must_change_password===true,sellerId:profile.seller_id||''
      },
      seller
    });
  }

  if(action==='update'){
    const profile=await getProfile(userId,secret);
    if(!profile)return json({error:'Perfil não encontrado.'},404);
    const fullName=String(body.fullName||'').trim();
    const username=String(body.username||'').trim().toLowerCase().replace(/[^a-z0-9._-]/g,'');
    const role=String(body.role||'seller').toLowerCase();
    const active=body.active!==false;
    const mustChange=body.mustChange===true;
    if(!fullName||username.length<3)return json({error:'Nome e usuário são obrigatórios.'},400);
    if(!['owner','admin','manager','seller'].includes(role))return json({error:'Perfil inválido.'},400);

    const email=`${username}@${AUTH_DOMAIN}`;
    const authUpdate=await adminFetch(`/auth/v1/admin/users/${encodeURIComponent(userId)}`,secret,{
      method:'PUT',
      body:JSON.stringify({email,email_confirm:true,user_metadata:{username,full_name:fullName},ban_duration:active?'none':'876000h'})
    });
    if(!authUpdate.ok){
      const x=await authUpdate.json().catch(()=>({}));
      return json({error:x.msg||x.message||x.error||'Falha ao atualizar usuário no Auth.'},authUpdate.status);
    }

    const sellerId=String(body.sellerId||profile.seller_id||'').trim()||`seller_${username.replace(/[^a-z0-9_-]/g,'_')}`;
    await patchProfile(userId,{username,full_name:fullName,email,role,active,must_change_password:mustChange,seller_id:sellerId},secret);
    await upsertSeller({
      id:sellerId,user_id:userId,name:fullName,
      phone:String(body.phone||'').trim()||null,
      email:String(body.contactEmail||'').trim()||null,
      commission:Number(body.commission||0),goal:Number(body.goal||0),
      active,access_role:role,notes:'Usuário com login no sistema'
    },secret);
    return json({ok:true});
  }

  if(action==='set_password'){
    const password=String(body.password||'');
    if(password.length<8)return json({error:'A senha deve ter pelo menos 8 caracteres.'},400);
    const r=await adminFetch(`/auth/v1/admin/users/${encodeURIComponent(userId)}`,secret,{
      method:'PUT',body:JSON.stringify({password})
    });
    if(!r.ok){
      const x=await r.json().catch(()=>({}));
      return json({error:x.msg||x.message||x.error||'Falha ao redefinir senha.'},r.status);
    }
    await patchProfile(userId,{must_change_password:body.forceChange===true},secret);
    return json({ok:true});
  }

  if(action==='delete'){
    if(userId===caller.user.id)return json({error:'Você não pode excluir o próprio login enquanto estiver conectado.'},400);
    const profile=await getProfile(userId,secret);
    if(!profile)return json({error:'Perfil não encontrado.'},404);
    const sellerId=String(body.sellerId||profile.seller_id||'').trim();

    if(sellerId){
      const seller=await getSeller(sellerId,secret);
      if(seller){
        await upsertSeller({
          ...seller,user_id:null,active:false,
          notes:`${seller.notes||''}${seller.notes?' • ':''}Login excluído; histórico preservado`
        },secret);
      }
    }

    const r=await adminFetch(`/auth/v1/admin/users/${encodeURIComponent(userId)}`,secret,{method:'DELETE'});
    if(!r.ok){
      const x=await r.json().catch(()=>({}));
      return json({error:x.msg||x.message||x.error||'Falha ao excluir login.'},r.status);
    }
    return json({ok:true});
  }

  return json({error:'Ação administrativa inválida.'},400);
}
