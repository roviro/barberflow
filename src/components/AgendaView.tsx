import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  MessageCircle,
  CheckCircle,
  Play,
  Trash2,
  Share2,
  Copy,
  Scissors,
  Download,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  formatCurrency,
  formatDateBR,
  getDayOfWeekName,
  getTodayString,
} from '../utils/formatters';
import {
  createWhatsAppUrl,
  generateReminderMessage,
  generateStatusAnnouncement,
} from '../utils/whatsapp';
import { exportAppointmentsToCSV } from '../utils/export';
import { NewAppointmentModal } from './modals/NewAppointmentModal';
import { CheckoutModal } from './modals/CheckoutModal';
import type { Appointment } from '../types';

export const AgendaView: React.FC = () => {
  const {
    profile,
    appointments,
    activeDate,
    setActiveDate,
    updateAppointmentStatus,
    deleteAppointment,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('todos');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [selectedSlotForNew, setSelectedSlotForNew] = useState<string | undefined>();
  const [checkoutApp, setCheckoutApp] = useState<Appointment | null>(null);
  const [showStatusGenerator, setShowStatusGenerator] = useState(false);
  const [copiedStatus, setCopiedStatus] = useState(false);

  const today = getTodayString();

  // Date Navigation
  const changeDateByDays = (days: number) => {
    const [y, m, d] = activeDate.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);
    dateObj.setDate(dateObj.getDate() + days);
    const year = dateObj.getFullYear();
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const day = String(dateObj.getDate()).padStart(2, '0');
    setActiveDate(`${year}-${month}-${day}`);
  };

  // Generate day time slots based on opening & closing time
  const startHour = parseInt(profile.openingTime.split(':')[0], 10);
  const endHour = parseInt(profile.closingTime.split(':')[0], 10);
  const allDaySlots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    const hh = String(h).padStart(2, '0');
    allDaySlots.push(`${hh}:00`);
    allDaySlots.push(`${hh}:30`);
  }

  // Filter appointments for the selected date
  const dayAppointments = appointments.filter(a => a.date === activeDate);

  const filteredAppointments = dayAppointments.filter(a => {
    if (statusFilter === 'todos') return true;
    return a.status === statusFilter;
  });

  // Calculate free slots for status announcement
  const occupiedTimes = dayAppointments
    .filter(a => a.status !== 'cancelado')
    .map(a => a.time);
  const freeSlots = allDaySlots.filter(s => !occupiedTimes.includes(s));

  const bookingPublicUrl = typeof window !== 'undefined' && window.location.origin ? `${window.location.origin}` : 'https://elite96.roviro.com.br';
  const statusAnnouncementText = generateStatusAnnouncement(
    profile.name,
    activeDate,
    freeSlots,
    bookingPublicUrl
  );

  const handleCopyStatus = () => {
    navigator.clipboard.writeText(statusAnnouncementText);
    setCopiedStatus(true);
    setTimeout(() => setCopiedStatus(false), 3000);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Controls: Date Selector & Actions */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 sm:p-5 shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Date Picker & Nav */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            <div className="flex items-center bg-zinc-900 rounded-xl p-1 border border-zinc-800">
              <button
                onClick={() => changeDateByDays(-1)}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                title="Dia anterior"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              
              <button
                onClick={() => setActiveDate(today)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors cursor-pointer ${
                  activeDate === today
                    ? 'bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950 font-extrabold'
                    : 'text-zinc-300 hover:text-white'
                }`}
              >
                Hoje
              </button>

              <button
                onClick={() => changeDateByDays(1)}
                className="p-1.5 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                title="Próximo dia"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="date"
                value={activeDate}
                onChange={e => setActiveDate(e.target.value)}
                className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
              <span className="text-xs sm:text-sm font-semibold text-[#f3e5ab]">
                {getDayOfWeekName(activeDate)}, {formatDateBR(activeDate)}
              </span>
            </div>
          </div>

          {/* Quick Buttons */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* WhatsApp Status Generator Toggle */}
            <button
              onClick={() => setShowStatusGenerator(!showStatusGenerator)}
              className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 cursor-pointer ${
                showStatusGenerator
                  ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                  : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
              }`}
            >
              <Share2 className="w-4 h-4" />
              <span>Gerar Status WhatsApp</span>
            </button>

            {/* Export CSV */}
            <button
              onClick={() => exportAppointmentsToCSV(appointments)}
              className="p-2 text-zinc-400 hover:text-white hover:bg-zinc-900 rounded-xl border border-zinc-800 transition-colors cursor-pointer"
              title="Exportar agendamentos para Excel"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* New Appointment Button */}
            <button
              onClick={() => {
                setSelectedSlotForNew(undefined);
                setIsNewModalOpen(true);
              }}
              className="px-4 py-2 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 text-xs sm:text-sm flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agendar</span>
            </button>
          </div>
        </div>

        {/* Retractable WhatsApp Status Announcement Generator */}
        {showStatusGenerator && (
          <div className="mt-4 pt-4 border-t border-zinc-800 bg-black/60 rounded-xl p-4 border border-zinc-850">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <MessageCircle className="w-4 h-4" />
                Texto Formatado para o Status do WhatsApp ({freeSlots.length} horários livres para {formatDateBR(activeDate)})
              </span>
              <button
                onClick={handleCopyStatus}
                className="px-3 py-1 bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-lg hover:bg-emerald-400 flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                {copiedStatus ? 'Copiado!' : 'Copiar Texto'}
              </button>
            </div>
            <pre className="text-xs font-mono bg-zinc-900 p-3 rounded-lg text-zinc-300 border border-zinc-800 whitespace-pre-wrap max-h-48 overflow-y-auto">
              {statusAnnouncementText}
            </pre>
            <p className="text-[11px] text-zinc-400 mt-2">
              💡 <strong>Dica:</strong> Cole esse texto diretamente no seu status do WhatsApp. Seus clientes podem clicar no link para agendar sozinhos sem você precisar responder um a um!
            </p>
          </div>
        )}

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 mt-4 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'todos', label: 'Todos' },
            { id: 'confirmado', label: 'Confirmados' },
            { id: 'em_atendimento', label: 'Na Cadeira' },
            { id: 'pendente', label: 'Pendentes' },
            { id: 'concluido', label: 'Concluídos' },
            { id: 'cancelado', label: 'Cancelados' },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setStatusFilter(f.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === f.id
                  ? 'bg-zinc-800 text-white font-bold border border-zinc-700'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Appointments List for the Date */}
      <div className="space-y-3">
        {filteredAppointments.length === 0 ? (
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-12 text-center text-zinc-400">
            <Clock className="w-12 h-12 mx-auto mb-3 opacity-30 text-[#d4af37]" />
            <h3 className="text-base font-bold text-white mb-1">
              Nenhum agendamento neste dia
            </h3>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto mb-4">
              Todos os horários estão vagos para {formatDateBR(activeDate)}.
            </p>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#c59b27] to-[#e5c558] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs inline-flex items-center gap-1.5 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Marcar Horário
            </button>
          </div>
        ) : (
          filteredAppointments
            .sort((a, b) => a.time.localeCompare(b.time))
            .map(app => {
              const isCompleted = app.status === 'concluido';
              const isUnderway = app.status === 'em_atendimento';
              const isCanceled = app.status === 'cancelado';

              return (
                <div
                  key={app.id}
                  className={`bg-zinc-950 border rounded-2xl p-4 sm:p-5 transition-all shadow-lg ${
                    isCompleted
                      ? 'border-zinc-850 bg-zinc-950/50 opacity-75'
                      : isUnderway
                      ? 'border-[#d4af37]/60 bg-[#d4af37]/10 ring-1 ring-[#d4af37]/30'
                      : isCanceled
                      ? 'border-rose-900/30 bg-rose-950/10 opacity-50'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    
                    {/* Left details */}
                    <div className="flex items-start gap-3.5">
                      <div className="text-center min-w-[56px] p-2.5 rounded-xl bg-black border border-zinc-800">
                        <span className="text-base font-black text-[#f3e5ab] block">
                          {app.time}
                        </span>
                        <span className="text-[9px] text-zinc-500 font-bold block uppercase tracking-wider">
                          Horário
                        </span>
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-extrabold text-base text-white">
                            {app.clientName}
                          </h4>
                          <span className="text-xs text-zinc-400 font-mono">
                            {app.clientPhone}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isCompleted
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                : isUnderway
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 animate-pulse'
                                : isCanceled
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                                : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                            }`}
                          >
                            {app.status === 'em_atendimento' ? 'Na Cadeira' : app.status}
                          </span>
                        </div>

                        <div className="flex items-center gap-3 text-xs text-zinc-400">
                          <span className="flex items-center gap-1 text-zinc-300 font-medium">
                            <Scissors className="w-3.5 h-3.5 text-amber-400" />
                            {app.serviceName}
                          </span>
                          <span>•</span>
                          <span className="text-emerald-400 font-bold">
                            {formatCurrency(app.price)}
                          </span>
                          {app.paymentMethod && (
                            <>
                              <span>•</span>
                              <span className="text-zinc-500 uppercase text-[10px]">
                                Pago via {app.paymentMethod}
                              </span>
                            </>
                          )}
                        </div>

                        {app.notes && (
                          <p className="text-xs text-amber-300/80 italic">
                            Obs: {app.notes}
                          </p>
                        )}

                        {app.productsAdded && app.productsAdded.length > 0 && (
                          <div className="text-[11px] text-zinc-400 pt-1">
                            Produtos levados:{' '}
                            {app.productsAdded.map(p => `${p.quantity}x ${p.name}`).join(', ')}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right action buttons */}
                    <div className="flex items-center gap-2 flex-wrap self-end sm:self-center">
                      {!isCompleted && !isCanceled && (
                        <>
                          {/* WhatsApp Reminder Button */}
                          <button
                            onClick={() => {
                              const msg = generateReminderMessage(app, profile.name);
                              const url = createWhatsAppUrl(app.clientPhone, msg);
                              window.open(url, '_blank');
                            }}
                            className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                            title="Enviar lembrete no WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                            <span className="hidden sm:inline">Lembrar</span>
                          </button>

                          {/* Underway status toggle */}
                          {!isUnderway && (
                            <button
                              onClick={() => updateAppointmentStatus(app.id, 'em_atendimento')}
                              className="p-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                              title="Iniciar atendimento (sentou na cadeira)"
                            >
                              <Play className="w-4 h-4" />
                              <span className="hidden sm:inline">Na Cadeira</span>
                            </button>
                          )}

                          {/* Finish & Checkout Button */}
                          <button
                            onClick={() => setCheckoutApp(app)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
                          >
                            <CheckCircle className="w-4 h-4" />
                            <span>Cobrar</span>
                          </button>
                        </>
                      )}

                      {/* Delete / Cancel button */}
                      <button
                        onClick={() => {
                          if (confirm(`Deseja excluir o agendamento de ${app.clientName}?`)) {
                            deleteAppointment(app.id);
                          }
                        }}
                        className="p-2 text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 rounded-xl transition-colors cursor-pointer"
                        title="Excluir agendamento"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
        )}
      </div>

      {/* Modals */}
      <NewAppointmentModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        defaultDate={activeDate}
        defaultTime={selectedSlotForNew}
      />
      <CheckoutModal
        appointment={checkoutApp}
        isOpen={!!checkoutApp}
        onClose={() => setCheckoutApp(null)}
      />
    </div>
  );
};
