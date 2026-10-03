import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  Scissors,
  User,
  CheckCircle,
  Share2,
  Copy,
  MapPin,
  ArrowRight,
  MessageCircle,
  Sparkles,
  Tag,
  Check,
  Lock,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateBR, getTodayString } from '../utils/formatters';
import { createWhatsAppUrl } from '../utils/whatsapp';

export const ClientBookingView: React.FC = () => {
  const {
    profile,
    services,
    appointments,
    addAppointment,
    subscriptionPlans,
    whatsAppConfig,
    currentRole,
    setRole,
  } = useApp();

  const today = getTodayString();

  const [activeTab, setActiveTab] = useState<'agendar' | 'precos' | 'planos' | 'limpeza'>('agendar');
  const [selectedServiceId, setSelectedServiceId] = useState<string>(services[0]?.id || '');
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [clientName, setClientName] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientNotes, setClientNotes] = useState('');
  const [bookingConfirmed, setBookingConfirmed] = useState(false);
  const [createdAppointmentData, setCreatedAppointmentData] = useState<any>(null);
  const [copiedLink, setCopiedLink] = useState(false);

  const selectedService = services.find(s => s.id === selectedServiceId) || services[0];

  // Calculate free time slots for the selected date
  const startHour = parseInt(profile.openingTime.split(':')[0], 10) || 8;
  const endHour = parseInt(profile.closingTime.split(':')[0], 10) || 20;
  const allSlots: string[] = [];
  for (let h = startHour; h < endHour; h++) {
    const hh = String(h).padStart(2, '0');
    allSlots.push(`${hh}:00`);
    allSlots.push(`${hh}:30`);
  }

  // Occupied slots on selectedDate
  const occupiedSlots = appointments
    .filter(a => a.date === selectedDate && a.status !== 'cancelado')
    .map(a => a.time);

  const availableSlots = allSlots.filter(s => !occupiedSlots.includes(s));

  const bookingPublicUrl = typeof window !== 'undefined' && window.location.origin
    ? `${window.location.origin}/agendar`
    : 'https://elite96.roviro.com.br/agendar';

  const handleCopyLink = () => {
    navigator.clipboard.writeText(bookingPublicUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 3000);
  };

  const handleBook = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientName.trim() || !clientPhone.trim() || !selectedTime) {
      alert('Por favor, selecione um horário e preencha seu nome e WhatsApp.');
      return;
    }

    const newApp = addAppointment({
      clientName: clientName.trim(),
      clientPhone: clientPhone.trim(),
      serviceId: selectedService.id,
      serviceName: selectedService.name,
      date: selectedDate,
      time: selectedTime,
      price: selectedService.price,
      status: 'confirmado',
      notes: clientNotes.trim() || undefined,
    });

    setCreatedAppointmentData(newApp);
    setBookingConfirmed(true);
  };

  const handleNotifyBarberOnWhatsApp = () => {
    if (!createdAppointmentData) return;
    const msg = `Olá, vim pelo link da *${profile.name}*! 💈✂️\n\nAcabei de agendar meu horário:\n🗓️ *Data:* ${formatDateBR(createdAppointmentData.date)}\n⏰ *Horário:* ${createdAppointmentData.time}\n✂️ *Serviço:* ${createdAppointmentData.serviceName}\n💰 *Valor:* ${formatCurrency(createdAppointmentData.price)}\n👤 *Nome:* ${createdAppointmentData.clientName}\n\nAté lá! 👊`;
    const url = createWhatsAppUrl(profile.phone, msg);
    window.open(url, '_blank');
  };

  const handleSubscribePlanWhatsApp = (plan: any) => {
    const msg = `Fala, equipe da *${profile.name}*! Beleza? 💈\n\nQuero assinar o *${plan.name}* (${plan.cutsCount} cortes por ${formatCurrency(plan.price)}).\nComo faço para ativar minha assinatura?`;
    const url = createWhatsAppUrl(profile.phone, msg);
    window.open(url, '_blank');
  };

  // Group services by category for price table
  const categories = Array.from(new Set(services.map(s => s.category)));

  return (
    <div className="max-w-3xl mx-auto space-y-6 pb-24 md:pb-12">
      
      {/* If logged in as admin/tech, display a quick banner with the customer's exclusive URL */}
      {currentRole && currentRole !== 'cliente' && (
        <div className="bg-gradient-to-r from-zinc-900 to-black border border-[#d4af37]/40 rounded-2xl p-4 sm:p-5 shadow-lg">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/30 shrink-0">
                <Share2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Link Exclusivo do Cliente (Sem acesso administrativo)
                </h3>
                <p className="text-xs text-zinc-300 mt-0.5">
                  Copie e cole este link na sua bio do Instagram e WhatsApp para os clientes agendarem:
                </p>
                <code className="text-xs text-[#f3e5ab] font-mono mt-1 block">
                  {bookingPublicUrl}
                </code>
              </div>
            </div>
            <button
              onClick={handleCopyLink}
              className="px-4 py-2 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] text-slate-950 font-extrabold text-xs rounded-xl hover:opacity-90 flex items-center justify-center gap-1.5 transition-all shrink-0 shadow-md shadow-amber-500/20 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              {copiedLink ? 'Link Copiado!' : 'Copiar Link'}
            </button>
          </div>
        </div>
      )}

      {/* Main Client Portal Box */}
      <div className="bg-[#121215] border border-[#27272a] rounded-3xl overflow-hidden shadow-2xl">
        
        {/* Elite 96 Luxury Black & Gold Header */}
        <div className="bg-gradient-to-b from-black via-zinc-950 to-[#121215] p-6 sm:p-8 text-center relative overflow-hidden border-b border-zinc-800">
          <div className="w-20 h-20 sm:w-24 sm:h-24 mx-auto mb-3 rounded-3xl bg-black border-2 border-[#d4af37] p-1 shadow-xl shadow-amber-500/10 overflow-hidden flex items-center justify-center">
            <img
              src="/logo-elite96.png"
              alt="Elite 96 Logo"
              className="w-full h-full object-cover scale-110"
              onError={(e) => {
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#dfc15d] via-[#f3e5ab] to-[#c59b27]">
            ELITE 96
          </h1>
          <p className="text-xs uppercase font-extrabold tracking-widest text-[#f3e5ab] mt-0.5">
            BARBEARIA
          </p>
          <p className="text-xs text-zinc-400 mt-2 flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#d4af37]" />
            {profile.address}
          </p>
          <div className="mt-3 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#18181b] border border-zinc-800 text-amber-300 text-xs font-semibold">
            <Clock className="w-3.5 h-3.5 text-[#d4af37]" />
            <span>Atendimento: {profile.openingTime} às {profile.closingTime}</span>
          </div>
        </div>

        {/* Customer Navigation Tabs Bar - Responsive 2x2 grid on mobile, 4-col on desktop */}
        <div className="bg-[#18181b]/80 border-b border-zinc-800 p-3 sm:p-4">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5 max-w-2xl mx-auto">
            {[
              { id: 'agendar', label: 'Agendar Horário', icon: Calendar },
              { id: 'precos', label: 'Tabela de Preços', icon: Tag },
              { id: 'planos', label: 'Planos de Assinatura', icon: Sparkles },
              { id: 'limpeza', label: 'Limpeza de Pele', icon: Scissors },
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`py-2.5 px-2 sm:px-3 rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-all text-center cursor-pointer ${
                    isActive
                      ? 'bg-gradient-to-r from-[#c59b27] via-[#f3e5ab] to-[#c59b27] text-slate-950 font-black shadow-lg shadow-amber-500/20'
                      : 'bg-[#121215] text-zinc-400 hover:text-white hover:bg-zinc-850 border border-zinc-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 shrink-0" />
                  <span className="truncate">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* TAB 1: BOOKING FLOW */}
        {activeTab === 'agendar' && (
          <div className="p-6 sm:p-8">
            {bookingConfirmed && createdAppointmentData ? (
              <div className="text-center py-8 space-y-5 animate-in fade-in zoom-in duration-300">
                <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto">
                  <CheckCircle className="w-8 h-8" />
                </div>

                <div>
                  <h2 className="text-2xl font-black text-white">Horário Confirmado! 🎉</h2>
                  <p className="text-xs sm:text-sm text-zinc-400 mt-1">
                    Te esperamos na <strong className="text-[#f3e5ab]">{profile.name}</strong>!
                  </p>
                </div>

                <div className="bg-[#18181b] border border-zinc-800 rounded-2xl p-5 text-left max-w-md mx-auto space-y-3">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs text-zinc-400">Cliente</span>
                    <span className="text-sm font-bold text-white">{createdAppointmentData.clientName}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs text-zinc-400">Data</span>
                    <span className="text-sm font-bold text-[#f3e5ab]">{formatDateBR(createdAppointmentData.date)}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs text-zinc-400">Horário Marcado</span>
                    <span className="text-sm font-black text-white">{createdAppointmentData.time}</span>
                  </div>
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <span className="text-xs text-zinc-400">Serviço</span>
                    <span className="text-sm font-bold text-white">{createdAppointmentData.serviceName}</span>
                  </div>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-xs text-zinc-400">Valor Estimado</span>
                    <span className="text-base font-black text-emerald-400">
                      {formatCurrency(createdAppointmentData.price)}
                    </span>
                  </div>
                </div>

                {whatsAppConfig.enabled ? (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs max-w-md mx-auto flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 shrink-0" />
                    <span>Disparamos a confirmação diretamente para o seu WhatsApp!</span>
                  </div>
                ) : null}

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <button
                    onClick={handleNotifyBarberOnWhatsApp}
                    className="w-full sm:w-auto px-6 py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Abrir Conversa no WhatsApp</span>
                  </button>

                  <button
                    onClick={() => {
                      setBookingConfirmed(false);
                      setCreatedAppointmentData(null);
                      setSelectedTime('');
                      setClientName('');
                      setClientPhone('');
                      setClientNotes('');
                    }}
                    className="w-full sm:w-auto px-5 py-3 text-xs text-zinc-400 hover:text-white"
                  >
                    Agendar Outro Horário
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleBook} className="space-y-6">
                
                {/* Step 1: Select Service */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#f3e5ab] mb-3 flex items-center gap-1.5">
                    <Scissors className="w-4 h-4" />
                    1. Escolha o Serviço ou Corte
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
                    {services.map(srv => {
                      const isSelected = selectedServiceId === srv.id;
                      return (
                        <div
                          key={srv.id}
                          onClick={() => setSelectedServiceId(srv.id)}
                          className={`p-3.5 rounded-2xl border cursor-pointer transition-all flex items-start justify-between gap-3 ${
                            isSelected
                              ? 'bg-gradient-to-r from-amber-500/15 to-[#d4af37]/20 border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-md'
                              : 'bg-[#18181b] border-zinc-800 hover:border-zinc-700'
                          }`}
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white">{srv.name}</span>
                              {srv.popular && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950">
                                  Top
                                </span>
                              )}
                            </div>
                            <p className="text-[11px] text-zinc-400 line-clamp-1">{srv.description}</p>
                            <span className="text-[11px] text-zinc-500 flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {srv.durationMinutes} minutos
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-sm font-black text-[#f3e5ab] block">
                              {formatCurrency(srv.price)}
                            </span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Step 2: Select Date */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#f3e5ab] mb-2 flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    2. Escolha o Dia
                  </label>
                  <input
                    type="date"
                    min={today}
                    value={selectedDate}
                    onChange={e => {
                      setSelectedDate(e.target.value);
                      setSelectedTime('');
                    }}
                    className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                {/* Step 3: Select Available Time Slot */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold uppercase tracking-wider text-[#f3e5ab] flex items-center gap-1.5">
                      <Clock className="w-4 h-4" />
                      3. Escolha o Horário Livre
                    </label>
                    <span className="text-[11px] text-zinc-400">
                      {availableSlots.length} horários vagos hoje
                    </span>
                  </div>

                  {availableSlots.length === 0 ? (
                    <div className="bg-[#18181b] border border-zinc-800 rounded-xl p-4 text-center text-xs text-zinc-400">
                      Nenhum horário livre restante para esta data. Por favor escolha outro dia!
                    </div>
                  ) : (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2">
                      {availableSlots.map(slot => {
                        const isSelected = selectedTime === slot;
                        return (
                          <button
                            key={slot}
                            type="button"
                            onClick={() => setSelectedTime(slot)}
                            className={`py-2 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] text-slate-950 shadow-md shadow-amber-500/20 ring-2 ring-white scale-105'
                                : 'bg-[#18181b] border border-zinc-800 text-zinc-300 hover:border-zinc-700 hover:text-white'
                            }`}
                          >
                            {slot}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Step 4: Client Info */}
                <div className="space-y-3 pt-2 border-t border-zinc-800">
                  <label className="block text-xs font-bold uppercase tracking-wider text-[#f3e5ab] flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    4. Seus Dados de Contato
                  </label>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <input
                        type="text"
                        required
                        placeholder="Seu Nome Completo *"
                        value={clientName}
                        onChange={e => setClientName(e.target.value)}
                        className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                    <div>
                      <input
                        type="tel"
                        required
                        placeholder="Seu WhatsApp com DDD *"
                        value={clientPhone}
                        onChange={e => setClientPhone(e.target.value)}
                        className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                      />
                    </div>
                  </div>

                  <div>
                    <input
                      type="text"
                      placeholder="Alguma observação especial? (ex: degradê navalhado, risco na sobrancelha)"
                      value={clientNotes}
                      onChange={e => setClientNotes(e.target.value)}
                      className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                    />
                  </div>
                </div>

                {/* Confirm Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!selectedTime}
                    className="w-full py-4 bg-gradient-to-r from-[#c59b27] via-[#f3e5ab] to-[#c59b27] hover:brightness-110 disabled:opacity-40 text-slate-950 font-black rounded-2xl shadow-xl shadow-amber-500/20 text-base flex items-center justify-center gap-2 transition-all cursor-pointer"
                  >
                    <span>Confirmar Meu Agendamento</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  <p className="text-center text-[11px] text-zinc-500 mt-2">
                    🔒 Agendamento garantido diretamente na bancada da Barbearia Elite 96.
                  </p>
                </div>
              </form>
            )}
          </div>
        )}

        {/* TAB 2: COMPLETE PRICE TABLE */}
        {activeTab === 'precos' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-1">
              <h2 className="text-xl sm:text-2xl font-black text-white">Tabela Oficial de Preços</h2>
              <p className="text-xs text-zinc-400">Valores e serviços praticados na Barbearia Elite 96</p>
            </div>

            <div className="space-y-6">
              {categories.map(cat => (
                <div key={cat} className="space-y-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black uppercase tracking-wider text-[#f3e5ab] bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/30">
                      {cat}
                    </span>
                    <div className="flex-1 h-px bg-zinc-800" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {services
                      .filter(s => s.category === cat)
                      .map(s => (
                        <div
                          key={s.id}
                          className="bg-[#18181b] border border-zinc-800/80 rounded-2xl p-4 flex items-center justify-between gap-3 hover:border-zinc-700 transition-all"
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <h4 className="font-bold text-sm text-white">{s.name}</h4>
                              {s.popular && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950">
                                  Top
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-zinc-400 line-clamp-1 mt-0.5">{s.description}</p>
                            <span className="text-[10px] text-zinc-500 flex items-center gap-1 mt-1">
                              <Clock className="w-3 h-3" /> {s.durationMinutes} min
                            </span>
                          </div>

                          <div className="text-right shrink-0">
                            <span className="text-base font-black text-[#f3e5ab]">
                              {formatCurrency(s.price)}
                            </span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-4 text-center">
              <button
                type="button"
                onClick={() => setActiveTab('agendar')}
                className="px-6 py-3 bg-gradient-to-r from-[#c59b27] via-[#f3e5ab] to-[#c59b27] text-slate-950 font-black rounded-xl text-xs sm:text-sm hover:brightness-110 shadow-lg shadow-amber-500/20 cursor-pointer"
              >
                Gostou? Agende Seu Horário Agora 💈
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: SUBSCRIPTION PLANS */}
        {activeTab === 'planos' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#f3e5ab] bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/30 inline-block">
                Economia & Praticidade
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Planos de Assinatura Elite 96</h2>
              <p className="text-xs text-zinc-400 max-w-md mx-auto">
                Corte o cabelo com frequência garantida pagando muito menos por mês!
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {subscriptionPlans.map(plan => (
                <div
                  key={plan.id}
                  className={`bg-[#18181b] rounded-3xl p-6 border flex flex-col justify-between relative transition-all ${
                    plan.popular
                      ? 'border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-xl shadow-amber-500/10 scale-102'
                      : 'border-zinc-800 hover:border-zinc-700'
                  }`}
                >
                  {plan.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 text-[10px] font-black uppercase px-3 py-0.5 rounded-full bg-gradient-to-r from-[#c59b27] via-[#f3e5ab] to-[#c59b27] text-slate-950 shadow-md">
                      Mais Escolhido
                    </span>
                  )}

                  <div>
                    <h3 className="font-black text-lg text-white">{plan.name}</h3>
                    <p className="text-xs text-[#f3e5ab] font-bold mt-0.5">{plan.frequency}</p>

                    <div className="my-5 p-4 rounded-2xl bg-black border border-zinc-800 text-center">
                      <span className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-[#dfc15d] via-[#f3e5ab] to-[#c59b27]">
                        {formatCurrency(plan.price)}
                      </span>
                      <span className="text-xs text-zinc-500 block mt-0.5">/ mês</span>
                    </div>

                    <ul className="space-y-2 text-xs text-zinc-300">
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span><strong>{plan.cutsCount} Cortes</strong> no mês</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Sem fila de espera</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                        <span>Degradê e acabamento premium</span>
                      </li>
                    </ul>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleSubscribePlanWhatsApp(plan)}
                    className="w-full mt-6 py-3 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-xl text-xs shadow-md shadow-amber-500/20 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Quero Este Plano</span>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: LIMPEZA DE PELE PROTOCOLO */}
        {activeTab === 'limpeza' && (
          <div className="p-6 sm:p-8 space-y-6">
            <div className="text-center space-y-2">
              <span className="text-xs font-black uppercase tracking-widest text-[#f3e5ab] bg-[#d4af37]/10 px-3 py-1 rounded-full border border-[#d4af37]/30 inline-block">
                Sua Pele Merece Esse Cuidado
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white">Limpeza de Pele Profissional</h2>
              <p className="text-xs sm:text-sm text-zinc-400 max-w-lg mx-auto">
                Pele limpa, leve e saudável. Utilizamos produtos de alta qualidade para remover impurezas, controlar a oleosidade e devolver o brilho natural da sua pele.
              </p>
            </div>

            {/* 4 Protocol Steps */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#f3e5ab]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] flex items-center justify-center border border-[#d4af37]/40 text-xs">
                    1
                  </span>
                  <span>LIMPEZA PROFUNDA</span>
                </div>
                <h4 className="font-bold text-white text-sm">Mousse de Limpeza Lovely Ice</h4>
                <p className="text-xs text-zinc-400">
                  Limpa profundamente os poros, remove impurezas acumuladas e controla a oleosidade excessiva sem ressecar o rosto.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#f3e5ab]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] flex items-center justify-center border border-[#d4af37]/40 text-xs">
                    2
                  </span>
                  <span>DESINTOXICAÇÃO</span>
                </div>
                <h4 className="font-bold text-white text-sm">Máscara Black Classe A com Argila</h4>
                <p className="text-xs text-zinc-400">
                  Fórmula enriquecida com argila preta que auxilia na remoção de cravos, toxinas e células mortas, deixando a pele renovada.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#f3e5ab]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] flex items-center justify-center border border-[#d4af37]/40 text-xs">
                    3
                  </span>
                  <span>ESFOLIAÇÃO SUAVE</span>
                </div>
                <h4 className="font-bold text-white text-sm">Esfoliador Facial Classe A</h4>
                <p className="text-xs text-zinc-400">
                  Desobstrui os poros com microesferas esfoliantes enriquecidas com Vitamina E, preparando o tecido para receber nutrientes.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#18181b] border border-zinc-800 space-y-2">
                <div className="flex items-center gap-2 text-xs font-black text-[#f3e5ab]">
                  <span className="w-6 h-6 rounded-full bg-[#d4af37]/20 text-[#f3e5ab] flex items-center justify-center border border-[#d4af37]/40 text-xs">
                    4
                  </span>
                  <span>NUTRIÇÃO & REVITALIZAÇÃO</span>
                </div>
                <h4 className="font-bold text-white text-sm">Máscara Facial Vitamina C Mello Verde</h4>
                <p className="text-xs text-zinc-400">
                  Rica em Vitamina C ativa com filtro solar, ilumina a pele, hidrata profundamente e traz viço imediato logo na 1ª sessão.
                </p>
              </div>
            </div>

            {/* Special Gift Banner */}
            <div className="bg-gradient-to-r from-amber-500/15 via-[#d4af37]/20 to-amber-500/15 border border-[#d4af37]/40 rounded-2xl p-4 flex items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#f3e5ab]">
                  🎁 Brinde Exclusivo da Sessão
                </span>
                <p className="text-sm font-bold text-white mt-0.5">Argila Branca Facial em Pó</p>
                <p className="text-xs text-zinc-300">Potencializa a cicatrização e uniformiza o tom da pele.</p>
              </div>
              <span className="text-xl font-black text-[#f3e5ab] shrink-0">R$ 50,00</span>
            </div>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => {
                  const srv = services.find(s => s.name.toLowerCase().includes('limpeza'));
                  if (srv) setSelectedServiceId(srv.id);
                  setActiveTab('agendar');
                }}
                className="px-6 py-3.5 bg-gradient-to-r from-[#c59b27] via-[#f3e5ab] to-[#c59b27] text-slate-950 font-black rounded-xl text-xs sm:text-sm hover:brightness-110 shadow-xl shadow-amber-500/20 cursor-pointer"
              >
                Agendar Minha Limpeza de Pele (R$ 50) 💆‍♂️
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Discreet Team / Barber Login Link in Footer */}
      <div className="text-center pt-4">
        <button
          type="button"
          onClick={() => {
            setRole(null);
            if (typeof window !== 'undefined' && window.history.pushState) {
              window.history.pushState({}, '', '/');
            }
          }}
          className="text-xs text-zinc-600 hover:text-zinc-400 flex items-center justify-center gap-1.5 mx-auto transition-colors cursor-pointer"
        >
          <Lock className="w-3 h-3" />
          <span>Área Restrita da Equipe / Barbeiro</span>
        </button>
      </div>
    </div>
  );
};
