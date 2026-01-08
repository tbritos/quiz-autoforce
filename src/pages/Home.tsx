import { ArrowRight, Clock, BarChart2, TrendingUp, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-autoforce-dark text-white font-sans selection:bg-autoforce-blue selection:text-white">
      
      {/* --- HERO SECTION (Topo com Imagem) --- */}
      <div className="relative pt-20 pb-20 px-4 overflow-hidden">
        
        {/* Efeitos de Luz de Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-autoforce-blue/20 blur-[120px] rounded-full z-0 pointer-events-none"></div>

        <div className="relative z-10 max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-12">
          
          {/* Lado Esquerdo: Texto */}
          <div className="md:w-1/2 text-left space-y-8">
            
            {/* Badge de Tempo */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-autoforce-surface border border-autoforce-blue/30 shadow-[0_0_15px_rgba(20,64,255,0.2)]">
              <Clock className="w-4 h-4 text-autoforce-blue" />
              <span className="text-sm font-semibold tracking-wide text-gray-200">Leva apenas 3 minutos</span>
            </div>

            {/* Título Principal */}
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-heading font-bold leading-tight">
              Receba uma <span className="text-transparent bg-clip-text bg-gradient-to-r from-autoforce-blue to-blue-400">consultoria gratuita</span> para melhorar a performance da sua Operação de Vendas de Veículos
            </h1>

            {/* Subtítulo */}
            <p className="text-lg text-gray-400 leading-relaxed max-w-xl">
              Preencha esse diagnóstico e receba um relatório com indicadores chave (KPIs) da estrutura de marketing e vendas do seu negócio, e ainda ganhe uma consultoria ao vivo com especialista.
            </p>

            {/* Botão Principal */}
            <div className="pt-2">
              <button 
                onClick={() => navigate('/diagnostico')}
                className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-autoforce-blue rounded-lg hover:bg-blue-600 hover:scale-105 shadow-[0_0_20px_rgba(20,64,255,0.4)] w-full md:w-auto"
              >
                Iniciar Diagnóstico Gratuito
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <p className="mt-4 text-sm text-gray-500">Resultados em tempo real • 100% Gratuito</p>
            </div>
          </div>

          {/* Lado Direito: Imagem */}
          <div className="md:w-1/2 flex justify-center relative">
            {/* Efeito de brilho atrás da imagem */}
            <div className="absolute inset-0 bg-autoforce-blue/20 blur-[60px] rounded-full -z-10"></div>
            
            <img 
              src="/hero-image4.png" 
              alt="Dashboard de Vendas AutoForce" 
              className="w-full max-w-lg object-cover rounded-2xl shadow-2xl border border-white/10 hover:border-autoforce-blue/50 transition-colors"
            />
          </div>

        </div>
      </div>

      {/* --- NOVA SEÇÃO: PERDA DE DEMANDA (H2) --- */}
      <section className="bg-autoforce-surface py-16 border-y border-white/5 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-2xl md:text-4xl font-heading font-bold text-white leading-tight">
            Descubra onde sua operação está <span className="text-red-400 decoration-red-400 underline decoration-2 underline-offset-4">perdendo demanda</span> <br className="hidden md:block"/>
            <span className="text-gray-400 font-normal text-xl md:text-2xl mt-4 block">
              (site, mídia, atendimento e funil) e receba recomendações práticas para melhorar os indicadores que realmente impactam vendas.
            </span>
          </h2>
        </div>
      </section>

      {/* --- SEÇÃO DE BENEFÍCIOS (Cards) --- */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 py-24">
        <div className="grid md:grid-cols-3 gap-8">
          
          {/* Card 1 */}
          <div className="bg-autoforce-surface p-8 rounded-2xl border border-white/5 hover:border-autoforce-blue/50 transition-all hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-autoforce-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-autoforce-blue transition-colors">
              <TrendingUp className="w-7 h-7 text-autoforce-blue group-hover:text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-white">Aumente suas vendas em até 2,7x</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Identifique melhorias que podem aumentar suas vendas em até 2,7x otimizando processos atuais.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-autoforce-surface p-8 rounded-2xl border border-white/5 hover:border-autoforce-blue/50 transition-all hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-autoforce-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-autoforce-blue transition-colors">
              <BarChart2 className="w-7 h-7 text-autoforce-blue group-hover:text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-white">Descubra o que está derrubando sua conversão</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Checklist de performance e conversão para transformar visitas em conversas reais.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-autoforce-surface p-8 rounded-2xl border border-white/5 hover:border-autoforce-blue/50 transition-all hover:-translate-y-1 group">
            <div className="w-14 h-14 bg-autoforce-blue/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-autoforce-blue transition-colors">
              <Users className="w-7 h-7 text-autoforce-blue group-hover:text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-white">Gere Mais leads com o mesmo investimento</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Entenda como as principais concessionárias do Brasil fazem para vender milhões por mês.
            </p>
          </div>
        </div>
      </div>

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