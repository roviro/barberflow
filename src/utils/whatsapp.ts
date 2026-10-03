import { formatDateBR, formatCurrency } from './formatters';
import type { Appointment, WhatsAppConfig } from '../types';

/**
 * Normaliza o telefone para o formato padrão do WhatsApp (com DDI 55 se necessário)
 */
export function normalizePhoneForWhatsApp(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 10 || digits.length === 11) {
    return `55${digits}`;
  }
  return digits;
}

/**
 * Cria o link direto para iniciar conversa no WhatsApp Web ou App (método 100% gratuito e seguro)
 */
export function createWhatsAppUrl(phone: string, message: string): string {
  const cleanPhone = normalizePhoneForWhatsApp(phone);
  const encodedMsg = encodeURIComponent(message);
  return `https://wa.me/${cleanPhone}?text=${encodedMsg}`;
}

/**
 * Envio de mensagem 100% automático via API de WhatsApp (Evolution API, Z-API ou Webhook)
 */
export async function sendWhatsAppViaApi(
  config: WhatsAppConfig,
  phone: string,
  message: string
): Promise<{ success: boolean; error?: string }> {
  if (!config.enabled || !config.apiUrl) {
    return { success: false, error: 'Disparo automático desativado ou API não configurada.' };
  }

  const cleanPhone = normalizePhoneForWhatsApp(phone);

  try {
    let endpoint = config.apiUrl;
    let headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    let body: any = {};

    if (config.provider === 'evolution-api') {
      const instance = config.instanceName || 'elite96';
      // Standard Evolution API v1 / v2 endpoint
      endpoint = `${config.apiUrl.replace(/\/+$/, '')}/message/sendText/${instance}`;
      headers['apikey'] = config.apiKey;
      body = {
        number: cleanPhone,
        options: {
          delay: 1200,
          presence: 'composing',
        },
        textMessage: {
          text: message,
        },
        text: message,
      };
    } else if (config.provider === 'z-api') {
      const instance = config.instanceName || '';
      // Z-API endpoint
      endpoint = `${config.apiUrl.replace(/\/+$/, '')}/instances/${instance}/token/${config.apiKey}/send-text`;
      body = {
        phone: cleanPhone,
        message: message,
      };
    } else {
      // Webhook personalizado (n8n, Make, Node backend)
      headers['Authorization'] = `Bearer ${config.apiKey}`;
      body = {
        phone: cleanPhone,
        message: message,
        timestamp: new Date().toISOString(),
      };
    }

    const res = await fetch(endpoint, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errText = await res.text();
      console.warn('Falha no envio de mensagem WhatsApp via API:', errText);
      return { success: false, error: `Status ${res.status}: ${errText}` };
    }

    return { success: true };
  } catch (err: any) {
    console.error('Erro de conexão com API de WhatsApp:', err);
    return { success: false, error: err?.message || 'Erro de conexão' };
  }
}

/**
 * Gera mensagem de lembrete de horário para o cliente
 */
export function generateReminderMessage(appointment: Appointment, barbershopName: string): string {
  const dateFormatted = formatDateBR(appointment.date);
  return `Fala, *${appointment.clientName}*! Tudo bem? 💈✂️

Passando para confirmar o seu horário na *${barbershopName}*:
🗓️ *Data:* ${dateFormatted}
⏰ *Horário:* ${appointment.time}
✂️ *Serviço:* ${appointment.serviceName}
💰 *Valor:* ${formatCurrency(appointment.price)}

Você confirma a sua presença? Caso tenha algum imprevisto, é só me dar um toque por aqui! 👊`;
}

/**
 * Gera mensagem de confirmação imediata de novo agendamento
 */
export function generateConfirmationMessage(appointment: Appointment, barbershopName: string): string {
  const dateFormatted = formatDateBR(appointment.date);
  return `Opa, *${appointment.clientName}*! Seu horário na *${barbershopName}* está garantido! 💈🔥

🗓️ *Data:* ${dateFormatted}
⏰ *Horário:* ${appointment.time}
✂️ *Serviço:* ${appointment.serviceName}
💰 *Valor:* ${formatCurrency(appointment.price)}

Te vejo lá na cadeira! Forte abraço! ✂️`;
}

/**
 * Gera mensagem de pós-atendimento / agradecimento
 */
export function generatePostCutMessage(appointment: Appointment, barbershopName: string): string {
  return `Fala, *${appointment.clientName}*! Beleza? 💈

Muito obrigado pela preferência e pela moral hoje na *${barbershopName}*! O corte ficou no grau! ✂️🔥

Qualquer dúvida ou quando quiser garantir o próximo horário, pode me chamar por aqui. Tamo junto!`;
}

/**
 * Gera texto para o barbeiro divulgar no Status do WhatsApp com link de agendamento online
 */
export function generateStatusAnnouncement(
  barbershopName: string,
  dateString: string,
  freeSlots: string[],
  bookingUrl: string
): string {
  const dateFormatted = formatDateBR(dateString);
  const slotsText = freeSlots.length > 0 
    ? freeSlots.map(s => `  • ${s}`).join('\n')
    : '  • Consulte horários no link abaixo';

  return `💈 *${barbershopName.toUpperCase()}* 💈
✂️ Horários disponíveis para *${dateFormatted}*:

${slotsText}

📲 *Agende direto pelo link em menos de 1 minuto:*
${bookingUrl}

Bora dar aquele talento no visual! 🔥`;
}
