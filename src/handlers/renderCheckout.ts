export function renderCheckoutPage(): Response {
  const html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Checkout Seguro PIX - BuckPay</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <style>
    :root {
      --bg: #070709;
      --card-bg: rgba(18, 18, 22, 0.85);
      --border: rgba(255, 255, 255, 0.08);
      --border-focus: #f59e0b;
      --text: #f5f5f7;
      --text-muted: #86868b;
      --emerald: #10b981;
      --gold: #f59e0b;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, sans-serif;
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 24px 16px;
      overflow-x: hidden;
      position: relative;
    }
    .glow-1 {
      position: fixed;
      top: -100px;
      left: 15%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(245, 158, 11, 0.12) 0%, transparent 70%);
      filter: blur(80px);
      pointer-events-none;
      z-index: 0;
    }
    .glow-2 {
      position: fixed;
      bottom: -100px;
      right: 15%;
      width: 500px;
      height: 500px;
      background: radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, transparent 70%);
      filter: blur(80px);
      pointer-events-none;
      z-index: 0;
    }
    .checkout-container {
      position: relative;
      z-index: 1;
      width: 100%;
      max-width: 540px;
      background: var(--card-bg);
      backdrop-filter: blur(24px);
      -webkit-backdrop-filter: blur(24px);
      border: 1px solid var(--border);
      border-radius: 28px;
      padding: 36px 32px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.7);
    }
    .header { text-align: center; margin-bottom: 28px; }
    .header-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 4px 12px;
      border-radius: 9999px;
      background: rgba(245, 158, 11, 0.1);
      border: 1px solid rgba(245, 158, 11, 0.25);
      color: #fbbf24;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 12px;
    }
    .header h1 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; margin-bottom: 6px; }
    .header p { font-size: 13px; color: var(--text-muted); }
    .form-group { margin-bottom: 18px; }
    label { display: block; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px; color: #a1a1a6; margin-bottom: 8px; }
    .input-wrapper { position: relative; }
    input[type="text"], input[type="email"], select {
      width: 100%;
      background: rgba(255, 255, 255, 0.04);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 14px 16px;
      color: #fff;
      font-size: 15px;
      outline: none;
      transition: all 0.2s ease;
      font-family: inherit;
    }
    input:focus, select:focus {
      border-color: var(--border-focus);
      background: rgba(255, 255, 255, 0.07);
      box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.15);
    }
    .price-card {
      background: rgba(245, 158, 11, 0.06);
      border: 1px solid rgba(245, 158, 11, 0.2);
      border-radius: 18px;
      padding: 16px 20px;
      margin-bottom: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .price-card-label { font-size: 13px; color: #d4d4d8; font-weight: 500; }
    .price-card-value { font-size: 22px; font-weight: 800; color: #fbbf24; }
    .btn-submit {
      width: 100%;
      background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%);
      color: #000;
      font-weight: 700;
      font-size: 16px;
      border: none;
      border-radius: 16px;
      padding: 16px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: all 0.2s ease;
      box-shadow: 0 10px 25px -5px rgba(245, 158, 11, 0.35);
    }
    .btn-submit:hover:not(:disabled) {
      transform: translateY(-2px);
      box-shadow: 0 14px 30px -5px rgba(245, 158, 11, 0.5);
    }
    .btn-submit:disabled { opacity: 0.6; cursor: not-allowed; }
    .alert-error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #fca5a5;
      padding: 12px 16px;
      border-radius: 12px;
      font-size: 13px;
      margin-bottom: 20px;
      display: none;
    }
    #pix-container { display: none; text-align: center; }
    .qr-frame {
      display: inline-block;
      padding: 16px;
      background: #ffffff;
      border-radius: 20px;
      margin: 16px 0 24px 0;
      box-shadow: 0 10px 25px rgba(0,0,0,0.5);
    }
    .qr-frame img { display: block; width: 220px; height: 220px; object-fit: contain; }
    .pix-code-box {
      position: relative;
      background: rgba(0, 0, 0, 0.4);
      border: 1px solid var(--border);
      border-radius: 14px;
      padding: 12px 14px;
      margin-bottom: 18px;
      display: flex;
      align-items: center;
    }
    .pix-code-box input {
      background: transparent;
      border: none;
      color: #a1a1a6;
      font-family: 'JetBrains Mono', monospace;
      font-size: 12px;
      width: 100%;
      outline: none;
    }
    .btn-copy {
      background: #27272a;
      border: 1px solid #3f3f46;
      color: #fff;
      font-weight: 600;
      font-size: 14px;
      border-radius: 12px;
      padding: 12px 18px;
      width: 100%;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 8px;
      transition: background 0.2s;
    }
    .btn-copy:hover { background: #3f3f46; }
    .btn-copy.copied { background: #10b981; border-color: #10b981; color: #000; font-weight: 700; }
    .timer-text { font-size: 13px; color: var(--text-muted); margin-top: 14px; }
  </style>
</head>
<body>
  <div class="glow-1"></div>
  <div class="glow-2"></div>

  <div class="checkout-container">
    <div class="header">
      <div class="header-badge">⚡ Checkout Oficial PIX</div>
      <h1>Finalizar Inscrição</h1>
      <p>Liberação automática em menos de 10 segundos via PIX</p>
    </div>

    <div id="error-box" class="alert-error"></div>

    <!-- FORMULÁRIO -->
    <div id="form-container">
      <form id="checkout-form">
        <div class="form-group">
          <label>Nome Completo *</label>
          <input type="text" id="buyer_name" placeholder="Ex: Lucas Silva" required autocomplete="name">
        </div>
        <div class="form-group">
          <label>E-mail para Acesso *</label>
          <input type="email" id="buyer_email" placeholder="seu@email.com" required autocomplete="email">
        </div>
        <div class="form-group">
          <label>CPF *</label>
          <input type="text" id="buyer_document" placeholder="000.000.000-00" required maxlength="14">
        </div>
        <div class="form-group">
          <label>Celular / WhatsApp *</label>
          <input type="text" id="buyer_phone" placeholder="(11) 90000-0000" required maxlength="15">
        </div>
        <div class="form-group">
          <label>Produto</label>
          <input type="text" id="product_name" value="Treinamento CPA Chinês" readonly>
        </div>
        <div class="form-group">
          <label>Valor (R$)</label>
          <input type="text" id="amount_display" value="R$ 27,00">
          <input type="hidden" id="amount_cents" value="2700">
        </div>

        <div class="price-card">
          <span class="price-card-label">Total a pagar via PIX:</span>
          <span class="price-card-value" id="badge-price">R$ 27,00</span>
        </div>

        <button type="submit" id="btn-submit" class="btn-submit">
          <span>Gerar PIX e Concluir</span>
          <span>→</span>
        </button>
      </form>
    </div>

    <!-- TELA PIX -->
    <div id="pix-container">
      <p style="font-size: 14px; color: #d4d4d8; margin-bottom: 6px;">Escaneie o QR Code abaixo com seu banco:</p>
      
      <div class="qr-frame">
        <img id="qr-image" src="" alt="QR Code PIX">
      </div>

      <div class="pix-code-box">
        <input type="text" id="pix-code-input" readonly>
      </div>

      <button type="button" id="btn-copy-pix" class="btn-copy">
        <span id="copy-text">Copiar Código PIX (Copia e Cola)</span>
      </button>

      <div class="timer-text">
        Este código expira em <b id="countdown-timer" style="color: #fbbf24;">15:00</b>
      </div>
    </div>
  </div>

  <script>
    document.addEventListener('DOMContentLoaded', () => {
      const form = document.getElementById('checkout-form');
      const formContainer = document.getElementById('form-container');
      const pixContainer = document.getElementById('pix-container');
      const errorBox = document.getElementById('error-box');

      const nameInput = document.getElementById('buyer_name');
      const emailInput = document.getElementById('buyer_email');
      const docInput = document.getElementById('buyer_document');
      const phoneInput = document.getElementById('buyer_phone');
      const productInput = document.getElementById('product_name');
      const amountDisplay = document.getElementById('amount_display');
      const amountCentsInput = document.getElementById('amount_cents');
      const badgePrice = document.getElementById('badge-price');
      const submitBtn = document.getElementById('btn-submit');

      const qrImage = document.getElementById('qr-image');
      const pixCodeInput = document.getElementById('pix-code-input');
      const copyBtn = document.getElementById('btn-copy-pix');
      const copyText = document.getElementById('copy-text');
      const countdownTimer = document.getElementById('countdown-timer');

      let timerInterval = null;
      let timeLeft = 900;

      // Máscara CPF
      docInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\\D/g, '').slice(0, 11);
        if (v.length > 9) v = \`\${v.slice(0,3)}.\${v.slice(3,6)}.\${v.slice(6,9)}-\${v.slice(9)}\`;
        else if (v.length > 6) v = \`\${v.slice(0,3)}.\${v.slice(3,6)}.\${v.slice(6)}\`;
        else if (v.length > 3) v = \`\${v.slice(0,3)}.\${v.slice(3)}\`;
        e.target.value = v;
      });

      // Máscara Telefone
      phoneInput.addEventListener('input', (e) => {
        let v = e.target.value.replace(/\\D/g, '').slice(0, 11);
        if (v.length > 6) v = \`(\${v.slice(0,2)}) \${v.slice(2,7)}-\${v.slice(7)}\`;
        else if (v.length > 2) v = \`(\${v.slice(0,2)}) \${v.slice(2)}\`;
        else if (v.length > 0) v = \`(\${v}\`;
        e.target.value = v;
      });

      // Máscara Moeda
      amountDisplay.addEventListener('input', (e) => {
        let raw = e.target.value.replace(/\\D/g, '');
        if (!raw) raw = '0';
        let cents = Math.min(parseInt(raw, 10), 300000);
        amountCentsInput.value = cents.toString();
        const formatted = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
        amountDisplay.value = formatted;
        badgePrice.innerText = formatted;
      });

      // Copiar PIX
      copyBtn.addEventListener('click', () => {
        const code = pixCodeInput.value;
        if (!code) return;
        navigator.clipboard.writeText(code).then(() => {
          copyBtn.classList.add('copied');
          copyText.innerText = '✓ Código PIX Copiado!';
          setTimeout(() => {
            copyBtn.classList.remove('copied');
            copyText.innerText = 'Copiar Código PIX (Copia e Cola)';
          }, 3000);
        });
      });

      // Submit
      form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorBox.style.display = 'none';

        const name = nameInput.value.trim();
        const email = emailInput.value.trim();
        const docClean = docInput.value.replace(/\\D/g, '');
        const phoneClean = phoneInput.value.replace(/\\D/g, '');
        const amountCents = parseInt(amountCentsInput.value, 10);

        if (name.split(' ').length < 2) {
          showError('Por favor, informe seu nome e sobrenome.');
          return;
        }
        if (docClean.length !== 11) {
          showError('CPF inválido. Digite os 11 números.');
          return;
        }

        submitBtn.disabled = true;
        submitBtn.innerHTML = '<span>Gerando PIX...</span>';

        try {
          const res = await fetch('/checkout/pix', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: amountCents,
              buyer_name: name,
              buyer_email: email,
              buyer_document: docClean,
              buyer_phone: phoneClean,
              product_name: productInput.value.trim(),
            })
          });

          const data = await res.json().catch(() => ({}));

          if (!res.ok || !data.success) {
            const msg = typeof data.error === 'string' ? data.error : (data.error?.message || data.message || 'Erro ao processar PIX.');
            throw new Error(msg);
          }

          formContainer.style.display = 'none';
          pixContainer.style.display = 'block';

          let qrSrc = data.qrcode_base64 || '';
          if (qrSrc && !qrSrc.startsWith('data:image')) {
            qrSrc = 'data:image/png;base64,' + qrSrc;
          }
          qrImage.src = qrSrc;
          pixCodeInput.value = data.pix_code || '';

          // Iniciar Timer 15 min
          timeLeft = 900;
          if (timerInterval) clearInterval(timerInterval);
          timerInterval = setInterval(() => {
            timeLeft--;
            if (timeLeft <= 0) {
              clearInterval(timerInterval);
              countdownTimer.innerText = 'Expirado';
            } else {
              const m = Math.floor(timeLeft / 60);
              const s = timeLeft % 60;
              countdownTimer.innerText = \`\${m.toString().padStart(2, '0')}:\${s.toString().padStart(2, '0')}\`;
            }
          }, 1000);

        } catch (err) {
          showError(err.message || 'Erro de conexão com o servidor de pagamento.');
          submitBtn.disabled = false;
          submitBtn.innerHTML = '<span>Gerar PIX e Concluir</span> <span>→</span>';
        }
      });

      function showError(msg) {
        errorBox.innerText = msg;
        errorBox.style.display = 'block';
      }
    });
  </script>
</body>
</html>`;

  return new Response(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Access-Control-Allow-Origin': '*',
    },
  });
}
