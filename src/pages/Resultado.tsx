import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, RefreshCw, Lock, ArrowRight, User, Mail, Phone, 
  Building2, Briefcase, Globe, 
  TrendingUp, Clock, DollarSign, AlertTriangle, CheckCircle2,
  BarChart3, Download, XCircle, CheckCircle, Bot
} from 'lucide-react';

function Resultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const answers = location.state?.answers || {};
  
  const [step, setStep] = useState<'locked' | 'loading' | 'result'>('locked');
  const [score, setScore] = useState(0);
  const [qualification, setQualification] = useState<'HOT' | 'WARM'>('WARM');
  
  const [formData, setFormData] = useState({ 
    name: '', role: '', phone: '', email: '', cnpj: '', website: '', consent: false 
  });

  // --- VALIDAÇÃO DE E-MAIL CORPORATIVO ---
  const isCorporateEmail = (email: string) => {
    const publicDomains = [
      'gmail.com', 'hotmail.com', 'outlook.com', 'outlook.com.br', 
      'yahoo.com', 'yahoo.com.br', 'live.com', 'icloud.com', 
      'uol.com.br', 'bol.com.br', 'terra.com.br', 'ig.com.br', 'globo.com'
    ];
    const domain = email.split('@')[1];
    if (!domain) return false;
    return !publicDomains.includes(domain.toLowerCase());
  };

  // --- MÁSCARAS ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
    setFormData({ ...formData, phone: v });
  };
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    setFormData({ ...formData, cnpj: v });
  };

  // --- LÓGICA DE QUALIFICAÇÃO (Mantida da última versão) ---
  const calculateResult = () => {
    // 1. Score Visual
    let points = 0;
    if (['70k+', '30-70k'].includes(answers.investimento_ads)) points += 30;
    else if (['10-30k'].includes(answers.investimento_ads)) points += 20;
    if (['200+', '100-199'].includes(answers.vendas_mes)) points += 30;
    else if (['50-99'].includes(answers.vendas_mes)) points += 20;
    if (answers.crm === 'crm-avancado') points += 20;
    if (answers.estrutura === 'grupo' || answers.lojas === '8+') points += 20;

    let finalScore = Math.min(points, 100);
    if (finalScore < 30) finalScore = 35;

    // 2. Decisão HOT vs WARM
    let tier: 'HOT' | 'WARM' = 'WARM'; 

    const cargo = formData.role.toLowerCase();
    const cargosDecisores = ['ceo', 'dono', 'proprietário', 'proprietario', 'sócio', 'socio', 'gerente', 'diretor', 'head', 'coordenador', 'supervisor', 'presidente'];
    const isDecisor = cargosDecisores.some(c => cargo.includes(c));

    const estrutura = (answers.estrutura || '').toLowerCase();
    const isConcessionaria = estrutura.includes('grupo') || estrutura.includes('concessionaria') || estrutura.includes('concessionária');
    
    const volumeAlto = ['50-99', '100-199', '200+', '50+', '100+'];
    const volumeAtual = answers.vendas_mes || answers.estoque || '';
    const isHighVolume = volumeAlto.some(v => volumeAtual.includes(v));
    const isBigMultimarcas = estrutura.includes('multimarcas') && isHighVolume;

    if (isDecisor && (isConcessionaria || isBigMultimarcas)) {
      tier = 'HOT';
    } 

    return { score: finalScore, tier };
  };

  const getPriorities = () => {
    const list = [];
    if (answers.crm !== 'crm-avancado') list.push("Implementar CRM integrado com WhatsApp");
    if (answers.tempo_resposta === '2h' || answers.tempo_resposta === '24h+') list.push("Reduzir SLA de atendimento para < 10 min");
    if (!answers.investimento_ads || answers.investimento_ads === 'ate-3k') list.push("Estruturar campanhas de tráfego pago");
    if (answers.estrutura === 'loja-unica') list.push("Criar Playbook de Vendas para escala");
    if (list.length < 3) list.push("Auditoria de conversão no site");
    return list.slice(0, 3);
  };

  const getChecklist = () => {
    return [
      { item: "CRM Integrado", status: answers.crm === 'crm-avancado' },
      { item: "Tempo de Resposta Ágil", status: ['5min', '30min'].includes(answers.tempo_resposta) },
      { item: "Volume de Tráfego", status: !['ate-3k', '3-10k'].includes(answers.investimento_ads) },
      { item: "Estrutura de Pré-vendas", status: ['hibrido', 'interno'].includes(answers.estrutura_mkt) },
      { item: "Rastreamento de Origem", status: true },
      { item: "Landing Pages Otimizadas", status: false },
    ];
  };

  const sendDataToWebhook = async (finalData: any) => {
    try {
      const WEBHOOK_URL = "https://n8n.autoforce.com/webhook/0079cc2e-0814-4f6d-869d-83fec83fafa1"; 
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
      console.log("Dados enviados para o n8n com sucesso!");
    } catch (error) {
      console.error("Erro ao enviar para n8n", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // --- VALIDAÇÕES EXTRAS ---
    if (!formData.consent) { alert("Necessário aceitar LGPD."); return; }
    
    // Validação de Site (Agora Obrigatória)
    if (!formData.website || formData.website.trim().length < 4) {
      alert("Por favor, insira o site da sua empresa.");
      return;
    }

    // Validação de E-mail Corporativo
    if (!isCorporateEmail(formData.email)) {
      alert("Por favor, utilize um e-mail corporativo (ex: nome@suaempresa.com). E-mails como Gmail, Hotmail ou Yahoo não são aceitos.");
      return;
    }
    
    const { score, tier } = calculateResult();
    setQualification(tier);
    
    const leadData = { 
      contact: formData, 
      answers, 
      result: { score, tier },
      generatedAt: new Date().toISOString()
    };

    console.log("LEAD PROCESSADO:", leadData);
    sendDataToWebhook(leadData);
    
    setStep('loading');
    setTimeout(() => {
      startScoreAnimation(score);
      setStep('result');
    }, 2000);
  };

  const startScoreAnimation = (finalScore: number) => {
    let start = 0;
    const increment = finalScore / 100;
    const timer = setInterval(() => {
      start += increment;
      if (start >= finalScore) {
        setScore(finalScore);
        clearInterval(timer);
      } else {
        setScore(start);
      }
    }, 10);
  };

  const handlePrint = () => {
    window.print();
  };

  const getContent = () => {
    if (qualification === 'HOT') return {
      tag: "ALTA QUALIFICAÇÃO",
      tagColor: "bg-green-500/10 text-green-500 border border-green-500/20",
      urgency: "Otimização Avançada",
      msg: "Identificamos que sua operação tem a estrutura ideal para escalar. Você tem prioridade para falar com nosso consultor especialista.",
      ctaTitle: "Falar com Consultor (SDR)",
      ctaSub: "Prioridade na agenda",
      ctaLink: "https://linkforce.cc/diagnostico_sdr",
      ctaIcon: Zap,
      buttonStyle: "bg-autoforce-blue text-white hover:bg-white hover:text-autoforce-blue"
    };
    
    return {
      tag: "POTENCIAL DE CRESCIMENTO",
      tagColor: "bg-autoforce-yellow/10 text-autoforce-yellow border border-autoforce-yellow/20",
      urgency: "Automação Recomendada",
      msg: "Para crescer sua operação sem inchar a equipe, a melhor estratégia hoje é Inteligência Artificial. Conheça a Lara, que atende seus leads 24h.",
      ctaTitle: "Conhecer Lara (IA de Vendas)",
      ctaSub: "Ver demonstração interativa",
      ctaLink: "https://linkforce.cc/diagnostico_lara",
      ctaIcon: Bot,
      buttonStyle: "bg-autoforce-blue text-white hover:bg-white hover:text-autoforce-blue"
    };
  };

  const content = getContent();
  const priorities = getPriorities();
  const checklist = getChecklist();

  return (
    <div className="min-h-screen bg-autoforce-dark text-white font-sans flex flex-col items-center justify-center p-4 md:p-8 print:bg-white print:text-black">
      
      <div className="fixed inset-0 pointer-events-none z-0 print:hidden">
        <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-autoforce-blue/10 blur-[120px] rounded-full"></div>
      </div>

      {step === 'locked' && (
        <div className="relative z-10 w-full max-w-lg animate-fade-in my-8">
           <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl">
            <div className="text-center mb-6">
              <div className="w-12 h-12 bg-autoforce-blue/20 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lock className="w-6 h-6 text-autoforce-blue" />
              </div>
              <h2 className="text-2xl font-bold">Diagnóstico Finalizado</h2>
              <p className="text-gray-400 text-sm mt-1">Preencha seus dados corporativos para liberar o resultado.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="group">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Nome completo *</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input required type="text" placeholder="Seu nome" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
                </div>
              </div>
              
              <div className="group">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Cargo *</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input required type="text" placeholder="Ex: Diretor, Gerente..." value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="group">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">WhatsApp *</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input required type="tel" maxLength={15} placeholder="(11) 99999-9999" value={formData.phone} onChange={handlePhoneChange} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
                  </div>
                </div>
                <div className="group">
                  <label className="text-xs font-bold text-gray-500 uppercase ml-1">CNPJ *</label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                    <input required type="text" maxLength={18} placeholder="00.000..." value={formData.cnpj} onChange={handleCnpjChange} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
                  </div>
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">E-mail corporativo *</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input required type="email" placeholder="nome@suaempresa.com.br" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1 ml-1">* E-mails como Gmail ou Hotmail não são permitidos.</p>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Site da Empresa *</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input required type="text" placeholder="www.suaempresa.com.br" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
                </div>
              </div>

              <div className="pt-2">
                <div className="flex items-start gap-3 p-3 bg-autoforce-blue/5 rounded-lg border border-autoforce-blue/10">
                  <input required type="checkbox" id="lgpd" checked={formData.consent} onChange={e => setFormData({...formData, consent: e.target.checked})} className="mt-1 w-4 h-4 rounded border-gray-600 text-autoforce-blue bg-black/40" />
                  <label htmlFor="lgpd" className="text-xs text-gray-400 cursor-pointer">Li e aceito receber o diagnóstico e comunicações da AutoForce.</label>
                </div>
              </div>

              <button type="submit" className="w-full bg-autoforce-blue hover:bg-white hover:text-autoforce-blue text-white font-bold py-4 rounded-xl transition-all flex items-center justify-center group">
                Liberar Dashboard <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          </div>
        </div>
      )}

      {step === 'loading' && (
        <div className="text-center animate-pulse z-20">
          <div className="w-16 h-16 border-4 border-autoforce-blue border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <h2 className="text-xl font-bold">Processando dados...</h2>
        </div>
      )}

      {step === 'result' && (
        <div className="relative z-10 w-full max-w-6xl animate-slide-up pb-12 print:p-0 print:w-full print:max-w-none">
          
          <div className="flex justify-between items-start mb-10 print:mb-6">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 print:hidden ${content.tagColor}`}>
                <CheckCircle2 className="w-3 h-3" /> {content.tag}
              </div>
              <h1 className="text-3xl md:text-5xl font-heading font-bold mb-2 print:text-black">
                Diagnóstico Digital
              </h1>
              <p className="text-gray-400 print:text-gray-600">Empresa: <span className="text-white font-bold print:text-black">{formData.website || formData.name}</span></p>
            </div>
            
            <button 
              onClick={handlePrint}
              className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors print:hidden"
            >
              <Download size={16} /> Baixar PDF
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 print:grid-cols-3 print:gap-4">
            
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center print:border-gray-300 print:bg-gray-50">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Score Digital</span>
              <div className="text-6xl font-heading font-black text-white mb-1 print:text-black">
                {score.toFixed(0)}
                <span className="text-lg text-gray-500 font-normal">/100</span>
              </div>
              <div className="text-sm font-bold text-autoforce-blue">{content.urgency}</div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:col-span-2 print:border-gray-300 print:bg-gray-50">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 block">
                <AlertTriangle className="inline w-3 h-3 mr-1 mb-0.5" /> Atenção Imediata
              </span>
              <div className="space-y-3">
                {priorities.map((item, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-red-500/10 border border-red-500/20 rounded-lg print:bg-red-50 print:border-red-100">
                    <div className="bg-red-500 text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <span className="text-sm font-medium text-gray-200 print:text-black">{item}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 print:grid-cols-3">
            
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8 print:border-gray-300 print:bg-white">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2 print:text-black">
                <BarChart3 className="w-5 h-5 text-gray-400" /> Auditoria Técnica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklist.map((check, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-white/5 rounded-xl print:border-gray-200">
                    <span className="text-sm text-gray-300 print:text-black">{check.item}</span>
                    {check.status ? (
                      <CheckCircle className="text-green-500 w-5 h-5" />
                    ) : (
                      <XCircle className="text-red-500 w-5 h-5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-8 flex flex-col gap-6 print:border-gray-300 print:bg-white">
               <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1">
                    <Clock size={14}/> Tempo Resposta
                  </div>
                  <div className="text-xl font-bold text-white print:text-black">{answers.tempo_resposta || '-'}</div>
               </div>
               <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1">
                    <DollarSign size={14}/> Investimento
                  </div>
                  <div className="text-xl font-bold text-white print:text-black">{answers.investimento_ads || '-'}</div>
               </div>
               <div>
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-400 uppercase mb-1">
                    <TrendingUp size={14}/> Volume
                  </div>
                  <div className="text-xl font-bold text-white print:text-black">{answers.vendas_mes || '-'} vendas/mês</div>
               </div>
            </div>
          </div>

          <div className="w-full bg-gradient-to-r from-autoforce-blue/20 to-transparent border border-autoforce-blue/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-[0_0_40px_rgba(20,64,255,0.1)] print:hidden">
            <div className="flex-1">
              <h3 className="text-2xl font-heading font-bold text-white mb-2">
                Próximo Passo Recomendado
              </h3>
              <p className="text-gray-300 max-w-xl">
                {content.msg}
              </p>
            </div>

            <button 
              onClick={() => window.open(content.ctaLink, '_blank')}
              className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-w-[280px] group ${content.buttonStyle}`}
            >
              <div className="flex items-center gap-2 text-lg">
                <content.ctaIcon className="w-5 h-5" />
                <span>{content.ctaTitle}</span>
              </div>
              <span className="text-xs opacity-80 font-normal mt-1">{content.ctaSub}</span>
            </button>
          </div>

          <button onClick={() => navigate('/')} className="mt-12 text-gray-500 hover:text-white flex items-center mx-auto text-sm transition-colors print:hidden">
            <RefreshCw className="w-4 h-4 mr-2" /> Refazer Diagnóstico
          </button>
        </div>
      )}
    </div>
  );
}

export default Resultado;