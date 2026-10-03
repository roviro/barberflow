import React, { useState } from 'react';
import {
  X,
  CheckCircle,
  Plus,
  Trash2,
  Package,
  MessageSquare,
  CreditCard,
  Banknote,
  QrCode,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import type { Appointment, PaymentMethod } from '../../types';
import { formatCurrency } from '../../utils/formatters';
import { createWhatsAppUrl, generatePostCutMessage } from '../../utils/whatsapp';

interface Props {
  appointment: Appointment | null;
  isOpen: boolean;
  onClose: () => void;
}

export const CheckoutModal: React.FC<Props> = ({ appointment, isOpen, onClose }) => {
  const { inventory, checkoutAppointment, profile } = useApp();

  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');
  const [addedProducts, setAddedProducts] = useState<
    { itemId: string; name: string; price: number; quantity: number }[]
  >([]);
  const [selectedProductToAdd, setSelectedProductToAdd] = useState('');
  const [sendWhatsAppThanks, setSendWhatsAppThanks] = useState(false);

  if (!isOpen || !appointment) return null;

  const resaleProducts = inventory.filter(i => i.type === 'revenda' && i.quantity > 0);

  const handleAddProduct = () => {
    if (!selectedProductToAdd) return;
    const item = inventory.find(i => i.id === selectedProductToAdd);
    if (!item || !item.salePrice) return;

    setAddedProducts(prev => {
      const existing = prev.find(p => p.itemId === item.id);
      if (existing) {
        return prev.map(p =>
          p.itemId === item.id ? { ...p, quantity: p.quantity + 1 } : p
        );
      }
      return [
        ...prev,
        { itemId: item.id, name: item.name, price: item.salePrice!, quantity: 1 },
      ];
    });
    setSelectedProductToAdd('');
  };

  const handleRemoveProduct = (itemId: string) => {
    setAddedProducts(prev => prev.filter(p => p.itemId !== itemId));
  };

  const productsTotal = addedProducts.reduce((sum, p) => sum + p.price * p.quantity, 0);
  const totalAmount = appointment.price + productsTotal;

  const handleFinalize = () => {
    checkoutAppointment(appointment.id, paymentMethod, addedProducts);

    if (sendWhatsAppThanks && appointment.clientPhone) {
      const msg = generatePostCutMessage(appointment, profile.name);
      const url = createWhatsAppUrl(appointment.clientPhone, msg);
      window.open(url, '_blank');
    }

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-zinc-900 border-b border-zinc-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <CheckCircle className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-bold text-white">Finalizar Atendimento & Cobrar</h2>
              <p className="text-xs text-zinc-400">
                Cliente: <span className="font-semibold text-emerald-400">{appointment.clientName}</span>
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Service Info Box */}
          <div className="bg-zinc-900 rounded-2xl p-4 border border-zinc-800 flex items-center justify-between">
            <div>
              <span className="text-xs font-semibold text-[#f3e5ab] uppercase tracking-wider block">
                Serviço Realizado
              </span>
              <p className="text-base font-bold text-white">{appointment.serviceName}</p>
              <p className="text-xs text-zinc-400">Horário: {appointment.time}</p>
            </div>
            <div className="text-right">
              <span className="text-xs text-zinc-400">Valor Serviço</span>
              <p className="text-lg font-black text-white">{formatCurrency(appointment.price)}</p>
            </div>
          </div>

          {/* Add Counter Products */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Package className="w-4 h-4 text-amber-400" />
                Venda de Produtos no Balcão (Pomada, Bebida, etc.)
              </label>
              <span className="text-[11px] text-zinc-500">Baixa automática</span>
            </div>

            <div className="flex gap-2">
              <select
                value={selectedProductToAdd}
                onChange={e => setSelectedProductToAdd(e.target.value)}
                className="flex-1 bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
              >
                <option value="">Selecione um produto para adicionar...</option>
                {resaleProducts.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} (Restam: {p.quantity}) - {formatCurrency(p.salePrice || 0)}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={handleAddProduct}
                disabled={!selectedProductToAdd}
                className="px-3 py-2 bg-zinc-900 hover:bg-zinc-800 disabled:opacity-40 text-amber-400 border border-zinc-800 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Adicionar
              </button>
            </div>

            {/* List of Added Products */}
            {addedProducts.length > 0 && (
              <div className="space-y-1.5 pt-1">
                {addedProducts.map(prod => (
                  <div
                    key={prod.itemId}
                    className="flex items-center justify-between px-3 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-zinc-300"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{prod.quantity}x</span>
                      <span>{prod.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-[#f3e5ab]">
                        {formatCurrency(prod.price * prod.quantity)}
                      </span>
                      <button
                        onClick={() => handleRemoveProduct(prod.itemId)}
                        className="text-zinc-500 hover:text-rose-400 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-2">
              Forma de Pagamento *
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {[
                { id: 'pix', label: 'Pix', icon: QrCode, color: 'text-teal-400' },
                { id: 'dinheiro', label: 'Dinheiro', icon: Banknote, color: 'text-emerald-400' },
                { id: 'cartao_credito', label: 'Crédito', icon: CreditCard, color: 'text-blue-400' },
                { id: 'cartao_debito', label: 'Débito', icon: CreditCard, color: 'text-indigo-400' },
              ].map(m => {
                const Icon = m.icon;
                const isSelected = paymentMethod === m.id;
                return (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setPaymentMethod(m.id as PaymentMethod)}
                    className={`flex flex-col items-center justify-center p-3 rounded-xl border text-xs font-semibold transition-all cursor-pointer ${
                      isSelected
                        ? `bg-zinc-900 border-[#d4af37] text-white shadow-md shadow-amber-500/10 ring-1 ring-[#d4af37]`
                        : `bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:bg-zinc-900 hover:text-white`
                    }`}
                  >
                    <Icon className={`w-5 h-5 mb-1 ${m.color}`} />
                    <span>{m.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Total Value Summary Box */}
          <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800 flex items-center justify-between shadow-inner">
            <div>
              <span className="text-xs text-zinc-400 uppercase tracking-wider block">
                Valor Total a Receber
              </span>
              <span className="text-xs text-zinc-500">
                Serviço ({formatCurrency(appointment.price)})
                {productsTotal > 0 && ` + Produtos (${formatCurrency(productsTotal)})`}
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-emerald-400">
                {formatCurrency(totalAmount)}
              </span>
            </div>
          </div>

          {/* WhatsApp Thanks checkbox */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer select-none bg-zinc-900 p-2.5 rounded-xl border border-zinc-800 hover:border-zinc-700 transition-colors">
              <input
                type="checkbox"
                checked={sendWhatsAppThanks}
                onChange={e => setSendWhatsAppThanks(e.target.checked)}
                className="w-4 h-4 rounded text-emerald-500 bg-zinc-950 border-zinc-700 focus:ring-emerald-500"
              />
              <span className="text-xs text-zinc-300 flex items-center gap-1.5">
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                Enviar mensagem de agradecimento pós-corte no WhatsApp
              </span>
            </label>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-zinc-850">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm text-zinc-400 hover:text-white rounded-xl hover:bg-zinc-900 transition-colors cursor-pointer"
            >
              Voltar
            </button>
            <button
              type="button"
              onClick={handleFinalize}
              className="px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-slate-950 font-black rounded-xl shadow-lg shadow-emerald-500/20 text-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <CheckCircle className="w-4 h-4" />
              Confirmar Pagamento & Concluir
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
