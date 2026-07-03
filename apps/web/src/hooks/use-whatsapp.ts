import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export interface WhatsAppConfig {
  id: string;
  tenantId: string;
  phoneNumberId: string;
  businessAccountId?: string | null;
  displayPhoneNumber?: string | null;
  isActive: boolean;
  aiBotEnabled: boolean;
  accessTokenPreview: string;
  createdAt: string;
  updatedAt: string;
}

export interface WhatsAppConversationSummary {
  contact: string;
  patient: { id: string; firstName: string; lastName: string } | null;
  lastMessage: {
    content: string | null;
    sentAt: string;
    direction: "OUTBOUND" | "INBOUND";
    respondedByAi: boolean;
    status: string;
  };
  messageCount: number;
}

export function useWhatsAppConfig() {
  return useQuery({
    queryKey: ["whatsapp", "config"],
    queryFn: () => api.get<WhatsAppConfig | null>("/whatsapp/config"),
  });
}

export function useUpsertWhatsAppConfig() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post<WhatsAppConfig>("/whatsapp/config", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", "config"] }),
  });
}

export function useWhatsAppConversations() {
  return useQuery({
    queryKey: ["whatsapp", "conversations"],
    queryFn: () => api.get<WhatsAppConversationSummary[]>("/whatsapp/conversations"),
  });
}

export function useWhatsAppConversation(contact: string | undefined) {
  return useQuery({
    queryKey: ["whatsapp", "conversations", contact],
    queryFn: () => api.get<any[]>(`/whatsapp/conversations/${encodeURIComponent(contact!)}`),
    enabled: !!contact,
  });
}

export function useSendWhatsAppMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { to: string; message: string; patientId?: string }) => api.post("/whatsapp/send", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["whatsapp", "conversations"] }),
  });
}
