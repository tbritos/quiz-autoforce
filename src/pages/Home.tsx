import { ArrowRight, Clock, BarChart2, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();
  const logos = [
    '/logos/Frame 1321314283.svg',
    '/logos/Frame 1321314284.svg',
    '/logos/Frame 1321314285.svg',
    '/logos/Frame 1321314286.svg',
    '/logos/Frame 1321314287.svg',
    '/logos/Frame 1321314288.svg',
    '/logos/Frame 1321314289.svg',
    '/logos/Frame 1321314290.svg',
    '/logos/Frame 1321314291.svg',
    '/logos/Frame 1321314292.svg',
    '/logos/Frame 1321314293.svg',
    '/logos/Frame 1321314294.svg',
    '/logos/Frame 1321314295.svg',
    '/logos/Frame 1321314296.svg',
    '/logos/Frame 1321314297.svg',
    '/logos/Frame 1321314298.svg',
    '/logos/Frame 1321314299.svg',
    '/logos/Frame 1321314300.svg',
    '/logos/Frame 1321314301.svg',
    '/logos/Frame 1321314302.svg',
    '/logos/Frame 1321314303.svg',
    '/logos/Frame 1321314304.svg',
    '/logos/Frame 1321314305.svg',
    '/logos/Frame 1321314306.svg',
  ];

  return (
    <div className="min-h-screen bg-autoforce-dark text-white font-sans selection:bg-autoforce-blue selection:text-white">
      
      {/* --- HERO SECTION (Topo com Imagem) --- */}
      {/* AJUSTE: Aumentei o padding vertical (py-16 md:py-24) para dar mais respiro no mobile */}
      <div className="relative pt-16 pb-16 md:pt-24 md:pb-24 px-4 overflow-hidden">
        
        {/* Efeitos de Luz de Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-autoforce-blue/20 blur-[120px] rounded-full z-0 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-10 md:gap-16">
          
          {/* Lado Esquerdo: Texto */}
          {/* AJUSTE MAIN: Mudei para 'text-center md:text-left' para centralizar no mobile */}
          <div className="md:w-1/2 text-center md:text-left space-y-6 md:space-y-8">
            
            {/* Badge de Tempo */}
            {/* AJUSTE: 'inline-flex' já centraliza quando o pai é text-center. Adicionei 'mx-auto md:mx-0' para garantir. */}
            <div className="inline-flex mx-auto md:mx-0 items-center gap-2 px-4 py-2 rounded-full bg-autoforce-surface border border-autoforce-blue/30 shadow-[0_0_15px_rgba(20,64,255,0.2)]">
              <Clock className="w-4 h-4 text-autoforce-blue" />
              <span className="text-sm font-semibold tracking-wide text-gray-200">Poucos segundos</span>
            </div>

            {/* Título Principal */}
            {/* AJUSTE DE FONTE: Mudei para 'text-3xl sm:text-4xl' no mobile para ficar menor e mais harmônico */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
              Receba uma{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-autoforce-blue to-blue-400">
                consultoria gratuita
              </span>{' '}
              para impulsionar os resultados de vendas de veículos do seu negócio.
            </h1>

            {/* Subtítulo */}
            {/* AJUSTE: Adicionei 'mx-auto md:mx-0' para centralizar o bloco de texto */}
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl mx-auto md:mx-0">
              Preencha esse diagnóstico e receba um relatório com indicadores chave (KPIs) da estrutura de marketing e vendas do seu negócio, e ainda ganhe uma consultoria ao vivo com especialista.
            </p>

            {/* Botão Principal */}
            {/* AJUSTE: Aumentei o padding top (pt-4 md:pt-2) para afastar do texto */}
            <div className="pt-6 md:pt-4">
              <button 
                onClick={() => navigate('/diagnostico')}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-autoforce-blue rounded-lg hover:bg-blue-600 hover:scale-105 shadow-[0_0_20px_rgba(20,64,255,0.4)] w-full md:w-auto"
              >
                Iniciar Diagnóstico Gratuito
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              {/* O texto pequeno já vai centralizar por causa da div pai */}
              <p className="mt-4 text-sm text-gray-500">Resultados em tempo real • 100% Gratuito</p>
            </div>
          </div>

          {/* Lado Direito: Imagem */}
          {/* AJUSTE: Adicionei 'mt-8 md:mt-0' para dar espaço entre o botão e a imagem no mobile */}
          <div className="md:w-1/2 flex justify-center relative mt-10 md:mt-0">
            {/* Efeito de brilho atrás da imagem */}
            <div className="absolute inset-0 bg-autoforce-blue/20 blur-[60px] rounded-full -z-10"></div>
            
            <img 
              src="/hero-image4.png" 
              alt="Dashboard de Vendas AutoForce" 
              className="w-full max-w-[400px] md:max-w-lg object-cover rounded-2xl shadow-2xl border border-white/10 hover:border-autoforce-blue/50 transition-colors"
            />
          </div>

        </div>
      </div>

      {/* --- CARROSSEL DE LOGOS --- */}
      <section className="relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 py-12 md:py-16">
          <div className="text-center mb-8">
            <h2 className="text-2xl md:text-3xl font-heading font-bold text-white">Confiança comprovada</h2>
            <p className="text-gray-400 mt-2">
              Essas são algumas das marcas líderes que impulsionamos com soluções personalizadas.
            </p>
          </div>

          <div className="logo-marquee overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
            <div className="logo-marquee-track flex w-max items-center gap-6 md:gap-8">
              {[...logos, ...logos].map((logo, index) => (
                <div
                  key={`${logo}-${index}`}
                  className="flex items-center justify-center h-16 md:h-20 px-6 md:px-8 rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.35)]"
                >
                  <img
                    src={logo}
                    alt={`Logo cliente ${index + 1}`}
                    className="h-8 md:h-10 max-w-[140px] md:max-w-[160px] object-contain"
                    loading="lazy"
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- NOVA SEÇÃO: PERDA DE DEMANDA (H2) --- */}
      <section className="relative z-10 py-16 md:py-20 border-y border-white/5 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-autoforce-blue/5 via-transparent to-transparent pointer-events-none"></div>
        <div className="absolute -top-28 right-1/2 translate-x-1/2 w-[600px] h-[300px] bg-autoforce-blue/12 blur-[140px] rounded-full pointer-events-none"></div>

        <div className="max-w-5xl mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-5xl font-heading font-bold text-white leading-tight">
            Descubra onde sua operação está{' '}
            <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-500/15 text-red-300 border border-red-500/30">
              perdendo demanda
            </span>
          </h2>
          <p className="text-gray-300 text-base md:text-lg max-w-3xl mx-auto mt-5 leading-relaxed">
            (site, mídia, atendimento e funil) e receba recomendações práticas para melhorar os indicadores que realmente
            impactam vendas.
          </p>
        </div>
      </section>

      {/* --- PARCEIROS OFICIAIS --- */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-10">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white">Parceiros oficiais</h2>
          <p className="text-gray-400 mt-2">Atendemos as maiores montadoras e associações do Brasil</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {[
            { src: '/selos/selo-homologado-stellantis.svg', alt: 'Selo homologado Stellantis' },
            { src: '/selos/selo-homologado-renault.svg', alt: 'Selo homologado Renault' },
            { src: '/selos/selo-homologado-mitsubishi.svg', alt: 'Selo homologado Mitsubishi' },
            { src: '/selos/selo-homologado-geely.svg', alt: 'Selo homologado Geely' },
            { src: '/selos/selo-homologado-hyundai.svg', alt: 'Selo homologado Hyundai' },
            { src: '/selos/selo-homologado-benz.svg', alt: 'Selo homologado Mercedes-Benz' },
            { src: '/selos/selo-homologado-assohonda.svg', alt: 'Selo homologado Assohonda' },
            { src: '/selos/selo-homologado-abraparts.svg', alt: 'Selo homologado Abraparts' },
            { src: '/selos/selo-homologado-abrahy.svg', alt: 'Selo homologado AbrahY' },
            { src: '/selos/selo-homologado-gwm.svg', alt: 'Selo homologado GWM' },
          ].map((partner) => (
            <div
              key={partner.src}
              className="group rounded-2xl bg-white/5 p-4 backdrop-blur-sm shadow-[0_10px_30px_rgba(0,0,0,0.25)] transition-all duration-300 hover:bg-white/10 hover:shadow-[0_12px_35px_rgba(20,64,255,0.25)]"
            >
              <img
                src={partner.src}
                alt={partner.alt}
                className="w-full h-auto object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                loading="lazy"
              />
            </div>
          ))}
        </div>
      </section>

      {/* --- CTA FINAL (Rodapé) --- */}
      <div className="border-t border-white/10 bg-autoforce-surface/30">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Pronto para otimizar sua operação?</h2>
          <p className="text-gray-400 mb-8">Responda 10 perguntas rápidas e receba seu diagnóstico personalizado.</p>
          <button 
            onClick={() => navigate('/diagnostico')}
            className="px-10 py-4 bg-white text-autoforce-dark font-bold text-lg rounded-lg hover:bg-gray-200 hover:scale-105 transition-all"
          >
            Iniciar agora
          </button>
          
          <div className="mt-12 flex items-center justify-center gap-4 text-xs text-gray-600">
            <span>© 2025 AutoForce</span>
            <span>•</span>
            <span>Política de Privacidade</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Home;
