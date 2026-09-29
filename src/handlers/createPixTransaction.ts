import { Env, PixCreateInput, PixCreateOutput } from '../types';

export async function createPixTransaction(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body: PixCreateInput = await request.json();
    const { amount, buyer_name, buyer_email, buyer_phone, buyer_document, product_name } = body;

    // Validações
    if (!amount || amount < 600 || amount > 300000) {
      return jsonResponse({
        success: false,
        error: 'O valor mínimo é R$ 6,00 (600 centavos) e o máximo é R$ 3.000,00 (300000 centavos).'
      }, 400);
    }

    if (!buyer_name || !buyer_email || !buyer_document) {
      return jsonResponse({ success: false, error: 'Nome, e-mail e CPF são obrigatórios.' }, 400);
    }

    const cleanDocument = (buyer_document || '').replace(/\D/g, '');
    let cleanPhone = (buyer_phone || '').replace(/\D/g, '');
    if (cleanPhone.length >= 10 && !cleanPhone.startsWith('55')) {
      cleanPhone = `55${cleanPhone}`;
    }

    const token = env.BUCKPAY_TOKEN;
    if (!token) {
      return jsonResponse({
        success: false,
        error: 'Variável de ambiente BUCKPAY_TOKEN não configurada no Cloudflare Worker.'
      }, 500);
    }
    const userAgent = env.BUCKPAY_USER_AGENT || 'Buckpay API';
    const webhookUrl = env.WEBHOOK_URL || 'https://dudutreinamentocpa.siteverificado.workers.dev/webhook/buckpay';

    const externalId = `order-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;

    const buckpayPayload = {
      external_id: externalId,
      payment_method: 'pix',
      amount: Math.round(amount),
      buyer: {
        name: buyer_name.trim(),
        email: buyer_email.trim(),
        document: cleanDocument,
        phone: cleanPhone,
      },
      product: {
        name: (product_name || 'Treinamento CPA Chinês').trim(),
      },
      postbackUrl: webhookUrl,
    };

    const response = await fetch('https://api.realtechdev.com.br/v1/transactions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'User-Agent': userAgent,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(buckpayPayload),
    });

    const resData: any = await response.json().catch(() => ({}));

    if (!response.ok) {
      const errorMsg = resData.message || resData.error || 'Erro ao comunicar com BuckPay';
      return jsonResponse({ success: false, error: errorMsg }, response.status);
    }

    const data = resData.data || resData;
    const output: PixCreateOutput = {
      success: true,
      transaction_id: data.id,
      pix_code: data.pix?.code || data.pix_code || '',
      qrcode_base64: data.pix?.qrcode_base64 || data.qrcode_base64 || '',
      status: data.status || 'pending',
    };

    return jsonResponse(output, 201);
  } catch (err: any) {
    return jsonResponse({ success: false, error: err.message || 'Erro interno.' }, 500);
  }
}

function jsonResponse(data: any, status: number = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}
