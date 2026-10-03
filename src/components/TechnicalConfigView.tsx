import React, { useState } from 'react';
import {
  Wrench,
  MessageSquare,
  ShieldCheck,
  Database,
  Download,
  Upload,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Globe,
  Key,
  Server,
  Lock,
  Send,
  Save,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { sendWhatsAppViaApi } from '../utils/whatsapp';

export const TechnicalConfigView: React.FC = () => {
  const {
    whatsAppConfig,
    setWhatsAppConfig,
    security,
    updateSecurityPins,
    exportBackupJson,
    importBackupJson,
    resetToDemoData,
  } = useApp();

  // WhatsApp state
  const [waConfig, setWaConfig] = useState(whatsAppConfig);
  const [waSavedSuccess, setWaSavedSuccess] = useState(false);
  const [testPhone, setTestPhone] = useState('');
  const [testStatus, setTestStatus] = useState<{ loading: boolean; success?: boolean; msg?: string }>({
    loading: false,
  });

  // Security state
  const [adminPinInput, setAdminPinInput] = useState(security.adminPin);
  const [techPinInput, setTechPinInput] = useState(security.techPin);
  const [pinsSavedSuccess, setPinsSavedSuccess] = useState(false);

  // Backup state
  const [importStatus, setImportStatus] = useState<{ success?: boolean; msg?: string }>({});

  const handleSaveWhatsApp = (e: React.FormEvent) => {
    e.preventDefault();
    setWhatsAppConfig(waConfig);
    setWaSavedSuccess(true);
    setTimeout(() => setWaSavedSuccess(false), 3000);
  };

  const handleTestWhatsApp = async () => {
    if (!testPhone.trim()) {
      setTestStatus({ loading: false, success: false, msg: 'Digite um número para teste (com DDD).' });
      return;
    }
    setTestStatus({ loading: true });
    const msg = `💈 *Elite 96 Barbearia - Teste de Conexão*\n\nSe você recebeu esta mensagem, sua Evolution API está 100% conectada e pronta para disparar agendamentos automáticos! 🚀`;
    const res = await sendWhatsAppViaApi(waConfig, testPhone, msg);
    if (res.success) {
      setTestStatus({
        loading: false,
        success: true,
        msg: 'Mensagem enviada com sucesso no WhatsApp!',
      });
    } else {
      setTestStatus({
        loading: false,
        success: false,
        msg: res.error || 'Erro ao enviar. Verifique se a URL e a API Key estão corretas.',
      });
    }
  };

  const handleSavePins = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminPinInput.trim() || !techPinInput.trim()) {
      alert('Os PINs não podem estar em branco.');
      return;
    }
    updateSecurityPins(adminPinInput, techPinInput);
    setPinsSavedSuccess(true);
    setTimeout(() => setPinsSavedSuccess(false), 3000);
  };

  const handleDownloadBackup = () => {
    const jsonStr = exportBackupJson();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `backup_elite96_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = evt => {
      const content = evt.target?.result as string;
      if (content) {
        const ok = importBackupJson(content);
        if (ok) {
          setImportStatus({ success: true, msg: 'Backup restaurado com sucesso! Dados atualizados.' });
        } else {
          setImportStatus({ success: false, msg: 'Arquivo JSON inválido. Verifique o arquivo.' });
        }
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-zinc-950 via-zinc-900 to-black border border-zinc-800 rounded-3xl p-5 sm:p-7 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-[#f3e5ab] text-xs sm:text-sm font-semibold mb-1">
              <Wrench className="w-4 h-4" />
              <span>Área Restrita</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Painel de <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#dfc15d] via-[#f3e5ab] to-[#c59b27]">Configuração Técnica</span>
            </h1>
            <p className="text-zinc-400 text-xs sm:text-sm mt-1">
              Parâmetros de infraestrutura, gateways de comunicação, segurança e rotinas de backup.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-bold self-start sm:self-auto">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Perfil Técnico Ativo</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* 1. WhatsApp Evolution API Gateway */}
        <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-5">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <MessageSquare className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Gateway de WhatsApp</h3>
                <p className="text-xs text-zinc-400">Evolution API no servidor local</p>
              </div>
            </div>
            <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40">
              {waConfig.enabled ? 'ATIVO' : 'DESLIGADO'}
            </span>
          </div>

          <form onSubmit={handleSaveWhatsApp} className="space-y-4">
            <div className="p-3.5 rounded-2xl bg-[#18181b] border border-zinc-800 flex items-center justify-between">
              <div>
                <span className="font-bold text-xs text-white block">Envio Automático em Segundo Plano</span>
                <span className="text-[11px] text-zinc-400">Dispara ao confirmar ou agendar</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={waConfig.enabled}
                  onChange={e => setWaConfig({ ...waConfig, enabled: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-zinc-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#d4af37]" />
              </label>
            </div>

            <div>
              <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#d4af37]" />
                URL da API (Evolution API)
              </label>
              <input
                type="url"
                value={waConfig.apiUrl}
                onChange={e => setWaConfig({ ...waConfig, apiUrl: e.target.value })}
                className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1 flex items-center gap-1.5">
                  <Key className="w-3.5 h-3.5 text-[#d4af37]" />
                  API Key / Token
                </label>
                <input
                  type="password"
                  value={waConfig.apiKey}
                  onChange={e => setWaConfig({ ...waConfig, apiKey: e.target.value })}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d4af37]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Nome da Instância
                </label>
                <input
                  type="text"
                  value={waConfig.instanceName || ''}
                  onChange={e => setWaConfig({ ...waConfig, instanceName: e.target.value })}
                  placeholder="gestao"
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
                />
              </div>
            </div>

            <div className="space-y-2 pt-1 border-t border-zinc-800">
              <label className="flex items-center gap-2 text-xs text-zinc-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={waConfig.autoSendOnBooking}
                  onChange={e => setWaConfig({ ...waConfig, autoSendOnBooking: e.target.checked })}
                  className="w-4 h-4 rounded text-[#d4af37] bg-[#18181b] border-zinc-700"
                />
                <span>Enviar mensagem automática imediatamente quando o cliente agenda</span>
              </label>
            </div>

            <div className="flex items-center justify-between pt-2">
              {waSavedSuccess && (
                <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                  <CheckCircle2 className="w-4 h-4" /> Configurações salvas!
                </span>
              )}
              <button
                type="submit"
                className="ml-auto px-4 py-2 bg-gradient-to-r from-[#c59b27] to-[#e5c558] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Salvar Gateway</span>
              </button>
            </div>
          </form>

          {/* Test connection live */}
          <div className="bg-[#18181b] p-4 rounded-2xl border border-zinc-800 space-y-3">
            <span className="text-xs font-bold text-zinc-300 block">
              🧪 Testar Envio ao Vivo pelo Servidor
            </span>
            <div className="flex gap-2">
              <input
                type="tel"
                value={testPhone}
                onChange={e => setTestPhone(e.target.value)}
                placeholder="Número de teste (Ex: 11986531134)"
                className="flex-1 bg-[#121215] border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d4af37]"
              />
              <button
                type="button"
                onClick={handleTestWhatsApp}
                disabled={testStatus.loading}
                className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-[#f3e5ab] border border-zinc-700 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors disabled:opacity-50 shrink-0 cursor-pointer"
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
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
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
        </div>

        {/* 2. Security & Access PINs */}
        <div className="space-y-6">
          <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-5">
            <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
              <div className="p-2 rounded-xl bg-amber-500/10 text-[#f3e5ab] border border-amber-500/30">
                <Lock className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Controle de PINs de Segurança</h3>
                <p className="text-xs text-zinc-400">Códigos rápidos para acesso no balcão e técnico</p>
              </div>
            </div>

            <form onSubmit={handleSavePins} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  PIN do Barbeiro / Admin (Operacional)
                </label>
                <input
                  type="text"
                  maxLength={8}
                  value={adminPinInput}
                  onChange={e => setAdminPinInput(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Padrão: <code>9696</code>. Usado pelo barbeiro para abrir a agenda e o caixa.
                </span>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1">
                  Senha da Configuração Técnica / Dev
                </label>
                <input
                  type="text"
                  value={techPinInput}
                  onChange={e => setTechPinInput(e.target.value)}
                  className="w-full bg-[#18181b] border border-zinc-800 rounded-xl px-3 py-2 text-sm text-white font-mono tracking-widest focus:outline-none focus:border-[#d4af37]"
                />
                <span className="text-[10px] text-zinc-500 mt-1 block">
                  Padrão: <code>admin96</code>. Dá acesso a esta tela e parametrizações de infra.
                </span>
              </div>

              <div className="flex items-center justify-between pt-2">
                {pinsSavedSuccess && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1 font-bold">
                    <CheckCircle2 className="w-4 h-4" /> PINs atualizados!
                  </span>
                )}
                <button
                  type="submit"
                  className="ml-auto px-4 py-2 bg-gradient-to-r from-[#c59b27] to-[#e5c558] hover:brightness-110 text-slate-950 font-bold rounded-xl text-xs flex items-center gap-1.5 shadow-md shadow-amber-500/20 cursor-pointer"
                >
                  <Save className="w-3.5 h-3.5" />
                  <span>Salvar Novos PINs</span>
                </button>
              </div>
            </form>
          </div>

          {/* 3. Database Backup & Restore */}
          <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-4">
            <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
              <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/30">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-base text-white">Backup & Restauração de Dados</h3>
                <p className="text-xs text-zinc-400">Proteja a base de clientes, financeiro e estoque</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <button
                type="button"
                onClick={handleDownloadBackup}
                className="p-3 bg-[#18181b] hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Download className="w-4 h-4 text-emerald-400" />
                <span>Baixar Backup (JSON)</span>
              </button>

              <label className="p-3 bg-[#18181b] hover:bg-zinc-800 border border-zinc-800 rounded-2xl text-xs font-bold text-white flex items-center justify-center gap-2 transition-colors cursor-pointer text-center">
                <Upload className="w-4 h-4 text-blue-400" />
                <span>Restaurar Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleFileUpload}
                  className="hidden"
                />
              </label>
            </div>

            {importStatus.msg && (
              <div
                className={`p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                  importStatus.success
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                    : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}
              >
                {importStatus.success ? (
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                ) : (
                  <AlertCircle className="w-4 h-4 shrink-0" />
                )}
                <span>{importStatus.msg}</span>
              </div>
            )}

            <div className="pt-2 border-t border-zinc-800">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Atenção: Isso irá redefinir todos os dados para o padrão de demonstração da Barbearia Elite 96. Deseja continuar?')) {
                    resetToDemoData();
                    alert('Dados restaurados para o padrão inicial da Elite 96!');
                  }
                }}
                className="text-xs text-zinc-500 hover:text-rose-400 flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resetar para padrão de fábrica</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Infrastructure Card */}
      <div className="bg-[#121215] border border-[#27272a] rounded-3xl p-6 shadow-xl space-y-4">
        <div className="flex items-center gap-2.5 border-b border-zinc-800 pb-3">
          <Server className="w-5 h-5 text-[#f3e5ab]" />
          <div>
            <h3 className="font-bold text-base text-white">Status da Infraestrutura & Host</h3>
            <p className="text-xs text-zinc-400">AWS Lightsail Ubuntu 24.04 LTS</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="p-3 bg-[#18181b] rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block uppercase text-[10px]">Domínio Oficial</span>
            <span className="font-bold text-[#f3e5ab] text-sm truncate block">elite96.roviro.com.br</span>
          </div>
          <div className="p-3 bg-[#18181b] rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block uppercase text-[10px]">IP Público Lightsail</span>
            <span className="font-bold text-white text-sm">54.20.32.248</span>
          </div>
          <div className="p-3 bg-[#18181b] rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block uppercase text-[10px]">Certificado de Segurança</span>
            <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
              <ShieldCheck className="w-4 h-4" /> SSL Ativo (Let's Encrypt)
            </span>
          </div>
          <div className="p-3 bg-[#18181b] rounded-xl border border-zinc-800">
            <span className="text-zinc-500 block uppercase text-[10px]">Evolution API Container</span>
            <span className="font-bold text-emerald-400 text-sm flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Porta 8080 (Instância gestao)
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
