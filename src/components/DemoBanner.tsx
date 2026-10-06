import React, { useState } from 'react';
import { Scissors, Smartphone, RotateCcw, MessageCircle, ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const DemoBanner: React.FC = () => {
  const { currentRole, setRole, resetToDemoData } = useApp();
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleReset = () => {
    if (confirm('Deseja restaurar os dados originais da demonstração com agendamentos e faturamento de exemplo?')) {
      resetToDemoData();
      setResetSuccess(true);
      setTimeout(() => setResetSuccess(false), 2500);
    }
  };

  return (
    <div className="bg-gradient-to-r from-amber-950/90 via-zinc-950/95 to-amber-950/90 border-b border-amber-500/30 text-zinc-100 py-2.5 px-3 sm:px-6 sticky top-0 z-50 shadow-xl backdrop-blur-md">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 text-xs">
        
        {/* Lado Esquerdo: Tag de Demonstração */}
        <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
          <span className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-300 font-mono text-[11px] font-bold">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            Modo Demonstração Interativa
          </span>
          <span className="hidden lg:inline text-zinc-400 text-[11px]">
            Alterne livremente entre as perspectivas do sistema:
          </span>
        </div>

        {/* Centro: Alternador de Perspectiva (Barbeiro vs Cliente) */}
        <div className="flex items-center gap-1.5 bg-black/70 p-1 rounded-xl border border-zinc-800">
          <button
            type="button"
            onClick={() => setRole('admin')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
              currentRole === 'admin' || currentRole === 'configuracao'
                ? 'bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Scissors className="w-3.5 h-3.5" />
            <span>Visão Barbeiro (Admin)</span>
          </button>

          <button
            type="button"
            onClick={() => setRole('cliente')}
            className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all text-xs cursor-pointer ${
              currentRole === 'cliente'
                ? 'bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950 shadow-md font-extrabold'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>Visão Cliente (Agendar)</span>
          </button>
        </div>

        {/* Lado Direito: Ações Rápidas */}
        <div className="flex items-center gap-2 flex-wrap justify-center">
          <button
            type="button"
            onClick={handleReset}
            className="px-2.5 py-1.5 rounded-lg bg-zinc-800/80 hover:bg-zinc-700 text-zinc-300 hover:text-white border border-zinc-700/60 transition-all flex items-center gap-1 text-[11px] cursor-pointer"
            title="Restaurar dados originais de exemplo"
          >
            <RotateCcw className="w-3 h-3 text-amber-400" />
            <span>{resetSuccess ? 'Restaurado! ✅' : 'Resetar Dados'}</span>
          </button>

          <a
            href="https://wa.me/5511986531134?text=Ol%C3%A1%20Jeferson%2C%20estou%20testando%20a%20demonstra%C3%A7%C3%A3o%20do%20sistema%20de%20barbearia%20e%20gostaria%20de%20um%20or%C3%A7amento%20para%20minha%20empresa."
            target="_blank"
            rel="noopener noreferrer"
            className="px-2.5 py-1.5 rounded-lg bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 font-bold transition-all flex items-center gap-1 text-[11px]"
          >
            <MessageCircle className="w-3 h-3 text-emerald-400" />
            <span>Quero Este Sistema</span>
          </a>

          <a
            href="https://roviro.com.br/#projetos"
            className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all flex items-center gap-1 text-[11px]"
            title="Voltar ao portfólio oficial"
          >
            <ArrowLeft className="w-3 h-3" />
            <span className="hidden sm:inline">Portfólio</span>
          </a>
        </div>

      </div>
    </div>
  );
};
