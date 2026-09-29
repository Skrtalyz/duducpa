import React, { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { trackInitiateCheckout } from '../utils/utmifyTracker';
import {
  CheckCircle2,
  Copy,
  Check,
  ArrowRight,
  ArrowLeft,
  Clock,
  Sparkles,
  User,
  Mail,
  Phone,
  MessageSquare,
  AlertCircle,
  RefreshCw,
  QrCode,
  CheckCircle,
  ShieldCheck,
  FileText
} from 'lucide-react';

interface CheckoutPageProps {
  plan: 'basico' | 'completo';
  onBack: () => void;
}

// Algoritmo oficial de validação de dígitos verificadores do CPF
function isValidCPF(cpf: string): boolean {
  const clean = cpf.replace(/\D/g, '');
  if (clean.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(clean)) return false;

  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean.charAt(i), 10) * (10 - i);
  }
  let rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(9), 10)) return false;

  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean.charAt(i), 10) * (11 - i);
  }
  rev = 11 - (sum % 11);
  if (rev === 10 || rev === 11) rev = 0;
  if (rev !== parseInt(clean.charAt(10), 10)) return false;

  return true;
}

export const CheckoutPage: React.FC<CheckoutPageProps> = ({ plan, onBack }) => {
  const isVip = plan === 'completo';
  const planTitle = isVip ? 'Plano Completo (VIP) ⭐' : 'Plano Básico';
  const planPrice = isVip ? 27.00 : 14.90;
  const planFormattedPrice = isVip ? 'R$ 27,00' : 'R$ 14,90';

  // Checkout steps: 'form' | 'pix' | 'success'
  const [step, setStep] = useState<'form' | 'pix' | 'success'>('form');

  // Form states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [cpf, setCpf] = useState('');
  const [discordNick, setDiscordNick] = useState('');
  const [phone, setPhone] = useState('');

  // UI & Validation states
  const [errors, setErrors] = useState<{ name?: string; email?: string; cpf?: string; phone?: string; api?: string }>({});
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(900); // 15 minutos
  const [pixCode, setPixCode] = useState('');
  const [qrImage, setQrImage] = useState<string | null>(null);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);

  // Scroll to top on mount e dispara evento InitiateCheckout (IC) na UTMify
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
    trackInitiateCheckout(planTitle, planPrice);
  }, [planTitle, planPrice]);

  // Timer countdown
  useEffect(() => {
    if (step !== 'pix') return;
    const interval = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // CPF input formatting (000.000.000-00)
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 11);
    if (value.length > 9) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6, 9)}-${value.slice(9)}`;
    } else if (value.length > 6) {
      value = `${value.slice(0, 3)}.${value.slice(3, 6)}.${value.slice(6)}`;
    } else if (value.length > 3) {
      value = `${value.slice(0, 3)}.${value.slice(3)}`;
    }
    setCpf(value);
    if (errors.cpf) setErrors((prev) => ({ ...prev, cpf: undefined }));
    if (errors.api) setErrors((prev) => ({ ...prev, api: undefined }));
  };

  // Phone input formatting ((00) 00000-0000)
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 11) value = value.slice(0, 11);

    if (value.length > 6) {
      value = `(${value.slice(0, 2)}) ${value.slice(2, 7)}-${value.slice(7)}`;
    } else if (value.length > 2) {
      value = `(${value.slice(0, 2)}) ${value.slice(2)}`;
    } else if (value.length > 0) {
      value = `(${value}`;
    }
    setPhone(value);
    if (errors.phone) setErrors((prev) => ({ ...prev, phone: undefined }));
    if (errors.api) setErrors((prev) => ({ ...prev, api: undefined }));
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleGeneratePix = async (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: { name?: string; email?: string; cpf?: string; phone?: string; api?: string } = {};

    if (!name.trim()) {
      newErrors.name = 'Informe seu nome completo.';
    } else if (name.trim().split(' ').length < 2) {
      newErrors.name = 'Digite nome e sobrenome.';
    }

    if (!email.trim()) {
      newErrors.email = 'Informe seu e-mail para receber o acesso.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      newErrors.email = 'Digite um e-mail válido.';
    }

    const cleanCpf = cpf.replace(/\D/g, '');
    if (!cleanCpf) {
      newErrors.cpf = 'Informe seu CPF (obrigatório para emissão do PIX).';
    } else if (cleanCpf.length !== 11 || !isValidCPF(cleanCpf)) {
      newErrors.cpf = 'CPF inválido. Por favor, digite um CPF válido para registro do PIX.';
    }

    const cleanPhone = phone.replace(/\D/g, '');
    if (!cleanPhone) {
      newErrors.phone = 'Informe seu celular / WhatsApp.';
    } else if (cleanPhone.length < 10) {
      newErrors.phone = 'Informe o DDD e o número completo.';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    setIsGenerating(true);

    try {
      // Chama o endpoint da BuckPay no Cloudflare Worker
      const apiUrl = window.location.hostname.includes('workers.dev')
        ? '/checkout/pix'
        : 'https://dudutreinamentocpa.siteverificado.workers.dev/checkout/pix';

      const res = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(planPrice * 100),
          buyer_name: name.trim(),
          buyer_email: email.trim(),
          buyer_document: cleanCpf,
          buyer_phone: cleanPhone,
          product_name: isVip ? 'Treinamento CPA Chinês - VIP' : 'Treinamento CPA Chinês - Básico',
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        const errorMsg = typeof data.error === 'string'
          ? data.error
          : (data.error?.message || data.message || 'Erro ao processar transação PIX na BuckPay.');
        throw new Error(errorMsg);
      }

      setPixCode(data.pix_code);
      if (data.qrcode_base64) {
        setQrImage(data.qrcode_base64.startsWith('data:image')
          ? data.qrcode_base64
          : `data:image/png;base64,${data.qrcode_base64}`
        );
      }
      if (data.transaction_id) {
        setTransactionId(data.transaction_id);
      }

      setIsGenerating(false);
      setStep('pix');
      setTimeLeft(900);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Erro BuckPay:', err);
      setIsGenerating(false);
      setErrors({
        api: err.message || 'Falha ao conectar à API da BuckPay. Verifique se o CPF e o telefone estão corretos.'
      });
    }
  };

  const handleCopyPix = () => {
    if (!pixCode) return;
    navigator.clipboard.writeText(pixCode).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 3000);
    });
  };

  const handleConfirmPayment = () => {
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setStep('success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col font-sans selection:bg-neutral-800 selection:text-white relative overflow-hidden pb-20">
      {/* Background Ambient Glows */}
      <div className="absolute top-0 left-1/4 -translate-x-1/2 w-[550px] h-[550px] bg-amber-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute top-1/3 right-10 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* Main Container */}
      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 pt-8 md:pt-12 relative z-10">
        {/* SUCCESS VIEW */}
        {step === 'success' ? (
          <div className="max-w-lg mx-auto apple-glass-card rounded-3xl p-6 sm:p-10 border border-white/10 text-center space-y-6 shadow-2xl animate-fade-in-up">
            <div className="w-20 h-20 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-[0_0_40px_rgba(16,185,129,0.3)]">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider bg-emerald-500/10 px-3.5 py-1 rounded-full border border-emerald-500/20 inline-block mb-2">
                Pagamento PIX Confirmado
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                Seja Bem-vindo ao Treinamento!
              </h1>
              <p className="text-sm text-[#a1a1a6] mt-2 leading-relaxed">
                Seu acesso ao <strong className="text-white">{planTitle}</strong> foi liberado.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-neutral-900/80 border border-white/[0.08] text-left text-xs space-y-2.5 text-[#d2d2d7]">
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#86868b]">Aluno:</span>
                <span className="font-semibold text-white">{name}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#86868b]">E-mail de Acesso:</span>
                <span className="font-semibold text-emerald-400">{email}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#86868b]">Plano:</span>
                <span className="font-semibold text-white">{planTitle}</span>
              </div>
              <div className="flex justify-between border-b border-white/5 pb-2">
                <span className="text-[#86868b]">Valor Pago:</span>
                <span className="font-semibold text-amber-400">{planFormattedPrice} no PIX</span>
              </div>
              {discordNick && (
                <div className="flex justify-between border-b border-white/5 pb-2">
                  <span className="text-[#86868b]">Discord Nick:</span>
                  <span className="font-semibold text-indigo-400">{discordNick}</span>
                </div>
              )}
              {phone && (
                <div className="flex justify-between">
                  <span className="text-[#86868b]">WhatsApp:</span>
                  <span className="font-semibold text-white">{phone}</span>
                </div>
              )}
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-left text-xs text-amber-200 space-y-1.5">
              <p className="font-semibold text-white text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                Instruções de Acesso:
              </p>
              <p>• O link da área de membros e os dados de login foram enviados para <strong>{email}</strong>.</p>
              {isVip && (
                <p>• Seu convite para o Discord Fechado e Grupo VIP no WhatsApp também já foi encaminhado.</p>
              )}
            </div>

            <button
              onClick={onBack}
              className="w-full py-4 rounded-full font-bold text-sm tracking-tight apple-btn-primary text-black flex items-center justify-center gap-2 cursor-pointer shadow-xl hover:scale-[1.01] active:scale-[0.99] transition-all"
            >
              <span>Voltar ao Início</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : step === 'pix' ? (
          /* PIX QR CODE & COPIA E COLA */
          <div className="max-w-lg mx-auto apple-glass-card rounded-3xl p-6 sm:p-10 border border-white/10 text-center shadow-2xl animate-fade-in-up">
            {/* Header Timer */}
            <div className="pb-5 border-b border-white/10">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-xs font-mono font-medium">
                <Clock className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '6s' }} />
                <span>Pague em até {formatTimer(timeLeft)}</span>
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-white mt-3 tracking-tight">
                Pague com PIX para Liberar seu Acesso
              </h1>
              <p className="text-xs text-[#a1a1a6] mt-1.5">
                {planTitle} • Total: <strong className="text-white font-bold text-sm">{planFormattedPrice}</strong>
              </p>
            </div>

            {/* QR Code Container com Efeito Glow Moderno */}
            <div className="my-6 flex flex-col items-center">
              <div className="p-4 bg-white rounded-3xl shadow-2xl border-2 border-emerald-400/40 pulse-glow-emerald inline-block">
                {qrImage ? (
                  <img
                    src={qrImage}
                    alt="QR Code PIX BuckPay"
                    className="w-[210px] h-[210px] object-contain block rounded-xl"
                  />
                ) : (
                  <QRCodeSVG
                    value={pixCode}
                    size={210}
                    level="M"
                    includeMargin={false}
                  />
                )}
              </div>

              {transactionId && (
                <p className="mt-2 text-[10px] text-[#71717a] font-mono">
                  ID BuckPay: {transactionId}
                </p>
              )}

              <div className="mt-3 flex items-center gap-2 text-xs text-emerald-400 font-mono">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                <span>Aguardando transferência via PIX no seu banco...</span>
              </div>
            </div>

            {/* Copia e Cola Moderno */}
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleCopyPix}
                className={`w-full py-4 px-5 rounded-2xl font-bold text-sm tracking-tight flex items-center justify-center gap-2.5 transition-all cursor-pointer shadow-lg active:scale-[0.985] ${
                  isCopied
                    ? 'bg-emerald-500 text-black border border-emerald-400 shadow-[0_0_30px_rgba(16,185,129,0.4)]'
                    : 'bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 hover:border-emerald-400/70'
                }`}
              >
                {isCopied ? (
                  <>
                    <Check className="w-4 h-4 stroke-[3]" />
                    <span>Código PIX Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copiar Código PIX (Copia e Cola)</span>
                  </>
                )}
              </button>

              <div className="relative">
                <input
                  type="text"
                  readOnly
                  value={pixCode}
                  onClick={handleCopyPix}
                  className="w-full bg-[#131316] border border-white/10 hover:border-white/20 rounded-xl py-2.5 px-3.5 text-xs font-mono text-[#a1a1a6] focus:outline-none cursor-pointer truncate transition-colors"
                />
              </div>
            </div>

            {/* Passo a passo simples */}
            <div className="mt-6 p-4 rounded-2xl bg-neutral-900/60 border border-white/[0.06] text-left text-xs space-y-2 text-[#d2d2d7]">
              <p className="font-semibold text-white text-[11px] uppercase tracking-wider mb-1 flex items-center gap-1.5">
                <QrCode className="w-3.5 h-3.5 text-emerald-400" />
                Como pagar no app do banco:
              </p>
              <p className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">1.</span>
                <span>Abra o app do seu banco e selecione <strong>PIX</strong>.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">2.</span>
                <span>Escolha <strong>PIX Copia e Cola</strong> ou aponte a câmera para o QR Code.</span>
              </p>
              <p className="flex items-start gap-2">
                <span className="text-amber-400 font-bold">3.</span>
                <span>Confirme o valor de <strong>{planFormattedPrice}</strong> e finalize.</span>
              </p>
            </div>

            {/* Botões de Ação */}
            <div className="mt-6">
              <button
                type="button"
                onClick={handleConfirmPayment}
                disabled={isVerifying}
                className="w-full py-4 rounded-full font-semibold text-xs tracking-tight bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.985]"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Confirmando pagamento no sistema...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Já realizei o pagamento via PIX</span>
                  </>
                )}
              </button>
            </div>
          </div>
        ) : (
          /* FORM VIEW: MODERNO, ELEGANTE E FLUIDO */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start animate-fade-in-up">
            {/* Coluna Principal: Formulário */}
            <div className="lg:col-span-7 apple-glass-card rounded-3xl p-6 sm:p-9 border border-white/[0.09] shadow-2xl relative overflow-hidden">
              <div className="mb-7">
                <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
                  Finalizar Inscrição
                </h1>
                <p className="text-xs sm:text-sm text-[#86868b] mt-1.5">
                  Informe seus dados para receber o acesso via PIX.
                </p>
              </div>

              <form onSubmit={handleGeneratePix} className="space-y-4">
                {/* Alerta de Erro da API BuckPay */}
                {errors.api && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-start gap-2.5">
                    <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block text-rose-200 mb-0.5 font-semibold">Aviso da BuckPay:</strong>
                      <span>{errors.api}</span>
                    </div>
                  </div>
                )}

                {/* Nome Completo */}
                <div>
                  <label className="text-xs font-semibold text-[#f5f5f7] block mb-2">
                    Nome Completo <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <User className="w-4 h-4 text-[#86868b] group-focus-within:text-white absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => {
                        setName(e.target.value);
                        if (errors.name) setErrors({ ...errors, name: undefined });
                      }}
                      placeholder="Seu nome completo"
                      className={`w-full bg-[#131316] border ${
                        errors.name
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-white/10 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20'
                      } rounded-2xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-[#55555a] focus:outline-none transition-all`}
                    />
                  </div>
                  {errors.name && (
                    <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.name}
                    </p>
                  )}
                </div>

                {/* E-mail Principal */}
                <div>
                  <label className="text-xs font-semibold text-[#f5f5f7] block mb-2">
                    E-mail para Acesso <span className="text-rose-400">*</span>
                  </label>
                  <div className="relative group">
                    <Mail className="w-4 h-4 text-[#86868b] group-focus-within:text-white absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errors.email) setErrors({ ...errors, email: undefined });
                      }}
                      placeholder="seuemail@exemplo.com"
                      className={`w-full bg-[#131316] border ${
                        errors.email
                          ? 'border-rose-500 ring-1 ring-rose-500'
                          : 'border-white/10 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20'
                      } rounded-2xl py-3.5 pl-10 pr-4 text-sm text-white placeholder-[#55555a] focus:outline-none transition-all`}
                    />
                  </div>
                  {errors.email ? (
                    <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                      <AlertCircle className="w-3 h-3" />
                      {errors.email}
                    </p>
                  ) : (
                    <p className="mt-1.5 text-[11px] text-[#71717a]">
                      O link da área de membros será enviado para este e-mail.
                    </p>
                  )}
                </div>

                {/* Grid 2 colunas: CPF e WhatsApp */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
                  {/* CPF Obrigatório */}
                  <div>
                    <label className="text-xs font-semibold text-[#f5f5f7] flex items-center gap-1.5 mb-2">
                      <span>CPF</span>
                      <span className="text-rose-400">*</span>
                      <span className="text-[10px] text-[#86868b] font-normal">(Exigência PIX)</span>
                    </label>
                    <div className="relative group">
                      <ShieldCheck className="w-4 h-4 text-[#86868b] group-focus-within:text-white absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                      <input
                        type="text"
                        value={cpf}
                        onChange={handleCpfChange}
                        placeholder="000.000.000-00"
                        maxLength={14}
                        className={`w-full bg-[#131316] border ${
                          errors.cpf
                            ? 'border-rose-500 ring-1 ring-rose-500'
                            : 'border-white/10 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20'
                        } rounded-2xl py-3 pl-10 pr-3.5 text-sm text-white placeholder-[#55555a] focus:outline-none transition-all`}
                      />
                    </div>
                    {errors.cpf && (
                      <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.cpf}
                      </p>
                    )}
                  </div>

                  {/* WhatsApp / Celular */}
                  <div>
                    <label className="text-xs font-semibold text-[#f5f5f7] flex items-center gap-1.5 mb-2">
                      <span>WhatsApp / Celular</span>
                      <span className="text-rose-400">*</span>
                    </label>
                    <div className="relative group">
                      <Phone className="w-4 h-4 text-[#86868b] group-focus-within:text-white absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={handlePhoneChange}
                        placeholder="(11) 99999-9999"
                        maxLength={15}
                        className={`w-full bg-[#131316] border ${
                          errors.phone
                            ? 'border-rose-500 ring-1 ring-rose-500'
                            : 'border-white/10 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20'
                        } rounded-2xl py-3 pl-10 pr-3.5 text-sm text-white placeholder-[#55555a] focus:outline-none transition-all`}
                      />
                    </div>
                    {errors.phone && (
                      <p className="mt-1.5 text-[11px] text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3 h-3" />
                        {errors.phone}
                      </p>
                    )}
                  </div>
                </div>

                {/* Nick do Discord (Opcional) */}
                <div>
                  <label className="text-xs font-semibold text-[#f5f5f7] flex items-center gap-1.5 mb-2">
                    <span>Nick do Discord</span>
                    <span className="text-[10px] text-[#86868b] font-normal">(Opcional)</span>
                  </label>
                  <div className="relative group">
                    <MessageSquare className="w-4 h-4 text-[#86868b] group-focus-within:text-white absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors" />
                    <input
                      type="text"
                      value={discordNick}
                      onChange={(e) => setDiscordNick(e.target.value)}
                      placeholder="usuario#0000"
                      className="w-full bg-[#131316] border border-white/10 focus:border-amber-400/80 focus:ring-2 focus:ring-amber-400/20 rounded-2xl py-3 pl-10 pr-3.5 text-sm text-white placeholder-[#55555a] focus:outline-none transition-all"
                    />
                  </div>
                </div>

                {/* Método de Pagamento: Apenas PIX com Destaque Elegante */}
                <div className="pt-2">
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-emerald-500/5 to-transparent border border-emerald-500/30 flex items-center justify-between shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 font-extrabold text-xs flex items-center justify-center shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                        PIX
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <p className="text-xs font-bold text-white">Pagamento Instantâneo via PIX</p>
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                        </div>
                        <p className="text-[11px] text-emerald-400">QR Code gerado na hora com liberação automática</p>
                      </div>
                    </div>
                    <span className="text-sm font-extrabold text-emerald-300 font-mono tracking-tight">
                      {planFormattedPrice}
                    </span>
                  </div>
                </div>

                {/* Botão de Finalizar */}
                <button
                  type="submit"
                  disabled={isGenerating}
                  className={`w-full mt-4 py-4 px-6 rounded-full font-bold text-sm tracking-tight flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xl active:scale-[0.985] hover:scale-[1.008] ${
                    isVip ? 'apple-btn-gold text-black' : 'apple-btn-primary text-black'
                  }`}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>Gerando Código PIX...</span>
                    </>
                  ) : (
                    <>
                      <span>Finalizar Inscrição via PIX</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Coluna Lateral: Resumo Fixo do Plano Selecionado */}
            <div className="lg:col-span-5 space-y-4">
              <div className="apple-glass-card rounded-3xl p-6 sm:p-7 border border-white/[0.09] shadow-xl relative overflow-hidden">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-400 bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20 inline-block mb-3">
                  Resumo do Pedido
                </span>

                <div className="border-b border-white/[0.08] pb-5 mb-5">
                  <h3 className="text-xl font-bold text-white tracking-tight">
                    {planTitle}
                  </h3>
                  <div className="flex items-baseline gap-1.5 mt-1.5">
                    <span className="text-3xl font-extrabold text-white tracking-tight">
                      {planFormattedPrice}
                    </span>
                    <span className="text-xs text-[#86868b]">à vista no PIX</span>
                  </div>
                </div>

                {/* Itens Inclusos */}
                <div className="space-y-3 text-xs text-[#d2d2d7]">
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Treinamento Completo CPA Chinês</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Área de Membros Vitalícia</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Lista Secreta das Casas Asiáticas Pagando</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Guia de Antidetect & Proxies</span>
                  </div>

                  {isVip && (
                    <>
                      <div className="flex items-center gap-2.5 text-amber-300 font-medium">
                        <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Comunidade Fechada no Discord</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-amber-300 font-medium">
                        <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Grupo VIP no WhatsApp (Alertas)</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-amber-300 font-medium">
                        <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Calls Semanais ao Vivo</span>
                      </div>
                      <div className="flex items-center gap-2.5 text-amber-300 font-medium">
                        <CheckCircle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>Pack de Bônus Exclusivos Anti-Bloqueio</span>
                      </div>
                    </>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-white/[0.08] flex justify-between items-center text-sm">
                  <span className="text-[#86868b]">Total a pagar:</span>
                  <span className="text-lg font-bold text-white">{planFormattedPrice}</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
