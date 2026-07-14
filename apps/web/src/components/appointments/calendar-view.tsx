"use client";

import { useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  addWeeks,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { useAppointments, useUpdateAppointment } from "@/hooks/use-appointments";
import { AppointmentDetailSheet } from "./appointment-detail-sheet";
import type { Appointment } from "@/types";
import { toast } from "sonner";
import { ApiError } from "@/lib/api-client";
import { transitionBase } from "@/lib/motion";

const START_HOUR = 8;
const END_HOUR = 19;
const HOUR_HEIGHT = 56;

type ViewMode = "day" | "week" | "month";

export function CalendarView() {
  const [view, setView] = useState<ViewMode>("week");
  const [cursor, setCursor] = useState(new Date());
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const updateAppointment = useUpdateAppointment();

  const range = useMemo(() => {
    if (view === "day") return { from: cursor, to: cursor };
    if (view === "week") return { from: startOfWeek(cursor, { weekStartsOn: 1 }), to: endOfWeek(cursor, { weekStartsOn: 1 }) };
    return { from: startOfMonth(cursor), to: endOfMonth(cursor) };
  }, [view, cursor]);

  const { data: appointments } = useAppointments({
    from: new Date(range.from.setHours(0, 0, 0, 0)).toISOString(),
    to: new Date(range.to.setHours(23, 59, 59, 999)).toISOString(),
  });

  const days = useMemo(() => {
    if (view === "day") return [cursor];
    if (view === "week") return eachDayOfInterval({ start: startOfWeek(cursor, { weekStartsOn: 1 }), end: endOfWeek(cursor, { weekStartsOn: 1 }) });
    return eachDayOfInterval({ start: startOfWeek(startOfMonth(cursor), { weekStartsOn: 1 }), end: endOfWeek(endOfMonth(cursor), { weekStartsOn: 1 }) });
  }, [view, cursor]);

  const navigate = (dir: 1 | -1) => {
    if (view === "day") setCursor((c) => addDays(c, dir));
    else if (view === "week") setCursor((c) => addWeeks(c, dir));
    else setCursor((c) => addMonths(c, dir));
  };

  const appointmentsFor = (day: Date) => (appointments ?? []).filter((a) => isSameDay(new Date(a.startTime), day));

  const handleDrop = async (day: Date, hour: number, minute: number) => {
    const dragged = window.__mbnDraggedAppointment as Appointment | undefined;
    if (!dragged) return;
    const duration = new Date(dragged.endTime).getTime() - new Date(dragged.startTime).getTime();
    const newStart = new Date(day);
    newStart.setHours(hour, minute, 0, 0);
    const newEnd = new Date(newStart.getTime() + duration);
    try {
      await updateAppointment.mutateAsync({
        id: dragged.id,
        data: { startTime: newStart.toISOString(), endTime: newEnd.toISOString() },
      });
      toast.success("Appointment rescheduled");
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Could not reschedule");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="icon" onClick={() => navigate(-1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button variant="outline" size="sm" onClick={() => setCursor(new Date())}>
            Today
          </Button>
          <Button variant="outline" size="icon" onClick={() => navigate(1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-2 text-sm font-medium">
            {view === "month" ? format(cursor, "MMMM yyyy") : `${format(range.from, "MMM d")} – ${format(range.to, "MMM d, yyyy")}`}
          </span>
        </div>
        <Tabs value={view} onValueChange={(v) => setView(v as ViewMode)}>
          <TabsList>
            <TabsTrigger value="day">Day</TabsTrigger>
            <TabsTrigger value="week">Week</TabsTrigger>
            <TabsTrigger value="month">Month</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {view === "month" ? (
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-xl border border-border bg-border">
          {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
            <div key={d} className="bg-muted px-2 py-1.5 text-center text-xs font-medium text-muted-foreground">
              {d}
            </div>
          ))}
          {days.map((day) => {
            const dayAppointments = appointmentsFor(day);
            return (
              <button
                key={day.toISOString()}
                onClick={() => {
                  setCursor(day);
                  setView("day");
                }}
                className={cn(
                  "min-h-24 bg-card p-2 text-left align-top hover:bg-accent/50",
                  !isSameMonth(day, cursor) && "opacity-40",
                )}
              >
                <span className={cn("text-xs font-medium", isSameDay(day, new Date()) && "text-primary")}>
                  {format(day, "d")}
                </span>
                <div className="mt-1 space-y-0.5">
                  {dayAppointments.slice(0, 3).map((a) => (
                    <div key={a.id} className="truncate rounded bg-primary/10 px-1 py-0.5 text-[10px] text-primary">
                      {format(new Date(a.startTime), "HH:mm")} {a.patient.firstName}
                    </div>
                  ))}
                  {dayAppointments.length > 3 && (
                    <p className="text-[10px] text-muted-foreground">+{dayAppointments.length - 3} more</p>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-border">
          <div className="flex min-w-[640px]">
            <div className="w-14 shrink-0 border-r border-border">
              <div className="h-10 border-b border-border" />
              {Array.from({ length: END_HOUR - START_HOUR }).map((_, i) => (
                <div key={i} style={{ height: HOUR_HEIGHT }} className="border-b border-border px-1 pt-0.5 text-right text-[10px] text-muted-foreground">
                  {String(START_HOUR + i).padStart(2, "0")}:00
                </div>
              ))}
            </div>
            {days.map((day) => (
              <div key={day.toISOString()} className="min-w-[140px] flex-1 border-r border-border last:border-r-0">
                <div className={cn("flex h-10 flex-col items-center justify-center border-b border-border text-xs font-medium", isSameDay(day, new Date()) && "bg-primary/5 text-primary")}>
                  <span>{format(day, "EEE")}</span>
                  <span className="text-[10px] text-muted-foreground">{format(day, "MMM d")}</span>
                </div>
                <div className="relative" style={{ height: (END_HOUR - START_HOUR) * HOUR_HEIGHT }}>
                  {Array.from({ length: (END_HOUR - START_HOUR) * 2 }).map((_, i) => (
                    <div
                      key={i}
                      style={{ height: HOUR_HEIGHT / 2, top: i * (HOUR_HEIGHT / 2) }}
                      className="absolute w-full border-b border-border/50"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={() => handleDrop(day, START_HOUR + Math.floor(i / 2), (i % 2) * 30)}
                    />
                  ))}
                  {appointmentsFor(day).map((a) => {
                    const start = new Date(a.startTime);
                    const end = new Date(a.endTime);
                    const startMinutes = (start.getHours() - START_HOUR) * 60 + start.getMinutes();
                    const durationMinutes = (end.getTime() - start.getTime()) / 60000;
                    const top = (startMinutes / 60) * HOUR_HEIGHT;
                    const height = Math.max(20, (durationMinutes / 60) * HOUR_HEIGHT - 2);
                    return (
                      <motion.div
                        key={a.id}
                        layout
                        transition={transitionBase}
                        whileHover={{ scale: 1.02 }}
                        draggable
                        onDragStart={() => {
                          window.__mbnDraggedAppointment = a;
                        }}
                        onClick={() => setSelectedAppointment(a)}
                        style={{ top, height }}
                        className="absolute left-1 right-1 cursor-pointer overflow-hidden rounded-md border border-primary/20 bg-primary/10 px-1.5 py-1 text-[11px] leading-tight text-primary shadow-sm"
                      >
                        <p className="truncate font-medium">
                          {format(start, "HH:mm")} {a.patient.firstName} {a.patient.lastName}
                        </p>
                        <p className="truncate opacity-80">Dr. {a.doctor.user.firstName}</p>
                        <Badge variant={STATUS_BADGE_VARIANT[a.status] ?? "secondary"} className="mt-0.5 px-1 py-0 text-[9px]">
                          {a.status}
                        </Badge>
                      </motion.div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedAppointment && (
        <AppointmentDetailSheet appointment={selectedAppointment} onClose={() => setSelectedAppointment(null)} />
      )}
    </div>
  );
}

declare global {
  interface Window {
    __mbnDraggedAppointment?: Appointment;
  }
}
