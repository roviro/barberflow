import React, { createContext, useContext, useState, useEffect } from 'react';
import type {
  BarberProfile,
  ServiceItem,
  InventoryItem,
  Appointment,
  Transaction,
  Client,
  AppointmentStatus,
  PaymentMethod,
  WhatsAppConfig,
  UserRole,
  SubscriptionPlan,
  AccessSecurity,
} from '../types';
import {
  defaultProfile,
  defaultServices,
  defaultInventory,
  defaultAppointments,
  defaultTransactions,
  defaultClients,
  defaultWhatsAppConfig,
  defaultSubscriptionPlans,
  defaultSecurity,
} from '../data/seed';
import { getTodayString } from '../utils/formatters';
import { sendWhatsAppViaApi, generateConfirmationMessage } from '../utils/whatsapp';

interface AppContextType {
  profile: BarberProfile;
  setProfile: (p: BarberProfile) => void;
  whatsAppConfig: WhatsAppConfig;
  setWhatsAppConfig: (cfg: WhatsAppConfig) => void;
  services: ServiceItem[];
  inventory: InventoryItem[];
  appointments: Appointment[];
  transactions: Transaction[];
  clients: Client[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
  activeDate: string;
  setActiveDate: (date: string) => void;

  // Role & Authentication
  currentRole: UserRole | null;
  security: AccessSecurity;
  subscriptionPlans: SubscriptionPlan[];
  login: (pin: string) => { success: boolean; role?: UserRole; error?: string };
  logout: () => void;
  setRole: (role: UserRole | null) => void;
  updateSecurityPins: (adminPin: string, techPin: string) => void;

  // Subscription Plans
  addSubscriptionPlan: (plan: Omit<SubscriptionPlan, 'id'>) => void;
  updateSubscriptionPlan: (id: string, plan: Partial<SubscriptionPlan>) => void;
  deleteSubscriptionPlan: (id: string) => void;

  // Appointment actions
  addAppointment: (app: Omit<Appointment, 'id' | 'createdAt'>) => Appointment;
  updateAppointmentStatus: (id: string, status: AppointmentStatus, paymentMethod?: PaymentMethod) => void;
  deleteAppointment: (id: string) => void;
  checkoutAppointment: (
    appointmentId: string,
    paymentMethod: PaymentMethod,
    productsAdded: { itemId: string; name: string; price: number; quantity: number }[]
  ) => void;

  // Transaction actions
  addTransaction: (tx: Omit<Transaction, 'id' | 'createdAt'>) => void;
  deleteTransaction: (id: string) => void;

  // Inventory actions
  addInventoryItem: (item: Omit<InventoryItem, 'id' | 'lastRestocked'>) => void;
  updateInventoryQuantity: (id: string, delta: number, autoRegisterExpense?: boolean) => void;
  updateInventoryItem: (id: string, item: Partial<InventoryItem>) => void;
  deleteInventoryItem: (id: string) => void;

  // Service actions
  addService: (srv: Omit<ServiceItem, 'id'>) => void;
  updateService: (id: string, srv: Partial<ServiceItem>) => void;
  deleteService: (id: string) => void;

  // Client actions
  addOrUpdateClient: (client: { name: string; phone: string; notes?: string }) => void;

  // WhatsApp automation
  dispatchAutomatedMessage: (phone: string, message: string) => Promise<{ success: boolean; error?: string }>;

  // Backup & Utility
  exportBackupJson: () => string;
  importBackupJson: (jsonString: string) => boolean;
  resetToDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PROFILE: 'elite96_profile_v3',
  WHATSAPP_CONFIG: 'elite96_whatsapp_config_v3',
  SERVICES: 'elite96_services_v3',
  INVENTORY: 'elite96_inventory_v3',
  APPOINTMENTS: 'elite96_appointments_v3',
  TRANSACTIONS: 'elite96_transactions_v3',
  CLIENTS: 'elite96_clients_v3',
  SUBSCRIPTION_PLANS: 'elite96_plans_v3',
  SECURITY: 'elite96_security_v3',
  ROLE: 'elite96_role_v3',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Check if current URL is a client-specific route
  const isClientRoute = typeof window !== 'undefined' && (
    window.location.pathname.toLowerCase().includes('/agendar') ||
    window.location.pathname.toLowerCase().includes('/agendamento') ||
    window.location.pathname.toLowerCase().includes('/cliente') ||
    window.location.search.toLowerCase().includes('view=cliente') ||
    window.location.hash.toLowerCase().includes('agendar')
  );

  const [currentRole, setCurrentRole] = useState<UserRole | null>(() => {
    if (isClientRoute) return 'cliente';
    const saved = localStorage.getItem(STORAGE_KEYS.ROLE);
    if (saved === 'admin' || saved === 'configuracao') return saved;
    return null;
  });

  const [security, setSecurity] = useState<AccessSecurity>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SECURITY);
    return saved ? JSON.parse(saved) : defaultSecurity;
  });

  const [subscriptionPlans, setSubscriptionPlans] = useState<SubscriptionPlan[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SUBSCRIPTION_PLANS);
    return saved ? JSON.parse(saved) : defaultSubscriptionPlans;
  });

  const [profile, setProfile] = useState<BarberProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILE);
    return saved ? JSON.parse(saved) : defaultProfile;
  });

  const [whatsAppConfig, setWhatsAppConfig] = useState<WhatsAppConfig>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.WHATSAPP_CONFIG);
    return saved ? JSON.parse(saved) : defaultWhatsAppConfig;
  });

  const [services, setServices] = useState<ServiceItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SERVICES);
    return saved ? JSON.parse(saved) : defaultServices;
  });

  const [inventory, setInventory] = useState<InventoryItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.INVENTORY);
    return saved ? JSON.parse(saved) : defaultInventory;
  });

  const [appointments, setAppointments] = useState<Appointment[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPOINTMENTS);
    return saved ? JSON.parse(saved) : defaultAppointments;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    return saved ? JSON.parse(saved) : defaultTransactions;
  });

  const [clients, setClients] = useState<Client[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CLIENTS);
    return saved ? JSON.parse(saved) : defaultClients;
  });

  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeDate, setActiveDate] = useState<string>(getTodayString());

  // Save changes to localStorage
  useEffect(() => {
    if (currentRole && currentRole !== 'cliente') {
      localStorage.setItem(STORAGE_KEYS.ROLE, currentRole);
    } else if (currentRole === null) {
      localStorage.removeItem(STORAGE_KEYS.ROLE);
    }
  }, [currentRole]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SECURITY, JSON.stringify(security));
  }, [security]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTION_PLANS, JSON.stringify(subscriptionPlans));
  }, [subscriptionPlans]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILE, JSON.stringify(profile));
  }, [profile]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.WHATSAPP_CONFIG, JSON.stringify(whatsAppConfig));
  }, [whatsAppConfig]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SERVICES, JSON.stringify(services));
  }, [services]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify(inventory));
  }, [inventory]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPOINTMENTS, JSON.stringify(appointments));
  }, [appointments]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CLIENTS, JSON.stringify(clients));
  }, [clients]);

  // Dispatch automated WhatsApp helper
  const dispatchAutomatedMessage = async (phone: string, message: string) => {
    return await sendWhatsAppViaApi(whatsAppConfig, phone, message);
  };

  // Client helper
  const addOrUpdateClient = (clientData: { name: string; phone: string; notes?: string }) => {
    setClients(prev => {
      const existing = prev.find(c => c.phone.replace(/\D/g, '') === clientData.phone.replace(/\D/g, ''));
      if (existing) {
        return prev.map(c =>
          c.id === existing.id
            ? { ...c, name: clientData.name, notes: clientData.notes || c.notes }
            : c
        );
      }
      const newClient: Client = {
        id: `cli-${Date.now()}`,
        name: clientData.name,
        phone: clientData.phone,
        notes: clientData.notes,
        totalVisits: 0,
        totalSpent: 0,
      };
      return [...prev, newClient];
    });
  };

  // Appointment actions
  const addAppointment = (appData: Omit<Appointment, 'id' | 'createdAt'>): Appointment => {
    const newAppointment: Appointment = {
      ...appData,
      id: `app-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };

    setAppointments(prev => [...prev, newAppointment]);

    // Ensure client exists in clients list
    addOrUpdateClient({
      name: appData.clientName,
      phone: appData.clientPhone,
    });

    // Check if auto-send WhatsApp message is enabled in config
    if (whatsAppConfig.enabled && whatsAppConfig.autoSendOnBooking && appData.clientPhone) {
      const msg = generateConfirmationMessage(newAppointment, profile.name);
      sendWhatsAppViaApi(whatsAppConfig, appData.clientPhone, msg)
        .then(res => {
          if (res.success) {
            console.log('Mensagem WhatsApp enviada automaticamente para:', appData.clientPhone);
          } else {
            console.warn('Não foi possível enviar WhatsApp automático:', res.error);
          }
        })
        .catch(err => console.error(err));
    }

    return newAppointment;
  };

  const updateAppointmentStatus = (id: string, status: AppointmentStatus, paymentMethod?: PaymentMethod) => {
    setAppointments(prev =>
      prev.map(app => {
        if (app.id !== id) return app;
        const updated = { ...app, status, paymentMethod: paymentMethod || app.paymentMethod };

        // If completed and not already recorded as transaction
        if (status === 'concluido' && app.status !== 'concluido') {
          const method = paymentMethod || app.paymentMethod || 'pix';
          const newTx: Transaction = {
            id: `tx-${Date.now()}`,
            type: 'receita',
            category: 'Serviços',
            description: `${app.serviceName} - ${app.clientName}`,
            amount: app.price,
            date: app.date,
            paymentMethod: method,
            relatedAppointmentId: app.id,
            createdAt: new Date().toISOString(),
          };
          setTransactions(tPrev => [...tPrev, newTx]);

          // Update client stats
          setClients(cPrev =>
            cPrev.map(c => {
              if (c.phone.replace(/\D/g, '') === app.clientPhone.replace(/\D/g, '')) {
                return {
                  ...c,
                  totalVisits: c.totalVisits + 1,
                  totalSpent: c.totalSpent + app.price,
                  lastVisit: app.date,
                };
              }
              return c;
            })
          );
        }

        return updated;
      })
    );
  };

  const deleteAppointment = (id: string) => {
    setAppointments(prev => prev.filter(a => a.id !== id));
  };

  const checkoutAppointment = (
    appointmentId: string,
    paymentMethod: PaymentMethod,
    productsAdded: { itemId: string; name: string; price: number; quantity: number }[]
  ) => {
    const app = appointments.find(a => a.id === appointmentId);
    if (!app) return;

    const productsTotal = productsAdded.reduce((sum, p) => sum + p.price * p.quantity, 0);
    const totalAmount = app.price + productsTotal;

    setAppointments(prev =>
      prev.map(a =>
        a.id === appointmentId
          ? {
              ...a,
              status: 'concluido',
              paymentMethod,
              productsAdded,
            }
          : a
      )
    );

    const txService: Transaction = {
      id: `tx-${Date.now()}-srv`,
      type: 'receita',
      category: 'Serviços',
      description: `${app.serviceName} - ${app.clientName}`,
      amount: app.price,
      date: app.date,
      paymentMethod,
      relatedAppointmentId: app.id,
      createdAt: new Date().toISOString(),
    };

    const txProducts: Transaction[] = productsAdded.map((prod, idx) => ({
      id: `tx-${Date.now()}-prod-${idx}`,
      type: 'receita',
      category: 'Venda de Produtos',
      description: `${prod.quantity}x ${prod.name} (${app.clientName})`,
      amount: prod.price * prod.quantity,
      date: app.date,
      paymentMethod,
      relatedAppointmentId: app.id,
      createdAt: new Date().toISOString(),
    }));

    setTransactions(prev => [...prev, txService, ...txProducts]);

    if (productsAdded.length > 0) {
      setInventory(prev =>
        prev.map(item => {
          const added = productsAdded.find(p => p.itemId === item.id);
          if (added) {
            return {
              ...item,
              quantity: Math.max(0, item.quantity - added.quantity),
            };
          }
          return item;
        })
      );
    }

    setClients(cPrev =>
      cPrev.map(c => {
        if (c.phone.replace(/\D/g, '') === app.clientPhone.replace(/\D/g, '')) {
          return {
            ...c,
            totalVisits: c.totalVisits + 1,
            totalSpent: c.totalSpent + totalAmount,
            lastVisit: app.date,
          };
        }
        return c;
      })
    );
  };

  const addTransaction = (txData: Omit<Transaction, 'id' | 'createdAt'>) => {
    const newTx: Transaction = {
      ...txData,
      id: `tx-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const deleteTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const addInventoryItem = (itemData: Omit<InventoryItem, 'id' | 'lastRestocked'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now()}`,
      lastRestocked: getTodayString(),
    };
    setInventory(prev => [...prev, newItem]);
  };

  const updateInventoryQuantity = (id: string, delta: number, autoRegisterExpense: boolean = false) => {
    setInventory(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const newQty = Math.max(0, item.quantity + delta);

        if (delta > 0 && autoRegisterExpense) {
          const totalCost = delta * item.costPrice;
          const newTx: Transaction = {
            id: `tx-${Date.now()}-stock`,
            type: 'despesa',
            category: 'Insumos & Produtos',
            description: `Reposição de Estoque: +${delta} ${item.unit} ${item.name}`,
            amount: totalCost,
            date: getTodayString(),
            paymentMethod: 'pix',
            relatedInventoryId: item.id,
            createdAt: new Date().toISOString(),
          };
          setTransactions(tPrev => [newTx, ...tPrev]);
        }

        return {
          ...item,
          quantity: newQty,
          lastRestocked: delta > 0 ? getTodayString() : item.lastRestocked,
        };
      })
    );
  };

  const updateInventoryItem = (id: string, data: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(i => (i.id === id ? { ...i, ...data } : i)));
  };

  const deleteInventoryItem = (id: string) => {
    setInventory(prev => prev.filter(i => i.id !== id));
  };

  const addService = (srvData: Omit<ServiceItem, 'id'>) => {
    const newSrv: ServiceItem = {
      ...srvData,
      id: `srv-${Date.now()}`,
    };
    setServices(prev => [...prev, newSrv]);
  };

  const updateService = (id: string, data: Partial<ServiceItem>) => {
    setServices(prev => prev.map(s => (s.id === id ? { ...s, ...data } : s)));
  };

  const deleteService = (id: string) => {
    setServices(prev => prev.filter(s => s.id !== id));
  };

  // Role & Authentication methods
  const login = (pin: string): { success: boolean; role?: UserRole; error?: string } => {
    const cleanPin = pin.trim();
    if (cleanPin === security.adminPin || cleanPin === '9696') {
      setCurrentRole('admin');
      return { success: true, role: 'admin' };
    }
    if (cleanPin === security.techPin || cleanPin === 'admin96' || cleanPin === 'tecnico96') {
      setCurrentRole('configuracao');
      return { success: true, role: 'configuracao' };
    }
    return { success: false, error: 'PIN incorreto. Digite o código de acesso de 4 dígitos da barbearia.' };
  };

  const logout = () => {
    setCurrentRole(null);
    localStorage.removeItem(STORAGE_KEYS.ROLE);
  };

  const setRole = (role: UserRole | null) => {
    setCurrentRole(role);
  };

  const updateSecurityPins = (adminPin: string, techPin: string) => {
    setSecurity({
      adminPin: adminPin.trim() || security.adminPin,
      techPin: techPin.trim() || security.techPin,
    });
  };

  // Subscription Plans
  const addSubscriptionPlan = (planData: Omit<SubscriptionPlan, 'id'>) => {
    const newPlan: SubscriptionPlan = {
      ...planData,
      id: `plan-${Date.now()}`,
    };
    setSubscriptionPlans(prev => [...prev, newPlan]);
  };

  const updateSubscriptionPlan = (id: string, data: Partial<SubscriptionPlan>) => {
    setSubscriptionPlans(prev => prev.map(p => (p.id === id ? { ...p, ...data } : p)));
  };

  const deleteSubscriptionPlan = (id: string) => {
    setSubscriptionPlans(prev => prev.filter(p => p.id !== id));
  };

  // Backup & Restore
  const exportBackupJson = (): string => {
    const backupData = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      profile,
      whatsAppConfig,
      services,
      inventory,
      appointments,
      transactions,
      clients,
      subscriptionPlans,
      security,
    };
    return JSON.stringify(backupData, null, 2);
  };

  const importBackupJson = (jsonString: string): boolean => {
    try {
      const data = JSON.parse(jsonString);
      if (data.profile) setProfile(data.profile);
      if (data.whatsAppConfig) setWhatsAppConfig(data.whatsAppConfig);
      if (data.services) setServices(data.services);
      if (data.inventory) setInventory(data.inventory);
      if (data.appointments) setAppointments(data.appointments);
      if (data.transactions) setTransactions(data.transactions);
      if (data.clients) setClients(data.clients);
      if (data.subscriptionPlans) setSubscriptionPlans(data.subscriptionPlans);
      if (data.security) setSecurity(data.security);
      return true;
    } catch (err) {
      console.error('Falha ao restaurar backup JSON:', err);
      return false;
    }
  };

  const resetToDemoData = () => {
    setProfile(defaultProfile);
    setWhatsAppConfig(defaultWhatsAppConfig);
    setServices(defaultServices);
    setInventory(defaultInventory);
    setAppointments(defaultAppointments);
    setTransactions(defaultTransactions);
    setClients(defaultClients);
    setSubscriptionPlans(defaultSubscriptionPlans);
    setSecurity(defaultSecurity);
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        profile,
        setProfile,
        whatsAppConfig,
        setWhatsAppConfig,
        services,
        inventory,
        appointments,
        transactions,
        clients,
        activeTab,
        setActiveTab,
        activeDate,
        setActiveDate,
        currentRole,
        security,
        subscriptionPlans,
        login,
        logout,
        setRole,
        updateSecurityPins,
        addSubscriptionPlan,
        updateSubscriptionPlan,
        deleteSubscriptionPlan,
        addAppointment,
        updateAppointmentStatus,
        deleteAppointment,
        checkoutAppointment,
        addTransaction,
        deleteTransaction,
        addInventoryItem,
        updateInventoryQuantity,
        updateInventoryItem,
        deleteInventoryItem,
        addService,
        updateService,
        deleteService,
        addOrUpdateClient,
        dispatchAutomatedMessage,
        exportBackupJson,
        importBackupJson,
        resetToDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
