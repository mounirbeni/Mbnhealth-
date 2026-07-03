import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api-client";

export function useThreads() {
  return useQuery({ queryKey: ["message-threads"], queryFn: () => api.get<any[]>("/messages/threads") });
}

export function useThreadMessages(threadId: string | undefined) {
  return useQuery({
    queryKey: ["message-threads", threadId],
    queryFn: () => api.get<any[]>(`/messages/threads/${threadId}`),
    enabled: !!threadId,
  });
}

export function useSendMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ threadId, body }: { threadId: string; body: string }) =>
      api.post(`/messages/threads/${threadId}/messages`, { body }),
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ["message-threads", vars.threadId] });
      qc.invalidateQueries({ queryKey: ["message-threads"] });
    },
  });
}

export function useCreateThread() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { subject?: string; participantIds: string[] }) => api.post("/messages/threads", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["message-threads"] }),
  });
}

export function useMessageTemplates() {
  return useQuery({ queryKey: ["message-templates"], queryFn: () => api.get<any[]>("/messages/templates") });
}

export function useCreateTemplate() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/messages/templates", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["message-templates"] }),
  });
}

export function useCommunicationLogs() {
  return useQuery({ queryKey: ["communication-logs"], queryFn: () => api.get<any[]>("/messages/logs") });
}

export function useSendCommunication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: Record<string, unknown>) => api.post("/messages/send", data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["communication-logs"] }),
  });
}
