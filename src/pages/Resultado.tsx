import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  Zap, RefreshCw, Lock, ArrowRight, User, Mail, Phone, 
  Building2, Briefcase, Globe, PlayCircle, 
  TrendingUp, Clock, DollarSign, AlertTriangle, CheckCircle2,
  BarChart3
} from 'lucide-react';

function Resultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const answers = location.state?.answers || {};
  
  const [step, setStep] = useState<'locked' | 'loading' | 'result'>('locked');
  const [score, setScore] = useState(0);
  const [qualification, setQualification] = useState<'HOT' | 'WARM' | 'COLD'>('WARM');
  const [formData, setFormData] = useState({ 
    name: '', role: '', phone: '', email: '', cnpj: '', website: '', noWebsite: false, consent: false 
  });

  // --- MÁSCARAS ---
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
    setFormData({ ...formData, phone: v });
  };
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    setFormData({ ...formData, cnpj: v });
  };

  // --- CÁLCULO INTELIGENTE (SCORING) ---
  const calculateMetrics = () => {
    let points = 0;
    
    // 1. Potencial de Compra (Investimento + Volume)
    if (['70k+', '30-70k'].includes(answers.investimento_ads)) points += 30;
    else if (['10-30k'].includes(answers.investimento_ads)) points += 20;
    
    if (['200+', '100-199'].includes(answers.vendas_mes)) points += 30;
    else if (['50-99'].includes(answers.vendas_mes)) points += 20;

    // 2. Maturidade de Gestão (CRM + Estrutura)
    if (answers.crm === 'crm-avancado') points += 20;
    if (answers.estrutura === 'grupo' || answers.lojas === '8+') points += 20;

    // Normalização 0-100
    let finalScore = Math.min(points, 100);
    if (finalScore < 30) finalScore = 42; 

    // Definição de Tier
    let tier: 'HOT' | 'WARM' | 'COLD' = 'COLD';
    if (points >= 70) tier = 'HOT';
    else if (points >= 40) tier = 'WARM';
    else tier = 'COLD';

    return { score: finalScore, tier };
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consent) { alert("Necessário aceitar LGPD."); return; }
    
    const result = calculateMetrics();
    setQualification(result.tier);
    
    console.log("LEAD CAPTURADO:", { ...formData, answers, qualification: result.tier });
    
    setStep('loading');
    setTimeout(() => {
      startScoreAnimation(result.score);
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

  const getContent = () => {
    if (qualification === 'HOT') return {
      tag: "PERFIL LÍDER",
      tagColor: "bg-autoforce-blue text-white",
      urgency: "Alta Urgência",
      msg: "Sua operação tem maturidade para escalar agressivamente. O gargalo atual está custando vendas diárias.",
      ctaTitle: "Falar com Consultor Senior",
      ctaSub: "Prioridade na agenda",
      ctaLink: `https://wa.me/5511999999999?text=Olá, sou ${formData.name}, minha nota foi ${score} e quero falar com um especialista.`,
      ctaIcon: Zap,
      isVsl: false
    };
    
    return {
      tag: "EM DESENVOLVIMENTO",
      tagColor: "bg-autoforce-yellow text-autoforce-dark",
      urgency: "Média Urgência",
      msg: "Você tem potencial, mas processos manuais estão travando seu crescimento. Você precisa estruturar a base antes de acelerar.",
      ctaTitle: "Assistir Aula de Estruturação",
      ctaSub: "Vídeo Gratuito (15 min)",
      ctaLink: "https://lp.autoforce.com/aula-gestao-leads",
      ctaIcon: PlayCircle,
      isVsl: true
    };
  };

  const content = getContent();

  const getInvestimentoLabel = () => {
    const map: any = { 'ate-3k': 'Até R$ 3k', '3-10k': 'R$ 3-10k', '10-30k': 'R$ 10-30k', '30-70k': 'R$ 30-70k', '70k+': 'R$ 70k+' };
    return map[answers.investimento_ads] || 'Não informado';
  };

  const getDorPrincipal = () => {
    const map: any = { 'geracao': 'Geração', 'qualidade': 'Qualidade', 'conversao': 'Conversão', 'atendimento': 'Atendimento', 'gestao': 'Gestão', 'site': 'Site' };
    return map[answers.friccao] || 'Vendas';
  };

  return (
    <div className="min-h-screen bg-autoforce-dark text-white font-sans flex flex-col items-center justify-center p-4 md:p-8">
      
      <div className="fixed inset-0 pointer-events-none z-0">
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
              <p className="text-gray-400 text-sm mt-1">Preencha seus dados para liberar o dashboard completo.</p>
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
                  <input required type="text" placeholder="Ex: Diretor Comercial" value={formData.role} onChange={e => setFormData({...formData, role: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
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
                  <input required type="email" placeholder="nome@empresa.com.br" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
                </div>
              </div>

              <div className="group">
                <label className="text-xs font-bold text-gray-500 uppercase ml-1">Site</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                  <input type="text" placeholder="www.suaempresa.com.br" value={formData.website} onChange={e => setFormData({...formData, website: e.target.value})} className="w-full bg-black/20 border border-white/10 rounded-lg pl-12 pr-4 py-3 text-white focus:border-autoforce-blue outline-none" />
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
          <h2 className="text-xl font-bold">Gerando Dashboard Personalizado...</h2>
          <p className="text-gray-400 mt-2">Cruzando dados de mercado</p>
        </div>
      )}

      {step === 'result' && (
        <div className="relative z-10 w-full max-w-6xl animate-slide-up pb-12">
          
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-autoforce-blue/10 border border-autoforce-blue/20 text-autoforce-blue text-xs font-bold uppercase tracking-wider mb-4">
              <CheckCircle2 className="w-3 h-3" /> Diagnóstico Concluído
            </div>
            <h1 className="text-3xl md:text-5xl font-heading font-bold mb-2">
              Seu Diagnóstico Digital
            </h1>
            <p className="text-gray-400">Análise completa da maturidade digital de <span className="text-white font-bold">{formData.name.split(' ')[0]}</span></p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4">Sua Classificação</span>
              <div className={`px-4 py-2 rounded-full text-sm font-bold uppercase mb-3 ${content.tagColor}`}>
                {content.tag}
              </div>
              <p className="text-gray-400 text-xs leading-relaxed max-w-[200px]">
                Baseado no seu volume de vendas e estrutura atual.
              </p>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 relative overflow-hidden flex flex-col justify-between">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-4 block">Métricas da Operação</span>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{answers.tempo_resposta || '-'}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Tempo Resposta</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white mb-1">{answers.crm === 'crm-avancado' ? '100%' : '50%'}</div>
                  <div className="text-[10px] text-gray-500 uppercase">Uso de CRM</div>
                </div>
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center flex flex-col items-center justify-center relative">
              <span className="text-gray-400 text-xs font-bold uppercase tracking-widest mb-2">Score Digital</span>
              <div className="text-6xl font-heading font-black text-white mb-1">
                {score}
                <span className="text-lg text-gray-500 font-normal">/100</span>
              </div>
              <div className="text-sm font-bold text-autoforce-blue">{content.urgency}</div>
            </div>
          </div>

          <div className="bg-white/5 border border-white/10 rounded-3xl p-8 mb-8">
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-gray-400" />
              Raio-X da Operação
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-red-500/10 rounded text-red-400"><TrendingUp size={18}/></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Performance 90d</span>
                </div>
                <div className="text-lg font-bold text-white capitalize">{answers.cenario || 'Indefinida'}</div>
                <div className="text-xs text-gray-500 mt-1">Situação das metas</div>
              </div>

              <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-yellow-500/10 rounded text-yellow-400"><Clock size={18}/></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Tempo de Resposta</span>
                </div>
                <div className="text-lg font-bold text-white">{answers.tempo_resposta || 'Não inf.'}</div>
                <div className="text-xs text-gray-500 mt-1">SLA primeiro contato</div>
              </div>

              <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-green-500/10 rounded text-green-400"><DollarSign size={18}/></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Investimento Mídia</span>
                </div>
                <div className="text-lg font-bold text-white">{getInvestimentoLabel()}</div>
                <div className="text-xs text-gray-500 mt-1">Mensal em tráfego pago</div>
              </div>

              <div className="bg-black/20 rounded-xl p-5 border border-white/5">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 bg-purple-500/10 rounded text-purple-400"><AlertTriangle size={18}/></div>
                  <span className="text-xs font-bold text-gray-400 uppercase">Dor Principal</span>
                </div>
                <div className="text-lg font-bold text-white capitalize">{getDorPrincipal()}</div>
                <div className="text-xs text-gray-500 mt-1">Maior fricção identificada</div>
              </div>
            </div>
          </div>

          <div className="w-full bg-gradient-to-r from-autoforce-blue/20 to-transparent border border-autoforce-blue/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-[0_0_40px_rgba(20,64,255,0.1)]">
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
              className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-w-[280px] group
                ${content.isVsl 
                  ? 'bg-autoforce-yellow text-autoforce-dark hover:bg-white' 
                  : 'bg-autoforce-blue text-white hover:bg-white hover:text-autoforce-blue'
                }`}
            >
              <div className="flex items-center gap-2 text-lg">
                <content.ctaIcon className="w-5 h-5" />
                <span>{content.ctaTitle}</span>
              </div>
              <span className="text-xs opacity-80 font-normal mt-1">{content.ctaSub}</span>
            </button>
          </div>

          <button onClick={() => navigate('/')} className="mt-12 text-gray-500 hover:text-white flex items-center mx-auto text-sm transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" /> Refazer Diagnóstico
          </button>
        </div>
      )}
    </div>
  );
}

export default Resultado;