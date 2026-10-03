import React, { useState } from 'react';
import { X, TrendingDown, DollarSign, Calendar, Tag, CreditCard } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { getTodayString } from '../../utils/formatters';
import type { PaymentMethod, TransactionType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  defaultType?: TransactionType;
}

export const NewExpenseModal: React.FC<Props> = ({
  isOpen,
  onClose,
  defaultType = 'despesa',
}) => {
  const { addTransaction } = useApp();

  const [type, setType] = useState<TransactionType>(defaultType);
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number | ''>('');
  const [category, setCategory] = useState(defaultType === 'despesa' ? 'Contas & Utilidades' : 'Venda de Produtos');
  const [date, setDate] = useState(getTodayString());
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  if (!isOpen) return null;

  const expenseCategories = [
    'Aluguel & Espaço',
    'Contas & Utilidades (Luz/Água/Net)',
    'Insumos & Produtos',
    'Equipamentos & Manutenção',
    'Café & Conforto Clientes',
    'Marketing & Redes Sociais',
    'MEI / Tributos',
    'Outras Despesas',
  ];

  const incomeCategories = [
    'Venda de Produtos (Balcão)',
    'Corte / Serviço Avulso',
    'Cursos / Workshops',
    'Outras Receitas',
  ];

  const categories = type === 'despesa' ? expenseCategories : incomeCategories;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description.trim() || !amount || Number(amount) <= 0) {
      alert('Por favor, informe a descrição e um valor válido.');
      return;
    }

    addTransaction({
      type,
      description: description.trim(),
      amount: Number(amount),
      category,
      date,
      paymentMethod,
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className={`px-6 py-4 border-b flex items-center justify-between ${
          type === 'despesa' ? 'bg-rose-950/30 border-rose-900/40' : 'bg-emerald-950/30 border-emerald-900/40'
        }`}>
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${
              type === 'despesa' ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/20 text-emerald-400'
            }`}>
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">
                {type === 'despesa' ? 'Lançar Gasto / Despesa' : 'Lançar Receita Avulsa'}
              </h2>
              <p className="text-xs text-zinc-400">Controle do fluxo de caixa</p>
            </div>
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
          
          {/* Toggle Type */}
          <div className="flex p-1 bg-zinc-900 rounded-2xl border border-zinc-800">
            <button
              type="button"
              onClick={() => {
                setType('despesa');
                setCategory('Contas & Utilidades');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'despesa'
                  ? 'bg-rose-600 text-white shadow-md'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Despesa (Gasto)
            </button>
            <button
              type="button"
              onClick={() => {
                setType('receita');
                setCategory('Venda de Produtos (Balcão)');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                type === 'receita'
                  ? 'bg-emerald-500 text-slate-950 shadow-md font-black'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              Receita (Entrada)
            </button>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Descrição do {type === 'despesa' ? 'Gasto' : 'Valor'} *
            </label>
            <input
              type="text"
              required
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder={type === 'despesa' ? 'Ex: Conta de Luz / Aluguel / Café' : 'Ex: 1x Pomada vendida no balcão'}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Amount and Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                Valor (R$) *
              </label>
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={amount}
                onChange={e => setAmount(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="0,00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-zinc-500" />
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
          </div>

          {/* Category */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <Tag className="w-3.5 h-3.5 text-amber-400" />
              Categoria
            </label>
            <select
              value={category}
              onChange={e => setCategory(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
            >
              {categories.map(c => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Payment Method */}
          <div>
            <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
              <CreditCard className="w-3.5 h-3.5 text-zinc-500" />
              Forma de Pagamento
            </label>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value as PaymentMethod)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
            >
              <option value="pix">Pix</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao_debito">Cartão de Débito</option>
              <option value="cartao_credito">Cartão de Crédito</option>
              <option value="outro">Boleto / Outro</option>
            </select>
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
              className={`px-5 py-2.5 font-bold rounded-xl shadow-lg text-sm transition-all flex items-center gap-2 cursor-pointer ${
                type === 'despesa'
                  ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-rose-600/20'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-500/20'
              }`}
            >
              {type === 'despesa' ? (
                <>
                  <TrendingDown className="w-4 h-4" />
                  Salvar Despesa
                </>
              ) : (
                <>
                  <DollarSign className="w-4 h-4" />
                  Salvar Receita
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
