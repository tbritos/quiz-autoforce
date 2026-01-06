import { ArrowRight, Clock, BarChart3, Target, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Home() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-autoforce-dark text-white font-sans selection:bg-autoforce-blue selection:text-white">
      
      {/* --- HERO SECTION (Topo) --- */}
      <div className="relative pt-20 pb-32 px-4 overflow-hidden">
        
        {/* Efeitos de Luz de Fundo */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-autoforce-blue/20 blur-[120px] rounded-full z-0 pointer-events-none"></div>

        <div className="relative z-10 max-w-4xl mx-auto text-center space-y-8">
          
          {/* Badge de Tempo */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-autoforce-surface border border-autoforce-blue/30 shadow-[0_0_15px_rgba(20,64,255,0.2)]">
            <Clock className="w-4 h-4 text-autoforce-blue" />
            <span className="text-sm font-semibold tracking-wide text-gray-200">Leva apenas 3 minutos</span>
          </div>

          {/* Título Principal (Extraído da referência) */}
          <h1 className="text-4xl md:text-6xl font-heading font-bold leading-tight">
            Receba sua <br className="md:hidden" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-autoforce-blue via-blue-400 to-white drop-shadow-[0_0_10px_rgba(20,64,255,0.5)]">
              Nota do Site (0–10)
            </span>
            <span className="text-white"> + </span>
            <br className="hidden md:block"/>
            Diagnóstico de Maturidade
          </h1>

          {/* Subtítulo */}
          <p className="text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Descubra em que nível está sua operação digital e receba recomendações práticas para vender mais veículos.
          </p>

          {/* Botão Principal */}
          <div className="pt-4">
            <button 
              onClick={() => navigate('/diagnostico')}
              className="group relative inline-flex items-center justify-center px-8 py-4 text-lg font-bold text-white transition-all duration-200 bg-autoforce-blue rounded-lg hover:bg-autoforce-orange hover:text-autoforce-dark hover:scale-105 shadow-[0_0_20px_rgba(20,64,255,0.4)]"
            >
              Começar diagnóstico gratuito
              <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <p className="mt-4 text-sm text-gray-500">Resultados em tempo real • 100% Gratuito</p>
          </div>
        </div>
      </div>

      {/* --- SEÇÃO DE BENEFÍCIOS (Cards) --- */}
      <div className="relative z-10 max-w-6xl mx-auto px-4 pb-24">
        <div className="text-center mb-12">
          <div className="inline-block px-3 py-1 rounded-md bg-autoforce-blue/10 text-autoforce-blue text-sm font-bold uppercase tracking-wider mb-2">
            O que você vai descobrir
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Card 1 */}
          <div className="bg-autoforce-surface p-8 rounded-2xl border border-white/5 hover:border-autoforce-blue/50 transition-colors group">
            <div className="w-12 h-12 bg-autoforce-blue/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-autoforce-blue transition-colors">
              <BarChart3 className="w-6 h-6 text-autoforce-blue group-hover:text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-white">Nota do Site (0–10)</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Avaliação técnica do seu site com checklist de 10 pontos e as 3 melhorias mais urgentes para converter mais.
            </p>
          </div>

          {/* Card 2 */}
          <div className="bg-autoforce-surface p-8 rounded-2xl border border-white/5 hover:border-autoforce-blue/50 transition-colors group">
            <div className="w-12 h-12 bg-autoforce-blue/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-autoforce-blue transition-colors">
              <Target className="w-6 h-6 text-autoforce-blue group-hover:text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-white">Benchmark de Maturidade</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Compare sua operação com o padrão de mercado e entenda se está abaixo, na média ou acima.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bg-autoforce-surface p-8 rounded-2xl border border-white/5 hover:border-autoforce-blue/50 transition-colors group">
            <div className="w-12 h-12 bg-autoforce-blue/10 rounded-lg flex items-center justify-center mb-6 group-hover:bg-autoforce-blue transition-colors">
              <CheckCircle2 className="w-6 h-6 text-autoforce-blue group-hover:text-white" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-white">Gargalos Identificados</h3>
            <p className="text-gray-400 leading-relaxed text-sm">
              Descubra onde está a fricção: geração, qualidade, atendimento, conversão ou processo.
            </p>
          </div>
        </div>
      </div>

      {/* --- CTA FINAL (Rodapé) --- */}
      <div className="border-t border-white/10 bg-autoforce-surface/50">
        <div className="max-w-4xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-heading font-bold mb-4">Pronto para otimizar sua operação?</h2>
          <p className="text-gray-400 mb-8">Responda 10 perguntas rápidas e receba seu diagnóstico personalizado.</p>
          <button 
            onClick={() => navigate('/diagnostico')}
            className="px-8 py-3 bg-white text-autoforce-dark font-bold rounded-lg hover:bg-gray-200 transition-colors"
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