import type { Transaction, Appointment, InventoryItem } from '../types';
import { formatDateBR } from './formatters';

function downloadCSV(csvContent: string, fileName: string) {
  // \uFEFF enables correct UTF-8 display in Microsoft Excel
  const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportTransactionsToCSV(transactions: Transaction[]) {
  const headers = ['Data', 'Tipo', 'Categoria', 'Descrição', 'Valor (R$)', 'Forma de Pagamento'];
  const rows = transactions.map(t => [
    formatDateBR(t.date),
    t.type === 'receita' ? 'Receita' : 'Despesa',
    t.category,
    `"${t.description.replace(/"/g, '""')}"`,
    t.amount.toFixed(2).replace('.', ','),
    t.paymentMethod.toUpperCase()
  ]);

  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  downloadCSV(csv, `barberflow-financeiro-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportAppointmentsToCSV(appointments: Appointment[]) {
  const headers = ['Data', 'Horário', 'Cliente', 'Telefone', 'Serviço', 'Preço (R$)', 'Status', 'Pagamento'];
  const rows = appointments.map(a => [
    formatDateBR(a.date),
    a.time,
    `"${a.clientName.replace(/"/g, '""')}"`,
    a.clientPhone,
    `"${a.serviceName.replace(/"/g, '""')}"`,
    a.price.toFixed(2).replace('.', ','),
    a.status.toUpperCase(),
    (a.paymentMethod || 'PENDENTE').toUpperCase()
  ]);

  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  downloadCSV(csv, `barberflow-agendamentos-${new Date().toISOString().slice(0, 10)}.csv`);
}

export function exportInventoryToCSV(inventory: InventoryItem[]) {
  const headers = ['Produto', 'Tipo', 'Categoria', 'Quantidade Atual', 'Estoque Mínimo', 'Unidade', 'Custo (R$)', 'Venda (R$)'];
  const rows = inventory.map(i => [
    `"${i.name.replace(/"/g, '""')}"`,
    i.type === 'revenda' ? 'Revenda' : 'Insumo de Bancada',
    i.category,
    i.quantity,
    i.minQuantity,
    i.unit,
    i.costPrice.toFixed(2).replace('.', ','),
    i.salePrice ? i.salePrice.toFixed(2).replace('.', ',') : '-'
  ]);

  const csv = [headers.join(';'), ...rows.map(r => r.join(';'))].join('\n');
  downloadCSV(csv, `barberflow-estoque-${new Date().toISOString().slice(0, 10)}.csv`);
}
