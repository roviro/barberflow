import React, { useState } from 'react';
import {
  Calendar,
  LayoutDashboard,
  DollarSign,
  Package,
  Users,
  Scissors,
  Smartphone,
  Copy,
  Wrench,
  LogOut,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export const Header: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    inventory,
    appointments,
    activeDate,
    currentRole,
    logout,
  } = useApp();

  const [copiedLink, setCopiedLink] = useState(false);

  // Badges calculation
  const lowStockCount = inventory.filter(i => i.quantity <= i.minQuantity).length;
  const todayAppointmentsCount = appointments.filter(
    a => a.date === activeDate && a.status !== 'cancelado'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Início', icon: LayoutDashboard },
    {
      id: 'agenda',
      label: 'Agenda',
      icon: Calendar,
      badge: todayAppointmentsCount > 0 ? todayAppointmentsCount : undefined,
    },
    { id: 'financeiro', label: 'Financeiro', icon: DollarSign },
    {
      id: 'estoque',
      label: 'Estoque',
      icon: Package,
      badge: lowStockCount > 0 ? lowStockCount : undefined,
      badgeColor: 'bg-red-500',
    },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'servicos', label: 'Serviços', icon: Scissors },
  ];

  // If user has technical config role, add the technical tab
  if (currentRole === 'configuracao') {
    navItems.push({
      id: 'configuracao',
      label: 'Config. Técnica',
      icon: Wrench,
      badge: undefined,
      badgeColor: undefined,
    });
  }

  const handleCopyCustomerLink = () => {
    const url = typeof window !== 'undefined' && window.location.origin
      ? `${window.location.origin}/agendar`
      : 'https://elite96.roviro.com.br/agendar';
    navigator.clipboard.writeText(url);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2500);
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-[#09090b]/95 backdrop-blur-md border-b border-[#27272a] shadow-xl">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20 gap-2 sm:gap-4">
            
            {/* Logo & Brand - 100% unbreakable on single line */}
            <div
              className="flex items-center gap-2.5 sm:gap-3 shrink-0 cursor-pointer select-none group"
              onClick={() => setActiveTab('dashboard')}
            >
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-black border border-[#d4af37]/70 p-0.5 overflow-hidden shadow-md shadow-amber-500/10 flex items-center justify-center shrink-0 group-hover:border-[#f3e5ab] transition-all">
                <img
                  src="/logo-elite96.png"
                  alt="Elite 96"
                  className="w-full h-full object-cover scale-110"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
              </div>

              <div className="flex flex-col justify-center shrink-0">
                <div className="flex items-center gap-1.5 flex-nowrap whitespace-nowrap">
                  <span className="font-black text-base sm:text-xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#dfc15d] via-[#f3e5ab] to-[#c59b27] shrink-0">
                    ELITE 96
                  </span>
                  <span className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/40 uppercase shrink-0">
                    BARBEARIA
                  </span>
                </div>
                <span className="text-[10px] text-zinc-400 font-medium tracking-wide">
                  Gestão & Agenda
                </span>
              </div>
            </div>

            {/* Desktop Navigation - Clean, responsive padding */}
            <nav className="hidden lg:flex items-center gap-1 xl:gap-1.5 shrink-0">
              {navItems.map(item => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`relative flex items-center gap-1.5 px-2.5 xl:px-3 py-1.5 xl:py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all whitespace-nowrap ${
                      isActive
                        ? 'bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] text-slate-950 font-extrabold shadow-md shadow-amber-500/20'
                        : 'text-zinc-300 hover:text-white hover:bg-zinc-900/80'
                    }`}
                  >
                    <Icon className="w-4 h-4 shrink-0" />
                    <span>{item.label}</span>

                    {item.badge !== undefined && (
                      <span
                        className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                          isActive
                            ? 'bg-slate-950 text-amber-300'
                            : item.badgeColor || 'bg-amber-500/20 text-amber-400'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            {/* Right Action Buttons */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
              
              {/* Role Badge */}
              <div className="hidden sm:flex items-center">
                {currentRole === 'configuracao' ? (
                  <span className="px-2.5 py-1 rounded-xl bg-blue-500/15 text-blue-400 border border-blue-500/30 text-[11px] font-black flex items-center gap-1">
                    <Wrench className="w-3 h-3" />
                    <span>Config. Técnica</span>
                  </span>
                ) : (
                  <span className="px-2.5 py-1 rounded-xl bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/40 text-[11px] font-black flex items-center gap-1">
                    <Scissors className="w-3 h-3" />
                    <span>Admin Barbeiro</span>
                  </span>
                )}
              </div>

              {/* Copy Customer Link Button */}
              <button
                onClick={handleCopyCustomerLink}
                className="flex items-center gap-1.5 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-bold bg-[#d4af37]/10 text-[#f3e5ab] border border-[#d4af37]/30 hover:bg-[#d4af37]/20 transition-all cursor-pointer shrink-0"
                title="Copiar link oficial que os clientes usam para agendar"
              >
                <Smartphone className="w-4 h-4 text-[#d4af37]" />
                <span className="hidden md:inline whitespace-nowrap">
                  {copiedLink ? 'Link Copiado! ✅' : 'Link do Cliente'}
                </span>
                <span className="md:hidden text-xs">
                  {copiedLink ? 'Copiado!' : 'Link'}
                </span>
                <Copy className="w-3 h-3 opacity-60 hidden md:inline" />
              </button>

              {/* Logout Button */}
              <button
                onClick={() => {
                  if (confirm('Deseja sair do painel administrativo?')) {
                    logout();
                  }
                }}
                title="Sair do painel / Trocar de perfil"
                className="p-2 text-zinc-400 hover:text-rose-400 hover:bg-zinc-900 rounded-xl border border-zinc-800 transition-colors shrink-0 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Bottom Navigation Bar */}
        <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090b]/98 backdrop-blur-lg border-t border-zinc-800 px-1 py-1.5 flex items-center justify-around shadow-2xl">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1 px-2 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-[#f3e5ab] font-bold' : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : ''}`} />
                  {item.badge !== undefined && (
                    <span
                      className={`absolute -top-1 -right-2 text-[9px] w-3.5 h-3.5 rounded-full flex items-center justify-center text-white ${
                        item.badgeColor || 'bg-amber-500'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-0.5">{item.label}</span>
              </button>
            );
          })}
        </div>
      </header>
    </>
  );
};
