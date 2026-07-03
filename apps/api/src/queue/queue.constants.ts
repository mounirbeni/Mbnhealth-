export const REMINDERS_QUEUE = "reminders";
export const WHATSAPP_INBOUND_QUEUE = "whatsapp-inbound";

export interface SendReminderJobData {
  appointmentId: string;
}

export interface WhatsAppInboundJobData {
  phoneNumberId: string;
  from: string;
  body: string;
  waMessageId: string;
  contactName?: string;
}
