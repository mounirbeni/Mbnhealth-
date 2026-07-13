"use client";

import { useState } from "react";
import { Share2, Bookmark, BookmarkCheck, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { patientApi, ApiError } from "@/lib/patient-api-client";
import { useLocale } from "@/lib/i18n/locale-context";
import { toast } from "sonner";

const FAVORITES_KEY = "mbn_directory_favorites";

function readFavorites(): string[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

export function ShareSaveBar({ slug, name }: { slug: string; name: string }) {
  const { t } = useLocale();
  const [saved, setSaved] = useState(() => readFavorites().includes(slug));

  const toggleSave = () => {
    const favorites = readFavorites();
    const next = saved ? favorites.filter((s) => s !== slug) : [...favorites, slug];
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(next));
    setSaved(!saved);
  };

  const share = async () => {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: name, url });
      } catch {
        // user cancelled — no-op
      }
      return;
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(url);
      toast.success(t("common.linkCopied"));
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="sm" onClick={share}>
        <Share2 className="h-3.5 w-3.5" /> {t("patientPortal.directory.share")}
      </Button>
      <Button variant={saved ? "secondary" : "outline"} size="sm" onClick={toggleSave}>
        {saved ? <BookmarkCheck className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        {saved ? t("patientPortal.directory.saved") : t("patientPortal.directory.save")}
      </Button>
    </div>
  );
}

export function RequestAppointmentForm({ slug }: { slug: string }) {
  const { t } = useLocale();
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [preferredDate, setPreferredDate] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await patientApi.post(
        `/public/directory/${slug}/inquiries`,
        { fullName, phone, email: email || undefined, preferredDate: preferredDate || undefined, notes: notes || undefined },
        { skipAuth: true },
      );
      setSent(true);
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Something went wrong");
    } finally {
      setSubmitting(false);
    }
  };

  if (sent) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-xl border border-success/30 bg-success/10 p-6 text-center">
        <CheckCircle2 className="h-6 w-6 text-success" />
        <p className="text-sm font-medium">{t("patientPortal.directory.requestSent")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <p className="text-xs text-muted-foreground">{t("patientPortal.directory.requestIntro")}</p>
      <div className="space-y-1.5">
        <Label htmlFor="fullName">{t("patientPortal.directory.requestFormName")}</Label>
        <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="phone">{t("patientPortal.directory.requestFormPhone")}</Label>
        <Input id="phone" required value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="email">{t("patientPortal.directory.requestFormEmail")}</Label>
        <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="preferredDate">{t("patientPortal.directory.requestFormDate")}</Label>
        <Input id="preferredDate" type="date" value={preferredDate} onChange={(e) => setPreferredDate(e.target.value)} />
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="notes">{t("patientPortal.directory.requestFormNotes")}</Label>
        <Textarea id="notes" rows={3} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </div>
      <Button type="submit" className="w-full" disabled={submitting}>
        {submitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : null}
        {submitting ? t("patientPortal.directory.requestFormSending") : t("patientPortal.directory.requestFormSubmit")}
      </Button>
    </form>
  );
}
