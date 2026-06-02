export default async function handler(req, res) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const tok = process.env.ASAAS_WEBHOOK_TOKEN;

  // Testa conexão com Supabase
  let supabaseOk = false;
  let supabaseError = null;
  if (url && key) {
    try {
      const r = await fetch(`${url}/rest/v1/companies?select=id&limit=1`, {
        headers: { apikey: key, Authorization: `Bearer ${key}` }
      });
      supabaseOk = r.ok;
      if (!r.ok) supabaseError = await r.text();
    } catch(e) { supabaseError = e.message; }
  }

  return res.status(200).json({
    env: {
      SUPABASE_URL:              url ? '✅ definida' : '❌ ausente',
      SUPABASE_SERVICE_ROLE_KEY: key ? '✅ definida' : '❌ ausente',
      ASAAS_WEBHOOK_TOKEN:       tok ? '✅ definida' : '❌ ausente',
    },
    supabase: supabaseOk ? '✅ conectado' : `❌ erro: ${supabaseError}`,
  });
}
