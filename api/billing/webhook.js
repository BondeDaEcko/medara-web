/**
 * Asaas Webhook — recebe eventos de pagamento e atualiza companies no Supabase
 * URL pública: https://medara-web.vercel.app/api/billing/webhook
 */

const SUPABASE_URL         = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const WEBHOOK_TOKEN        = process.env.ASAAS_WEBHOOK_TOKEN;

// Mapeia evento Asaas → status da empresa
const STATUS_MAP = {
  // Ativa
  PAYMENT_RECEIVED:              { payment_status: 'active',    is_active: true,  blocked: false },
  PAYMENT_CONFIRMED:             { payment_status: 'active',    is_active: true,  blocked: false },
  // Bloqueia
  PAYMENT_OVERDUE:               { payment_status: 'overdue',   is_active: false, blocked: true  },
  PAYMENT_DELETED:               { payment_status: 'cancelled', is_active: false, blocked: true  },
  PAYMENT_REFUNDED:              { payment_status: 'refunded',  is_active: false, blocked: true  },
  PAYMENT_CHARGEBACK_REQUESTED:  { payment_status: 'chargeback',is_active: false, blocked: true  },
  SUBSCRIPTION_DELETED:          { payment_status: 'cancelled', is_active: false, blocked: true  },
  // Log apenas (sem mudança de status)
  SUBSCRIPTION_CREATED:  null,
  SUBSCRIPTION_UPDATED:  null,
  PAYMENT_CREATED:       null,
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  // Valida token de autenticação do Asaas
  if (WEBHOOK_TOKEN) {
    const token = (req.headers['asaas-access-token'] || '').trim();
    if (!token || token !== WEBHOOK_TOKEN.trim()) {
      console.error('[webhook] Token inválido');
      return res.status(401).json({ error: 'Unauthorized' });
    }
  }

  const body    = req.body;
  const event   = body?.event;
  const payment = body?.payment;

  // SUBSCRIPTION_DELETED tem o ID no objeto subscription, não em payment
  const subId = event?.startsWith('SUBSCRIPTION_')
    ? (body?.subscription?.id ?? body?.subscription)
    : payment?.subscription;

  console.log(`[webhook] event=${event} subscription=${subId}`);

  // Eventos de log apenas (sem ação no banco)
  if (STATUS_MAP[event] === null) {
    console.log(`[webhook] evento de log: ${event}`);
    return res.status(200).json({ received: true, logged: true });
  }

  // Ignora eventos completamente desconhecidos
  if (!(event in STATUS_MAP)) {
    return res.status(200).json({ received: true, ignored: true });
  }

  if (!subId) {
    return res.status(200).json({ received: true, ignored: true });
  }

  const { payment_status, is_active, blocked } = STATUS_MAP[event];

  // Monta patch para o Supabase
  const patch = {
    payment_status,
    active:        is_active,
    blocked_at:    blocked ? new Date().toISOString() : null,
    next_due_date: payment?.dueDate ?? null,
  };

  try {
    const url = `${SUPABASE_URL}/rest/v1/companies?asaas_subscription_id=eq.${encodeURIComponent(subId)}`;
    const resp = await fetch(url, {
      method:  'PATCH',
      headers: {
        'Content-Type':  'application/json',
        'apikey':        SUPABASE_SERVICE_KEY,
        'Authorization': `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Prefer':        'return=minimal',
      },
      body: JSON.stringify(patch),
    });

    if (!resp.ok) {
      const err = await resp.text();
      console.error('[webhook] Supabase erro:', err);
      return res.status(502).json({ error: 'Supabase update failed' });
    }

    console.log(`[webhook] update OK → subscription=${subId} status=${payment_status}`);
    return res.status(200).json({ received: true });

  } catch (err) {
    console.error('[webhook] Erro interno:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
