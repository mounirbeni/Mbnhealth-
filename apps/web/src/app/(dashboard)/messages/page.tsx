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
import { formatDateTime } from "@/lib/utils";
import { ApiError } from "@/lib/api-client";

function ThreadsTab() {
  const { data: threads } = useThreads();
  const [activeThread, setActiveThread] = useState<string | null>(null);
  const { data: messages } = useThreadMessages(activeThread ?? undefined);
  const sendMessage = useSendMessage();
  const [body, setBody] = useState("");

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      <Card className="md:col-span-1">
        <CardContent className="max-h-[28rem] divide-y divide-border overflow-y-auto p-0">
          {threads && threads.length > 0 ? (
            threads.map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveThread(t.id)}
                className={`w-full p-3 text-left text-sm hover:bg-accent ${activeThread === t.id ? "bg-accent" : ""}`}
              >
                <p className="font-medium">{t.subject ?? "Untitled thread"}</p>
                <p className="truncate text-xs text-muted-foreground">{t.messages?.[0]?.body ?? "No messages yet"}</p>
              </button>
            ))
          ) : (
            <p className="p-4 text-sm text-muted-foreground">No conversations yet.</p>
          )}
        </CardContent>
      </Card>
      <Card className="md:col-span-2">
        <CardContent className="flex h-[28rem] flex-col p-4">
          {!activeThread ? (
            <p className="m-auto text-sm text-muted-foreground">Select a conversation</p>
          ) : (
            <>
              <div className="flex-1 space-y-3 overflow-y-auto">
                {messages?.map((m) => (
                  <div key={m.id} className="rounded-lg border border-border p-2.5 text-sm">
                    <p className="text-xs font-medium text-muted-foreground">
                      {m.sender.firstName} {m.sender.lastName} · {formatDateTime(m.createdAt)}
                    </p>
                    <p>{m.body}</p>
                  </div>
                ))}
              </div>
              <form
                className="mt-3 flex gap-2"
                onSubmit={async (e) => {
                  e.preventDefault();
                  if (!body.trim()) return;
                  await sendMessage.mutateAsync({ threadId: activeThread, body });
                  setBody("");
                }}
              >
                <Input value={body} onChange={(e) => setBody(e.target.value)} placeholder="Type a message..." />
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
            <Plus /> New Template
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>New message template</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={handleSubmit(async (v) => {
              try {
                await createTemplate.mutateAsync(v);
                toast.success("Template created");
                reset();
                setOpen(false);
              } catch (e) {
                toast.error(e instanceof ApiError ? e.message : "Failed");
              }
            })}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <Label>Name</Label>
              <Input {...register("name", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Channel</Label>
              <Controller
                control={control}
                name="channel"
                render={({ field }) => (
                  <Select value={field.value} onValueChange={field.onChange}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="WHATSAPP">WhatsApp</SelectItem>
                      <SelectItem value="EMAIL">Email</SelectItem>
                    </SelectContent>
                  </Select>
                )}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Subject (email only)</Label>
              <Input {...register("subject")} />
            </div>
            <div className="space-y-1.5">
              <Label>Body</Label>
              <Textarea rows={3} {...register("body", { required: true })} placeholder="Hi {{patientName}}, ..." />
            </div>
            <DialogFooter>
              <Button type="submit">Create template</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {templates?.map((t) => (
          <Card key={t.id}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">{t.name}</p>
                <Badge variant="secondary">{t.channel}</Badge>
              </div>
              <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{t.body}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

function WhatsAppTab() {
  const { data: config } = useWhatsAppConfig();
  const { data: conversations } = useWhatsAppConversations();

  return (
    <div className="space-y-4">
      <Card>
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
                {config?.isActive ? "WhatsApp bot is connected" : "WhatsApp bot is not connected yet"}
              </p>
              <p className="text-xs text-muted-foreground">
                {config?.displayPhoneNumber ?? config?.phoneNumberId ?? "No phone number configured"}
                {config?.aiBotEnabled ? " · AI replies enabled" : " · AI replies off"}
              </p>
            </div>
          </div>
          <Button asChild size="sm" variant="outline">
            <Link href="/settings?tab=whatsapp">
              <SettingsIcon className="h-3.5 w-3.5" /> Configure
            </Link>
          </Button>
        </CardContent>
      </Card>

      <Card>
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
                      {c.lastMessage.direction === "OUTBOUND" ? "You: " : ""}
                      {c.lastMessage.content ?? "—"}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-right">
                  {c.lastMessage.respondedByAi && (
                    <Badge variant="secondary" className="gap-1">
                      <Bot className="h-3 w-3" /> AI
                    </Badge>
                  )}
                  <span className="text-xs text-muted-foreground">{formatDateTime(c.lastMessage.sentAt)}</span>
                </div>
              </div>
            ))
          ) : (
            <p className="p-6 text-center text-sm text-muted-foreground">
              No WhatsApp conversations yet. Once patients message your clinic&apos;s WhatsApp number, they&apos;ll show up
              here.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function LogsTab() {
  const { data: logs } = useCommunicationLogs();
  return (
    <Card>
      <CardContent className="divide-y divide-border p-0">
        {logs && logs.length > 0 ? (
          logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-3 text-sm">
              <div className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
                <span>{l.channel}</span>
              </div>
              <Badge variant={l.status === "SENT" ? "success" : "secondary"}>{l.status}</Badge>
              <span className="text-xs text-muted-foreground">{formatDateTime(l.sentAt)}</span>
            </div>
          ))
        ) : (
          <p className="p-6 text-center text-sm text-muted-foreground">No communications sent yet.</p>
        )}
      </CardContent>
    </Card>
  );
}

export default function MessagesPage() {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Messages</h1>
        <p className="text-sm text-muted-foreground">Internal staff chat, reminder templates and delivery logs</p>
      </div>
      <Tabs defaultValue="whatsapp">
        <TabsList>
          <TabsTrigger value="whatsapp">WhatsApp Bot</TabsTrigger>
          <TabsTrigger value="threads">Staff Chat</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
          <TabsTrigger value="logs">Delivery Logs</TabsTrigger>
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
