"use client";

import Link from "next/link";
import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Bot, MessageSquare, Plus, Send, Settings as SettingsIcon, User } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { EmptyState } from "@/components/ui/empty-state";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import {
  useCreateTemplate,
  useMessageTemplates,
  useSendMessage,
  useThreadMessages,
  useThreads,
  useCommunicationLogs,
} from "@/hooks/use-messages";
import { useWhatsAppConfig, useWhatsAppConversations } from "@/hooks/use-whatsapp";
import { useAuth } from "@/lib/auth-context";
import { formatDateTime, initials } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";
import { useLocale } from "@/lib/i18n/locale-context";

interface PendingMessage {
  id: string;
  body: string;
  createdAt: string;
  pending: true;
}

function ThreadsTab() {
  const { t } = useLocale();
  const { user } = useAuth();
  const { data: threads } = useThreads();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const { data: messages } = useThreadMessages(activeThread ?? undefined);
  const sendMessage = useSendMessage();
  const [body, setBody] = useState("");
  const [pending, setPending] = useState<PendingMessage[]>([]);

  const selectThread = (id: string) => {
    setActiveThread(id);
    setPending([]);
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!body.trim() || !activeThread) return;
    const optimistic: PendingMessage = { id: `pending-${Date.now()}`, body, createdAt: new Date().toISOString(), pending: true };
    setPending((p) => [...p, optimistic]);
    setBody("");
    try {
      await sendMessage.mutateAsync({ threadId: activeThread, body: optimistic.body });
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : t("dashboard.messages.sendFailedToast"));
    } finally {
      setPending((p) => p.filter((m) => m.id !== optimistic.id));
    }
  };

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="surface-card md:col-span-1">
        <CardContent className="max-h-[28rem] divide-y divide-border overflow-y-auto p-0">
          {threads && threads.length > 0 ? (
            threads.map((t2) => (
              <button
                key={t2.id}
                onClick={() => selectThread(t2.id)}
                className={`w-full p-3 text-start text-sm transition-colors hover:bg-accent ${activeThread === t2.id ? "bg-accent" : ""}`}
              >
                <p className="font-medium">{t2.subject ?? t("dashboard.messages.untitledThread")}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {t2.messages?.[0]?.body ?? t("dashboard.messages.noMessagesYet")}
                </p>
              </button>
            ))
          ) : (
            <EmptyState icon={MessageSquare} title={t("dashboard.messages.noConversations")} size="sm" className="m-3" />
          )}
        </CardContent>
      </Card>
      <Card className="surface-card md:col-span-2">
        <CardContent className="flex h-[28rem] flex-col p-4">
          {!activeThread ? (
            <p className="m-auto text-sm text-muted-foreground">{t("dashboard.messages.selectConversation")}</p>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {[...(messages ?? []), ...pending].map((m: any) => {
                  const isMine = m.pending || m.sender?.id === user?.userId;
                  return (
                    <div key={m.id} className={`flex items-end gap-2 ${isMine ? "justify-end" : "justify-start"}`}>
                      {!isMine && (
                        <Avatar className="h-6 w-6 shrink-0">
                          <AvatarFallback className="text-[10px]">{initials(m.sender.firstName, m.sender.lastName)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div className={`max-w-[75%] space-y-0.5 ${isMine ? "items-end" : "items-start"} flex flex-col`}>
                        <div
                          className={`rounded-2xl px-3 py-2 text-sm ${
                            isMine ? "rounded-ee-sm bg-primary text-primary-foreground" : "rounded-es-sm bg-muted"
                          } ${m.pending ? "opacity-60" : ""}`}
                        >
                          {m.body}
                        </div>
                        <p className="px-1 text-[10px] text-muted-foreground">{formatDateTime(m.createdAt)}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
              <form className="mt-3 flex gap-2" onSubmit={handleSend}>
                <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder={t("dashboard.messages.typeMessagePlaceholder")} />
                <Button type="submit" size="icon">
                  <Send className="h-4 w-4" />
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function TemplatesTab() {
  const { t } = useLocale();
  const { data: templates } = useMessageTemplates();
  const createTemplate = useCreateTemplate();
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, control, reset } = useForm<{ name: string; channel: string; subject?: string; body: string }>({
    defaultValues: { channel: "WHATSAPP" },
  });

  return (
    <div className="space-y-3">
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm">
            <Plus /> {t("dashboard.messages.newTemplate")}
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t("dashboard.messages.newTemplateDialogTitle")}</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(async (v) => {
              try {
                await createTemplate.mutateAsync(v);
                toast.success(t("dashboard.messages.templateCreatedToast"));
                reset();
                setOpen(false);
              } catch (e) {
                toast.error(e instanceof ApiError ? e.message : t("dashboard.messages.templateFailedToast"));
              }
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>{t("dashboard.messages.nameLabel")}</Label>
              <Input {...register("name", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.messages.channelLabel")}</Label>
              <Controller
                control={control}
                name="channel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WHATSAPP">{t("dashboard.messages.whatsappChannel")}</SelectItem>
                      <SelectItem value="EMAIL">{t("dashboard.messages.emailChannel")}</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.messages.subjectEmailOnlyLabel")}</Label>
              <Input {...register("subject")} />
            </div>
            <div className="space-y-1.5">
              <Label>{t("dashboard.messages.bodyLabel")}</Label>
              <Textarea rows={3} {...register("body", { required: true })} placeholder={t("dashboard.messages.bodyPlaceholder")} />
            </div>
            <DialogFooter>
              <Button type="submit">{t("dashboard.messages.createTemplate")}</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {templates?.map((tpl) => (
          <Card key={tpl.id} className="surface-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{tpl.name}</p>
                <Badge variant="secondary">{tpl.channel}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{tpl.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WhatsAppTab() {
  const { t } = useLocale();
  const { data: config } = useWhatsAppConfig();
  const { data: conversations } = useWhatsAppConversations();

  return (
    <div className="space-y-4">
      <Card className="surface-card">
        <CardContent className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-9 w-9 items-center justify-center rounded-lg ${
                config?.isActive ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"
              }`}
            >
              <Bot className="h-4 w-4" />
            </div>
            <div>
              <p className="text-sm font-medium">
                {config?.isActive ? t("dashboard.messages.whatsappConnected") : t("dashboard.messages.whatsappNotConnected")}
              </p>
              <p className="text-xs text-muted-foreground">
                {config?.displayPhoneNumber ?? config?.phoneNumberId ?? t("dashboard.messages.noPhoneConfigured")}
                {config?.aiBotEnabled ? t("dashboard.messages.aiRepliesEnabled") : t("dashboard.messages.aiRepliesOff")}
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/settings?tab=whatsapp">
              <SettingsIcon className="h-3.5 w-3.5" /> {t("dashboard.messages.configure")}
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card className="surface-card">
        <CardContent className="divide-y divide-border p-0">
          {conversations && conversations.length > 0 ? (
            conversations.map((c) => (
              <div key={c.contact} className="flex items-center justify-between gap-3 p-4">
                <div className="flex items-center gap-3">
                  {c.patient ? <User className="h-4 w-4 text-primary" /> : <MessageSquare className="h-4 w-4 text-muted-foreground" />}
                  <div>
                    <p className="text-sm font-medium">
                      {c.patient ? `${c.patient.firstName} ${c.patient.lastName}` : c.contact}
                    </p>
                    <p className="line-clamp-1 max-w-md text-xs text-muted-foreground">
                      {c.lastMessage.direction === "OUTBOUND" ? t("dashboard.messages.youPrefix") : ""}
                      {c.lastMessage.content ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-end">
                  {c.lastMessage.respondedByAi && (
                    <Badge variant="secondary" className="gap-1">
                      <Bot className="h-3 w-3" /> {t("dashboard.messages.aiBadge")}
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.lastMessage.sentAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">
              {t("dashboard.messages.noWhatsappConversations")}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LogsTab() {
  const { t } = useLocale();
  const { data: logs } = useCommunicationLogs();
  return (
    <Card className="surface-card">
      <CardContent className="divide-y divide-border p-0">
        {logs && logs.length > 0 ? (
          logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-3 text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{l.channel}</span>
              </div>
              <Badge variant={l.status === "SENT" ? "success" : "secondary"}>{t(`workflowStatus.${l.status}`)}</Badge>
              <span className="text-xs text-muted-foreground">{formatDateTime(l.sentAt)}</span>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">{t("dashboard.messages.noCommunications")}</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MessagesPage() {
  const { t } = useLocale();
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-page-title">{t("dashboard.messages.title")}</h1>
        <p className="text-sm text-muted-foreground">{t("dashboard.messages.subtitle")}</p>
      </div>
      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="whatsapp">{t("dashboard.messages.whatsappTab")}</TabsTrigger>
          <TabsTrigger value="threads">{t("dashboard.messages.staffChatTab")}</TabsTrigger>
          <TabsTrigger value="templates">{t("dashboard.messages.templatesTab")}</TabsTrigger>
          <TabsTrigger value="logs">{t("dashboard.messages.deliveryLogsTab")}</TabsTrigger>
        </TabsList>
        <TabsContent value="whatsapp">
          <WhatsAppTab />
        </TabsContent>
        <TabsContent value="threads">
          <ThreadsTab />
        </TabsContent>
        <TabsContent value="templates">
          <TemplatesTab />
        </TabsContent>
        <TabsContent value="logs">
          <LogsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
