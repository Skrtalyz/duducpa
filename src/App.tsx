import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  ChevronDown,
  ArrowRight,
  Lock,
  X,
  Check,
  Minus
} from 'lucide-react';
import { CheckoutPage } from './components/CheckoutPage';
import { trackInitiateCheckout } from './utils/utmifyTracker';

export default function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'checkout'>('landing');
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<'basico' | 'completo'>('completo');

  // Handle browser back button with popstate/hash
  useEffect(() => {
    const handlePopState = () => {
      if (window.location.hash === '#checkout') {
        setCurrentView('checkout');
      } else {
        setCurrentView('landing');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Smooth scroll to comparison or plans
  const scrollToPlans = () => {
    if (currentView === 'checkout') {
      setCurrentView('landing');
      window.location.hash = '';
      setTimeout(() => {
        const plansElement = document.getElementById('planos');
        if (plansElement) {
          plansElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 50);
      return;
    }
    const plansElement = document.getElementById('planos');
    if (plansElement) {
      plansElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const handleSelectPlan = (plan: 'basico' | 'completo') => {
    setSelectedPlan(plan);
    setCurrentView('checkout');
    window.location.hash = 'checkout';
    const planTitle = plan === 'completo' ? 'Plano Completo (VIP) ⭐' : 'Plano Básico';
    const planPrice = plan === 'completo' ? 27.0 : 14.9;
    trackInitiateCheckout(planTitle, planPrice);
  };

  const handleBackToLanding = () => {
    setCurrentView('landing');
    if (window.location.hash === '#checkout') {
      window.history.back();
    } else {
      window.location.hash = '';
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  if (currentView === 'checkout') {
    return (
      <CheckoutPage
        plan={selectedPlan}
        onBack={handleBackToLanding}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#000000] text-[#f5f5f7] flex flex-col font-sans selection:bg-neutral-800 selection:text-white">
      {/* 1. TOP BAR (Faixa Superior de Urgência) */}
      <aside aria-label="Alerta de urgência" className="w-full bg-[#161617] border-b border-white/[0.08] py-2.5 px-4 sticky top-0 z-50 backdrop-blur-xl bg-opacity-95">
        <div className="max-w-5xl mx-auto flex items-center justify-center text-center text-xs md:text-sm leading-relaxed text-[#f5f5f7]">
          <p className="flex flex-wrap items-center justify-center gap-1.5 font-normal">
            <span className="font-semibold text-amber-400 tracking-wide uppercase text-[11px] md:text-xs bg-amber-400/10 px-2 py-0.5 rounded-full border border-amber-400/20">
              [ALERTA DE OPORTUNIDADE]
            </span>
            <span className="italic text-[#d2d2d7]">
              (Desconto especial hoje, 28/09/2026).
            </span>
          </p>
        </div>
      </aside>

      <main className="flex-1">
        {/* 2. SEÇÃO HERO (Primeira Dobra — 80% da Conversão) */}
        <section className="relative pt-[78vw] sm:pt-[70vw] md:pt-24 pb-16 md:pb-24 px-6 sm:px-10 lg:px-16 overflow-hidden">
          {/* Background Images: Mobile & Desktop */}
          <div className="absolute inset-0 z-0 pointer-events-none">
            {/* Versão celular: sem distorção (w-full h-auto) no topo */}
            <img
              src="https://i.imgur.com/J2c8g9y.jpeg"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="absolute top-0 left-0 w-full h-auto block md:hidden"
            />
            {/* Versão desktop / tablet */}
            <img
              src="https://i.imgur.com/1swVcSw.png"
              alt=""
              aria-hidden="true"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-center hidden md:block"
            />
          </div>

          <div className="max-w-7xl mx-auto relative z-10 w-full">
            <div className="max-w-2xl lg:max-w-3xl text-center md:text-left mx-auto md:mx-0">
              {/* Headline Principal (Promessa + Notícia + Mecanismo) */}
              <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-[46px] font-bold tracking-tight text-[#f5f5f7] leading-[1.18] text-balance">
                &ldquo;Enquanto as Bets Estão Sendo Proibidas no Brasil, Existe um <span className="text-amber-400">&lsquo;Furo Técnico&rsquo;</span> em Plataformas <span className="text-amber-400">Asiáticas</span> que Gera de <span className="text-amber-400">R$ 150 a R$ 500 por Dia</span> — Sem Precisar Apostar 1 Centavo.&rdquo;
              </h1>

              {/* Sub-headline / Descrição de Apoio */}
              <p className="mt-6 md:mt-8 text-base md:text-lg text-[#a1a1a6] leading-relaxed max-w-2xl font-normal text-balance mx-auto md:mx-0">
                <span className="italic">Descubra o método de</span>{' '}
                <strong className="text-white font-semibold">Auto-Indicação e Farm de CPA Chinês</strong>
                <span className="italic">
                  : aprenda a usar navegadores antidetect e IPs dedicados para indicar a si mesmo de forma 100% invisível, <span className="text-amber-400 font-semibold">sacar comissões diárias no PIX</span> e (opcionalmente) contar com o nosso acompanhamento ao vivo no Discord e WhatsApp.
                </span>
              </p>

              {/* Elemento de Prova Social na Hero */}
              <div className="mt-8 flex flex-col sm:flex-row items-center md:items-start justify-center md:justify-start gap-2 text-sm text-[#d2d2d7]">
                <span className="text-amber-400 tracking-tight" aria-label="5 estrelas">⭐⭐⭐⭐⭐</span>
                <span className="italic">
                  +480 alunos aplicando o método e sacando comissões diariamente.
                </span>
              </div>

              {/* Botão de Chamada para Ação (CTA 1 - Downscroll para a Tabela de Planos) */}
              <div className="mt-8 flex justify-center md:justify-start">
                <button
                  onClick={scrollToPlans}
                  className="apple-btn-primary px-8 py-4 rounded-full font-bold text-sm md:text-base tracking-tight inline-flex items-center gap-2.5 cursor-pointer shadow-xl transition-all"
                >
                  <span>[ QUERO APRENDER O CPA CHINÊS AGORA ]</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 3. SEÇÃO DE AGITAÇÃO DA DOR (Culpado Oculto) */}
        <section className="py-16 md:py-24 px-6 border-t border-white/[0.06] bg-[#050507]">
          <div className="max-w-3xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-semibold text-center text-[#f5f5f7] tracking-tight leading-snug italic text-balance">
              Por que tentar ganhar dinheiro com apostas tradicionais ou tráfego comum virou um jogo perdido em 2026?
            </h2>

            <div className="mt-12 space-y-4">
              <div className="apple-glass-card rounded-2xl p-6 md:p-7 border border-white/[0.08]">
                <div className="flex items-start gap-4">
                  <span className="text-xl shrink-0" role="img" aria-label="alerta">🚫</span>
                  <p className="text-sm md:text-base text-[#d2d2d7] leading-relaxed">
                    O governo apertou o cerco e proibiu o mercado tradicional de apostas no Brasil. Quem dependia da &ldquo;sorte&rdquo; ou de indicar clientes para plataformas que travam saques ficou sem saída.
                  </p>
                </div>
              </div>

              <div className="rounded-2xl p-6 md:p-7 border border-amber-400/25 bg-amber-400/[0.04]">
                <div className="flex items-start gap-4">
                  <span className="text-xl shrink-0" role="img" aria-label="diagnóstico">💡</span>
                  <p className="text-sm md:text-base text-[#f5f5f7] leading-relaxed">
                    <strong className="text-amber-400 font-semibold">O Diagnóstico:</strong> Você não tem culpa por ter perdido tempo com métodos ultrapassados. Para ganhar dinheiro de verdade, você só precisa migrar para onde o dinheiro está fluindo: nas comissões fixas (CPA) das plataformas asiáticas.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 4. APRESENTAÇÃO DO MECANISMO ÚNICO (Self-CPA) */}
        <section id="mecanismo" className="py-16 md:py-24 px-6 border-t border-white/[0.06]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#f5f5f7] italic">
                Como Funciona a Auto-Indicação no CPA Chinês?
              </h2>
            </div>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Step 1 */}
              <div className="apple-glass-card rounded-2xl md:rounded-3xl p-6 md:p-7 border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#86868b] tracking-wider block">ETAPA 01</span>
                    <span className="text-xl" role="img" aria-label="oportunidade">📈</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">1. A Oportunidade</h3>
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    As &ldquo;casas chinesas&rdquo; pagam comissões de CPA altíssimas por novos usuários cadastrados com depósitos mínimos.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] text-[#86868b] flex items-center justify-between">
                  <span>Comissões Altas</span>
                  <span className="text-white font-mono">Depósitos Mínimos</span>
                </div>
              </div>

              {/* Step 2 */}
              <div className="apple-glass-card rounded-2xl md:rounded-3xl p-6 md:p-7 border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#86868b] tracking-wider block">ETAPA 02</span>
                    <span className="text-xl" role="img" aria-label="blindagem">🛡️</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">2. A Blindagem</h3>
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    Usando navegadores antidetect (Dolphin) e proxies residenciais dedicados, você cria um &ldquo;Farm de Contas&rdquo;, onde o sistema reconhece cada perfil como uma pessoa real e distinta.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] text-[#86868b] flex items-center justify-between">
                  <span>Dolphin + Proxies</span>
                  <span className="text-white font-mono">Perfis Reais & Distintos</span>
                </div>
              </div>

              {/* Step 3 */}
              <div className="apple-glass-card rounded-2xl md:rounded-3xl p-6 md:p-7 border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-colors">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-mono text-[#86868b] tracking-wider block">ETAPA 03</span>
                    <span className="text-xl" role="img" aria-label="lucro">💸</span>
                  </div>
                  <h3 className="text-base font-semibold text-white mb-2">3. O Lucro Limpo</h3>
                  <p className="text-sm text-[#a1a1a6] leading-relaxed">
                    Você se indica através do seu próprio link de afiliado, recebe a comissão/bônus de CPA diretamente na sua conta e saca no PIX.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-white/[0.06] text-[11px] text-[#86868b] flex items-center justify-between">
                  <span>Saques no PIX</span>
                  <span className="text-emerald-400 font-mono">Comissão Direta</span>
                </div>
              </div>
            </div>

            {/* Imagem Explicativa do Mecanismo */}
            <div className="mt-12 flex justify-center">
              <div className="max-w-md sm:max-w-lg md:max-w-xl w-full">
                <img
                  src="https://i.imgur.com/b4sXHPH.png"
                  alt="Como Funciona a Auto-Indicação no CPA Chinês"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-2xl md:rounded-3xl border border-white/[0.08] shadow-2xl block mx-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 5. COMPARATIVO DE ENTREGÁVEIS (O que Você Vai Receber) */}
        <section id="comparativo" className="py-16 md:py-24 px-6 border-t border-white/[0.06] bg-[#050507]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center max-w-2xl mx-auto mb-10">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#f5f5f7]">
                Comparativo de Entregáveis
              </h2>
              <p className="mt-2 text-sm text-[#86868b]">(O que Você Vai Receber)</p>
            </div>

            {/* Apple Style Clean Comparison Table */}
            <div className="apple-glass-card rounded-2xl md:rounded-3xl border border-white/[0.08] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-white/[0.08] bg-white/[0.02]">
                      <th className="py-4 px-6 text-sm font-semibold text-white">Recursos Inclusos</th>
                      <th className="py-4 px-6 text-sm font-semibold text-[#a1a1a6] text-center w-36 sm:w-44">Plano Básico</th>
                      <th className="py-4 px-6 text-sm font-semibold text-amber-400 text-center w-44 sm:w-56 bg-amber-400/[0.03]">Plano Completo (VIP) ⭐</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.06] text-xs md:text-sm">
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-[#f5f5f7]">
                        <strong className="font-semibold text-white">Treinamento Completo CPA Chinês</strong> (Aulas Práticas)
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-400/[0.02]">
                        <Check className="w-4 h-4 text-amber-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-[#f5f5f7]">
                        <strong className="font-semibold text-white">Área de Membros Vitalícia</strong>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-400/[0.02]">
                        <Check className="w-4 h-4 text-amber-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-[#f5f5f7]">
                        <strong className="font-semibold text-white">Lista Secreta das Casas Asiáticas Pagando</strong>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-400/[0.02]">
                        <Check className="w-4 h-4 text-amber-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-[#f5f5f7]">
                        <strong className="font-semibold text-white">Guia de Configuração de Antidetect & Proxies</strong>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Check className="w-4 h-4 text-emerald-400 mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-400/[0.02]">
                        <Check className="w-4 h-4 text-amber-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-[#f5f5f7]">
                        <strong className="font-semibold text-white">Comunidade Ativa no Discord</strong> (Networking & Troca)
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Minus className="w-4 h-4 text-[#55555a] mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-400/[0.02]">
                        <Check className="w-4 h-4 text-amber-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-[#f5f5f7]">
                        <strong className="font-semibold text-white">Grupo VIP de Alertas no WhatsApp</strong>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Minus className="w-4 h-4 text-[#55555a] mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-400/[0.02]">
                        <Check className="w-4 h-4 text-amber-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-[#f5f5f7]">
                        <strong className="font-semibold text-white">Calls em Grupo ao Vivo</strong> (Acompanhamento)
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Minus className="w-4 h-4 text-[#55555a] mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-400/[0.02]">
                        <Check className="w-4 h-4 text-amber-400 mx-auto" />
                      </td>
                    </tr>
                    <tr className="hover:bg-white/[0.01] transition-colors">
                      <td className="py-4 px-6 text-[#f5f5f7]">
                        <strong className="font-semibold text-white">Pack de Bônus Exclusivos Anti-Bloqueio</strong>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <Minus className="w-4 h-4 text-[#55555a] mx-auto" />
                      </td>
                      <td className="py-4 px-6 text-center bg-amber-400/[0.02]">
                        <Check className="w-4 h-4 text-amber-400 mx-auto" />
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Imagem do Comparativo de Entregáveis posicionada abaixo da tabela */}
            <div className="mt-12 flex justify-center">
              <div className="max-w-md sm:max-w-lg md:max-w-xl w-full">
                <img
                  src="https://i.imgur.com/dV1wUp5.png"
                  alt="Comparativo de Entregáveis"
                  referrerPolicy="no-referrer"
                  className="w-full h-auto rounded-2xl md:rounded-3xl border border-white/[0.08] shadow-2xl block mx-auto"
                />
              </div>
            </div>
          </div>
        </section>

        {/* 6. CARD DE OFERTA DUPLO (O Coração da Conversão) */}
        <section id="planos" className="py-20 md:py-28 px-6 border-t border-white/[0.06] relative overflow-hidden bg-gradient-to-b from-black via-[#0a0907] to-black">
          {/* Subtle Ambient Gold Center */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[500px] bg-amber-500/10 blur-[150px] pointer-events-none rounded-full" />

          <div className="max-w-5xl mx-auto relative z-10">
            <div className="text-center mb-12">
              <span className="text-xs uppercase tracking-widest text-amber-400 font-semibold">
                Escolha o Seu Plano
              </span>
              <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-white mt-2">
                Card de Oferta Duplo
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
              {/* ⚪ CARD 1: PLANO BÁSICO (Para Auto-Didatas) */}
              <div className="lg:col-span-5 apple-glass-card rounded-3xl p-7 md:p-9 border border-white/[0.08] flex flex-col justify-between hover:border-white/20 transition-all">
                <div>
                  <div className="pb-5 border-b border-white/[0.08]">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-[#86868b]">⚪ CARD 1</span>
                      <span className="text-xs text-[#a1a1a6] font-mono">• Para Auto-Didatas</span>
                    </div>
                    <h3 className="text-xl md:text-2xl font-bold text-white mt-1 flex items-center gap-2">
                      <span>📦</span>
                      <span>PLANO BÁSICO</span>
                    </h3>
                    <p className="text-sm italic text-[#86868b] mt-1">
                      Acesso Essencial ao Método
                    </p>
                  </div>

                  <div className="mt-6 space-y-3.5">
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="livro">📘</span>
                      <span>Treinamento Passo a Passo CPA Chinês</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="video">🎥</span>
                      <span>Área de Membros com Videoaulas</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="ferramenta">🛠️</span>
                      <span>Guia de Configuração Antidetect</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#a1a1a6]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="globo">🌐</span>
                      <span>
                        Lista Inicial de Plataformas Asiáticas <span className="italic text-[#86868b] text-xs block mt-0.5">(Sem acesso à comunidade, suporte em grupo ou WhatsApp)</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-white/[0.08]">
                  <div className="text-left mb-6">
                    <p className="text-xs text-[#86868b]">Por apenas</p>
                    <p className="text-2xl md:text-3xl font-bold text-white tracking-tight mt-0.5">
                      R$ 14,90 à vista
                    </p>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('basico')}
                    className="utmify-checkout-btn w-full py-3.5 px-5 rounded-full font-semibold text-xs md:text-sm tracking-tight bg-white/10 hover:bg-white/20 text-white border border-white/15 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-[0.985]"
                  >
                    <span>[ FINALIZAR INSCRIÇÃO NO PLANO BÁSICO ]</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-2 text-[11px] text-[#86868b]">
                    <Lock className="w-3 h-3 text-neutral-500" />
                    <span>Acesso Imediato</span>
                  </div>
                </div>
              </div>

              {/* 🟡 CARD 2: PLANO COMPLETO (Mais Vendido — Destaque Dourado) ⭐ */}
              <div className="lg:col-span-7 apple-gold-card rounded-3xl p-8 md:p-10 relative overflow-hidden flex flex-col justify-between transition-all">
                <div>
                  {/* Selo */}
                  <div className="mb-4">
                    <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wide bg-amber-400/10 px-3 py-1 rounded-full border border-amber-400/20">
                      [ SELO: ESCOLHA DA COMUNIDADE / 89% DOS ALUNOS PREFEREM ESTE ]
                    </span>
                  </div>

                  <div className="pb-6 border-b border-amber-400/20 flex flex-col sm:flex-row sm:items-baseline justify-between gap-2">
                    <div>
                      <h3 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
                        <span>🟡 CARD 2: PLANO COMPLETO</span>
                        <span className="text-amber-400 text-lg">⭐</span>
                      </h3>
                      <p className="text-sm font-semibold text-amber-300/90 mt-1">
                        Treinamento + Comunidade & Acompanhamento VIP
                      </p>
                    </div>
                    <span className="self-start sm:self-auto text-xs font-semibold px-3 py-1 rounded-full bg-amber-400 text-black shadow-sm font-sans whitespace-nowrap">
                      Mais Vendido
                    </span>
                  </div>

                  <div className="mt-6 space-y-3.5">
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="estrela">✨</span>
                      <span><strong className="text-white font-semibold">TUDO do Plano Básico</strong> (Acesso Vitalício ao Treinamento)</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="discord">🏛️</span>
                      <span><strong className="text-white font-semibold">Comunidade Fechada no Discord:</strong> Salas de networking organizadas e troca de experiências diárias.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="whatsapp">📱</span>
                      <span><strong className="text-white font-semibold">Grupo VIP no WhatsApp:</strong> Alertas de novas casas com CPA alto em tempo real.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="calls">🎙️</span>
                      <span><strong className="text-white font-semibold">Calls em Grupo ao Vivo:</strong> Tira-dúvidas e análise de tela diretamente com quem opera.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="bonus">🎁</span>
                      <span><strong className="text-white font-semibold">Bônus #1:</strong> Lista VIP de Casas Asiáticas com Maior Bônus do Mercado.</span>
                    </div>
                    <div className="flex items-start gap-3 text-sm text-[#f5f5f7]">
                      <span className="text-base shrink-0 mt-0.5" role="img" aria-label="antiban">🛡️</span>
                      <span><strong className="text-white font-semibold">Bônus #2:</strong> Guia de Proxies Residenciais Anti-Banimento.</span>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-amber-400/20">
                  <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-4 mb-6">
                    <div>
                      <p className="text-sm text-[#86868b] line-through font-mono">
                        De R$ 497,00
                      </p>
                      <p className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mt-0.5">
                        Por apenas <span className="text-amber-400">R$ 27,00</span> à vista
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={() => handleSelectPlan('completo')}
                    className="utmify-checkout-btn apple-btn-gold w-full py-4 px-6 rounded-full font-bold text-sm md:text-base tracking-tight flex items-center justify-center gap-2 cursor-pointer shadow-lg"
                  >
                    <span>[ FINALIZAR INSCRIÇÃO - PLANO COMPLETO VIP ]</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>

                  <div className="mt-4 flex items-center justify-center gap-4 text-xs text-[#86868b]">
                    <span className="flex items-center gap-1.5">
                      <Lock className="w-3.5 h-3.5 text-neutral-400" />
                      Pagamento 100% Seguro
                    </span>
                    <span>•</span>
                    <span>Acesso Imediato</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 7. INVERSÃO TOTAL DE RISCO (Garantia Incondicional) */}
        <section className="py-16 md:py-20 px-6 border-t border-white/[0.06] bg-[#050507]">
          <div className="max-w-2xl mx-auto text-center">
            <div className="w-14 h-14 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center mx-auto mb-6 text-2xl">
              🛡️
            </div>

            <p className="text-base md:text-lg text-[#d2d2d7] leading-relaxed">
              <strong className="text-white font-semibold">Garantia Blindada de 7 Dias:</strong> Escolha qualquer um dos planos, acesse a área de membros e teste a estrutura. Se dentro de 7 dias você achar que o método não é para você ou não se adaptar ao ambiente, devolvemos 100% do seu dinheiro investido. Sem burocracia.
            </p>
          </div>
        </section>

        {/* 8. FAQ (Perguntas Frequentes) */}
        <section id="faq" className="py-16 md:py-24 px-6 border-t border-white/[0.06]">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-[#f5f5f7]">
                Perguntas Frequentes
              </h2>
            </div>

            <div className="space-y-3">
              {/* FAQ Item 1 */}
              <div className="apple-glass-card rounded-2xl border border-white/[0.08] overflow-hidden transition-colors">
                <button
                  onClick={() => toggleFaq(0)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="text-sm md:text-base font-medium text-white flex items-center gap-2.5">
                    <span role="img" aria-label="duvida">❓</span>
                    <span>Qual a diferença entre os dois planos?</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-200 ${
                      openFaq === 0 ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {openFaq === 0 && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#a1a1a6] leading-relaxed border-t border-white/[0.04]">
                    <p className="italic">
                      O <strong className="text-white font-semibold not-italic">Plano Básico</strong> entrega apenas o curso gravado para quem prefere estudar sozinho. O <strong className="text-white font-semibold not-italic">Plano Completo</strong> inclui o ecossistema ativo com Discord, WhatsApp, Calls ao vivo e os Bônus de Alertas para quem quer acompanhamento e networking.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ Item 2 */}
              <div className="apple-glass-card rounded-2xl border border-white/[0.08] overflow-hidden transition-colors">
                <button
                  onClick={() => toggleFaq(1)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="text-sm md:text-base font-medium text-white flex items-center gap-2.5">
                    <span role="img" aria-label="upgrade">🔄</span>
                    <span>Posso migrar do Plano Básico para o Completo depois?</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-200 ${
                      openFaq === 1 ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {openFaq === 1 && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#a1a1a6] leading-relaxed border-t border-white/[0.04]">
                    <p className="italic">
                      Sim, mas no Plano Completo adquirido hoje você garante a condição promocional com o desconto de lançamento.
                    </p>
                  </div>
                )}
              </div>

              {/* FAQ Item 3 */}
              <div className="apple-glass-card rounded-2xl border border-white/[0.08] overflow-hidden transition-colors">
                <button
                  onClick={() => toggleFaq(2)}
                  className="w-full py-5 px-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-white/[0.02]"
                >
                  <span className="text-sm md:text-base font-medium text-white flex items-center gap-2.5">
                    <span role="img" aria-label="computador">💻</span>
                    <span>Preciso de um computador potente?</span>
                  </span>
                  <ChevronDown
                    className={`w-4 h-4 text-[#86868b] shrink-0 transition-transform duration-200 ${
                      openFaq === 2 ? 'rotate-180 text-white' : ''
                    }`}
                  />
                </button>
                {openFaq === 2 && (
                  <div className="px-6 pb-5 pt-1 text-sm text-[#a1a1a6] leading-relaxed border-t border-white/[0.04]">
                    <p className="italic">
                      Não. O software antidetect roda em computadores e notebooks básicos.
                    </p>
                  </div>
                )}
              </div>
            </div>

            {/* CTA Final Pós-FAQ */}
            <div className="mt-12 text-center">
              <button
                onClick={scrollToPlans}
                className="apple-btn-primary px-8 py-4 rounded-full font-bold text-sm md:text-base tracking-tight inline-flex items-center gap-2 cursor-pointer shadow-xl transition-all"
              >
                <span>[ CTA FINAL: SELECIONAR MEU PLANO E COMECAR AGORA ]</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </section>
      </main>

      {/* APPLE CLEAN FOOTER */}
      <footer className="w-full py-10 px-6 border-t border-white/[0.06] bg-[#000000] text-center text-xs text-[#86868b]">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© {new Date().getFullYear()} CPA Chinês. Todos os direitos reservados.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-white transition-colors cursor-pointer" onClick={scrollToPlans}>Termos</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={scrollToPlans}>Privacidade</span>
            <span className="hover:text-white transition-colors cursor-pointer" onClick={scrollToPlans}>Garantia 7 Dias</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
