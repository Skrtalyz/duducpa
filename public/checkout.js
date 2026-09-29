// Checkout Vanilla JS - BuckPay PIX

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
  const pixTotalDisplay = document.getElementById('pix-total-display');

  let timerInterval = null;
  let timeLeftSeconds = 900; // 15 minutos

  // 1. Máscara de CPF (000.000.000-00)
  docInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    e.target.value = value;
  });

  // 2. Máscara de Telefone ((00) 00000-0000)
  phoneInput.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    e.target.value = value;
  });

  // 3. Máscara e parser de valor em R$
  amountDisplay.addEventListener('input', (e) => {
    let raw = e.target.value.replace(/\D/g, '');
    if (!raw) raw = '0';
    let cents = parseInt(raw, 10);
    if (cents > 300000) cents = 300000;

    amountCentsInput.value = cents.toString();
    const formatted = (cents / 100).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    amountDisplay.value = formatted;
    badgePrice.innerText = formatted;
    pixTotalDisplay.innerText = formatted;
  });

  // 4. Copiar código PIX
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

  pixCodeInput.addEventListener('click', () => copyBtn.click());

  // 5. Envio do Formulário (POST /checkout/pix)
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorBox.style.display = 'none';
    errorBox.innerText = '';

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const documentClean = docInput.value.replace(/\D/g, '');
    const phoneClean = phoneInput.value.replace(/\D/g, '');
    const product = productInput.value.trim();
    const amountCents = parseInt(amountCentsInput.value, 10);

    if (name.split(' ').length < 2) {
      showError('Por favor, informe seu nome e sobrenome.');
      return;
    }

    if (documentClean.length !== 11) {
      showError('CPF inválido. Digite 11 números.');
      return;
    }

    if (!amountCents || amountCents < 600 || amountCents > 300000) {
      showError('O valor deve ser entre R$ 6,00 e R$ 3.000,00.');
      return;
    }

    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>Gerando PIX...</span>';

    try {
      const response = await fetch('/checkout/pix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amountCents,
          buyer_name: name,
          buyer_email: email,
          buyer_document: documentClean,
          buyer_phone: phoneClean,
          product_name: product,
        }),
      });

      const data = await response.json();

      let errorMsg = 'Erro ao processar PIX no servidor.';
      if (typeof data.error === 'string') {
        errorMsg = data.error;
      } else if (data.error && typeof data.error === 'object') {
        errorMsg = data.error.message || JSON.stringify(data.error);
      } else if (data.message) {
        errorMsg = typeof data.message === 'string' ? data.message : JSON.stringify(data.message);
      }

      if (!response.ok || !data.success) {
        throw new Error(errorMsg);
      }

      displayPix(data);
    } catch (err) {
      console.error('[Checkout Error]:', err);
      showError(err.message || 'Erro ao conectar ao servidor de pagamento.');
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<span>Gerar PIX e Concluir</span> <span>→</span>';
    }
  });

  function showError(msg) {
    errorBox.innerText = msg;
    errorBox.style.display = 'block';
  }

  function displayPix(data) {
    formContainer.style.display = 'none';
    pixContainer.style.display = 'block';

    let qrcodeSrc = data.qrcode_base64;
    if (qrcodeSrc && !qrcodeSrc.startsWith('data:image')) {
      qrcodeSrc = `data:image/png;base64,${qrcodeSrc}`;
    }
    qrImage.src = qrcodeSrc;
    pixCodeInput.value = data.pix_code;

    startTimer(900);
  }

  function startTimer(seconds) {
    timeLeftSeconds = seconds;
    updateTimerText();

    if (timerInterval) clearInterval(timerInterval);
    timerInterval = setInterval(() => {
      timeLeftSeconds--;
      if (timeLeftSeconds <= 0) {
        clearInterval(timerInterval);
        countdownTimer.innerText = 'Expirado';
      } else {
        updateTimerText();
      }
    }, 1000);
  }

  function updateTimerText() {
    const mins = Math.floor(timeLeftSeconds / 60);
    const secs = timeLeftSeconds % 60;
    countdownTimer.innerText = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
});
