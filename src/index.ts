import { Env } from './types';
import { createPixTransaction } from './handlers/createPixTransaction';
import { handlePixWebhook } from './handlers/handlePixWebhook';
import { renderCheckoutPage } from './handlers/renderCheckout';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method.toUpperCase();
    const pathname = url.pathname;

    // CORS Preflight
    if (method === 'OPTIONS') {
      return new Response(null, {
        status: 204,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      });
    }

    // 1. Servir Página de Checkout no Workers
    if ((pathname === '/' || pathname === '/checkout' || pathname === '/checkout.html') && method === 'GET') {
      return renderCheckoutPage();
    }

    // 2. Criar Transação PIX (BuckPay)
    if (pathname === '/checkout/pix' && method === 'POST') {
      return await createPixTransaction(request, env);
    }

    // 3. Webhook BuckPay
    if (pathname === '/webhook/buckpay' && method === 'POST') {
      return await handlePixWebhook(request);
    }

    // 4. Servir arquivos estáticos se o binding ASSETS existir
    if ((env as any).ASSETS) {
      return await (env as any).ASSETS.fetch(request);
    }

    return new Response(JSON.stringify({ error: 'Endpoint não encontrado.' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  },
};
