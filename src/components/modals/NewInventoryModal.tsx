import React, { useState } from 'react';
import { X, Package, DollarSign, Layers } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { InventoryType } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const NewInventoryModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { addInventoryItem, addTransaction } = useApp();

  const [name, setName] = useState('');
  const [type, setType] = useState<InventoryType>('revenda');
  const [category, setCategory] = useState('Pomadas');
  const [quantity, setQuantity] = useState<number | ''>(5);
  const [minQuantity, setMinQuantity] = useState<number | ''>(2);
  const [costPrice, setCostPrice] = useState<number | ''>(15.0);
  const [salePrice, setSalePrice] = useState<number | ''>(35.0);
  const [unit, setUnit] = useState('unid');
  const [registerInitialExpense, setRegisterInitialExpense] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || quantity === '' || costPrice === '') {
      alert('Preencha os campos obrigatórios.');
      return;
    }

    const qty = Number(quantity);
    const cost = Number(costPrice);

    addInventoryItem({
      name: name.trim(),
      type,
      category,
      quantity: qty,
      minQuantity: minQuantity !== '' ? Number(minQuantity) : 2,
      costPrice: cost,
      salePrice: type === 'revenda' && salePrice !== '' ? Number(salePrice) : undefined,
      unit,
    });

    if (registerInitialExpense && qty > 0 && cost > 0) {
      addTransaction({
        type: 'despesa',
        category: 'Insumos & Produtos',
        description: `Compra inicial de estoque: ${qty}x ${name.trim()}`,
        amount: qty * cost,
        date: new Date().toISOString().slice(0, 10),
        paymentMethod: 'pix',
      });
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Novo Item de Estoque</h2>
              <p className="text-xs text-zinc-400">Cadastre insumo ou produto de revenda</p>
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
          
          {/* Item Type Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5">
              Tipo do Produto *
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('revenda');
                  setCategory('Pomadas');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  type === 'revenda'
                    ? 'bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950 border-[#d4af37] shadow-md font-black'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                🏷️ Revenda (Cliente)
              </button>
              <button
                type="button"
                onClick={() => {
                  setType('insumo');
                  setCategory('Descartáveis');
                }}
                className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                  type === 'insumo'
                    ? 'bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950 border-[#d4af37] shadow-md font-black'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                ✂️ Insumo da Bancada
              </button>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1">
              Nome do Produto / Insumo *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={type === 'revenda' ? "Ex: Pomada Efeito Matte 150g" : "Ex: Caixa Lâminas Derby (100 unid)"}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
            />
          </div>

          {/* Category & Unit */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-amber-400" />
                Categoria
              </label>
              <input
                type="text"
                value={category}
                onChange={e => setCategory(e.target.value)}
                placeholder="Ex: Pomadas, Barba, Bebidas"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Unidade de Medida
              </label>
              <select
                value={unit}
                onChange={e => setUnit(e.target.value)}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="unid">Unidade (unid)</option>
                <option value="frasco">Frasco</option>
                <option value="caixa">Caixa</option>
                <option value="rolo">Rolo</option>
                <option value="lata">Lata</option>
                <option value="pacote">Pacote</option>
              </select>
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Quantidade Atual em Estoque *
              </label>
              <input
                type="number"
                min="0"
                required
                value={quantity}
                onChange={e => setQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Estoque Mínimo (Alerta) *
              </label>
              <input
                type="number"
                min="0"
                required
                value={minQuantity}
                onChange={e => setMinQuantity(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>
          </div>

          {/* Prices (Cost & Sale) */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-rose-400" />
                Preço de Custo (R$) *
              </label>
              <input
                type="number"
                step="0.1"
                min="0"
                required
                value={costPrice}
                onChange={e => setCostPrice(e.target.value === '' ? '' : Number(e.target.value))}
                placeholder="15,00"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            {type === 'revenda' && (
              <div>
                <label className="text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  Preço de Venda (R$) *
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  required
                  value={salePrice}
                  onChange={e => setSalePrice(e.target.value === '' ? '' : Number(e.target.value))}
                  placeholder="35,00"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-semibold focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            )}
          </div>

          {/* Register initial expense */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-750 transition-colors">
              <input
                type="checkbox"
                checked={registerInitialExpense}
                onChange={e => setRegisterInitialExpense(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-zinc-950 border-zinc-700 focus:ring-amber-500"
              />
              <span className="text-xs text-zinc-300">
                Registrar compra das unidades iniciais como despesa no financeiro
              </span>
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
              <Package className="w-4 h-4" />
              Salvar Item
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
