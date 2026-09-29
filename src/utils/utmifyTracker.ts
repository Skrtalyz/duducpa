// Utilitário para rastreamento de eventos da UTMify e pixels integrados (Meta/Facebook, TikTok, Google)

export function trackInitiateCheckout(planName: string = 'Treinamento CPA Chinês', planPrice: number = 27.0) {
  try {
    const pixelId = (typeof window !== 'undefined' && (window as any).pixelId) || '6abc1b828aea9115177803e0';

    // 1. Recupera lead salvo pela UTMify em localStorage
    let lead: any = null;
    try {
      const rawLead = localStorage.getItem('lead');
      if (rawLead) {
        lead = JSON.parse(rawLead);
      }
    } catch {
      // Ignora erro de parse
    }

    if (!lead || !lead.pixelId) {
      lead = {
        pixelId,
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      };
    }

    const currentUrl = typeof window !== 'undefined' ? window.location.href : '';
    const cleanUrl = currentUrl ? currentUrl.split('?')[0].split('#')[0] : 'https://dudutreinamentocpa.siteverificado.workers.dev';

    // 2. Dispara requisição oficial diretamente ao endpoint de tracking da UTMify
    fetch('https://tracking.utmify.com.br/tracking/v1/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        type: 'InitiateCheckout',
        lead,
        event: {
          sourceUrl: cleanUrl,
          pageTitle: typeof document !== 'undefined' && document.title ? document.title : 'Checkout - CPA Chinês',
          value: planPrice,
          currency: 'BRL',
          content_name: planName,
        },
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data?.lead && typeof localStorage !== 'undefined') {
          try {
            localStorage.setItem('lead', JSON.stringify(data.lead));
          } catch {
            // Ignora se localStorage estiver cheio ou restrito
          }
        }
      })
      .catch(() => {
        // Ignora erro de rede em conexões instáveis
      });

    // 3. Dispara no Meta Pixel (Facebook Pixel) inicializado pela UTMify ou pelo site
    if (typeof window !== 'undefined' && typeof (window as any).fbq === 'function') {
      (window as any).fbq('track', 'InitiateCheckout', {
        content_name: planName,
        value: planPrice,
        currency: 'BRL',
      });
    }

    // 4. Dispara no TikTok Pixel caso configurado
    if (typeof window !== 'undefined' && typeof (window as any).ttq?.track === 'function') {
      (window as any).ttq.track('InitiateCheckout', {
        content_name: planName,
        value: planPrice,
        currency: 'BRL',
      });
    }

    // 5. Dispara no Google (gtag) se presente
    if (typeof window !== 'undefined' && typeof (window as any).gtag === 'function') {
      (window as any).gtag('event', 'begin_checkout', {
        value: planPrice,
        currency: 'BRL',
        items: [{ item_name: planName, price: planPrice }],
      });
    }
  } catch (err) {
    console.error('Erro ao disparar InitiateCheckout:', err);
  }
}
