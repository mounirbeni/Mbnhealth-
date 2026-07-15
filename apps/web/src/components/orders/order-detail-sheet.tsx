import type { ReactNode } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { OrderStatusBadge } from "@/components/orders/order-status-badge";

export interface OrderDetailRow {
  label: string;
  value: ReactNode;
}

export function OrderDetailSheet({
  open,
  onOpenChange,
  title,
  status,
  rows,
  notes,
  notesLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  status: string;
  rows: OrderDetailRow[];
  notes?: string | null;
  notesLabel: string;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="end">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {title}
            <OrderStatusBadge status={status} />
          </SheetTitle>
          <SheetDescription className="sr-only">{title}</SheetDescription>
        </SheetHeader>
        <div className="grid grid-cols-2 gap-3 text-sm">
          {rows.map((row) => (
            <div key={row.label}>
              <p className="text-muted-foreground">{row.label}</p>
              <p className="font-medium">{row.value}</p>
            </div>
          ))}
        </div>
        {notes && (
          <div>
            <p className="text-sm text-muted-foreground">{notesLabel}</p>
            <p className="mt-1 rounded-lg border border-border bg-muted/40 p-3 text-sm">{notes}</p>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}
