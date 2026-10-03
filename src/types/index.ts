export type PaymentMethod = 'pix' | 'dinheiro' | 'cartao_credito' | 'cartao_debito' | 'outro';

export type AppointmentStatus = 'pendente' | 'confirmado' | 'em_atendimento' | 'concluido' | 'cancelado';

export type InventoryType = 'revenda' | 'insumo';

export type TransactionType = 'receita' | 'despesa';

export interface WhatsAppConfig {
  enabled: boolean;
  provider: 'evolution-api' | 'z-api' | 'webhook';
  apiUrl: string; // Ex: https://api.meuhost.com
  apiKey: string;
  instanceName?: string; // Para Evolution API / Z-API
  autoSendOnBooking: boolean;
  autoSendReminder: boolean;
}

export interface BarberProfile {
  name: string;
  barberName: string;
  phone: string;
  address: string;
  pixKey?: string;
  openingTime: string; // "08:00"
  closingTime: string; // "20:00"
  intervalMinutes: number; // 30 or 45 or 60
  logoUrl?: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  durationMinutes: number;
  category: string;
  description: string;
  popular?: boolean;
}

export interface Appointment {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  price: number;
  status: AppointmentStatus;
  paymentMethod?: PaymentMethod;
  notes?: string;
  productsAdded?: { itemId: string; name: string; price: number; quantity: number }[];
  createdAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  type: InventoryType; // 'revenda' or 'insumo'
  category: string;
  quantity: number;
  minQuantity: number;
  costPrice: number;
  salePrice?: number;
  unit: string; // 'unid', 'caixa', 'frasco', 'rolo'
  lastRestocked: string;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  category: string;
  description: string;
  amount: number;
  date: string; // YYYY-MM-DD
  paymentMethod: PaymentMethod;
  relatedAppointmentId?: string;
  relatedInventoryId?: string;
  createdAt: string;
}

export interface Client {
  id: string;
  name: string;
  phone: string;
  notes?: string;
  totalVisits: number;
  lastVisit?: string;
  totalSpent: number;
  planId?: string;
}

export type UserRole = 'cliente' | 'admin' | 'configuracao';

export interface SubscriptionPlan {
  id: string;
  name: string;
  frequency: string; // ex: 'Semanal', 'A cada 10 dias', 'A cada 15 dias'
  cutsCount: number; // 4, 3, 2
  price: number; // 109.99, 89.00, 59.99
  description: string;
  popular?: boolean;
}

export interface AccessSecurity {
  adminPin: string; // padrão: '9696'
  techPin: string;  // padrão: 'admin96'
}
