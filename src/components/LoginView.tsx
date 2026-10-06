import React, { useState } from 'react';
import { ShieldCheck, Wrench, Scissors, Smartphone, ArrowRight, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const LoginView: React.FC = () => {
  const { login, setRole } = useApp();
  const [selectedRoleType, setSelectedRoleType] = useState<'admin' | 'configuracao'>('admin');
  const [pin, setPin] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [showHelper, setShowHelper] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!pin.trim()) {
      setErrorMsg('Por favor, informe o PIN de acesso.');
      return;
    }

    const res = login(pin);
    if (!res.success) {
      setErrorMsg(res.error || 'PIN incorreto. Tente novamente.');
      setPin('');
    } else {
      setErrorMsg('');
    }
  };

  const handleKeypadPress = (digit: string) => {
    if (pin.length < 10) {
      const newPin = pin + digit;
      setPin(newPin);
      setErrorMsg('');
      // Auto-submit if 4 digits
      if (newPin.length === 4 && selectedRoleType === 'admin') {
        const res = login(newPin);
        if (!res.success) {
          setErrorMsg(res.error || 'PIN incorreto.');
          setPin('');
        }
      }
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
    setErrorMsg('');
  };

  const handleQuickClientAccess = () => {
    setRole('cliente');
    if (typeof window !== 'undefined' && window.history.pushState) {
      window.history.pushState({}, '', '/agendar');
    }
  };

  return (
    <div className="min-h-screen bg-[#09090b] flex flex-col items-center justify-center p-4 selection:bg-[#d4af37] selection:text-black">
      {/* Background ambient glow */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[550px] h-[550px] bg-[#d4af37]/8 rounded-full blur-[120px]" />
      </div>

      <div className="w-full max-w-md relative z-10 space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-3">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto rounded-3xl bg-black border-2 border-[#d4af37]/80 p-1 shadow-2xl shadow-amber-500/20 flex items-center justify-center overflow-hidden">
            <img
              src="./logo-elite96.png"
              alt="Elite 96 Barbearia"
              className="w-full h-full object-cover scale-110"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <div>
            <div className="flex items-center justify-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#dfc15d] via-[#f3e5ab] to-[#c59b27]">
                ELITE 96
              </h1>
              <span className="text-[10px] font-black px-2 py-0.5 rounded bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/40 uppercase tracking-widest">
                BARBEARIA
              </span>
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Controle de Gestão, Agenda & Automação WhatsApp
            </p>
          </div>
        </div>

        {/* Profile Card */}
        <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 sm:p-7 shadow-2xl space-y-6">
          
          {/* Quick Demo Access Button */}
          <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-[#d4af37]/10 to-amber-500/15 border border-[#d4af37]/40 text-center space-y-2">
            <div className="text-xs text-[#f3e5ab] font-bold flex items-center justify-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
              <span>Modo Demonstração Ativo</span>
            </div>
            <button
              type="button"
              onClick={() => setRole('admin')}
              className="w-full py-2.5 bg-gradient-to-r from-[#c59b27] via-[#f3e5ab] to-[#c59b27] text-slate-950 font-black rounded-xl text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
            >
              <Scissors className="w-4 h-4" />
              <span>Entrar como Barbeiro/Admin (1 Clique)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Profile Switcher Tabs */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-2">
              Ou selecione para acessar com PIN:
            </label>
            <div className="grid grid-cols-2 gap-2 bg-[#18181b] p-1.5 rounded-2xl border border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  setSelectedRoleType('admin');
                  setErrorMsg('');
                  setPin('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRoleType === 'admin'
                    ? 'bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] text-slate-950 shadow-md font-extrabold shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Scissors className="w-3.5 h-3.5 shrink-0" />
                <span>Barbeiro / Admin</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedRoleType('configuracao');
                  setErrorMsg('');
                  setPin('');
                }}
                className={`py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  selectedRoleType === 'configuracao'
                    ? 'bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] text-slate-950 shadow-md font-extrabold shadow-amber-500/20'
                    : 'text-zinc-400 hover:text-white'
                }`}
              >
                <Wrench className="w-3.5 h-3.5 shrink-0" />
                <span>Config. Técnica</span>
              </button>
            </div>
          </div>

          {/* Description of Selected Profile */}
          <div className="p-3.5 rounded-2xl bg-[#18181b]/60 border border-zinc-800 text-xs">
            {selectedRoleType === 'admin' ? (
              <div className="flex items-start gap-2.5 text-zinc-300">
                <Scissors className="w-4 h-4 text-[#f3e5ab] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Operação da Barbearia:</strong> Agenda, checkout com produtos, lançamento de gastos, estoque e cadastro de clientes.
                </p>
              </div>
            ) : (
              <div className="flex items-start gap-2.5 text-zinc-300">
                <ShieldCheck className="w-4 h-4 text-[#f3e5ab] shrink-0 mt-0.5" />
                <p>
                  <strong className="text-white">Área Técnica & Servidor:</strong> Configurações da Evolution API de WhatsApp, chaves secretas, backups e manutenção do sistema.
                </p>
              </div>
            )}
          </div>

          {/* PIN Input & Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="text-xs font-bold text-zinc-300 flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-[#d4af37]" />
                  <span>PIN ou Senha de Acesso</span>
                </label>
                <button
                  type="button"
                  onClick={() => setShowHelper(!showHelper)}
                  className="text-[10px] text-[#f3e5ab] hover:underline cursor-pointer"
                >
                  {showHelper ? 'Ocultar dica' : 'Esqueceu o PIN?'}
                </button>
              </div>

              <div className="relative">
                <input
                  type="password"
                  value={pin}
                  onChange={e => setPin(e.target.value)}
                  placeholder={selectedRoleType === 'admin' ? 'Digite o PIN (ex: 9696)' : 'Digite a senha técnica (ex: admin96)'}
                  className="w-full bg-[#18181b] border border-zinc-700/80 rounded-2xl px-4 py-3.5 text-center text-lg sm:text-xl tracking-widest font-mono text-white focus:outline-none focus:border-[#d4af37] focus:ring-1 focus:ring-[#d4af37]"
                  autoFocus
                />
              </div>

              {showHelper && (
                <div className="mt-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                  <p>🔑 <strong>PIN Padrão Barbeiro/Admin:</strong> <code className="text-[#f3e5ab] font-bold">9696</code></p>
                  <p>⚙️ <strong>Senha Padrão Config. Técnica:</strong> <code className="text-[#f3e5ab] font-bold">admin96</code></p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {/* Quick Numeric Keypad for Smartphones */}
            <div className="grid grid-cols-3 gap-2 pt-1">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map(num => (
                <button
                  key={num}
                  type="button"
                  onClick={() => handleKeypadPress(num)}
                  className="py-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-800/80 text-white font-bold text-lg active:scale-95 transition-all cursor-pointer"
                >
                  {num}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPin('')}
                className="py-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 text-xs font-bold active:scale-95 transition-all cursor-pointer"
              >
                Limpar
              </button>
              <button
                type="button"
                onClick={() => handleKeypadPress('0')}
                className="py-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-800/80 text-white font-bold text-lg active:scale-95 transition-all cursor-pointer"
              >
                0
              </button>
              <button
                type="button"
                onClick={handleBackspace}
                className="py-3 rounded-xl bg-[#18181b] hover:bg-zinc-800 border border-zinc-800/80 text-zinc-400 text-xs font-bold active:scale-95 transition-all cursor-pointer"
              >
                ⌫ Apagar
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 bg-gradient-to-r from-[#c59b27] via-[#f3e5ab] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 text-sm flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Entrar no Painel</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>
        </div>

        {/* Exclusive Customer Link Shortcut */}
        <div className="bg-[#121215]/80 border border-[#27272a] rounded-3xl p-5 text-center shadow-lg">
          <p className="text-xs text-zinc-400 mb-3">
            Você é um cliente querendo agendar um horário ou ver os preços?
          </p>
          <button
            type="button"
            onClick={handleQuickClientAccess}
            className="w-full py-3 bg-[#d4af37]/10 hover:bg-[#d4af37]/20 text-[#f3e5ab] border border-[#d4af37]/40 rounded-2xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 transition-all cursor-pointer"
          >
            <Smartphone className="w-4 h-4" />
            <span>Acessar Visão do Cliente (Horários & Preços)</span>
            <ArrowRight className="w-3.5 h-3.5 opacity-70" />
          </button>
        </div>

        {/* Footer info */}
        <p className="text-center text-[10px] text-zinc-500">
          Elite 96 Barbearia • Sistema de Gestão Privado • Hospedado em AWS Lightsail
        </p>
      </div>
    </div>
  );
};
