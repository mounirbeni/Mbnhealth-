"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Package, Plus, ArrowDownCircle, ArrowUpCircle, DollarSign, PackageX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { StatCard } from "@/components/dashboard/stat-card";
import { useAdjustStock, useCreateInventoryItem, useInventory } from "@/hooks/use-inventory";
import { useInventoryReport } from "@/hooks/use-reports";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

function NewItemDialog() {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const createItem = useCreateInventoryItem();
  const { register, handleSubmit, reset } = useForm<{
    name: string;
    category?: string;
    quantity: string;
    reorderLevel: string;
    unitCost?: string;
    unit?: string;
  }>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> {t("dashboard.inventory.newItem")}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{t("dashboard.inventory.newItemDialogTitle")}</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createItem.mutateAsync({
                ...v,
                quantity: Number(v.quantity),
                reorderLevel: Number(v.reorderLevel) || 0,
                unitCost: v.unitCost ? Number(v.unitCost) : undefined,
              });
              toast.success(t("dashboard.inventory.addedToast"));
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.inventory.addFailedToast"));
            }
          })}
          className="grid grid-cols-2 gap-3"
        >
          <div className="col-span-2 space-y-1.5">
            <Label>{t("dashboard.inventory.nameLabel")}</Label>
            <Input {...register("name", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.inventory.categoryLabel")}</Label>
            <Input {...register("category")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.inventory.unitLabel")}</Label>
            <Input {...register("unit")} placeholder={t("dashboard.inventory.unitPlaceholder")} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.inventory.quantityLabel")}</Label>
            <Input type="number" {...register("quantity", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.inventory.reorderLevelLabel")}</Label>
            <Input type="number" {...register("reorderLevel")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>{t("dashboard.inventory.unitCostLabel")}</Label>
            <Input type="number" step="0.01" {...register("unitCost")} />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="submit">{t("dashboard.inventory.addItem")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function AdjustStockDialog({
  itemId,
  itemName,
  type,
}: {
  itemId: string;
  itemName: string;
  type: "RESTOCK" | "CONSUMPTION";
}) {
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const adjustStock = useAdjustStock();
  const { register, handleSubmit, reset } = useForm<{ quantity: string; reason?: string }>({ defaultValues: { quantity: "1" } });
  const isRestock = type === "RESTOCK";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="icon" variant="ghost" title={isRestock ? t("dashboard.inventory.restockTitle") : t("dashboard.inventory.useTitle")}>
          {isRestock ? <ArrowUpCircle className="h-4 w-4 text-success" /> : <ArrowDownCircle className="h-4 w-4 text-warning" />}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {isRestock ? t("dashboard.inventory.restockTitle") : t("dashboard.inventory.useTitle")} — {itemName}
          </DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await adjustStock.mutateAsync({ id: itemId, data: { type, quantity: Number(v.quantity), reason: v.reason } });
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : t("dashboard.inventory.addFailedToast"));
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>{t("dashboard.inventory.quantityLabel")}</Label>
            <Input type="number" min={1} {...register("quantity", { required: true, min: 1 })} />
          </div>
          <div className="space-y-1.5">
            <Label>{t("dashboard.inventory.reasonLabel")}</Label>
            <Input {...register("reason")} placeholder={t("dashboard.inventory.reasonPlaceholder")} />
          </div>
          <DialogFooter>
            <Button type="submit">{t("common.save")}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function InventoryPage() {
  const { data: items, isLoading } = useInventory();
  const { data: report } = useInventoryReport();
  const { hasPermission } = useAuth();
  const { t } = useLocale();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">{t("dashboard.inventory.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.inventory.subtitle")}</p>
        </div>
        {hasPermission("INVENTORY_WRITE") && <NewItemDialog />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label={t("dashboard.reports.totalItems")} value={report?.totalItems ?? 0} icon={Package} />
        <StatCard label={t("dashboard.reports.lowStockItems")} value={report?.lowStockCount ?? 0} icon={PackageX} accent="warning" />
        <StatCard label={t("dashboard.reports.totalValue")} value={formatCurrency(report?.totalValue ?? 0)} icon={DollarSign} accent="success" />
      </div>

      <div className="surface-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("dashboard.inventory.colItem")}</TableHead>
              <TableHead>{t("dashboard.inventory.colCategory")}</TableHead>
              <TableHead>{t("dashboard.inventory.colQuantity")}</TableHead>
              <TableHead>{t("dashboard.inventory.colUnitCost")}</TableHead>
              <TableHead>{t("dashboard.inventory.colStatus")}</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {Array.from({ length: 6 }).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-4 w-full" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : items && items.length > 0 ? (
              items.map((item) => {
                const low = item.quantity <= item.reorderLevel;
                return (
                  <TableRow key={item.id}>
                    <TableCell className="flex items-center gap-2 font-medium">
                      <Package className="h-4 w-4 text-primary" /> {item.name}
                    </TableCell>
                    <TableCell>{item.category ?? "—"}</TableCell>
                    <TableCell>
                      {item.quantity} {item.unit}
                    </TableCell>
                    <TableCell>{item.unitCost ? formatCurrency(Number(item.unitCost)) : "—"}</TableCell>
                    <TableCell>
                      <Badge variant={low ? "destructive" : "success"}>
                        {low ? t("dashboard.inventory.lowStock") : t("dashboard.inventory.inStock")}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {hasPermission("INVENTORY_WRITE") && (
                        <>
                          <AdjustStockDialog itemId={item.id} itemName={item.name} type="RESTOCK" />
                          <AdjustStockDialog itemId={item.id} itemName={item.name} type="CONSUMPTION" />
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.inventory.empty")}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
