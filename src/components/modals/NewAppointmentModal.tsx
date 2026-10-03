import React, { useState } from 'react';
import { X, Calendar, Clock, User, Phone, Scissors, DollarSign, MessageSquare } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatCurrency } from '../../utils/formatters';
import { createWhatsAppUrl, generateConfirmationMessage } from '../../utils/whatsapp';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultDate?: string;
  defaultTime?: string;
}

export const NewAppointmentModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultDate,
  defaultTime,
}) => {
  const { services, clients, profile, addAppointment, activeDate, whatsAppConfig } = useApp();

  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [selectedServiceId, setSelectedServiceId] = useState(services[0]?.id || '');
  const [date, setDate] = useState(defaultDate || activeDate);
  const [time, setTime] = useState(defaultTime || '10:00');
  const [notes, setNotes] = useState('');
  const [customPrice, setCustomPrice] = useState<number | ''>('');
  const [openWhatsAppLinkManual, setOpenWhatsAppLinkManual] = useState(!whatsAppConfig.enabled);

  if (!isOpen) return null;

  const currentService = services.find(s => s.id === selectedServiceId) || services[0];
  const finalPrice = customPrice !== '' ? Number(customPrice) : (currentService?.price || 0);

  const handleClientSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = clients.find(c => c.id === e.target.value);
    if (selected) {
      setClientName(selected.name);
      setClientPhone(selected.phone);
      if (selected.notes) setNotes(selected.notes);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim()) {
      alert('Por favor, informe o nome e telefone do cliente.');
      return;
    }

    const newApp = addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      serviceId: currentService.id,
      serviceName: currentService.name,
      date,
      time,
      price: finalPrice,
      status: 'confirmado',
      notes: notes.trim() || undefined,
    });

    if (openWhatsAppLinkManual && clientPhone) {
      const msg = generateConfirmationMessage(newApp, profile.name);
      const url = createWhatsAppUrl(clientPhone, msg);
      window.open(url, '_blank');
    }

    onClose();
  };

  const timeSlots: string[] = [];
  const startHour = parseInt(profile.openingTime.split(':')[0], 10);
  const endHour = parseInt(profile.closingTime.split(':')[0], 10);
  for (let h = startHour; h < endHour; h++) {
    const hourStr = String(h).padStart(2, '0');
    timeSlots.push(`${hourStr}:00`);
    timeSlots.push(`${hourStr}:30`);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Modal Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Calendar className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold text-white">Novo Agendamento</h2>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          {/* Quick client select from existing */}
          {clients.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-zinc-400 mb-1">
                Cliente Cadastrado (Opcional):
              </label>
              <select
                onChange={handleClientSelect}
                defaultValue=""
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-zinc-200 focus:outline-none focus:border-[#d4af37]"
              >
                <option value="">-- Selecione ou digite abaixo --</option>
                {clients.map(c => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone}) - {c.totalVisits} visitas
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Name & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-amber-400" />
                Nome do Cliente *
              </label>
              <input
                type="text"
                required
                value={clientName}
                onChange={e => setClientName(e.target.value)}
                placeholder="Ex: João Victor"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Phone className="w-3.5 h-3.5 text-emerald-400" />
                WhatsApp *
              </label>
              <input
                type="tel"
                required
                value={clientPhone}
                onChange={e => setClientPhone(e.target.value)}
                placeholder="(11) 98765-4321"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <Scissors className="w-3.5 h-3.5 text-amber-400" />
              Serviço Desejado *
            </label>
            <select
              value={selectedServiceId}
              onChange={e => {
                setSelectedServiceId(e.target.value);
                setCustomPrice('');
              }}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
            >
              {services.map(s => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.durationMinutes} min) - {formatCurrency(s.price)}
                </option>
              ))}
            </select>
          </div>

          {/* Date & Time */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
                Data *
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-amber-400" />
                Horário *
              </label>
              <select
                value={time}
                onChange={e => setTime(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              >
                {timeSlots.map(slot => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Custom Price & Notes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                Valor (R$)
              </label>
              <input
                type="number"
                step="0.5"
                placeholder={String(currentService?.price || 0)}
                value={customPrice}
                onChange={e => setCustomPrice(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Observações
              </label>
              <input
                type="text"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                placeholder="Ex: navalhado na lateral"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* WhatsApp option */}
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer select-none bg-zinc-900 p-3 rounded-2xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={openWhatsAppLinkManual}
                onChange={e => setOpenWhatsAppLinkManual(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700 focus:ring-amber-500"
              />
              <div className="text-xs text-zinc-300">
                <span className="font-semibold text-white flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                  Abrir WhatsApp para enviar confirmação agora
                </span>
                <span className="text-zinc-500 block text-[11px]">
                  {whatsAppConfig.enabled
                    ? 'A mensagem automática também será enviada em segundo plano pela API!'
                    : 'Abre a conversa do WhatsApp com a mensagem formatada pronta.'}
                </span>
              </div>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-zinc-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-xl shadow-lg shadow-amber-500/20 text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Calendar className="w-4 h-4" />
              Agendar Horário
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
