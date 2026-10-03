import React, { useState } from 'react';
import {
  DollarSign,
  TrendingDown,
  TrendingUp,
  Plus,
  Download,
  Trash2,
  PieChart,
  CreditCard,
  Calendar,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatCurrency, formatDateBR, getTodayString } from '../utils/formatters';
import { exportTransactionsToCSV } from '../utils/export';
import { NewExpenseModal } from './modals/NewExpenseModal';
import type { TransactionType } from '../types';

export const FinancialView: React.FC = () => {
  const { transactions, deleteTransaction } = useApp();

  const [periodFilter, setPeriodFilter] = useState<'mes' | 'hoje' | 'todos'>('mes');
  const [typeFilter, setTypeFilter] = useState<'todos' | 'receita' | 'despesa'>('todos');
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [modalDefaultType, setModalDefaultType] = useState<TransactionType>('despesa');

  const today = getTodayString();
  const currentMonthPrefix = today.slice(0, 7);

  // Filter transactions by period
  const periodFiltered = transactions.filter(t => {
    if (periodFilter === 'hoje') return t.date === today;
    if (periodFilter === 'mes') return t.date.startsWith(currentMonthPrefix);
    return true;
  });

  // Filter by type
  const filteredTransactions = periodFiltered.filter(t => {
    if (typeFilter === 'todos') return true;
    return t.type === typeFilter;
  });

  // Totals
  const totalIncome = periodFiltered
    .filter(t => t.type === 'receita')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = periodFiltered
    .filter(t => t.type === 'despesa')
    .reduce((sum, t) => sum + t.amount, 0);

  const netProfit = totalIncome - totalExpense;
  const profitMargin = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  // Group expenses by category
  const expensesByCategory: Record<string, number> = {};
  periodFiltered
    .filter(t => t.type === 'despesa')
    .forEach(t => {
      expensesByCategory[t.category] = (expensesByCategory[t.category] || 0) + t.amount;
    });

  // Group payment methods
  const paymentMethodsTotal: Record<string, number> = {};
  periodFiltered
    .filter(t => t.type === 'receita')
    .forEach(t => {
      paymentMethodsTotal[t.paymentMethod] = (paymentMethodsTotal[t.paymentMethod] || 0) + t.amount;
    });

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      
      {/* Top Header & Quick Actions */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white flex items-center gap-2">
              <DollarSign className="w-6 h-6 text-[#f3e5ab]" />
              Controle Financeiro & Gastos
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Acompanhe cada centavo que entra e sai da barbearia.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => exportTransactionsToCSV(transactions)}
              className="px-3 py-2 bg-zinc-900 hover:bg-zinc-850 text-zinc-300 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
              title="Baixar planilha para Excel"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Excel</span>
            </button>

            <button
              onClick={() => {
                setModalDefaultType('despesa');
                setIsExpenseModalOpen(true);
              }}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-rose-600/20 transition-all cursor-pointer"
            >
              <TrendingDown className="w-4 h-4" />
              <span>Lançar Gasto</span>
            </button>

            <button
              onClick={() => {
                setModalDefaultType('receita');
                setIsExpenseModalOpen(true);
              }}
              className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-1.5 shadow-md shadow-emerald-500/20 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Lançar Receita</span>
            </button>
          </div>
        </div>

        {/* Period Selector Tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-zinc-850 flex-wrap">
          <span className="text-xs font-semibold text-zinc-400 flex items-center gap-1">
            <Calendar className="w-3.5 h-3.5" />
            Período:
          </span>
          {[
            { id: 'mes', label: 'Este Mês' },
            { id: 'hoje', label: 'Hoje' },
            { id: 'todos', label: 'Todo o Histórico' },
          ].map(p => (
            <button
              key={p.id}
              onClick={() => setPeriodFilter(p.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                periodFilter === p.id
                  ? 'bg-gradient-to-r from-[#c59b27] to-[#e5c558] text-slate-950 font-extrabold'
                  : 'bg-zinc-900 text-zinc-400 hover:text-white'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Financial KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Entradas */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Total de Entradas
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-emerald-400">
            {formatCurrency(totalIncome)}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Cortes + produtos vendidos
          </span>
        </div>

        {/* Saídas */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Total de Gastos
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <TrendingDown className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-400">
            {formatCurrency(totalExpense)}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Custos fixos, contas & insumos
          </span>
        </div>

        {/* Lucro Líquido Real */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Lucro Líquido Real
            </span>
            <div className="p-2 rounded-xl bg-[#d4af37]/10 text-[#f3e5ab]">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <p className={`text-2xl font-black ${netProfit >= 0 ? 'text-[#f3e5ab]' : 'text-rose-400'}`}>
            {formatCurrency(netProfit)}
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            O que sobra no bolso do barbeiro
          </span>
        </div>

        {/* Margem de Lucro */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold uppercase text-zinc-400 tracking-wider">
              Margem de Lucro
            </span>
            <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400">
              <PieChart className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-white">
            {profitMargin}%
          </p>
          <span className="text-[11px] text-zinc-500 mt-1 block">
            Retorno sobre faturamento
          </span>
        </div>
      </div>

      {/* Analytics Breakdown: Expenses by Category & Income by Payment */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Despesas por Categoria */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <TrendingDown className="w-4 h-4 text-rose-400" />
            <h3 className="font-bold text-sm text-white">
              Para onde foi o dinheiro? (Gastos por Categoria)
            </h3>
          </div>

          {Object.keys(expensesByCategory).length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Nenhuma despesa registrada no período selecionado.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(expensesByCategory)
                .sort(([, a], [, b]) => b - a)
                .map(([cat, amount]) => {
                  const percent = totalExpense > 0 ? ((amount / totalExpense) * 100).toFixed(0) : '0';
                  return (
                    <div key={cat} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">{cat}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white">{formatCurrency(amount)}</span>
                          <span className="text-zinc-500 text-[10px]">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-rose-500/80 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>

        {/* Faturamento por Forma de Pagamento */}
        <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
          <div className="flex items-center gap-2 mb-4">
            <CreditCard className="w-4 h-4 text-emerald-400" />
            <h3 className="font-bold text-sm text-white">
              Como os clientes pagaram? (Entradas)
            </h3>
          </div>

          {Object.keys(paymentMethodsTotal).length === 0 ? (
            <p className="text-xs text-zinc-500 py-6 text-center">
              Nenhuma receita registrada no período selecionado.
            </p>
          ) : (
            <div className="space-y-3">
              {Object.entries(paymentMethodsTotal)
                .sort(([, a], [, b]) => b - a)
                .map(([method, amount]) => {
                  const percent = totalIncome > 0 ? ((amount / totalIncome) * 100).toFixed(0) : '0';
                  const methodLabel = method === 'pix' ? 'Pix' : method === 'dinheiro' ? 'Dinheiro' : method === 'cartao_credito' ? 'Cartão de Crédito' : method === 'cartao_debito' ? 'Cartão de Débito' : 'Outros';
                  return (
                    <div key={method} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-zinc-300 font-medium">{methodLabel}</span>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-emerald-400">{formatCurrency(amount)}</span>
                          <span className="text-zinc-500 text-[10px]">({percent}%)</span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-zinc-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500/80 rounded-full transition-all duration-500"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-5 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <h3 className="font-bold text-base text-white">
            Extrato de Lançamentos ({filteredTransactions.length})
          </h3>

          <div className="flex items-center gap-1.5 flex-wrap">
            {[
              { id: 'todos', label: 'Tudo' },
              { id: 'receita', label: 'Apenas Entradas' },
              { id: 'despesa', label: 'Apenas Gastos' },
            ].map(f => (
              <button
                key={f.id}
                onClick={() => setTypeFilter(f.id as any)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  typeFilter === f.id
                    ? 'bg-zinc-800 text-white border border-zinc-700 font-bold'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <p className="text-xs text-zinc-500 py-8 text-center">
            Nenhum lançamento encontrado para os filtros selecionados.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-zinc-300 min-w-[500px]">
              <thead className="bg-zinc-900 text-zinc-400 font-semibold border-b border-zinc-800 uppercase text-[10px] tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3">Tipo</th>
                  <th className="py-2.5 px-3">Categoria</th>
                  <th className="py-2.5 px-3">Descrição</th>
                  <th className="py-2.5 px-3">Pagamento</th>
                  <th className="py-2.5 px-3 text-right">Valor</th>
                  <th className="py-2.5 px-3 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-850">
                {filteredTransactions.map(tx => {
                  const isIncome = tx.type === 'receita';
                  return (
                    <tr key={tx.id} className="hover:bg-zinc-900/40 transition-colors">
                      <td className="py-3 px-3 font-mono text-zinc-400">
                        {formatDateBR(tx.date)}
                      </td>
                      <td className="py-3 px-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                            isIncome
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                          }`}
                        >
                          {isIncome ? 'Entrada' : 'Saída'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-zinc-400 font-medium">
                        {tx.category}
                      </td>
                      <td className="py-3 px-3 font-semibold text-white">
                        {tx.description}
                      </td>
                      <td className="py-3 px-3 uppercase text-[10px] text-zinc-500 font-medium">
                        {tx.paymentMethod}
                      </td>
                      <td
                        className={`py-3 px-3 text-right font-bold text-sm ${
                          isIncome ? 'text-emerald-400' : 'text-rose-400'
                        }`}
                      >
                        {isIncome ? '+' : '-'} {formatCurrency(tx.amount)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <button
                          onClick={() => {
                            if (confirm(`Excluir lançamento "${tx.description}"?`)) {
                              deleteTransaction(tx.id);
                            }
                          }}
                          className="p-1 text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                          title="Excluir lançamento"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <NewExpenseModal
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        defaultType={modalDefaultType}
      />
    </div>
  );
};
