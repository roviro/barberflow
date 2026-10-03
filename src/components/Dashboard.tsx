import React, { useState } from 'react';
import {
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Clock,
  CheckCircle,
  Plus,
  MessageCircle,
  ChevronRight,
  Package,
  Scissors,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateBR, getDayOfWeekName, getTodayString } from '../utils/formatters';
import { createWhatsAppUrl, generateReminderMessage } from '../utils/whatsapp';
import { NewAppointmentModal } from './modals/NewAppointmentModal';
import { NewExpenseModal } from './modals/NewExpenseModal';
import { CheckoutModal } from './modals/CheckoutModal';
import type { Appointment } from '../types';

export const Dashboard: React.FC = () => {
  const {
    profile,
    appointments,
    transactions,
    inventory,
    setActiveTab,
    setActiveDate,
    setRole,
  } = useApp();

  const [isNewAppModalOpen, setIsNewAppModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [selectedAppForCheckout, setSelectedAppForCheckout] = useState<Appointment | null>(null);

  const today = getTodayString();

  // Metrics calculation
  const todayAppointments = appointments.filter(a => a.date === today && a.status !== 'cancelado');
  const completedToday = todayAppointments.filter(a => a.status === 'concluido').length;

  // Monthly totals (current month)
  const currentMonthPrefix = today.slice(0, 7); // "YYYY-MM"
  const monthlyTransactions = transactions.filter(t => t.date.startsWith(currentMonthPrefix));

  const monthlyIncome = monthlyTransactions
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const monthlyExpenses = monthlyTransactions
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = monthlyIncome - monthlyExpenses;

  // Today income
  const todayIncome = transactions
    .filter(t => t.date === today && t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  // Low stock alert items
  const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity);

  // Next up appointments today
  const nextAppointments = [...todayAppointments].sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Welcome & Quick Actions Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-amber-400 text-xs sm:text-sm font-semibold mb-1">
              <span>{getDayOfWeekName(today)}</span>
              <span>•</span>
              <span>{formatDateBR(today)}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Fala, <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfc15d] via-[#f3e5ab] to-[#c59b27]">{profile.barberName}</span>! 💈
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Painel de controle em tempo real da Barbearia Elite 96.
            </p>
          </div>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <button
              onClick={() => setIsNewAppModalOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm flex items-center gap-2 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Novo Agendamento
            </button>
            <button
              onClick={() => setIsExpenseModalOpen(true)}
              className="px-4 py-2.5 bg-zinc-900 hover:bg-zinc-850 text-rose-400 border border-zinc-800 hover:border-rose-500/40 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2 transition-all cursor-pointer"
            >
              <TrendingDown className="w-4 h-4" />
              Lançar Gasto
            </button>
          </div>
        </div>
      </div>

      {/* Critical Stock Alert Banner */}
      {lowStockItems.length > 0 && (
        <div
          onClick={() => setActiveTab('estoque')}
          className="cursor-pointer bg-rose-950/20 border border-rose-800/50 hover:border-rose-700/80 rounded-2xl p-4 flex items-center justify-between transition-all group shadow-lg"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-rose-500/20 text-rose-400 group-hover:scale-105 transition-transform">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-2">
                Atenção ao Estoque: {lowStockItems.length} {lowStockItems.length === 1 ? 'item está' : 'itens estão'} acabando!
              </h4>
              <p className="text-xs text-rose-300/80">
                {lowStockItems.map(i => i.name).slice(0, 2).join(', ')}
                {lowStockItems.length > 2 && ` e mais ${lowStockItems.length - 2}...`}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-rose-400 group-hover:text-rose-300">
            <span>Ver Estoque</span>
            <ChevronRight className="w-4 h-4" />
          </div>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-5">
        
        {/* Lucro Líquido Real */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg relative overflow-hidden">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Lucro Líquido (Mês)
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-xl sm:text-2xl font-black ${netProfit >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatCurrency(netProfit)}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Entradas (-) Despesas
          </span>
        </div>

        {/* Faturamento do Mês */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Faturamento (Mês)
            </span>
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#f3e5ab]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {formatCurrency(monthlyIncome)}
          </p>
          <span className="text-[11px] text-[#f3e5ab]/90 mt-1 block">
            Hoje: {formatCurrency(todayIncome)}
          </span>
        </div>

        {/* Total de Gastos do Mês */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Gastos / Despesas (Mês)
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-rose-400">
            {formatCurrency(monthlyExpenses)}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Custos fixos & insumos
          </span>
        </div>

        {/* Atendimentos Hoje */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-zinc-400">
              Agenda de Hoje
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <p className="text-xl sm:text-2xl font-black text-white">
            {completedToday} / {todayAppointments.length}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {todayAppointments.length - completedToday} restantes hoje
          </span>
        </div>
      </div>

      {/* Main Content Split: Today's Appointments & Quick Tools */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left 2 Cols: Today's Timeline / Appointments */}
        <div className="lg:col-span-2 bg-zinc-950 border border-zinc-800 rounded-2xl p-5 sm:p-6 shadow-xl">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#f3e5ab]" />
              <h3 className="font-bold text-base sm:text-lg text-white">
                Fila de Atendimento de Hoje
              </h3>
            </div>
            <button
              onClick={() => {
                setActiveDate(today);
                setActiveTab('agenda');
              }}
              className="text-xs font-semibold text-amber-400 hover:text-amber-300 flex items-center gap-1"
            >
              Ver agenda completa
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {nextAppointments.length === 0 ? (
            <div className="py-12 text-center text-zinc-400">
              <Calendar className="w-12 h-12 mx-auto mb-2 opacity-30 text-[#d4af37]" />
              <p className="text-sm">Nenhum agendamento marcado para hoje.</p>
              <button
                onClick={() => setIsNewAppModalOpen(true)}
                className="mt-3 text-xs text-amber-400 font-semibold hover:underline"
              >
                + Adicionar primeiro cliente
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {nextAppointments.map(app => {
                const isCompleted = app.status === 'concluido';
                const isUnderway = app.status === 'em_atendimento';
                return (
                  <div
                    key={app.id}
                    className={`p-4 rounded-xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCompleted
                        ? 'bg-zinc-900/40 border-zinc-850 opacity-70'
                        : isUnderway
                        ? 'bg-[#d4af37]/10 border-[#d4af37]/50 ring-1 ring-[#d4af37]/30'
                        : 'bg-zinc-900/60 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="text-center min-w-[54px] p-2 rounded-xl bg-black border border-zinc-800">
                        <span className="text-sm font-black text-[#f3e5ab] block">
                          {app.time}
                        </span>
                        <span className="text-[9px] uppercase tracking-wider text-zinc-500 font-bold block">
                          Hora
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-sm sm:text-base text-white">
                            {app.clientName}
                          </h4>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : isUnderway
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {isCompleted
                              ? 'Concluído'
                              : isUnderway
                              ? 'Na Cadeira'
                              : 'Confirmado'}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-400 flex items-center gap-2 mt-0.5">
                          <Scissors className="w-3 h-3 text-zinc-500" />
                          <span>{app.serviceName}</span>
                          <span>•</span>
                          <span className="text-emerald-400 font-semibold">
                            {formatCurrency(app.price)}
                          </span>
                        </p>
                        {app.notes && (
                          <p className="text-[11px] text-amber-300/80 italic mt-1">
                            Obs: {app.notes}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions for this appointment */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      {!isCompleted && (
                        <>
                          {/* Send WhatsApp Reminder */}
                          <button
                            onClick={() => {
                              const msg = generateReminderMessage(app, profile.name);
                              const url = createWhatsAppUrl(app.clientPhone, msg);
                              window.open(url, '_blank');
                            }}
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1 transition-colors"
                            title="Lembrar cliente no WhatsApp"
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                            <span className="hidden sm:inline">Lembrete</span>
                          </button>

                          {/* Complete & Checkout */}
                          <button
                            onClick={() => setSelectedAppForCheckout(app)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                            <span>Cobrar</span>
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right 1 Col: Quick Tools & WhatsApp Hub */}
        <div className="space-y-5">
          
          {/* Public Booking Link Card */}
          <div className="bg-gradient-to-br from-zinc-900 to-black border border-[#d4af37]/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center gap-2.5 text-[#f3e5ab] mb-2">
              <MessageCircle className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-sm text-white">Chega de postar status!</h3>
            </div>
            <p className="text-xs text-zinc-300 leading-relaxed">
              Em vez de postar horários no WhatsApp todo dia, seus clientes podem agendar direto pelo seu link online exclusivo:
            </p>
            <div className="mt-3 bg-black p-2.5 rounded-xl border border-zinc-800 flex items-center justify-between gap-2">
              <span className="text-[11px] font-mono text-amber-300 truncate">
                {typeof window !== 'undefined' && window.location.origin ? `${window.location.origin}/agendar` : 'https://elite96.roviro.com.br/agendar'}
              </span>
              <button
                onClick={() => {
                  const url = typeof window !== 'undefined' && window.location.origin ? `${window.location.origin}/agendar` : 'https://elite96.roviro.com.br/agendar';
                  navigator.clipboard.writeText(url);
                  alert('Link de agendamento exclusivo copiado! Envie no WhatsApp ou cole no Instagram.');
                }}
                className="px-2.5 py-1 bg-amber-500 text-slate-950 text-[10px] font-extrabold rounded-lg hover:bg-amber-400 transition-colors cursor-pointer shrink-0"
              >
                Copiar
              </button>
            </div>
            <button
              onClick={() => {
                setRole('cliente');
                if (typeof window !== 'undefined' && window.history.pushState) {
                  window.history.pushState({}, '', '/agendar');
                }
              }}
              className="w-full mt-3 py-2 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] text-slate-950 font-bold rounded-xl text-xs hover:brightness-110 transition-all cursor-pointer"
            >
              Testar como Cliente 📲
            </button>
          </div>

          {/* Quick Resale Product Sell */}
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-amber-400" />
                <h3 className="font-bold text-sm text-white">Revenda no Balcão</h3>
              </div>
              <button
                onClick={() => setActiveTab('estoque')}
                className="text-[11px] font-semibold text-amber-400 hover:text-amber-300 cursor-pointer"
              >
                Ver todos
              </button>
            </div>
            <p className="text-xs text-zinc-400 mb-3">
              Produtos para oferecer aos clientes na cadeira:
            </p>
            <div className="space-y-2">
              {inventory
                .filter(i => i.type === 'revenda')
                .slice(0, 3)
                .map(prod => (
                  <div
                    key={prod.id}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs"
                  >
                    <div>
                      <p className="font-semibold text-white">{prod.name}</p>
                      <span className="text-[10px] text-zinc-500">
                        {prod.quantity} em estoque
                      </span>
                    </div>
                    <span className="font-bold text-[#f3e5ab]">
                      {formatCurrency(prod.salePrice || 0)}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewAppModalOpen}
        onClose={() => setIsNewAppModalOpen(false)}
      />
      <NewExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
      <CheckoutModal
        appointment={selectedAppForCheckout}
        isOpen={!!selectedAppForCheckout}
        onClose={() => setSelectedAppForCheckout(null)}
      />
    </div>
  );
};
