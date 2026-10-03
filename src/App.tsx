import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { AgendaView } from './components/AgendaView';
import { FinancialView } from './components/FinancialView';
import { InventoryView } from './components/InventoryView';
import { ClientsView } from './components/ClientsView';
import { ServicesView } from './components/ServicesView';
import { ClientBookingView } from './components/ClientBookingView';
import { TechnicalConfigView } from './components/TechnicalConfigView';
import { LoginView } from './components/LoginView';

const MainLayout: React.FC = () => {
  const { activeTab, currentRole, setRole } = useApp();
  const [currentPath, setCurrentPath] = useState(() => 
    typeof window !== 'undefined' ? window.location.pathname.toLowerCase() : '/'
  );

  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname.toLowerCase();
      setCurrentPath(path);
      if (path.includes('/agendar') || path.includes('/agendamento') || path.includes('/cliente')) {
        setRole('cliente');
      }
    };

    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, [setRole]);

  const isClientPath = currentPath.includes('/agendar') ||
    currentPath.includes('/agendamento') ||
    currentPath.includes('/cliente') ||
    (typeof window !== 'undefined' && window.location.search.toLowerCase().includes('view=cliente'));

  // 1. If path is /agendar or currentRole is 'cliente' -> Show standalone Customer Portal
  if (isClientPath || currentRole === 'cliente') {
    return (
      <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#d4af37] selection:text-black">
        <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
          <ClientBookingView />
        </main>
      </div>
    );
  }

  // 2. If not logged in -> Show Login View
  if (!currentRole) {
    return <LoginView />;
  }

  // 3. Logged in as 'admin' or 'configuracao' -> Show Full Management Platform
  return (
    <div className="min-h-screen bg-[#09090b] text-zinc-100 flex flex-col font-sans selection:bg-[#d4af37] selection:text-black">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 pb-24 lg:pb-8">
        {activeTab === 'dashboard' && <Dashboard />}
        {activeTab === 'agenda' && <AgendaView />}
        {activeTab === 'financeiro' && <FinancialView />}
        {activeTab === 'estoque' && <InventoryView />}
        {activeTab === 'clientes' && <ClientsView />}
        {activeTab === 'servicos' && <ServicesView />}
        {activeTab === 'configuracao' && <TechnicalConfigView />}
      </main>
    </div>
  );
};

export function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}

export default App;

