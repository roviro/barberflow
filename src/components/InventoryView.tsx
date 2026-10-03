import React, { useState } from 'react';
import {
  Package,
  AlertTriangle,
  Plus,
  Minus,
  Download,
  DollarSign,
  TrendingUp,
  Trash2,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency } from '../utils/formatters';
import { exportInventoryToCSV } from '../utils/export';
import { NewInventoryModal } from './modals/NewInventoryModal';
import type { InventoryItem } from '../types';

export const InventoryView: React.FC = () => {
  const { inventory, updateInventoryQuantity, deleteInventoryItem } = useApp();

  const [activeFilter, setActiveFilter] = useState<'todos' | 'alerta' | 'revenda' | 'insumo'>('todos');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [restockItem, setRestockItem] = useState<InventoryItem | null>(null);
  const [restockQty, setRestockQty] = useState<number>(5);
  const [registerExpenseOnRestock, setRegisterExpenseOnRestock] = useState(true);

  // Statistics
  const lowStockItems = inventory.filter(i => i.quantity <= i.minQuantity);

  const totalInvestedCost = inventory.reduce(
    (sum, item) => sum + item.quantity * item.costPrice,
    0
  );

  const totalPotentialSale = inventory
    .filter(i => i.type === 'revenda' && i.salePrice)
    .reduce((sum, item) => sum + item.quantity * item.salePrice!, 0);

  // Filtering
  const filteredItems = inventory.filter(item => {
    if (activeFilter === 'alerta') return item.quantity <= item.minQuantity;
    if (activeFilter === 'revenda') return item.type === 'revenda';
    if (activeFilter === 'insumo') return item.type === 'insumo';
    return true;
  });

  const handleConfirmRestock = () => {
    if (!restockItem || restockQty <= 0) return;
    updateInventoryQuantity(restockItem.id, restockQty, registerExpenseOnRestock);
    setRestockItem(null);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Header */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <Package className="w-6 h-6 text-[#f3e5ab]" />
              Controle de Estoque & Insumos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Monitore produtos de revenda e descartáveis de bancada sem deixar faltar lâmina ou pomada.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportInventoryToCSV(inventory)}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Baixar lista para Excel"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={() => setIsNewModalOpen(true)}
              className="px-4 py-2 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-amber-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Produto</span>
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-850 overflow-x-auto pb-1 scrollbar-none">
          {[
            { id: 'todos', label: `Todos (${inventory.length})` },
            {
              id: 'alerta',
              label: `⚠️ Alerta de Reposição (${lowStockItems.length})`,
              highlight: lowStockItems.length > 0,
            },
            {
              id: 'revenda',
              label: `Revenda (${inventory.filter(i => i.type === 'revenda').length})`,
            },
            {
              id: 'insumo',
              label: `Insumos da Bancada (${inventory.filter(i => i.type === 'insumo').length})`,
            },
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                activeFilter === f.id
                  ? 'bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950 font-extrabold'
                  : f.highlight
                  ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Inventory KPI Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        
        {/* Itens em Alerta */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Estoque Baixo / Repor
            </span>
            <div className={`p-2 rounded-xl ${lowStockItems.length > 0 ? 'bg-rose-500/20 text-rose-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${lowStockItems.length > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {lowStockItems.length} {lowStockItems.length === 1 ? 'item' : 'itens'}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            {lowStockItems.length > 0 ? 'Necessitam compra imediata' : 'Nenhum item em nível crítico'}
          </span>
        </div>

        {/* Custo Total Investido */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Investido em Estoque
            </span>
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#f3e5ab]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {formatCurrency(totalInvestedCost)}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Valor de custo de todos os itens
          </span>
        </div>

        {/* Potencial de Venda (Revenda) */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Potencial de Faturamento
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {formatCurrency(totalPotentialSale)}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Valor esperado se vender todos os produtos
          </span>
        </div>
      </div>

      {/* Inventory Items Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredItems.map(item => {
          const isLow = item.quantity <= item.minQuantity;
          const isResale = item.type === 'revenda';

          return (
            <div
              key={item.id}
              className={`bg-zinc-950 border rounded-2xl p-5 shadow-lg transition-all flex flex-col justify-between ${
                isLow
                  ? 'border-rose-500/50 bg-rose-950/10 ring-1 ring-rose-500/30'
                  : 'border-zinc-800 hover:border-zinc-700'
              }`}
            >
              <div>
                {/* Header Tag & Delete */}
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span
                    className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                      isResale
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        : 'bg-blue-500/10 text-blue-400 border border-blue-500/30'
                    }`}
                  >
                    {isResale ? '🏷️ Revenda' : '✂️ Insumo de Bancada'}
                  </span>

                  <button
                    onClick={() => {
                      if (confirm(`Remover "${item.name}" do estoque?`)) {
                        deleteInventoryItem(item.id);
                      }
                    }}
                    className="text-zinc-500 hover:text-rose-400 p-1 rounded-lg transition-colors cursor-pointer"
                    title="Excluir produto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h3 className="font-extrabold text-base text-white line-clamp-2">
                  {item.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Categoria: <span className="text-zinc-300 font-medium">{item.category}</span>
                </p>

                {/* Stock Level Bar */}
                <div className="mt-4 p-3 bg-zinc-900/80 rounded-xl border border-zinc-800">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-zinc-400">Em estoque:</span>
                    <span className={`font-black text-sm ${isLow ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {item.quantity} {item.unit}
                    </span>
                  </div>

                  {/* Visual Gauge */}
                  <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-300 ${
                        isLow ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: `${Math.min(100, (item.quantity / Math.max(item.minQuantity * 2, 1)) * 100)}%`,
                      }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-zinc-500 mt-1.5">
                    <span>Mínimo seguro: {item.minQuantity} {item.unit}</span>
                    {isLow && (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3 h-3" />
                        Repor!
                      </span>
                    )}
                  </div>
                </div>

                {/* Financial details */}
                <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
                  <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-850">
                    <span className="text-[10px] text-zinc-500 block uppercase">Custo</span>
                    <span className="font-bold text-zinc-200">{formatCurrency(item.costPrice)}</span>
                  </div>
                  {isResale && item.salePrice ? (
                    <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-850">
                      <span className="text-[10px] text-emerald-400 block uppercase">Venda</span>
                      <span className="font-bold text-emerald-400">{formatCurrency(item.salePrice)}</span>
                    </div>
                  ) : (
                    <div className="bg-zinc-900 p-2 rounded-lg border border-zinc-850">
                      <span className="text-[10px] text-zinc-500 block uppercase">Uso</span>
                      <span className="font-bold text-zinc-300">Interno</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons: Quick Plus/Minus and Restock */}
              <div className="mt-4 pt-3 border-t border-zinc-850 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1 bg-zinc-900 rounded-xl p-1 border border-zinc-800">
                  <button
                    onClick={() => updateInventoryQuantity(item.id, -1)}
                    disabled={item.quantity <= 0}
                    className="p-1 hover:bg-zinc-800 disabled:opacity-30 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                    title="Dar baixa em 1 unidade"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-2 text-xs font-mono font-bold text-white">
                    {item.quantity}
                  </span>
                  <button
                    onClick={() => updateInventoryQuantity(item.id, 1)}
                    className="p-1 hover:bg-zinc-800 text-zinc-300 rounded-lg transition-colors cursor-pointer"
                    title="Adicionar 1 unidade"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  onClick={() => {
                    setRestockItem(item);
                    setRestockQty(item.minQuantity * 2 || 5);
                  }}
                  className="px-3 py-1.5 bg-zinc-900 hover:bg-zinc-800 text-[#f3e5ab] border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Repor Compra</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Restock Purchase Modal */}
      {restockItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-sm shadow-2xl p-6 space-y-4">
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <RefreshCw className="w-5 h-5 text-amber-400" />
              Repor Estoque: {restockItem.name}
            </h3>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1">
                Quantidade comprada ({restockItem.unit})
              </label>
              <input
                type="number"
                min="1"
                value={restockQty}
                onChange={e => setRestockQty(Math.max(1, Number(e.target.value)))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-bold focus:outline-none focus:border-amber-500"
              />
            </div>

            <div className="bg-zinc-900 p-3 rounded-xl border border-zinc-800 text-xs space-y-1">
              <div className="flex justify-between text-zinc-400">
                <span>Custo Unitário:</span>
                <span>{formatCurrency(restockItem.costPrice)}</span>
              </div>
              <div className="flex justify-between text-white font-bold pt-1 border-t border-zinc-800">
                <span>Custo Total da Compra:</span>
                <span className="text-rose-400">
                  {formatCurrency(restockQty * restockItem.costPrice)}
                </span>
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={registerExpenseOnRestock}
                onChange={e => setRegisterExpenseOnRestock(e.target.checked)}
                className="w-4 h-4 rounded text-amber-500 bg-zinc-900 border-zinc-700 focus:ring-amber-500"
              />
              <span>Lançar esse valor como gasto no módulo Financeiro</span>
            </label>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => setRestockItem(null)}
                className="px-3 py-2 text-xs text-zinc-400 hover:text-white cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmRestock}
                className="px-4 py-2 bg-gradient-to-r from-[#c59b27] to-[#e5c558] hover:brightness-110 text-slate-950 font-bold text-xs rounded-xl transition-colors cursor-pointer"
              >
                Confirmar Reposição
              </button>
            </div>
          </div>
        </div>
      )}

      <NewInventoryModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
      />
    </div>
  );
};
