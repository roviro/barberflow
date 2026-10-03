import React, { useState } from 'react';
import { Scissors, Clock, Plus, Trash2, Check } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';

export const ServicesView: React.FC = () => {
  const {
    services,
    addService,
    deleteService,
    subscriptionPlans,
    deleteSubscriptionPlan,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('todos');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number | ''>(45);
  const [duration, setDuration] = useState<number | ''>(30);
  const [category, setCategory] = useState('Cortes');
  const [description, setDescription] = useState('');
  const [popular, setPopular] = useState(false);

  const categories = ['todos', 'Cortes', 'Penteados c/ Corte', 'Serviços Adicionais', 'Químicas', 'planos'];

  const filteredServices = activeCategory === 'todos'
    ? services
    : services.filter(s => s.category === activeCategory);

  const handleAddService = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || price === '' || duration === '') return;

    addService({
      name: name.trim(),
      price: Number(price),
      durationMinutes: Number(duration),
      category,
      description: description.trim(),
      popular,
    });

    setName('');
    setDescription('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
            <Scissors className="w-6 h-6 text-[#f3e5ab]" />
            Catálogo de Serviços & Preços
          </h1>
          <p className="text-xs sm:text-sm text-zinc-400 mt-1">
            Configure os cortes, barboterapia e combos disponíveis para agendamento.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>Novo Serviço</span>
        </button>
      </div>

      {/* Category Pills Filter */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map(cat => {
          const isPlanTab = cat === 'planos';
          const label = isPlanTab ? '💎 Planos de Assinatura' : cat === 'todos' ? `Todos (${services.length})` : cat;
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] text-slate-950 font-black shadow-md'
                  : isPlanTab
                  ? 'bg-[#d4af37]/15 text-[#f3e5ab] border border-[#d4af37]/40 hover:bg-[#d4af37]/25'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      {/* Conditional Rendering: Services Grid or Subscription Plans Grid */}
      {activeCategory === 'planos' ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {subscriptionPlans.map(plan => (
            <div
              key={plan.id}
              className={`bg-zinc-950 rounded-3xl p-6 border flex flex-col justify-between relative transition-all ${
                plan.popular
                  ? 'border-[#d4af37] ring-1 ring-[#d4af37]/50 shadow-xl shadow-amber-500/10'
                  : 'border-zinc-800'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-black text-lg text-white">{plan.name}</h3>
                  {plan.popular && (
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950">
                      Popular
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#f3e5ab] font-bold">{plan.frequency}</p>

                <div className="my-4 p-4 rounded-2xl bg-black border border-zinc-800 text-center">
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
                    <span>{plan.description}</span>
                  </li>
                </ul>
              </div>

              <div className="mt-6 pt-3 border-t border-zinc-850 flex items-center justify-between text-xs text-zinc-500">
                <span>Disponível para clientes</span>
                <button
                  onClick={() => {
                    if (confirm(`Excluir plano "${plan.name}"?`)) {
                      deleteSubscriptionPlan(plan.id);
                    }
                  }}
                  className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                  title="Excluir plano"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredServices.map(srv => (
            <div
              key={srv.id}
              className="bg-zinc-950 border border-zinc-800 hover:border-zinc-700 rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-900 text-zinc-300 border border-zinc-800 uppercase">
                    {srv.category}
                  </span>

                  <div className="flex items-center gap-1">
                    {srv.popular && (
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950">
                        Mais Pedido
                      </span>
                    )}
                    <button
                      onClick={() => {
                        if (confirm(`Excluir serviço "${srv.name}"?`)) {
                          deleteService(srv.id);
                        }
                      }}
                      className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <h3 className="font-extrabold text-base text-white">{srv.name}</h3>
                <p className="text-xs text-zinc-400 mt-1 line-clamp-2">
                  {srv.description || 'Sem descrição cadastrada.'}
                </p>
              </div>

              <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-850 text-xs">
                <span className="text-zinc-400 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-400" />
                  {srv.durationMinutes} minutos
                </span>
                <span className="font-black text-base text-emerald-400">
                  {formatCurrency(srv.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Service Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <Scissors className="w-5 h-5 text-amber-400" />
              Cadastrar Serviço
            </h3>

            <form onSubmit={handleAddService} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome do Serviço *
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Ex: Corte Degradê Navalhado"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Preço (R$) *
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={price}
                    onChange={e => setPrice(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-[#d4af37]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-300 mb-1">
                    Duração (min) *
                  </label>
                  <input
                    type="number"
                    step="5"
                    min="5"
                    required
                    value={duration}
                    onChange={e => setDuration(e.target.value === '' ? '' : Number(e.target.value))}
                    className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Categoria
                </label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
                >
                  <option value="Cabelo">Cabelo</option>
                  <option value="Barba">Barba</option>
                  <option value="Combo">Combo</option>
                  <option value="Acabamento">Acabamento</option>
                  <option value="Química">Química</option>
                  <option value="Tratamento">Tratamento</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Descrição Rápida
                </label>
                <input
                  type="text"
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Ex: Corte com degradê na máquina e tesoura"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300 pt-1">
                <input
                  type="checkbox"
                  checked={popular}
                  onChange={e => setPopular(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-500 bg-zinc-900 border-zinc-700 focus:ring-amber-500"
                />
                <span>Destacar como "Mais Pedido"</span>
              </label>

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
                  Salvar Serviço
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
