import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Zap, RefreshCw, Lock, ArrowRight, User, Mail, Phone, 
  Building2, Briefcase, Globe, 
  TrendingUp, Clock, DollarSign, AlertTriangle, CheckCircle2,
  BarChart3, Download, XCircle, CheckCircle, Bot, Loader2
} from 'lucide-react';

function Resultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPreview = searchParams.get('preview') === '1';
  const testSite = searchParams.get('testsite');
  const previewAnswers = {
    investimento_ads: '30-70k',
    vendas_mes: '100-199',
    crm: 'crm-avancado',
    estrutura: 'grupo',
    tempo_resposta: '5min',
    estrutura_mkt: 'interno',
  };
  const testAnswers = {
    investimento_ads: '30-70k',
    vendas_mes: '100-199',
    crm: 'crm-basico',
    estrutura: 'grupo',
    tempo_resposta: '2h',
    estrutura_mkt: 'agencia',
    lojas: '4-7',
    estoque: '100-199',
    equipe: '11-20',
    origem: ['ads', 'portals'],
    ads_flow: 'sim',
    cenario: 'instavel',
    friccao: 'conversao',
    metricas: ['leads', 'vendas', 'roas'],
    prazo: '60d',
  };
  const answers = isPreview
    ? previewAnswers
    : testSite
      ? testAnswers
      : location.state?.answers || {};
  const selectedBrands = location.state?.selectedBrands || [];
  
  const printRef = useRef<HTMLDivElement>(null);
  
  const [step, setStep] = useState<'locked' | 'loading' | 'result'>(
    isPreview || !!testSite ? 'result' : 'locked'
  );
  const [score, setScore] = useState(0);
  const [qualification, setQualification] = useState<'HOT' | 'WARM'>('WARM');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
  const [psiStatus, setPsiStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [psiError, setPsiError] = useState<string | null>(null);
  const [psiData, setPsiData] = useState<{
    url: string;
    scores: { performance: number | null; accessibility: number | null; seo: number | null; bestPractices: number | null };
    metrics: { lcp?: string; cls?: string; inp?: string; tbt?: string };
  } | null>(null);
  const [loadingStep, setLoadingStep] = useState(0);
  
  const [formData, setFormData] = useState({ 
    name: isPreview ? 'Teste Preview' : '',
    role: isPreview ? 'Diretor' : '',
    phone: isPreview ? '(11) 99999-9999' : '',
    email: isPreview ? 'teste@empresa.com.br' : '',
    cnpj: isPreview ? '12.345.678/0001-90' : '',
    website: isPreview ? 'www.empresa.com.br' : testSite || '',
    consent: isPreview ? true : false,
  });

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

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/g, "($1) $2").replace(/(\d)(\d{4})$/, "$1-$2");
    setFormData({ ...formData, phone: v });
  };
  const handleCnpjChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, "").replace(/^(\d{2})(\d)/, "$1.$2").replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3").replace(/\.(\d{3})(\d)/, ".$1/$2").replace(/(\d{4})(\d)/, "$1-$2");
    setFormData({ ...formData, cnpj: v });
  };

  const calculateResult = () => {
    let points = 0;
    if (['70k+', '30-70k'].includes(answers.investimento_ads)) points += 30;
    else if (['10-30k'].includes(answers.investimento_ads)) points += 20;
    if (['200+', '100-199'].includes(answers.vendas_mes)) points += 30;
    else if (['50-99'].includes(answers.vendas_mes)) points += 20;
    if (answers.crm === 'crm-avancado') points += 20;
    if (answers.estrutura === 'grupo' || answers.lojas === '8+') points += 20;

    let finalScore = Math.min(points, 100);
    if (finalScore < 30) finalScore = 35;

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

  const getInsights = () => {
    const insights: { type: 'risk' | 'info'; title: string; text: string }[] = [];

    // Estrutura
    if (answers.estrutura === 'concessionaria') {
      insights.push({
        type: 'risk',
        title: 'Concessionária autorizada',
        text: 'O gargalo mais comum aqui é SLA alto e lead pulverizado entre canais.',
      });
    }
    if (answers.estrutura === 'multimarcas') {
      insights.push({
        type: 'risk',
        title: 'Operação multimarcas',
        text: 'Sem priorização de leads, a conversão tende a cair mesmo com volume.',
      });
    }
    if (answers.estrutura === 'grupo') {
      insights.push({
        type: 'risk',
        title: 'Grupo com múltiplas lojas',
        text: 'A falta de padronização entre unidades cria perdas invisíveis no funil.',
      });
    }

    // Lojas
    if (answers.lojas === '1') {
      insights.push({
        type: 'info',
        title: 'Operação enxuta',
        text: 'Processo e follow-up definem sua capacidade de competir.',
      });
    }
    if (['2-3', '4-7', '8+'].includes(answers.lojas)) {
      insights.push({
        type: 'risk',
        title: 'Escala sem padronização',
        text: 'Quanto mais lojas, maior o risco de assimetria de conversão.',
      });
    }

    // Volume e Estoque
    if (['0-19', '20-49'].includes(answers.vendas_mes)) {
      insights.push({
        type: 'risk',
        title: 'Volume abaixo do potencial',
        text: 'Indica gargalo no topo do funil ou qualificação de leads.',
      });
    }
    if (['100-199', '200+'].includes(answers.vendas_mes)) {
      insights.push({
        type: 'risk',
        title: 'Alto volume',
        text: 'Pequenas ineficiências viram grandes perdas financeiras.',
      });
    }
    if (['100-199', '200+'].includes(answers.estoque)) {
      insights.push({
        type: 'risk',
        title: 'Estoque alto',
        text: 'Sem giro rápido, margem sofre e a pressão por conversão aumenta.',
      });
    }

    // Equipe
    if (['1-5', '6-10'].includes(answers.equipe)) {
      insights.push({
        type: 'risk',
        title: 'Equipe enxuta',
        text: 'Automação e priorização evitam perda de lead quente.',
      });
    }
    if (['21-40', '41+'].includes(answers.equipe)) {
      insights.push({
        type: 'risk',
        title: 'Equipe grande',
        text: 'Sem SLA e regras claras, a operação vira gargalo.',
      });
    }

    // Origem
    const origem = answers.origem || [];
    if (origem.includes('ads')) {
      insights.push({
        type: 'risk',
        title: 'Tráfego pago',
        text: 'Sem resposta rápida, o investimento vira desperdício direto.',
      });
    }
    if (origem.includes('portals')) {
      insights.push({
        type: 'risk',
        title: 'Portais/Marketplaces',
        text: 'Volume alto com qualidade variável exige triagem rigorosa.',
      });
    }
    if (origem.includes('organic')) {
      insights.push({
        type: 'info',
        title: 'Orgânico forte',
        text: 'Leads mais frios exigem cadência e follow-up consistente.',
      });
    }

    // Ads + investimento
    if (answers.ads_flow === 'nao') {
      insights.push({
        type: 'risk',
        title: 'Sem mídia paga',
        text: 'Topo de funil tende a ficar instável e sazonal.',
      });
    }
    if (['ate-3k', '3-10k'].includes(answers.investimento_ads)) {
      insights.push({
        type: 'info',
        title: 'Investimento baixo',
        text: 'Eficiência no atendimento é crítica para gerar resultado.',
      });
    }
    if (['30-70k', '70k+'].includes(answers.investimento_ads)) {
      insights.push({
        type: 'risk',
        title: 'Investimento alto',
        text: 'Sem SLA e CRM forte, o retorno despenca.',
      });
    }

    // Estrutura de marketing
    if (answers.estrutura_mkt === 'agencia') {
      insights.push({
        type: 'risk',
        title: 'Dependência de agência',
        text: 'Agência otimiza mídia, mas raramente resolve atendimento e CRM.',
      });
    }
    if (answers.estrutura_mkt === 'sem-estrutura') {
      insights.push({
        type: 'risk',
        title: 'Sem estrutura de marketing',
        text: 'As perdas começam antes do lead chegar.',
      });
    }

    // CRM
    if (answers.crm === 'crm-basico') {
      insights.push({
        type: 'risk',
        title: 'CRM básico',
        text: 'Sem regras claras, leads ficam parados e a conversão cai.',
      });
    }
    if (answers.crm === 'planilha') {
      insights.push({
        type: 'risk',
        title: 'Gestão por planilha',
        text: 'Sem visibilidade e prioridade, perdas são inevitáveis.',
      });
    }
    if (answers.crm === 'whatsapp') {
      insights.push({
        type: 'risk',
        title: 'WhatsApp sem controle',
        text: 'Sem histórico e responsabilidade, leads se perdem no caminho.',
      });
    }

    // Tempo resposta
    if (['2h', '24h', '24h+'].includes(answers.tempo_resposta)) {
      insights.push({
        type: 'risk',
        title: 'Tempo de resposta alto',
        text: 'A conversão despenca e a mídia perde eficiência.',
      });
    }

    // Cenário
    if (answers.cenario === 'instavel') {
      insights.push({
        type: 'risk',
        title: 'Resultados instáveis',
        text: 'Oscilações indicam falhas de processo ou atendimento.',
      });
    }
    if (answers.cenario === 'abaixo') {
      insights.push({
        type: 'risk',
        title: 'Metas não batidas',
        text: 'Sinal de gargalo crítico no funil de vendas.',
      });
    }
    if (answers.cenario === 'sem-dados') {
      insights.push({
        type: 'risk',
        title: 'Sem previsibilidade',
        text: 'Sem métricas, decisões viram achismo e aumentam perdas.',
      });
    }

    // Fricção
    if (answers.friccao === 'geracao') {
      insights.push({
        type: 'risk',
        title: 'Geração de leads',
        text: 'Topo fraco limita toda a operação.',
      });
    }
    if (answers.friccao === 'qualidade') {
      insights.push({
        type: 'risk',
        title: 'Qualidade dos leads',
        text: 'Leads desalinhados drenam o time comercial.',
      });
    }
    if (answers.friccao === 'conversao') {
      insights.push({
        type: 'risk',
        title: 'Conversão baixa',
        text: 'Problema clássico de processo e follow-up.',
      });
    }
    if (answers.friccao === 'atendimento') {
      insights.push({
        type: 'risk',
        title: 'Atendimento lento',
        text: 'SLA é hoje o maior fator de perda.',
      });
    }
    if (answers.friccao === 'gestao') {
      insights.push({
        type: 'risk',
        title: 'Gestão/CRM',
        text: 'Sem regras e visibilidade, o funil não é previsível.',
      });
    }
    if (answers.friccao === 'site') {
      insights.push({
        type: 'risk',
        title: 'Site / Landing',
        text: 'Uma experiência fraca mata a intenção antes do contato.',
      });
    }

    // Métricas
    const metricas = answers.metricas || [];
    if (!metricas.length || metricas.length < 2) {
      insights.push({
        type: 'risk',
        title: 'Baixa visibilidade',
        text: 'Sem métricas básicas, você não sabe onde está o buraco.',
      });
    }

    // Prazo
    if (['30d', '60d'].includes(answers.prazo)) {
      insights.push({
        type: 'info',
        title: 'Urgência alta',
        text: 'Automação e SLA precisam ser prioridade imediata.',
      });
    }

    return insights.slice(0, 8);
  };

  const sendDataToWebhook = async (finalData: any) => {
    try {
      const WEBHOOK_URL = "https://n8n.autoforce.com/webhook/0079cc2e-0814-4f6d-869d-83fec83fafa1"; 
      await fetch(WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalData)
      });
    } catch (error) {
      console.error("Erro ao enviar para n8n", error);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isPreview || testSite) return;
    if (!formData.consent) { alert("Necessário aceitar LGPD."); return; }
    if (!formData.website || formData.website.trim().length < 4) { alert("Por favor, insira o site da sua empresa."); return; }
    if (!isValidWebsiteInput(formData.website)) { alert("Site inválido. Use algo como www.suaempresa.com.br"); return; }
    if (!isCorporateEmail(formData.email)) { alert("Por favor, utilize um e-mail corporativo (ex: nome@suaempresa.com)."); return; }
    
    const { score, tier } = calculateResult();
    setQualification(tier);
    
    const leadData = { contact: formData, answers, result: { score, tier }, generatedAt: new Date().toISOString() };
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

  // --- PDF GENERATOR (Ajustado para preenchimento total) ---
  const handleDownloadPDF = async () => {
    if (!printRef.current) return;
    setIsGeneratingPdf(true);

    try {
      const canvas = await html2canvas(printRef.current, {
        scale: 4, 
        useCORS: true,
        backgroundColor: '#020617', 
        ignoreElements: (element) => element.classList.contains('no-print')
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      // Pinta o fundo
      pdf.setFillColor(2, 6, 23); 
      pdf.rect(0, 0, pdfWidth, pdfHeight, 'F'); 

      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      
      // Ajuste para preencher a largura total (Full Width)
      const ratio = pdfWidth / imgWidth; 
      
      const imgX = 0; // Começa do canto
      const imgY = 10; // Pequena margem topo

      pdf.addImage(imgData, 'PNG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);
      pdf.save(`Diagnostico-AutoForce-${formData.name}.pdf`);
    } catch (error) {
      console.error("Erro ao gerar PDF:", error);
      alert("Houve um erro ao gerar o PDF.");
    } finally {
      setIsGeneratingPdf(false);
    }
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

  const getWorstPsiScore = () => {
    if (!psiData) return null;
    const values = [
      psiData.scores.performance,
      psiData.scores.accessibility,
      psiData.scores.bestPractices,
      psiData.scores.seo,
    ].filter((v): v is number => typeof v === 'number');
    if (!values.length) return null;
    return Math.min(...values);
  };

  const getExecutiveSummary = () => {
    const worstPsi = getWorstPsiScore();
    if (typeof worstPsi === 'number' && worstPsi < 50) {
      return {
        risk: 'Risco crítico no site (baixa performance técnica)',
        impact: 'Carregamento lento e instável reduz conversão e aumenta o CPL.',
        action: 'Prioridade: otimizar performance e estabilidade nas próximas semanas.',
      };
    }
    if (['2h', '24h', '24h+'].includes(answers.tempo_resposta)) {
      return {
        risk: 'Tempo de resposta elevado',
        impact: 'Leads esquentam e esfriam antes do primeiro contato.',
        action: 'Prioridade: reduzir SLA para menos de 10 minutos.',
      };
    }
    if (answers.crm !== 'crm-avancado') {
      return {
        risk: 'Gestão de leads sem regras claras',
        impact: 'Leads se perdem e o funil fica imprevisível.',
        action: 'Prioridade: CRM com regras e distribuição automática.',
      };
    }
    return {
      risk: 'Oportunidade de ganho rápido',
      impact: 'Pequenos ajustes podem gerar aumento imediato de conversão.',
      action: 'Prioridade: alinhar processos e acelerar o atendimento.',
    };
  };

  const getPriorityImpact = (item: string) => {
    const impactMap: Record<string, string> = {
      "Implementar CRM integrado com WhatsApp": "Impacto: reduz perdas por falta de controle.",
      "Reduzir SLA de atendimento para < 10 min": "Impacto: aumenta conversão e resposta do lead.",
      "Estruturar campanhas de tráfego pago": "Impacto: aumenta volume qualificado no topo do funil.",
      "Criar Playbook de Vendas para escala": "Impacto: padroniza conversão entre lojas.",
      "Auditoria de conversão no site": "Impacto: melhora performance e captação.",
    };
    return impactMap[item] || "Impacto: ganho direto em conversão e eficiência.";
  };

  const getActionPlan = () => {
    const steps: string[] = [];
    if (['2h', '24h', '24h+'].includes(answers.tempo_resposta)) {
      steps.push('Reduzir SLA para menos de 10 minutos com automação.');
    }
    if (answers.crm !== 'crm-avancado') {
      steps.push('Implantar CRM com regras e distribuição inteligente.');
    }
    const worstPsi = getWorstPsiScore();
    if (typeof worstPsi === 'number' && worstPsi < 90) {
      steps.push('Otimizar performance do site e corrigir pontos técnicos.');
    }
    if (steps.length < 3) {
      steps.push('Padronizar atendimento e acompanhar métricas semanalmente.');
    }
    return steps.slice(0, 3);
  };

  const content = getContent();
  const priorities = getPriorities();
  const checklist = getChecklist();
  const insights = getInsights();
  const psiAlerts = getPsiAlerts();
  const executive = getExecutiveSummary();
  const actionPlan = getActionPlan();
  const ctaHook = (() => {
    const worstPsi = getWorstPsiScore();
    if (typeof worstPsi === 'number' && worstPsi < 50) {
      return 'Seu site está em nível crítico e isso afeta diretamente conversão e CPL.';
    }
    if (psiAlerts.length > 0) {
      return 'Existem pontos técnicos que estão reduzindo sua performance agora.';
    }
    return 'Com alguns ajustes, é possível gerar ganho imediato em vendas.';
  })();

  const getCtaCopy = () => {
    const worstPsi = getWorstPsiScore();
    const perf = psiData?.scores.performance ?? null;
    const seo = psiData?.scores.seo ?? null;

    if (typeof worstPsi === 'number' && worstPsi < 50) {
      return {
        title: 'Corrigir pontos críticos agora',
        sub: 'Plano rápido para recuperar conversão e reduzir CPL',
      };
    }
    if (typeof perf === 'number' && perf < 50) {
      return {
        title: 'Acelerar o site e recuperar leads',
        sub: 'Reduza o tempo de carregamento e melhore conversão',
      };
    }
    if (typeof seo === 'number' && seo < 60) {
      return {
        title: 'Aumentar tráfego orgânico em 30 dias',
        sub: 'Ajustes técnicos e conteúdo que geram demanda',
      };
    }
    if (answers.tempo_resposta && ['2h', '24h', '24h+'].includes(answers.tempo_resposta)) {
      return {
        title: 'Reduzir SLA e vender mais rápido',
        sub: 'Organize atendimento e responda em minutos',
      };
    }
    return {
      title: content.ctaTitle,
      sub: content.ctaSub,
    };
  };

  const labelMaps = {
    estrutura: {
      concessionaria: 'Concessionária autorizada',
      multimarcas: 'Revenda multimarcas',
      grupo: 'Grupo misto',
    },
    lojas: { '1': '1', '2-3': '2–3', '4-7': '4–7', '8+': '8+' },
    vendas_mes: { '0-19': '0–19', '20-49': '20–49', '50-99': '50–99', '100-199': '100–199', '200+': '200+' },
    estoque: { '0-29': '0–29', '30-49': '30–49', '50-99': '50–99', '100-199': '100–199', '200+': '200+' },
    equipe: { '1-5': '1–5', '6-10': '6–10', '11-20': '11–20', '21-40': '21–40', '41+': '41+' },
    origem: {
      ads: 'Tráfego pago',
      organic: 'Orgânico',
      portals: 'Portais',
      phone: 'Telefone',
      referral: 'Indicação/Base',
      offline: 'Ações locais',
      other: 'Outros',
    },
    ads_flow: { sim: 'Sim', nao: 'Não' },
    investimento_ads: {
      'ate-3k': 'Até R$ 3 mil',
      '3-10k': 'R$ 3–10 mil',
      '10-30k': 'R$ 10–30 mil',
      '30-70k': 'R$ 30–70 mil',
      '70k+': 'R$ 70 mil+',
    },
    estrutura_mkt: {
      interno: 'Time interno',
      agencia: 'Agência',
      hibrido: 'Interno + Agência',
      'sem-estrutura': 'Sem estrutura',
    },
    crm: {
      'crm-avancado': 'CRM avançado',
      'crm-basico': 'CRM básico',
      planilha: 'Planilha/ERP',
      whatsapp: 'WhatsApp sem controle',
    },
    tempo_resposta: { '5min': 'Até 5 min', '30min': '5–30 min', '2h': '30–120 min', '24h': '2–24h', '24h+': '24h+' },
    cenario: {
      previsivel: 'Metas previsíveis',
      instavel: 'Metas instáveis',
      abaixo: 'Abaixo do esperado',
      'sem-dados': 'Sem previsibilidade',
    },
    friccao: {
      geracao: 'Geração de leads',
      qualidade: 'Qualidade dos leads',
      conversao: 'Conversão (vendas)',
      atendimento: 'Atendimento',
      gestao: 'Gestão/CRM',
      site: 'Site/Landing',
    },
    metricas: {
      leads: 'Leads',
      vendas: 'Vendas',
      roi: 'ROI',
      roas: 'ROAS',
      csat: 'CSAT/NPS',
      ticket: 'Ticket médio',
      conversao: 'Conversão por canal',
      outros: 'Outros',
    },
    prazo: { '30d': '0–30 dias', '60d': '31–60 dias', '120d': '61–120 dias', '120d+': '120+ dias' },
  } as const;

  const listFromMulti = (values: string[], map: Record<string, string>) =>
    values.map((v) => map[v] || v).filter(Boolean).join(', ');

  const confirmedAnswers = [
    { label: 'Estrutura', value: labelMaps.estrutura[answers.estrutura] },
    { label: 'Lojas', value: labelMaps.lojas[answers.lojas] },
    { label: 'Vendas/mês', value: labelMaps.vendas_mes[answers.vendas_mes] },
    { label: 'Estoque', value: labelMaps.estoque[answers.estoque] },
    { label: 'Equipe', value: labelMaps.equipe[answers.equipe] },
    { label: 'Origem', value: listFromMulti(answers.origem || [], labelMaps.origem) },
    { label: 'Anúncios pagos', value: labelMaps.ads_flow[answers.ads_flow] },
    { label: 'Investimento', value: labelMaps.investimento_ads[answers.investimento_ads] },
    { label: 'Marketing', value: labelMaps.estrutura_mkt[answers.estrutura_mkt] },
    { label: 'CRM', value: labelMaps.crm[answers.crm] },
    { label: 'Tempo resposta', value: labelMaps.tempo_resposta[answers.tempo_resposta] },
    { label: 'Cenário', value: labelMaps.cenario[answers.cenario] },
    { label: 'Fricção', value: labelMaps.friccao[answers.friccao] },
    { label: 'Métricas', value: listFromMulti(answers.metricas || [], labelMaps.metricas) },
    { label: 'Prazo', value: labelMaps.prazo[answers.prazo] },
    { label: 'Marcas', value: selectedBrands.length ? selectedBrands.join(', ') : '' },
  ].filter((item) => item.value);

  const getScoreStyle = (value: number | null) => {
    if (value === null || value === undefined) {
      return {
        text: 'text-gray-400',
        ring: 'ring-white/10',
        bg: 'bg-white/5',
        label: 'text-gray-400',
        badge: 'bg-white/5 border-white/10 text-gray-400',
        badgeText: 'N/A',
      };
    }
    if (value >= 90) {
      return {
        text: 'text-emerald-400',
        ring: 'ring-emerald-400/40',
        bg: 'bg-emerald-400/10',
        label: 'text-emerald-300',
        badge: 'bg-emerald-400/15 border-emerald-400/40 text-emerald-300',
        badgeText: 'Bom',
      };
    }
    if (value >= 50) {
      return {
        text: 'text-amber-400',
        ring: 'ring-amber-400/40',
        bg: 'bg-amber-400/10',
        label: 'text-amber-300',
        badge: 'bg-amber-400/15 border-amber-400/40 text-amber-300',
        badgeText: 'Médio',
      };
    }
    return {
      text: 'text-red-400',
      ring: 'ring-red-400/40',
      bg: 'bg-red-400/10',
      label: 'text-red-300',
      badge: 'bg-red-400/15 border-red-400/40 text-red-300',
      badgeText: 'Crítico',
    };
  };

  function getPsiAlerts() {
    if (!psiData) return [];
    const items = [
      { key: 'performance', label: 'Performance', value: psiData.scores.performance },
      { key: 'accessibility', label: 'Acessibilidade', value: psiData.scores.accessibility },
      { key: 'bestPractices', label: 'Boas práticas', value: psiData.scores.bestPractices },
      { key: 'seo', label: 'SEO', value: psiData.scores.seo },
    ];

    return items
      .filter((i) => i.value !== null && i.value < 90)
      .map((i) => {
        const level = i.value !== null && i.value < 50 ? 'critical' : 'warning';
        const text =
          i.key === 'performance'
            ? 'Site lento reduz conversão e aumenta o custo por lead.'
            : i.key === 'accessibility'
              ? 'Baixa acessibilidade exclui usuários e impacta SEO.'
              : i.key === 'bestPractices'
                ? 'Problemas técnicos diminuem confiança e estabilidade.'
                : 'SEO baixo reduz tráfego orgânico e gera dependência de mídia paga.';
        return { ...i, level, text };
      });
  }

  const normalizeUrl = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) return trimmed;
    return `https://${trimmed}`;
  };

  const isValidWebsiteInput = (rawUrl: string) => {
    const trimmed = rawUrl.trim();
    if (!trimmed) return false;
    if (/\s/.test(trimmed)) return false;
    try {
      const url = new URL(normalizeUrl(trimmed));
      if (!['http:', 'https:'].includes(url.protocol)) return false;
      if (!url.hostname.includes('.')) return false;
      const allowedTlds = new Set([
        'com', 'com.br', 'net', 'org', 'gov.br', 'edu.br', 'io', 'co', 'app',
        'store', 'site', 'online', 'tech', 'ai', 'dev', 'biz', 'info', 'br',
      ]);
      const host = url.hostname.toLowerCase();
      const parts = host.split('.');
      if (parts.length < 2) return false;
      const tld = parts.slice(-2).join('.');
      const tldFallback = parts.slice(-1)[0];
      if (!allowedTlds.has(tld) && !allowedTlds.has(tldFallback)) return false;
      return true;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    if (step !== 'result') return;
    const website = normalizeUrl(formData.website || testSite || '');
    if (!website) return;

    if (isPreview) {
      setPsiData({
        url: website,
        scores: { performance: 72, accessibility: 88, seo: 80, bestPractices: 92 },
        metrics: { lcp: '2.8 s', cls: '0.09', inp: '180 ms', tbt: '210 ms' },
      });
      setPsiStatus('ready');
      return;
    }

    const apiKey = import.meta.env.VITE_PSI_API_KEY as string | undefined;
    if (!apiKey) {
      setPsiStatus('error');
      setPsiError('Configure a chave VITE_PSI_API_KEY para ativar a análise do site.');
      return;
    }

    const run = async () => {
      try {
        setPsiStatus('loading');
        setPsiError(null);

        const params = new URLSearchParams();
        params.set('url', website);
        params.set('strategy', 'mobile');
        params.append('category', 'performance');
        params.append('category', 'accessibility');
        params.append('category', 'best-practices');
        params.append('category', 'seo');
        params.set('key', apiKey);

        const res = await fetch(`https://www.googleapis.com/pagespeedonline/v5/runPagespeed?${params.toString()}`);
        if (!res.ok) {
          let errMessage = `HTTP ${res.status}`;
          try {
            const errJson = await res.json();
            errMessage = errJson?.error?.message || errMessage;
          } catch {
            // ignore parse errors
          }
          throw new Error(errMessage);
        }
        const json = await res.json();

        const lighthouse = json?.lighthouseResult;
        const categories = lighthouse?.categories || {};
        const audits = lighthouse?.audits || {};

        const score = (id: string) =>
          typeof categories?.[id]?.score === 'number' ? Math.round(categories[id].score * 100) : null;

        setPsiData({
          url: website,
          scores: {
            performance: score('performance'),
            accessibility: score('accessibility'),
            seo: score('seo'),
            bestPractices: score('best-practices'),
          },
          metrics: {
            lcp: audits?.['largest-contentful-paint']?.displayValue,
            cls: audits?.['cumulative-layout-shift']?.displayValue,
            inp: audits?.['interaction-to-next-paint']?.displayValue,
            tbt: audits?.['total-blocking-time']?.displayValue,
          },
        });
        setPsiStatus('ready');
      } catch (error: any) {
        const apiMessage =
          error?.message ||
          error?.response?.data?.error?.message ||
          error?.toString?.();
        setPsiStatus('error');
        setPsiError(apiMessage ? `Erro na análise: ${apiMessage}` : 'Não foi possível analisar o site agora. Tente novamente mais tarde.');
      }
    };

    run();
  }, [step, formData.website, isPreview]);

  useEffect(() => {
    if (!isPreview) return;
    const { score, tier } = calculateResult();
    setQualification(tier);
    startScoreAnimation(score);
  }, [isPreview]);

  useEffect(() => {
    if (psiStatus !== 'loading') return;
    const timer = setInterval(() => {
      setLoadingStep((prev) => (prev + 1) % 4);
    }, 900);
    return () => clearInterval(timer);
  }, [psiStatus]);

  return (
    <div className="min-h-screen bg-autoforce-dark text-white font-sans flex flex-col items-center justify-center p-4 md:p-8">
      
      {psiStatus !== 'loading' && (
        <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-20%] left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-autoforce-blue/10 blur-[120px] rounded-full"></div>
        </div>
      )}

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
                <p className="text-[10px] text-gray-500 mt-1 ml-1">Ex: www.suaempresa.com.br</p>
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

      {/* --- ÁREA DO PDF (FORMATO A4 FIXO) --- */}
      {step === 'result' && (
        <div 
          ref={printRef}
          className="relative z-10 w-full max-w-6xl mx-auto animate-slide-up pb-12 p-6 md:p-8 rounded-3xl bg-autoforce-dark"
        >
          {psiStatus === 'loading' ? (
            <div className="min-h-[60vh] flex flex-col items-center justify-center text-center gap-6">
              <div className="w-16 h-16 rounded-full border-2 border-autoforce-blue/30 border-t-autoforce-blue animate-spin"></div>
              <div>
                <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">Analisando seu site</h2>
                <p className="text-gray-400 mt-2">Isso pode levar alguns segundos. Estamos preparando seu diagnóstico.</p>
              </div>
              <div className="w-full max-w-md">
                <div className="h-2 rounded-full bg-white/10 overflow-hidden">
                  <div className="h-full w-1/2 bg-gradient-to-r from-autoforce-blue to-blue-400 animate-pulse"></div>
                </div>
                <div className="mt-4 text-sm text-gray-400">
                  {[
                    'Coletando métricas de performance…',
                    'Validando acessibilidade e boas práticas…',
                    'Analisando SEO e estabilidade visual…',
                    'Montando recomendações personalizadas…',
                  ][loadingStep]}
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-4xl mt-4">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="rounded-2xl bg-white/5 border border-white/10 p-4">
                    <div className="h-3 w-24 bg-white/10 rounded mb-3 animate-pulse"></div>
                    <div className="h-6 w-16 bg-white/10 rounded mb-2 animate-pulse"></div>
                    <div className="h-3 w-full bg-white/10 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
          <>
          <div className="flex justify-between items-center mb-10">
            <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${content.tagColor}`}>
                <CheckCircle2 className="w-3 h-3" /> {content.tag}
              </div>
              <h1 className="text-3xl font-heading font-bold mb-2 text-white">
                Diagnóstico Digital
              </h1>
              <p className="text-gray-400">Empresa: <span className="text-white font-bold">{formData.website || formData.name}</span></p>
            </div>
            
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="no-print flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-wait"
            >
              {isGeneratingPdf ? (
                 <>
                   <Loader2 className="w-4 h-4 animate-spin" /> Gerando...
                 </>
              ) : (
                 <>
                   <Download size={16} /> Baixar PDF
                 </>
              )}
            </button>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4">Resumo executivo</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Principal risco</div>
                <div className="text-sm text-white">{executive.risk}</div>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Impacto</div>
                <div className="text-sm text-white">{executive.impact}</div>
              </div>
              <div className="rounded-xl bg-black/20 border border-white/10 p-4">
                <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Ação urgente</div>
                <div className="text-sm text-white">{executive.action}</div>
              </div>
            </div>
          </div>

          {confirmedAnswers.length > 0 && (
            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <h3 className="text-lg font-bold text-white">Resumo das suas respostas</h3>
                <span className="text-xs uppercase tracking-widest text-gray-400">
                  {confirmedAnswers.length} pontos confirmados
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {confirmedAnswers.map((item) => (
                  <span
                    key={item.label}
                    className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white"
                  >
                    <span className="text-gray-400 uppercase tracking-widest">{item.label}:</span>
                    <span className="font-semibold">{item.value}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          <div className="mb-8">
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h3 className="text-lg font-bold text-white">Análise do site</h3>
                  <p className="text-sm text-gray-400">Resultados técnicos baseados no site informado.</p>
                </div>
                {psiStatus === 'loading' && (
                  <div className="flex items-center gap-2 text-sm text-gray-400">
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Analisando...
                  </div>
                )}
              </div>

              {psiStatus === 'error' && (
                <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
                  <div className="font-semibold text-red-300">Não conseguimos acessar esse site.</div>
                  <div className="mt-1 text-red-200/80">
                    Confira o link digitado (ex.: www.suaempresa.com.br) e tente novamente.
                  </div>
                  {psiError && <div className="mt-2 text-xs text-red-300/80">{psiError}</div>}
                  <button
                    onClick={() => setStep('locked')}
                    className="mt-3 inline-flex items-center gap-2 rounded-lg border border-red-400/30 bg-red-400/10 px-3 py-2 text-xs font-semibold text-red-200 hover:bg-red-400/20 transition-colors"
                  >
                    Corrigir site informado
                  </button>
                </div>
              )}

              {psiStatus === 'ready' && psiData && (
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  {[
                    { label: 'Score Digital', value: Math.round(score) },
                    { label: 'Performance', value: psiData.scores.performance },
                    { label: 'Acessibilidade', value: psiData.scores.accessibility },
                    { label: 'Boas práticas', value: psiData.scores.bestPractices },
                    { label: 'SEO', value: psiData.scores.seo },
                  ].map((item) => (
                    <div key={item.label} className="rounded-2xl bg-black/20 border border-white/10 p-4 text-center">
                      <div className="text-xs uppercase tracking-widest text-gray-400">{item.label}</div>
                      <div
                        className={`mt-3 mx-auto w-20 h-20 rounded-full ring-2 ${getScoreStyle(item.value).ring} ${getScoreStyle(item.value).bg} flex items-center justify-center`}
                      >
                        <div className={`text-2xl font-black tabular-nums ${getScoreStyle(item.value).text}`}>
                          {item.value ?? '-'}
                        </div>
                      </div>
                      <div
                        className={`mt-3 inline-flex items-center px-2 py-0.5 rounded-full border text-[10px] uppercase tracking-widest ${getScoreStyle(item.value).badge}`}
                      >
                        {getScoreStyle(item.value).badgeText}
                      </div>
                    </div>
                  ))}

                  <div className="md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
                    <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                      <div className="text-sm text-gray-400">Tempo até o maior elemento visível carregar:</div>
                      <div className="text-lg font-semibold text-white mt-1">{psiData.metrics.lcp || '-'}</div>
                    </div>
                    <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                      <div className="text-sm text-gray-400">Estabilidade visual da página (saltos de layout):</div>
                      <div className="text-lg font-semibold text-white mt-1">{psiData.metrics.cls || '-'}</div>
                    </div>
                    <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                      <div className="text-sm text-gray-400">Tempo de resposta às interações do usuário:</div>
                      <div className="text-lg font-semibold text-white mt-1">{psiData.metrics.inp || '-'}</div>
                    </div>
                    <div className="rounded-xl bg-black/20 border border-white/10 p-3">
                      <div className="text-sm text-gray-400">Tempo total em que a página fica bloqueada:</div>
                      <div className="text-lg font-semibold text-white mt-1">{psiData.metrics.tbt || '-'}</div>
                    </div>
                  </div>

                  {[
                    { label: 'Performance', value: psiData.scores.performance },
                    { label: 'Acessibilidade', value: psiData.scores.accessibility },
                    { label: 'Boas práticas', value: psiData.scores.bestPractices },
                    { label: 'SEO', value: psiData.scores.seo },
                  ].some((item) => item.value !== null && item.value < 50) && (
                    <div className="md:col-span-4 mt-4 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                      <div className="flex items-start gap-3">
                        <AlertTriangle className="w-5 h-5 text-red-400 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-sm font-bold text-red-300">Atenção: pontos críticos detectados</div>
                          <p className="text-sm text-red-200/80 mt-1">
                            Scores abaixo de 50 indicam problemas sérios que afetam conversão e mídia. Vale priorizar
                            correções técnicas imediatamente.
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {psiStatus === 'ready' && psiData && psiAlerts.length > 0 && (
                <div className="mt-6 rounded-2xl border border-red-500/30 bg-red-500/10 p-4">
                  <div className="flex items-center gap-2 text-sm font-bold text-red-300 mb-3">
                    <AlertTriangle className="w-4 h-4 animate-pulse" />
                    Atenção imediata no site
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {psiAlerts.map((alert) => (
                      <div key={alert.label} className="rounded-xl bg-black/20 border border-white/10 p-3">
                        <div className="flex items-center justify-between">
                          <div className="text-sm font-semibold text-white">{alert.label}</div>
                          <span
                            className={`text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full border ${
                              alert.level === 'critical'
                                ? 'bg-red-400/15 border-red-400/40 text-red-300'
                                : 'bg-amber-400/15 border-amber-400/40 text-amber-300'
                            }`}
                          >
                            {alert.level === 'critical' ? 'Crítico' : 'Atenção'}
                          </span>
                        </div>
                        <p className="text-xs text-gray-300 mt-2">{alert.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 mb-8">
            <div className="rounded-2xl border border-red-500/30 bg-gradient-to-br from-red-500/10 via-transparent to-transparent p-6">
              <div className="flex items-center justify-between gap-4 mb-4">
                <span className="text-gray-200 text-xs font-bold uppercase tracking-widest">
                  <AlertTriangle className="inline w-3 h-3 mr-1 mb-0.5 text-red-400" /> Riscos e oportunidades identificados
                </span>
                <span className="text-[11px] uppercase tracking-widest text-red-300">
                  {priorities.length + insights.length} pontos críticos
                </span>
              </div>
              <div className="divide-y divide-red-500/20">
                {priorities.map((item, index) => (
                  <div key={index} className="flex items-start gap-3 py-3">
                    <div className="bg-red-500/15 text-red-300 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0">
                      {index + 1}
                    </div>
                    <div>
                      <div className="text-sm text-gray-200">{item}</div>
                      <div className="text-xs text-gray-400 mt-1">{getPriorityImpact(item)}</div>
                    </div>
                  </div>
                ))}
              </div>
              {insights.length > 0 && (
                <div className="mt-4 pt-4 border-t border-red-500/20 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {insights.map((insight, index) => (
                    <div key={`${insight.title}-${index}`} className="rounded-xl bg-black/20 border border-white/10 p-3">
                      <div className="flex items-start gap-2">
                        {insight.type === 'risk' ? (
                          <AlertTriangle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-4 h-4 text-autoforce-blue mt-0.5 shrink-0" />
                        )}
                        <div>
                          <div className="text-sm font-semibold text-white">{insight.title}</div>
                          <p className="text-xs text-gray-400 mt-1">{insight.text}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Plano de ação em 3 passos</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {actionPlan.map((step, index) => (
                <div key={index} className="rounded-xl bg-black/20 border border-white/10 p-4">
                  <div className="text-xs uppercase tracking-widest text-gray-400 mb-2">Passo {index + 1}</div>
                  <div className="text-sm text-white">{step}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-3xl p-8">
              <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-gray-400" /> Auditoria Técnica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {checklist.map((check, i) => (
                  <div key={i} className="flex items-center justify-between p-3 border border-white/5 rounded-xl">
                    <span className="text-sm text-gray-300">{check.item}</span>
                    {check.status ? (
                      <CheckCircle className="text-green-500 w-5 h-5" />
                    ) : (
                      <XCircle className="text-red-500 w-5 h-5" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8">
              <div className="grid grid-cols-1 gap-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    <Clock size={14} /> Tempo resposta
                  </div>
                  <div className="text-2xl font-bold text-white tabular-nums">
                    {answers.tempo_resposta || '-'}
                  </div>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    <DollarSign size={14} /> Investimento
                  </div>
                  <div className="text-2xl font-bold text-white tabular-nums">
                    {answers.investimento_ads || '-'}
                  </div>
                </div>
                <div className="h-px bg-white/5"></div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[11px] font-bold tracking-widest text-gray-400 uppercase">
                    <TrendingUp size={14} /> Volume
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-white tabular-nums">{answers.vendas_mes || '-'}</div>
                    <div className="text-xs text-gray-500">vendas/mês</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {(() => {
            const cta = getCtaCopy();
            return (
          <div className="w-full bg-gradient-to-r from-autoforce-blue/20 to-transparent border border-autoforce-blue/30 rounded-2xl p-8 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left shadow-[0_0_40px_rgba(20,64,255,0.1)]">
            <div className="flex-1">
              <h3 className="text-2xl font-heading font-bold text-white mb-2">
                Próximo Passo Recomendado
              </h3>
              <p className="text-gray-200 max-w-xl font-semibold mb-2">
                {ctaHook}
              </p>
              <p className="text-gray-300 max-w-xl">
                {content.msg}
              </p>
              <p className="text-xs text-gray-400 mt-3">+300 operações já aplicaram esse plano</p>
            </div>

            <button 
              onClick={() => window.open(content.ctaLink, '_blank')}
              className={`px-8 py-4 rounded-xl font-bold transition-all shadow-lg flex flex-col items-center justify-center min-w-[280px] group ${content.buttonStyle}`}
            >
              <div className="flex items-center gap-2 text-lg">
                <content.ctaIcon className="w-5 h-5" />
                <span>{cta.title}</span>
              </div>
              <span className="text-xs opacity-80 font-normal mt-1">{cta.sub}</span>
            </button>
          </div>
            );
          })()}

          <button onClick={() => navigate('/')} className="no-print mt-12 text-gray-500 hover:text-white flex items-center mx-auto text-sm transition-colors">
            <RefreshCw className="w-4 h-4 mr-2" /> Refazer Diagnóstico
          </button>
          </>
          )}
        </div>
      )}
    </div>
  );
}

export default Resultado;
