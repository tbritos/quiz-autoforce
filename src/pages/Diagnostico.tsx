import { useState, useEffect } from 'react';
import { AlertTriangle, ArrowLeft, ArrowRight, Check, Search, ShieldCheck, Trophy, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// --- BANCO DE DADOS DAS PERGUNTAS ---
const QUESTIONS = [
  // 1. Estrutura
  {
    id: 'estrutura',
    title: "Qual estrutura descreve melhor sua operação hoje?",
    type: 'single',
    options: [
      { label: "Concessionária autorizada", value: "concessionaria" },
      { label: "Revenda multimarcas", value: "multimarcas" },
      { label: "Grupo misto (concessionária + revenda)", value: "grupo" }
    ]
  },
  // 2. Site do cliente
  {
    id: 'site_cliente',
    title: "Qual e o site da sua empresa?",
    subtitle: "Cole aqui o link do seu site oficial. Use o endereço correto, pois essa analise depende do link informado.",
    type: 'text',
    placeholder: "Ex.: www.suaempresa.com.br"
  },
  // 2. Lojas
  {
    id: 'lojas',
    title: "Quantos pontos de venda/lojas a operação possui?",
    type: 'single',
    options: [
      { label: "1", value: "1" },
      { label: "2–3", value: "2-3" },
      { label: "4–7", value: "4-7" },
      { label: "8+", value: "8+" }
    ]
  },
  // 3. Volume Vendas
  {
    id: 'vendas_mes',
    title: "Em média, quantos veículos vocês vendem por mês?",
    subtitle: "Considere novos e usados somados.",
    type: 'single',
    options: [
      { label: "0–19", value: "0-19" },
      { label: "20–49", value: "20-49" },
      { label: "50–99", value: "50-99" },
      { label: "100–199", value: "100-199" },
      { label: "200+", value: "200+" }
    ]
  },
  // 4. Ticket medio
  {
    id: 'ticket_medio',
    title: "Qual o ticket medio de venda do seu negocio?",
    subtitle: "Considere o valor medio por veiculo vendido.",
    type: 'text',
    placeholder: "Ex.: R$ 120.000"
  },
  // 5. Estoque
  {
    id: 'estoque',
    title: "Qual o estoque médio disponível no mês?",
    type: 'single',
    options: [
      { label: "0–29", value: "0-29" },
      { label: "30–49", value: "30-49" },
      { label: "50–99", value: "50-99" },
      { label: "100–199", value: "100-199" },
      { label: "200+", value: "200+" }
    ]
  },
  // 5. Equipe
  {
    id: 'equipe',
    title: "Quantas pessoas atuam diretamente em vendas?",
    subtitle: "Somando showroom + digital + telefone.",
    type: 'single',
    options: [
      { label: "1–5", value: "1-5" },
      { label: "6–10", value: "6-10" },
      { label: "11–20", value: "11-20" },
      { label: "21–40", value: "21-40" },
      { label: "41+", value: "41+" }
    ]
  },
  // 6. Origem
  {
    id: 'origem',
    title: "De onde vem a maior parte das oportunidades hoje?",
    subtitle: "Selecione até 2 opções principais.",
    type: 'multi-max-2',
    options: [
      { label: "Tráfego pago (Google/Meta)", value: "ads" },
      { label: "Orgânico (SEO/Google Meu Negócio)", value: "organic" },
      { label: "Portais/Marketplaces", value: "portals" },
      { label: "Telefone / Ligações", value: "phone" },
      { label: "Indicação / Base", value: "referral" },
      { label: "Ações locais (Eventos)", value: "offline" },
      { label: "Outro", value: "other" }
    ]
  },
  // 7. Anúncios
  {
    id: 'ads_flow',
    title: "Vocês rodam anúncios pagos hoje?",
    type: 'conditional-sub',
    options: [
      { label: "Sim", value: "sim" },
      { label: "Não", value: "nao" }
    ],
    subQuestion: {
      id: 'investimento_ads',
      title: "Qual faixa média mensal de investimento?",
      conditionValue: 'sim',
      options: [
        { label: "Até R$ 3 mil", value: "ate-3k" },
        { label: "R$ 3–10 mil", value: "3-10k" },
        { label: "R$ 10–30 mil", value: "10-30k" },
        { label: "R$ 30–70 mil", value: "30-70k" },
        { label: "R$ 70 mil+", value: "70k+" }
      ]
    }
  },
  // 8. Estrutura Mkt
  {
    id: 'estrutura_mkt',
    title: "Como a execução de marketing está estruturada hoje?",
    type: 'single',
    options: [
      { label: "Time interno", value: "interno" },
      { label: "Agência", value: "agencia" },
      { label: "Time interno + Agência", value: "hibrido" },
      { label: "Não temos estrutura", value: "sem-estrutura" }
    ]
  },
  // 9. CRM
  {
    id: 'crm',
    title: "Como vocês controlam e distribuem os leads?",
    type: 'single',
    options: [
      { label: "CRM com funil + regras (SLA)", value: "crm-avancado" },
      { label: "CRM básico (sem regras claras)", value: "crm-basico" },
      { label: "Planilha/ERP", value: "planilha" },
      { label: "WhatsApp 'na mão' (sem controle)", value: "whatsapp" }
    ]
  },
  // 10. Tempo Resposta
  {
    id: 'tempo_resposta',
    title: "Tempo típico para 1º contato após o lead chegar:",
    type: 'single',
    options: [
      { label: "Até 5 min", value: "5min" },
      { label: "5–30 min", value: "30min" },
      { label: "30–120 min", value: "2h" },
      { label: "2–24h", value: "24h" },
      { label: "24h+", value: "24h+" }
    ]
  },
  // 11. Cenário Atual
  {
    id: 'cenario',
    title: "Nos últimos 90 dias, qual cenário descreve melhor sua operação?",
    type: 'single',
    options: [
      { label: "Metas batidas e previsíveis", value: "previsivel" },
      { label: "Metas batidas, mas instáveis", value: "instavel" },
      { label: "Metas não batidas / abaixo do esperado", value: "abaixo" },
      { label: "Não sei medir / sem previsibilidade", value: "sem-dados" }
    ]
  },
  // 12. Maior Fricção
  {
    id: 'friccao',
    title: "Onde está a maior fricção hoje?",
    type: 'single',
    options: [
      { label: "Geração de leads", value: "geracao" },
      { label: "Qualidade dos leads", value: "qualidade" },
      { label: "Conversão (Vendas)", value: "conversao" },
      { label: "Atendimento / tempo de resposta", value: "atendimento" },
      { label: "Gestão / CRM / Processo", value: "gestao" },
      { label: "Site / Landing Page", value: "site" }
    ]
  },
  // --- NOVA PERGUNTA: MÉTRICAS (Multipla Ilimitada + Outros) ---
  {
    id: 'metricas',
    title: "Quais dados/métricas vocês acompanham hoje?",
    subtitle: "Selecione todas as que se aplicam.",
    type: 'multi-unlimited', // Novo tipo
    options: [
      { label: "Leads Gerados", value: "leads" },
      { label: "Vendas Feitas", value: "vendas" },
      { label: "ROI (Retorno sobre Investimento)", value: "roi" },
      { label: "ROAS (Retorno sobre Ads)", value: "roas" },
      { label: "CSAT / NPS (Satisfação)", value: "csat" },
      { label: "Ticket Médio", value: "ticket" },
      { label: "Conversão por canal", value: "conversao" },
      { label: "Outros", value: "outros" }
    ]
  },
  // 14. Prazo
  {
    id: 'prazo',
    title: "Em quanto tempo você quer resolver isso?",
    type: 'single',
    options: [
      { label: "0–30 dias", value: "30d" },
      { label: "31–60 dias", value: "60d" },
      { label: "61–120 dias", value: "120d" },
      { label: "120+ dias", value: "120d+" }
    ]
  }
];

const CAR_BRANDS = [
  "Audi", "BMW", "BYD", "CAOA Chery", "Chevrolet", "Citroën", "Fiat", "Ford", 
  "GWM", "Honda", "Hyundai", "JAC Motors", "Jaguar", "Jeep", "Kia", "Land Rover", 
  "Mercedes-Benz", "Mitsubishi", "Nissan", "Peugeot", "Porsche", "RAM", "Renault", 
  "Toyota", "Volkswagen", "Volvo"
];

function Diagnostico() {
  const navigate = useNavigate();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [selectedBrands, setSelectedBrands] = useState<string[]>([]);
  const [brandSearch, setBrandSearch] = useState("");
  const [otherText, setOtherText] = useState(""); // Estado para o campo "Outros"

  const question = QUESTIONS[currentStep];
  const progress = Math.round(((currentStep + 1) / QUESTIONS.length) * 100);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentStep]);

  const isValidWebsiteInput = (rawUrl: string) => {
    const value = (rawUrl || '').trim();
    if (!value) return false;

    const withProtocol = /^https?:\/\//i.test(value) ? value : `https://${value}`;
    try {
      const url = new URL(withProtocol);
      const host = url.hostname.toLowerCase();
      if (!host || !host.includes('.')) return false;
      if (host.includes(' ')) return false;
      return true;
    } catch {
      return false;
    }
  };

  const formatCurrencyInput = (rawValue: string) => {
    const digits = (rawValue || '').replace(/\D/g, '');
    if (!digits) return '';
    const numeric = Number(digits);
    if (!Number.isFinite(numeric)) return '';
    return `R$ ${numeric.toLocaleString('pt-BR')}`;
  };

  const handleSelect = (questionId: string, value: string, type: string) => {
    // SINGLE / CONDITIONAL
    if (type === 'single' || type === 'conditional-sub') {
      setAnswers(prev => ({ ...prev, [questionId]: value }));
      
      if (questionId === 'ads_flow' && value === 'nao') {
        setAnswers(prev => {
          const newAnswers = { ...prev };
          delete newAnswers['investimento_ads'];
          return newAnswers;
        });
      }
    } 
    // MULTI LIMITADO (ATÉ 2)
    else if (type === 'multi-max-2') {
      const currentSelected = answers[questionId] || [];
      if (currentSelected.includes(value)) {
        setAnswers(prev => ({ ...prev, [questionId]: currentSelected.filter((i: string) => i !== value) }));
      } else if (currentSelected.length < 2) {
        setAnswers(prev => ({ ...prev, [questionId]: [...currentSelected, value] }));
      }
    }
    // NOVO: MULTI ILIMITADO
    else if (type === 'multi-unlimited') {
      const currentSelected = answers[questionId] || [];
      if (currentSelected.includes(value)) {
        setAnswers(prev => ({ ...prev, [questionId]: currentSelected.filter((i: string) => i !== value) }));
      } else {
        setAnswers(prev => ({ ...prev, [questionId]: [...currentSelected, value] }));
      }
    }
  };

  const toggleBrand = (brand: string) => {
    if (selectedBrands.includes(brand)) {
      setSelectedBrands(prev => prev.filter(b => b !== brand));
    } else {
      setSelectedBrands(prev => [...prev, brand]);
    }
  };

  const handleNext = () => {
    const finalAnswers = { ...answers };

    if (question.type === 'text') {
      const value = (finalAnswers[question.id] || '').trim();
      if (!value) {
        if (question.id === 'site_cliente') alert("Por favor, cole o link do site da sua empresa.");
        if (question.id === 'ticket_medio') alert("Por favor, informe o ticket medio.");
        return;
      }
      if (question.id === 'site_cliente' && !isValidWebsiteInput(value)) {
        alert("Site invalido. Use algo como www.suaempresa.com.br");
        return;
      }
      if (question.id === 'ticket_medio') {
        const numeric = Number(value.replace(/\D/g, ''));
        if (!Number.isFinite(numeric) || numeric < 1000) {
          alert("Informe um ticket medio valido.");
          return;
        }
      }
      finalAnswers[question.id] = value;
    }

    // 1. Validacao geral (exceto multis e condicionais)
    if (!finalAnswers[question.id] &&
      question.type !== 'multi-max-2' &&
      question.type !== 'multi-unlimited' &&
      question.type !== 'conditional-sub' &&
      question.type !== 'text') return;

    // 2. Validacao multipla (garante pelo menos 1 selecionado)
    if ((question.type === 'multi-max-2' || question.type === 'multi-unlimited') &&
      (!finalAnswers[question.id] || finalAnswers[question.id].length === 0)) {
      alert("Por favor, selecione pelo menos uma opcao.");
      return;
    }

    // 3. Validacao marcas
    if (question.id === 'estrutura' &&
      (finalAnswers['estrutura'] === 'concessionaria' || finalAnswers['estrutura'] === 'grupo') &&
      selectedBrands.length === 0) {
      alert("Por favor, selecione pelo menos uma marca.");
      return;
    }

    // 4. Validacao da condicional
    if (question.type === 'conditional-sub') {
      if (!finalAnswers[question.id]) return;
      if (finalAnswers[question.id] === question.subQuestion?.conditionValue) {
        if (!finalAnswers[question.subQuestion!.id]) {
          alert("Por favor, selecione a faixa de investimento.");
          return;
        }
      }
    }

    // Salvar "Outros" de metricas
    if (question.id === 'metricas') {
      if (finalAnswers['metricas']?.includes('outros')) {
        finalAnswers['metricas_outros_texto'] = otherText;
      } else {
        delete finalAnswers['metricas_outros_texto'];
      }
    }

    setAnswers(finalAnswers);

    if (currentStep < QUESTIONS.length - 1) {
      setCurrentStep(curr => curr + 1);
    } else {
      console.log("Finalizando...", { ...finalAnswers, marcas: selectedBrands });
      navigate('/resultado', { state: { answers: finalAnswers, selectedBrands } });
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep(curr => curr - 1);
    else navigate('/');
  };

  // --- LÓGICA VISUAL ---
  const showBrandsSelection = question.id === 'estrutura' && 
    (answers['estrutura'] === 'concessionaria' || answers['estrutura'] === 'grupo');

  const filteredBrands = CAR_BRANDS.filter(b => b.toLowerCase().includes(brandSearch.toLowerCase()));

  const showInvestmentOptions = question.id === 'ads_flow' && 
    answers['ads_flow'] === 'sim';

  // Lógica para mostrar campo "Outros"
  const showOtherInput = question.id === 'metricas' && 
    answers['metricas']?.includes('outros');

  return (
    <div className="min-h-screen bg-autoforce-dark text-white font-sans flex flex-col selection:bg-autoforce-blue selection:text-white">
      
      {/* Background Lights */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-autoforce-blue/10 blur-[150px] rounded-full animate-pulse"></div>
        <div className="absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-autoforce-blue/5 blur-[120px] rounded-full"></div>
      </div>

      {/* Header Fixo */}
      <div className="sticky top-0 z-50 bg-autoforce-dark/90 backdrop-blur-md border-b border-white/5 pt-4 pb-4 px-6">
        <div className="max-w-3xl mx-auto flex items-center justify-between mb-2">
          <span className="text-xs font-bold tracking-widest text-gray-400 uppercase">DIAGNÓSTICO DE PERFORMANCE</span>
          <span className="text-xs font-bold text-autoforce-blue">{progress}%</span>
        </div>
        <div className="max-w-3xl mx-auto h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-autoforce-blue to-autoforce-light transition-all duration-700 ease-out shadow-[0_0_15px_#1440FF]"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="flex-1 relative z-10 flex flex-col items-center justify-start pt-8 pb-24 px-4">
        <div className="w-full max-w-2xl animate-slide-up" key={currentStep}>
          
          {/* Título Principal */}
          <div className="mb-8 text-center md:text-left">
            <h2 className="text-2xl md:text-4xl font-heading font-bold mb-2 leading-tight">
              {question.title}
            </h2>
            {question.subtitle && (
              <p className="text-gray-400 text-lg">{question.subtitle}</p>
            )}
          </div>

          {question.type === 'text' ? (
            <div className="space-y-6">
              {question.id === 'site_cliente' && (
              <div className="rounded-xl border border-autoforce-yellow/50 bg-autoforce-yellow/5 p-3.5">
                <div className="flex items-start gap-3">
                  <AlertTriangle className="w-5 h-5 text-autoforce-yellow mt-0.5" />
                  <div>
                    <span className="inline-flex items-center rounded-full border border-autoforce-yellow/50 bg-autoforce-yellow/10 px-2 py-0.5 text-[11px] font-bold tracking-widest text-autoforce-yellow mb-2">
                      IMPORTANTE
                    </span>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Confira com atenção se este e o site oficial correto da empresa. Um link errado compromete todo o diagnostico.
                    </p>
                  </div>
                </div>
              </div>
              )}

              <input
                type="text"
                value={answers[question.id] || ''}
                onChange={(e) => {
                  const nextValue = question.id === 'ticket_medio'
                    ? formatCurrencyInput(e.target.value)
                    : e.target.value;
                  setAnswers(prev => ({ ...prev, [question.id]: nextValue }));
                }}
                placeholder={question.placeholder || "Ex.: www.suaempresa.com.br"}
                className="w-full bg-black/30 border border-white/15 rounded-xl px-4 py-4 text-white text-lg focus:outline-none focus:border-autoforce-blue focus:shadow-[0_0_15px_rgba(20,64,255,0.2)]"
                autoFocus
              />
              <div className="mt-2 rounded-xl border border-autoforce-blue/20 bg-autoforce-blue/5 p-3">
                <div className="flex items-start gap-3">
                  <ShieldCheck className="w-4 h-4 text-autoforce-blue mt-0.5" />
                  <p className="text-xs text-gray-300 leading-relaxed">
                    Seus dados e informacoes ficam protegidos conforme nossas politicas de privacidade e seguranca.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {(question.options || []).map((option) => {
                // Logica de selecao (Single vs Multi)
                const isSelected =
                  question.type === 'multi-max-2' || question.type === 'multi-unlimited'
                    ? (answers[question.id] || []).includes(option.value)
                    : answers[question.id] === option.value;

                return (
                  <button
                    key={option.value}
                    onClick={() => handleSelect(question.id, option.value, question.type)}
                    className={"group relative w-full text-left p-5 rounded-xl border transition-all duration-300 ease-out flex items-center justify-between " +
                      (isSelected
                        ? "bg-white/5 border-autoforce-blue shadow-[0_0_20px_rgba(20,64,255,0.2)] translate-x-1"
                        : "bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10")}
                  >
                    <div className="flex items-center gap-4">
                      <div className={"w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors duration-300 " +
                        (isSelected ? "bg-autoforce-blue border-autoforce-blue" : "border-gray-500 group-hover:border-white")}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white" />}
                      </div>
                      <span className={"text-lg font-medium transition-colors " + (isSelected ? "text-white" : "text-gray-300 group-hover:text-white")}>
                        {option.label}
                      </span>
                    </div>
                    {isSelected && <Zap className="w-5 h-5 text-autoforce-yellow animate-pulse" />}
                  </button>
                );
              })}
            </div>
          )}

          {/* --- CAMPO OUTROS (Se selecionado em Métricas) --- */}
          {showOtherInput && (
             <div className="mt-4 animate-fade-in pl-2">
                <label className="text-sm text-autoforce-blue font-bold uppercase mb-2 block">Quais outros?</label>
                <input 
                  type="text"
                  value={otherText}
                  onChange={(e) => setOtherText(e.target.value)}
                  placeholder="Digite aqui..."
                  className="w-full bg-black/30 border border-autoforce-blue rounded-lg px-4 py-3 text-white focus:outline-none focus:shadow-[0_0_15px_rgba(20,64,255,0.3)]"
                  autoFocus
                />
             </div>
          )}

          {/* --- SUB-PERGUNTA: INVESTIMENTO --- */}
          {showInvestmentOptions && question.subQuestion && (
            <div className="mt-8 pt-8 border-t border-white/10 animate-fade-in">
              <h3 className="text-xl font-heading font-bold mb-4 text-white">
                {question.subQuestion.title}
              </h3>
              <div className="space-y-3">
                {question.subQuestion.options.map((subOpt) => {
                  const isSubSelected = answers[question.subQuestion!.id] === subOpt.value;
                  return (
                    <button
                      key={subOpt.value}
                      onClick={() => handleSelect(question.subQuestion!.id, subOpt.value, 'single')}
                      className={`group relative w-full text-left p-4 rounded-xl border transition-all duration-300 ease-out flex items-center justify-between
                        ${isSubSelected 
                          ? 'bg-autoforce-blue/10 border-autoforce-blue' 
                          : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/10'
                        }`}
                    >
                      <span className={`text-base font-medium ${isSubSelected ? 'text-white' : 'text-gray-300'}`}>
                        {subOpt.label}
                      </span>
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center
                        ${isSubSelected ? 'bg-autoforce-blue border-autoforce-blue' : 'border-gray-500'}`}>
                        {isSubSelected && <Check className="w-3 h-3 text-white" />}
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {/* --- SELEÇÃO DE MARCAS --- */}
          {showBrandsSelection && (
            <div className="mt-8 p-6 bg-white/5 rounded-2xl border-t-2 border-t-autoforce-blue animate-fade-in">
              <div className="flex items-center gap-2 mb-4">
                <Trophy className="w-5 h-5 text-autoforce-yellow" />
                <h3 className="text-lg font-bold">Selecione as marcas (Obrigatório)</h3>
              </div>
              <div className="relative mb-4 group">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 group-focus-within:text-autoforce-blue" />
                <input 
                  type="text" 
                  placeholder="Buscar marca..." 
                  className="w-full bg-black/40 border border-white/10 rounded-lg pl-10 pr-4 py-3 text-white focus:border-autoforce-blue focus:outline-none transition-all"
                  onChange={(e) => setBrandSearch(e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-60 overflow-y-auto custom-scrollbar pr-1">
                {filteredBrands.map(brand => (
                  <button
                    key={brand}
                    onClick={() => toggleBrand(brand)}
                    className={`text-sm px-3 py-2.5 rounded-md border text-left transition-all duration-200
                      ${selectedBrands.includes(brand)
                        ? 'bg-autoforce-blue text-white border-autoforce-blue shadow-lg'
                        : 'bg-white/5 text-gray-400 border-transparent hover:bg-white/10 hover:text-white'
                      }`}
                  >
                    {brand}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer Fixo */}
      <div className="fixed bottom-0 left-0 w-full bg-autoforce-dark border-t border-white/10 p-4 z-50">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
          <button 
            onClick={handlePrev}
            className="flex items-center px-6 py-3 text-gray-400 hover:text-white transition-colors font-medium rounded-lg hover:bg-white/5"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Voltar
          </button>

          <button 
            onClick={handleNext}
            className="flex-1 sm:flex-none sm:w-auto px-8 py-3 bg-autoforce-blue text-white font-bold rounded-lg hover:bg-white hover:text-autoforce-blue transition-all duration-300 shadow-[0_0_20px_rgba(20,64,255,0.4)] flex items-center justify-center group"
          >
            {currentStep === QUESTIONS.length - 1 ? 'Ver Resultado' : 'Próxima'}
            <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default Diagnostico;
