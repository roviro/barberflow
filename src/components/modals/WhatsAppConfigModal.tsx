import React, { useState } from 'react';
import { X, MessageSquare, CheckCircle2, AlertCircle, Send, Key, Globe, ShieldCheck } from 'lucide-react';

import { useApp } from '../../context/AppContext';
import { sendWhatsAppViaApi } from '../../utils/whatsapp';
import type { WhatsAppConfig } from '../../types';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export const WhatsAppConfigModal: React.FC<Props> = ({ isOpen, onClose }) => {
  const { whatsAppConfig, setWhatsAppConfig, profile } = useApp();

  const [config, setConfig] = useState<WhatsAppConfig>({ ...whatsAppConfig });
  const [testPhone, setTestPhone] = useState('');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; msg?: string }>({
    loading: false,
  });

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsAppConfig(config);
    alert('Configurações de WhatsApp salvas com sucesso!');
    onClose();
  };

  const handleTestSend = async () => {
    if (!testPhone.trim()) {
      alert('Informe um número de telefone com DDD para teste.');
      return;
    }
    setTestStatus({ loading: true });
    const res = await sendWhatsAppViaApi(
      config,
      testPhone,
      `💈 *${profile.name}* - Teste de Conexão!\n\nSe você recebeu esta mensagem, o disparo automático de WhatsApp está configurado e funcionando 100%! 🔥✂️`
    );

    if (res.success) {
      setTestStatus({
        loading: false,
        success: true,
        msg: 'Mensagem de teste enviada com sucesso para o WhatsApp!',
      });
    } else {
      setTestStatus({
        loading: false,
        success: false,
        msg: res.error || 'Erro ao enviar. Verifique a URL e API Key.',
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#121215] border border-[#d4af37]/30 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="px-6 py-4 bg-[#18181b] border-b border-[#27272a] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-[#d4af37]/10 text-[#f3e5ab] border border-[#d4af37]/30">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                Automação de WhatsApp
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
                  DIRETO NO CELULAR
                </span>
              </h2>
              <p className="text-xs text-zinc-400">
                Dispare confirmações automáticas sem precisar apertar botões
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-white p-1 rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSave} className="p-6 space-y-5">
          
          {/* Main Toggle */}
          <div className="p-4 rounded-2xl bg-[#18181b]/80 border border-[#27272a] flex items-center justify-between">
            <div className="space-y-0.5 pr-2">
              <span className="font-bold text-sm text-white block">
                Ativar Disparo Automático em Segundo Plano
              </span>
              <span className="text-xs text-zinc-400 block">
                {config.enabled
                  ? 'O cliente receberá a mensagem no momento que o horário for agendado.'
                  : 'Desativado. O sistema usará o link padrão de WhatsApp com 1 clique.'}
              </span>
            </div>
            <label className="relative inline-flex items-center cursor-pointer shrink-0">
              <input
                type="checkbox"
                checked={config.enabled}
                onChange={e => setConfig({ ...config, enabled: e.target.checked })}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]"></div>
            </label>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-zinc-400 mb-2">
              Selecione o Gateway / Provedor
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'evolution-api', label: 'Evolution API', badge: 'Auto-hospedado (Grátis)' },
                { id: 'z-api', label: 'Z-API', badge: 'SaaS Gerenciado' },
                { id: 'webhook', label: 'Webhook', badge: 'n8n / Make / Node' },
              ].map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setConfig({ ...config, provider: p.id as any })}
                  className={`p-2.5 rounded-xl border text-left transition-all ${
                    config.provider === p.id
                      ? 'bg-[#d4af37]/15 border-[#d4af37] text-white ring-1 ring-[#d4af37]/50'
                      : 'bg-[#18181b]/50 border-[#27272a] text-zinc-400 hover:text-white hover:border-zinc-700'
                  }`}
                >
                  <span className="block text-xs font-bold text-white">{p.label}</span>
                  <span className="block text-[9px] text-[#f3e5ab] mt-0.5">{p.badge}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Credentials */}
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
                URL da API ou Webhook *
              </label>
              <input
                type="url"
                value={config.apiUrl}
                onChange={e => setConfig({ ...config, apiUrl: e.target.value })}
                placeholder="Ex: https://whatsapp.seuservidor.com ou https://api.z-api.io"
                className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#d4af37]" />
                  API Key / Token *
                </label>
                <input
                  type="password"
                  value={config.apiKey}
                  onChange={e => setConfig({ ...config, apiKey: e.target.value })}
                  placeholder="Sua chave secreta"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs sm:text-sm text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome da Instância
                </label>
                <input
                  type="text"
                  value={config.instanceName || ''}
                  onChange={e => setConfig({ ...config, instanceName: e.target.value })}
                  placeholder="Ex: elite96"
                  className="w-full bg-[#18181b] border border-[#27272a] rounded-xl px-3 py-2 text-xs sm:text-sm text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>
          </div>

          {/* Automation Options */}
          <div className="space-y-2 pt-1 border-t border-[#27272a]">
            <label className="flex items-center gap-2 cursor-pointer select-none text-xs text-zinc-300">
              <input
                type="checkbox"
                checked={config.autoSendOnBooking}
                onChange={e => setConfig({ ...config, autoSendOnBooking: e.target.checked })}
                className="w-4 h-4 rounded text-[#d4af37] bg-[#18181b] border-zinc-700 focus:ring-[#d4af37]"
              />
              <span>Disparar confirmação automática imediatamente ao agendar</span>
            </label>
          </div>

          {/* Test Section */}
          <div className="bg-[#18181b] p-4 rounded-2xl border border-[#27272a] space-y-3">
            <label className="block text-xs font-bold text-zinc-300">
              🧪 Testar Conexão e Envio de Mensagem
            </label>
            <div className="flex gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                placeholder="Seu WhatsApp (Ex: 11999998888)"
                className="flex-1 bg-[#121215] border border-[#27272a] rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="button"
                onClick={handleTestSend}
                disabled={testStatus.loading || !config.apiUrl}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#f3e5ab] border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                {testStatus.loading ? 'Enviando...' : 'Testar'}
              </button>
            </div>

            {testStatus.msg && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  testStatus.success
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-red-500/10 text-red-400 border border-red-500/30'
                }`}
              >
                {testStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{testStatus.msg}</span>
              </div>
            )}
          </div>

          {/* Submit */}
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#27272a]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs text-zinc-400 hover:text-white"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-gradient-to-r from-[#c59b27] via-[#e5c558] to-[#c59b27] hover:brightness-110 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center gap-2 shadow-lg shadow-amber-500/20"
            >
              <ShieldCheck className="w-4 h-4" />
              Salvar Configurações
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
