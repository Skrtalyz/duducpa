export async function handlePixWebhook(request: Request): Promise<Response> {
  try {
    const raw = await request.text();
    console.log('[BuckPay Webhook Received]:', raw);

    let payload: any = {};
    try {
      payload = JSON.parse(raw);
    } catch {}

    const { event, data } = payload || {};
    console.log(`[BuckPay Webhook] Event: ${event} | Status: ${data?.status} | ID: ${data?.id} | ExternalID: ${data?.external_id}`);

    if (event === 'transaction.processed' && (data?.status === 'paid' || data?.status === 'completed')) {
      console.log(`[BuckPay Webhook] ✅ PAGAMENTO CONFIRMADO: ${data?.id} (R$ ${(data?.amount || 0) / 100})`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err: any) {
    console.error('[BuckPay Webhook Error]:', err);
    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
