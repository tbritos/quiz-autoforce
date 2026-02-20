import { useState, useRef, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { 
  Zap, RefreshCw, Lock, ArrowRight, User, Mail, Phone, 
  Building2, Briefcase, Globe, 
  CheckCircle2,
  Download, Bot, Loader2
} from 'lucide-react';

function Resultado() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const isPreview = searchParams.get('preview') === '1';
  const testSite = searchParams.get('testsite');
  const previewAnswers = {
    site_cliente: 'https://site.autoforce.com/',
    ticket_medio: '100000',
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
  const [serpStatus, setSerpStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const [serpError, setSerpError] = useState<string | null>(null);
  const [serpKeywords, setSerpKeywords] = useState<Array<{
    keyword: string;
    source?: string;
    position?: number | null;
  }>>([]);
  const [loadingStep, setLoadingStep] = useState(0);
  void psiError;
  void serpStatus;
  void serpError;
  void serpKeywords;
  
  const [formData, setFormData] = useState({ 
    name: isPreview ? 'Teste Preview' : '',
    role: isPreview ? 'Diretor' : '',
    phone: isPreview ? '(11) 99999-9999' : '',
    email: isPreview ? 'teste@empresa.com.br' : '',
    cnpj: isPreview ? '12.345.678/0001-90' : '',
    website: isPreview ? 'https://site.autoforce.com/' : testSite || answers.site_cliente || '',
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
      ctaTitle: "Falar com Especialista AutoForce",
      ctaSub: "Plano estratégico em uma conversa",
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
  const insights = getInsights();
  const psiAlerts = getPsiAlerts();
  const executive = getExecutiveSummary();
  void getChecklist;
  void getActionPlan;
  void getPriorityImpact;
  void priorities;
  void insights;
  void psiAlerts;
  void executive;
  const labelMaps: Record<string, Record<string, string>> = {
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
  };

  const getLabel = (map: Record<string, string>, key: string | undefined) =>
    key ? map[key] || key : '';

  const listFromMulti = (values: string[], map: Record<string, string>) =>
    values.map((v) => map[v] || v).filter(Boolean).join(', ');

  const confirmedAnswers = [
    { label: 'Estrutura', value: getLabel(labelMaps.estrutura, answers.estrutura) },
    { label: 'Site', value: answers.site_cliente || '' },
    { label: 'Lojas', value: getLabel(labelMaps.lojas, answers.lojas) },
    { label: 'Vendas/mês', value: getLabel(labelMaps.vendas_mes, answers.vendas_mes) },
    { label: 'Estoque', value: getLabel(labelMaps.estoque, answers.estoque) },
    { label: 'Equipe', value: getLabel(labelMaps.equipe, answers.equipe) },
    { label: 'Origem', value: listFromMulti(answers.origem || [], labelMaps.origem) },
    { label: 'Anúncios pagos', value: getLabel(labelMaps.ads_flow, answers.ads_flow) },
    { label: 'Investimento', value: getLabel(labelMaps.investimento_ads, answers.investimento_ads) },
    { label: 'Marketing', value: getLabel(labelMaps.estrutura_mkt, answers.estrutura_mkt) },
    { label: 'CRM', value: getLabel(labelMaps.crm, answers.crm) },
    { label: 'Tempo resposta', value: getLabel(labelMaps.tempo_resposta, answers.tempo_resposta) },
    { label: 'Cenário', value: getLabel(labelMaps.cenario, answers.cenario) },
    { label: 'Fricção', value: getLabel(labelMaps.friccao, answers.friccao) },
    { label: 'Métricas', value: listFromMulti(answers.metricas || [], labelMaps.metricas) },
    { label: 'Prazo', value: getLabel(labelMaps.prazo, answers.prazo) },
    { label: 'Marcas', value: selectedBrands.length ? selectedBrands.join(', ') : '' },
  ].filter((item) => item.value);
  void confirmedAnswers;
  void score;

  const maturityOrder = ['BASICO', 'MEDIO', 'AVANCADO', 'CHAMPION'] as const;
  const maturityData: Record<(typeof maturityOrder)[number], { rate: number; description: string }> = {
    BASICO: {
      rate: 1.5,
      description: 'Equipe sem processo estruturado, CRM inconsistente e atendimento reativo.',
    },
    MEDIO: {
      rate: 3.75,
      description: 'Processo comercial basico com uso parcial de CRM e sem SLA definido.',
    },
    AVANCADO: {
      rate: 5.0,
      description: '',
    },
    CHAMPION: {
      rate: 6.25,
      description: 'Operacao com automacoes, SLA agressivo, CRM em tempo real e alta previsibilidade.',
    },
  };

  const pageSpeedBands = [
    {
      min: 0,
      max: 39,
      label: '0-39',
      speed: 'Muito lento',
      impact: 'Alta taxa de rejeicao, experiencia ruim.',
      userToLeadRate: 0.01,
    },
    {
      min: 40,
      max: 49,
      label: '40-49',
      speed: 'Lento',
      impact: 'Frustracao do usuario, menor engajamento.',
      userToLeadRate: 0.02,
    },
    {
      min: 50,
      max: 70,
      label: '50-70',
      speed: 'Mediano',
      impact: 'Experiencia aceitavel, mas ainda ha atrito.',
      userToLeadRate: 0.0325,
    },
    {
      min: 71,
      max: 89,
      label: '71-89',
      speed: 'Rapido',
      impact: 'Boa experiencia, pouca friccao.',
      userToLeadRate: 0.05,
    },
    {
      min: 90,
      max: 100,
      label: '90-100',
      speed: 'Muito rapido',
      impact: 'Experiencia fluida, maxima conversao.',
      userToLeadRate: 0.09,
    },
  ] as const;

  const toMoney = (value: number) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 });

  const toPct = (value: number) =>
    `${(value * 100).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%`;

  const parseInvestment = (range?: string) => {
    switch (range) {
      case 'ate-3k': return 3000;
      case '3-10k': return 6500;
      case '10-30k': return 20000;
      case '30-70k': return 50000;
      case '70k+': return 80000;
      default: return 10000;
    }
  };

  const estimateTrafficFromContext = () => {
    const base = parseInvestment(answers.investimento_ads);
    let users = Math.round(base * 1.2);
    const origem = answers.origem || [];
    if (origem.includes('ads')) users = Math.round(users * 1.2);
    if (origem.includes('organic')) users = Math.round(users * 1.1);
    if (origem.includes('portals')) users = Math.round(users * 1.15);
    if (answers.lojas === '4-7') users = Math.round(users * 1.2);
    if (answers.lojas === '8+') users = Math.round(users * 1.35);
    return Math.max(4000, users);
  };

  const parseTicketFromAnswer = (rawValue: any) => {
    const text = String(rawValue || '').trim();
    if (!text) return null;
    const digits = text.replace(/[^\d]/g, '');
    if (!digits) return null;
    const numeric = Number(digits);
    if (!Number.isFinite(numeric) || numeric <= 0) return null;
    return numeric;
  };

  const estimateTicket = () => {
    if (answers.estrutura === 'multimarcas') return 100000;
    if (answers.estrutura === 'concessionaria') return 160000;
    if (answers.estrutura === 'grupo') return 140000;
    return 120000;
  };

  const getPageSpeedBand = (perfScore: number | null) => {
    const safe = perfScore === null ? 45 : Math.max(0, Math.min(100, perfScore));
    return pageSpeedBands.find((b) => safe >= b.min && safe <= b.max) || pageSpeedBands[1];
  };

  const conversionBySpeed = (perfScore: number | null) => getPageSpeedBand(perfScore).userToLeadRate;

  const getCurrentMaturity = (): (typeof maturityOrder)[number] => {
    let points = 0;
    if (answers.crm === 'crm-avancado') points += 2;
    else if (answers.crm === 'crm-basico') points += 1;
    if (answers.tempo_resposta === '5min') points += 2;
    else if (answers.tempo_resposta === '30min') points += 1;
    if (answers.estrutura_mkt === 'hibrido' || answers.estrutura_mkt === 'interno') points += 1;
    if (answers.cenario === 'previsivel') points += 1;
    if (answers.cenario === 'abaixo' || answers.cenario === 'sem-dados') points -= 1;
    if (points <= 1) return 'BASICO';
    if (points <= 3) return 'MEDIO';
    if (points <= 5) return 'AVANCADO';
    return 'CHAMPION';
  };

  const nextMaturity = (current: (typeof maturityOrder)[number], tier: 'HOT' | 'WARM') => {
    const idx = maturityOrder.indexOf(current);
    const jump = tier === 'HOT' ? 2 : 1;
    return maturityOrder[Math.min(maturityOrder.length - 1, idx + jump)];
  };

  const comparisonModel = (() => {
    const visitsCurrent = estimateTrafficFromContext();
    const ticket = parseTicketFromAnswer(answers.ticket_medio) ?? estimateTicket();
    const invested = parseInvestment(answers.investimento_ads);

    const currentPerf = psiData?.scores.performance ?? 45;
    const autoforcePerf = 90;

    const currentVisitToLead = conversionBySpeed(currentPerf);
    const autoforceVisitToLead = Math.min(0.09, Math.max(conversionBySpeed(autoforcePerf), currentVisitToLead * 1.5));
    const currentSpeedBand = getPageSpeedBand(currentPerf);
    const futureSpeedBand = getPageSpeedBand(autoforcePerf);

    const currentLevel = getCurrentMaturity();
    const targetLevel = nextMaturity(currentLevel, qualification);
    const currentLeadToSale = maturityData[currentLevel].rate / 100;
    const autoforceLeadToSale = maturityData[targetLevel].rate / 100;

    const visitsFuture = Math.round(visitsCurrent * (autoforcePerf >= 90 ? 1.6 : 1.35));
    const leadsCurrent = Math.round(visitsCurrent * currentVisitToLead);
    const leadsFuture = Math.round(visitsFuture * autoforceVisitToLead);
    const salesCurrent = Math.max(1, Math.round(leadsCurrent * currentLeadToSale));
    const salesFuture = Math.max(salesCurrent + 1, Math.round(leadsFuture * autoforceLeadToSale));

    const revenueCurrent = salesCurrent * ticket;
    const revenueFuture = salesFuture * ticket;
    const costCurrent = invested + 1450;
    const costFuture = invested + 997;

    return {
      current: {
        level: currentLevel,
        levelRate: currentLeadToSale,
        speed: currentPerf,
        speedBand: currentSpeedBand,
        visitToLead: currentVisitToLead,
        visits: visitsCurrent,
        leads: leadsCurrent,
        sales: salesCurrent,
        ticket,
        revenue: revenueCurrent,
        cost: costCurrent,
        roas: revenueCurrent / Math.max(invested, 1),
      },
      future: {
        level: targetLevel,
        levelRate: autoforceLeadToSale,
        speed: autoforcePerf,
        speedBand: futureSpeedBand,
        visitToLead: autoforceVisitToLead,
        visits: visitsFuture,
        leads: leadsFuture,
        sales: salesFuture,
        ticket,
        revenue: revenueFuture,
        cost: costFuture,
        roas: revenueFuture / Math.max(invested, 1),
      },
      gain: {
        leads: leadsFuture - leadsCurrent,
        sales: salesFuture - salesCurrent,
        revenue: revenueFuture - revenueCurrent,
        cost: costCurrent - costFuture,
      },
    };
  })();

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
  void getScoreStyle;

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

  const getDomainFromWebsite = (rawUrl: string) => {
    try {
      const normalized = normalizeUrl(rawUrl);
      if (!normalized) return '';
      const url = new URL(normalized);
      return url.hostname.replace(/^www\./i, '').toLowerCase();
    } catch {
      return '';
    }
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

  const currentDomain = getDomainFromWebsite(formData.website || testSite || answers.site_cliente || '') || 'seusite.com.br';
  const roasLift = comparisonModel.future.roas / Math.max(comparisonModel.current.roas, 0.01);
  const monthlyRevenueGain = Math.max(0, comparisonModel.gain.revenue);
  const yearlyRevenueGain = monthlyRevenueGain * 12;
  const psiSummary = [
    { key: 'performance', label: 'Performance', value: psiData?.scores.performance ?? comparisonModel.current.speed },
    { key: 'seo', label: 'SEO', value: psiData?.scores.seo ?? null },
    { key: 'accessibility', label: 'Acessibilidade', value: psiData?.scores.accessibility ?? null },
    { key: 'bestPractices', label: 'Boas praticas', value: psiData?.scores.bestPractices ?? null },
  ];

  const getPsiBadgeStyle = (value: number | null) => {
    if (value === null || value === undefined) {
      return {
        ring: 'border-slate-300',
        bg: 'bg-slate-100',
        text: 'text-slate-400',
      };
    }
    if (value >= 90) {
      return {
        ring: 'border-emerald-500',
        bg: 'bg-emerald-50',
        text: 'text-emerald-600',
      };
    }
    if (value >= 50) {
      return {
        ring: 'border-amber-500',
        bg: 'bg-amber-50',
        text: 'text-amber-600',
      };
    }
    return {
      ring: 'border-rose-500',
      bg: 'bg-rose-50',
      text: 'text-rose-600',
    };
  };
  const currentSpeedStyle = getPsiBadgeStyle(comparisonModel.current.speed);
  const futureSpeedStyle = getPsiBadgeStyle(comparisonModel.future.speed);
  const comparisonRows = [
    {
      label: 'Visitas mensais',
      current: comparisonModel.current.visits.toLocaleString('pt-BR'),
      future: comparisonModel.future.visits.toLocaleString('pt-BR'),
    },
    {
      label: 'PageSpeed',
      current: String(comparisonModel.current.speed),
      future: String(comparisonModel.future.speed),
    },
    {
      label: 'Conversão (visitas para leads)',
      current: toPct(comparisonModel.current.visitToLead),
      future: toPct(comparisonModel.future.visitToLead),
    },
    {
      label: 'Leads',
      current: comparisonModel.current.leads.toLocaleString('pt-BR'),
      future: comparisonModel.future.leads.toLocaleString('pt-BR'),
    },
    {
      label: 'Maturidade comercial',
      current: comparisonModel.current.level,
      future: comparisonModel.future.level,
    },
    {
      label: 'Conversão (leads para vendas)',
      current: toPct(comparisonModel.current.levelRate),
      future: toPct(comparisonModel.future.levelRate),
    },
    {
      label: 'Vendas',
      current: comparisonModel.current.sales.toLocaleString('pt-BR'),
      future: comparisonModel.future.sales.toLocaleString('pt-BR'),
    },
    {
      label: 'Ticket médio',
      current: toMoney(comparisonModel.current.ticket),
      future: toMoney(comparisonModel.future.ticket),
    },
    {
      label: 'Faturamento',
      current: toMoney(comparisonModel.current.revenue),
      future: toMoney(comparisonModel.future.revenue),
    },
  ];

  useEffect(() => {
    if (step !== 'result') return;
    const website = isPreview
      ? 'https://site.autoforce.com/'
      : normalizeUrl(formData.website || testSite || '');
    if (!website) return;

    const apiKey = import.meta.env.VITE_PSI_API_KEY as string | undefined;
    if (!apiKey && !isPreview) {
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
        if (apiKey) {
          params.set('key', apiKey);
        }

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
  }, [step, formData.website, testSite, isPreview]);

  useEffect(() => {
    if (step !== 'result') return;

    const domain = getDomainFromWebsite(
      isPreview ? 'https://site.autoforce.com/' : (formData.website || testSite || '')
    );
    if (!domain) return;

    const run = async () => {
      try {
        setSerpStatus('loading');
        setSerpError(null);

        const res = await fetch(`/api/serp-keywords?domain=${encodeURIComponent(domain)}`);
        const json = await res.json();
        if (!res.ok) {
          throw new Error(json?.error || `HTTP ${res.status}`);
        }

        const rows = (json?.keywords || []).map((item: any) => ({
          keyword: item.keyword,
          source: item.source || null,
          position: typeof item.position === 'number' ? item.position : null,
        }));

        setSerpKeywords(rows.slice(0, 12));
        setSerpStatus('ready');
      } catch (error: any) {
        const apiMessage = error?.message || error?.toString?.();
        setSerpStatus('error');
        setSerpError(apiMessage ? `Erro SerpApi: ${apiMessage}` : 'Nao foi possivel consultar dados da SerpApi.');
      }
    };

    run();
  }, [step, formData.website, testSite, isPreview]);

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
          <div className="mb-8 rounded-3xl border border-white/10 bg-gradient-to-br from-autoforce-blue/20 via-autoforce-dark to-autoforce-dark p-6 md:p-8">
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-6">
              <div>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 ${content.tagColor}`}>
                <CheckCircle2 className="w-3 h-3" /> {content.tag}
              </div>
              <h1 className="text-2xl md:text-4xl font-heading font-bold mb-2 text-white">
                Diagnóstico Digital
              </h1>
              <p className="text-gray-300">Empresa analisada: <span className="text-white font-semibold">{formData.website || formData.name}</span></p>
              </div>
            
            <button 
              onClick={handleDownloadPDF}
              disabled={isGeneratingPdf}
              className="no-print inline-flex items-center justify-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-3 rounded-xl text-sm font-bold transition-colors disabled:opacity-50 disabled:cursor-wait"
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
          </div>




          <div className="mb-8 rounded-3xl border border-white/10 bg-[#e7eaf7] text-[#0f172a] p-4 md:p-6 shadow-[0_24px_70px_rgba(2,6,23,0.35)]">
            <div className="mb-5">
              <h2 className="text-2xl md:text-4xl font-heading font-bold text-center text-[#0f2a9b]">
                Comparativo de performance com AutoForce
              </h2>
            </div>

            <div className="mb-3 grid grid-cols-1 md:grid-cols-2 gap-3 items-stretch">
              <div className="rounded-xl border border-slate-300 bg-white p-4 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(23,49,207,0.15)]">
                <p className="text-xs uppercase tracking-wider text-slate-500">Média de visitas por mês</p>
                <p className="mt-1 text-3xl font-bold text-[#1731cf]">{comparisonModel.current.visits.toLocaleString('pt-BR')}</p>
                <p className="text-sm text-slate-600 mt-1">Analisamos seu site e identificamos esta média de visitas por mês.</p>
              </div>
              <div className="rounded-xl border border-slate-300 bg-white p-4 h-full transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(23,49,207,0.15)]">
                <p className="text-xs uppercase tracking-wider text-amber-700">Maturidade comercial atual</p>
                <p className="mt-1 text-2xl font-bold text-amber-800">{comparisonModel.current.level}</p>
                <p className="text-sm text-amber-700 mt-1">Nível estimado a partir das respostas do diagnóstico.</p>
                <p className="text-sm font-semibold text-amber-800 mt-2">
                  Conversão média deste nível: {toPct(maturityData[comparisonModel.current.level].rate / 100)}.
                  Em média, a cada 100 leads, {Math.round(maturityData[comparisonModel.current.level].rate)} viram vendas.
                </p>
                {maturityData[comparisonModel.current.level].description ? (
                  <p className="text-sm text-amber-700 mt-1">{maturityData[comparisonModel.current.level].description}</p>
                ) : null}
              </div>
            </div>

            <div className="mb-3 rounded-xl border border-slate-300 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(23,49,207,0.15)]">
              <p className="text-xs uppercase tracking-wider text-slate-500">PageSpeed do seu site</p>
              <div className="mt-2 grid grid-cols-2 md:grid-cols-4 gap-3">
                {psiSummary.map((item) => {
                  const style = getPsiBadgeStyle(item.value);
                  return (
                    <div key={item.key} className="flex flex-col items-center justify-center rounded-lg border border-slate-200 bg-slate-50 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_24px_rgba(23,49,207,0.12)]">
                      <div className={`h-14 w-14 rounded-full border-4 ${style.ring} ${style.bg} flex items-center justify-center text-base font-bold ${style.text}`}>
                        {item.value ?? '--'}
                      </div>
                      <span className="text-xs text-slate-700 mt-2 text-center">{item.label}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mb-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-300 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(23,49,207,0.15)]">
                <p className="text-xs uppercase tracking-wider text-slate-500">Velocidade e impacto</p>
                <p className="text-sm text-slate-700 mt-1">
                  Analisando a performance do seu site, identificamos velocidade <span className="font-semibold">{comparisonModel.current.speedBand.speed}</span> (faixa {comparisonModel.current.speedBand.label}).
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Impacto: <span className="font-semibold">{comparisonModel.current.speedBand.impact}</span>
                </p>
              </div>
              <div className="rounded-xl border border-slate-300 bg-white p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_36px_rgba(23,49,207,0.15)]">
                <p className="text-xs uppercase tracking-wider text-slate-500">Taxa média por performance</p>
                <p className="text-sm text-slate-700 mt-1">
                  Com esse PageSpeed, a conversão média estimada (visitas para leads) é de <span className="font-semibold">{toPct(comparisonModel.current.visitToLead)}</span>.
                </p>
                <p className="text-sm text-slate-700 mt-1">
                  Em média, a cada 100 visitas, <span className="font-semibold">{Math.round(comparisonModel.current.visitToLead * 100)}</span> viram leads.
                </p>
              </div>
            </div>

            <div className="md:hidden space-y-3">
              {comparisonRows.map((row) => (
                <div key={row.label} className="rounded-2xl bg-white p-4 shadow-sm">
                  <div className="text-sm font-semibold text-slate-700 leading-snug break-words">{row.label}</div>
                  <div className="mt-3 grid grid-cols-2 gap-3">
                    <div className="rounded-xl bg-slate-50 px-3 py-3">
                      <div className="text-[10px] uppercase tracking-wide text-slate-500 truncate">{currentDomain}</div>
                      <div className="mt-1 text-[15px] font-semibold text-slate-800 tabular-nums break-words">{row.current}</div>
                    </div>
                    <div className="rounded-xl bg-[#edf2ff] px-3 py-3">
                      <div className="text-[10px] uppercase tracking-wide text-[#3450c7]">AutoForce</div>
                      <div className="mt-1 text-[15px] font-bold text-[#1731cf] tabular-nums break-words">{row.future}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="hidden md:block overflow-x-auto rounded-3xl border border-[#b9c7ff] bg-gradient-to-b from-white to-[#f5f8ff] shadow-[0_18px_38px_rgba(23,49,207,0.14)] ring-1 ring-inset ring-white/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_26px_52px_rgba(23,49,207,0.22)]">
              <table className="w-full min-w-[700px] text-[15px]">
                <thead>
                  <tr>
                    <th className="rounded-tl-2xl p-4 text-left text-white bg-[#1731cf] text-xs uppercase tracking-[0.12em]">Métricas</th>
                    <th className="p-4 text-center text-white bg-[#3d5eff] text-xs uppercase tracking-[0.12em] border-l border-blue-300/40">
                      <div className="font-bold">{currentDomain}</div>
                    </th>
                    <th className="rounded-tr-2xl p-4 text-center text-white bg-[#1452ff] text-xs uppercase tracking-[0.12em] border-l border-blue-300/40">
                      <div className="font-bold">Seu site com AutoForce</div>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">Visitas mensais</td>
                    <td className="p-4 text-center font-semibold text-slate-800 tabular-nums">{comparisonModel.current.visits.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff] font-bold text-[#1731cf] tabular-nums">{comparisonModel.future.visits.toLocaleString('pt-BR')}</td>
                  </tr>

                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">PageSpeed</td>
                    <td className="p-4 text-center">
                      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 font-bold ${currentSpeedStyle.ring} ${currentSpeedStyle.bg} ${currentSpeedStyle.text}`}>{comparisonModel.current.speed}</div>
                    </td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff]">
                      <div className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full border-4 font-bold ${futureSpeedStyle.ring} ${futureSpeedStyle.bg} ${futureSpeedStyle.text}`}>{comparisonModel.future.speed}</div>
                    </td>
                  </tr>

                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">Conversão (visitas para leads)</td>
                    <td className="p-4 text-center font-semibold text-slate-800 tabular-nums">{toPct(comparisonModel.current.visitToLead)}</td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff] font-bold text-[#1731cf] tabular-nums">{toPct(comparisonModel.future.visitToLead)}</td>
                  </tr>

                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">Leads</td>
                    <td className="p-4 text-center font-semibold text-slate-800 tabular-nums">{comparisonModel.current.leads.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff] font-bold text-[#1731cf] tabular-nums">{comparisonModel.future.leads.toLocaleString('pt-BR')}</td>
                  </tr>

                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">Maturidade comercial</td>
                    <td className="p-4 text-center font-semibold text-slate-800">{comparisonModel.current.level}</td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff] font-bold text-[#1731cf]">{comparisonModel.future.level}</td>
                  </tr>

                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">Conversão (leads para vendas)</td>
                    <td className="p-4 text-center font-semibold text-slate-800 tabular-nums">{toPct(comparisonModel.current.levelRate)}</td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff] font-bold text-[#1731cf] tabular-nums">{toPct(comparisonModel.future.levelRate)}</td>
                  </tr>

                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">Vendas</td>
                    <td className="p-4 text-center font-semibold text-slate-800 tabular-nums">{comparisonModel.current.sales.toLocaleString('pt-BR')}</td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff] font-bold text-[#1731cf] tabular-nums">{comparisonModel.future.sales.toLocaleString('pt-BR')}</td>
                  </tr>

                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">Ticket médio</td>
                    <td className="p-4 text-center font-semibold text-slate-800 tabular-nums">{toMoney(comparisonModel.current.ticket)}</td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff] font-bold text-[#1731cf] tabular-nums">{toMoney(comparisonModel.future.ticket)}</td>
                  </tr>

                  <tr className="group border-t border-slate-200/70 odd:bg-white even:bg-[#f7f9ff] hover:bg-[#eef3ff] transition-colors">
                    <td className="p-4 font-semibold text-slate-700 whitespace-nowrap">Faturamento</td>
                    <td className="p-4 text-center font-semibold text-slate-800 tabular-nums">{toMoney(comparisonModel.current.revenue)}</td>
                    <td className="p-4 text-center bg-[#e8efff]/90 border-l border-[#cfdbff] font-bold text-[#1731cf] tabular-nums">{toMoney(comparisonModel.future.revenue)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-6 flex justify-center">
              <button
                onClick={() => window.open(content.ctaLink, '_blank')}
                className="group relative overflow-hidden w-full max-w-xl rounded-2xl bg-gradient-to-r from-[#2f5dff] to-[#1a8bff] text-white py-5 px-6 font-bold text-lg shadow-[0_18px_38px_rgba(45,91,255,0.5)] hover:from-[#4b74ff] hover:to-[#3ba0ff] transition-all duration-300 hover:scale-[1.01] hover:shadow-[0_24px_50px_rgba(45,91,255,0.62)] flex items-center justify-center gap-2"
              >
                <span className="pointer-events-none absolute inset-y-0 left-[-30%] w-[30%] -skew-x-12 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-button-sheen" aria-hidden="true" />
                <content.ctaIcon className="relative w-5 h-5 transition-transform duration-300 group-hover:translate-x-0.5" />
                <span className="relative">{content.ctaTitle}</span>
              </button>
            </div>

            <div className="mt-4 mb-3 rounded-2xl border border-emerald-300/60 bg-emerald-50 p-4 text-center">
              <p className="text-xs uppercase tracking-widest text-emerald-700 font-semibold">Potencial de ganho com AutoForce</p>
              <p className="mt-1 text-lg md:text-2xl font-bold text-emerald-700">
                +{toMoney(monthlyRevenueGain)} por mês
              </p>
              <p className="text-sm text-emerald-800">
                Projeção anual: <span className="font-bold">{toMoney(yearlyRevenueGain)}</span> em faturamento adicional.
              </p>
            </div>

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
              <div className="rounded-xl bg-white border border-slate-300 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(23,49,207,0.12)]">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Ganho de leads/mês</p>
                <p className="text-2xl font-bold text-[#1731cf]">+{comparisonModel.gain.leads.toLocaleString('pt-BR')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Mais oportunidades entrando no seu funil todos os meses.</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-300 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(23,49,207,0.12)]">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Ganho de vendas/mês</p>
                <p className="text-2xl font-bold text-[#1731cf]">+{comparisonModel.gain.sales.toLocaleString('pt-BR')}</p>
                <p className="text-[11px] text-slate-500 mt-1">Mais negócios fechados com processo comercial otimizado.</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-300 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(23,49,207,0.12)]">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Multiplicador de ROAS</p>
                <p className="text-2xl font-bold text-[#1731cf]">{roasLift.toFixed(1)}x</p>
                <p className="text-[11px] text-slate-500 mt-1">Mais retorno sobre mídia com o mesmo investimento.</p>
              </div>
              <div className="rounded-xl bg-white border border-slate-300 p-3 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_14px_28px_rgba(23,49,207,0.12)]">
                <p className="text-[11px] uppercase tracking-wider text-slate-500">Aumento de faturamento</p>
                <p className="text-xl md:text-2xl font-bold text-emerald-700 break-words leading-tight">{toMoney(comparisonModel.gain.revenue)}</p>
                <p className="text-[11px] text-slate-500 mt-1">Diferença direta entre seu cenário atual e o potencial com AutoForce.</p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500 text-center">
              *Projeção baseada nas respostas do diagnóstico, PageSpeed e maturidade comercial.
            </p>
          </div>
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

