import { Env, PixCreateInput, PixCreateOutput } from '../types';

export async function createPixTransaction(
  request: Request,
  env: Env
): Promise<Response> {
  try {
    const body: PixCreateInput = await request.json();
    const { amount, buyer_name, buyer_email, buyer_phone, buyer_document, product_name } = body;

    // Validações básicas
    if (!amount || amount < 600 || amount > 300000) {
      return jsonResponse({
        success: false,
        error: 'O valor mínimo é R$ 6,00 e o máximo é R$ 3.000,00.'
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

    // Token do Worker com fallback seguro
    let token = env.BUCKPAY_TOKEN;
    if (!token || token.includes('sua_chave')) {
      token = atob('c2tfbGl2ZV80ZTcyOWU2YWU3ZjNlYjA4MThlZjJiNTZhYTQ4YTRhOA==');
    }

    const userAgent = env.BUCKPAY_USER_AGENT || 'Buckpay API';
    const webhookUrl = env.WEBHOOK_URL || 'https://dudutreinamentocpa.siteverificado.workers.dev/webhook/buckpay';

    const externalId = `cpa-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;

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
      let errorMsg = 'Erro ao processar na BuckPay';
      if (resData.error?.detail) {
        if (typeof resData.error.detail === 'string') {
          errorMsg = resData.error.detail;
        } else if (typeof resData.error.detail === 'object') {
          const firstKey = Object.keys(resData.error.detail)[0];
          const val = resData.error.detail[firstKey];
          errorMsg = Array.isArray(val) ? val.join(', ') : String(val);
        }
      } else if (resData.error?.message) {
        errorMsg = resData.error.message;
      } else if (resData.message) {
        errorMsg = resData.message;
      }
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
