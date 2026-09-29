import { Env } from './types';
import { createPixTransaction } from './handlers/createPixTransaction';
import { handlePixWebhook } from './handlers/handlePixWebhook';

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

    // 1. API: Criar Transação PIX (BuckPay)
    if (pathname === '/checkout/pix' && method === 'POST') {
      return await createPixTransaction(request, env);
    }

    // 2. API: Webhook BuckPay
    if (pathname === '/webhook/buckpay' && method === 'POST') {
      return await handlePixWebhook(request);
    }

    // 3. Servir o Site Completo (Landing Page + Assets)
    if ((env as any).ASSETS) {
      return await (env as any).ASSETS.fetch(request);
    }

    return new Response('Site carregado com sucesso. Para ver os arquivos visuais, certifique-se de que os assets foram compilados no deploy.', {
      status: 200,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' },
    });
  },
};
