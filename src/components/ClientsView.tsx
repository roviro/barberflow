import React, { useState } from 'react';
import { Users, Search, Phone, MessageSquare, Plus } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateBR, formatPhone } from '../utils/formatters';
import { createWhatsAppUrl } from '../utils/whatsapp';

export const ClientsView: React.FC = () => {
  const { clients, addOrUpdateClient } = useApp();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const filteredClients = clients.filter(
    c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm)
  );

  const handleAddClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim() || !newPhone.trim()) return;
    addOrUpdateClient({
      name: newName.trim(),
      phone: newPhone.trim(),
      notes: newNotes.trim() || undefined,
    });
    setNewName('');
    setNewPhone('');
    setNewNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header & Search */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-[#f3e5ab]" />
              Base de Clientes & Fidelidade
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Histórico, frequência de visitas e preferências de cada cliente.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Cliente</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="mt-4 relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar cliente por nome ou telefone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs sm:text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-[#d4af37]"
          />
        </div>
      </div>

      {/* Clients Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h3 className="font-bold text-base text-white">{client.name}</h3>
                  <p className="text-xs text-zinc-400 flex items-center gap-1 mt-0.5 font-mono">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {formatPhone(client.phone)}
                  </p>
                </div>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#d4af37]/10 text-[#f3e5ab] border border-[#d4af37]/30">
                  {client.totalVisits} {client.totalVisits === 1 ? 'visita' : 'visitas'}
                </span>
              </div>

              {client.notes && (
                <div className="mt-3 p-2.5 rounded-xl bg-zinc-900 border border-zinc-850 text-xs text-amber-300/90 italic">
                  "{client.notes}"
                </div>
              )}

              <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-850 text-xs">
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Última Visita</span>
                  <span className="font-medium text-zinc-200">
                    {client.lastVisit ? formatDateBR(client.lastVisit) : 'Hoje'}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-zinc-500 block uppercase">Total Investido</span>
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(client.totalSpent)}
                  </span>
                </div>
              </div>
            </div>

            {/* Direct WhatsApp Call */}
            <div className="mt-4 pt-3 border-t border-zinc-850">
              <button
                onClick={() => {
                  const msg = `Fala, ${client.name}! Beleza? 💈 Passando para saber quando vamos dar aquele talento no corte na Elite 96! Bora agendar?`;
                  const url = createWhatsAppUrl(client.phone, msg);
                  window.open(url, '_blank');
                }}
                className="w-full py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <MessageSquare className="w-3.5 h-3.5" />
                <span>Chamar no WhatsApp</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Client Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-400" />
              Novo Cliente
            </h3>

            <form onSubmit={handleAddClient} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Cliente *
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Ex: Matheus Oliveira"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  WhatsApp com DDD *
                </label>
                <input
                  type="tel"
                  required
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="(11) 98888-7777"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Preferências / Notas de Corte
                </label>
                <input
                  type="text"
                  value={newNotes}
                  onChange={e => setNewNotes(e.target.value)}
                  placeholder="Ex: corte na tesoura, degradê na 1"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-850">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-gradient-to-r from-[#c59b27] to-[#e5c558] hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
