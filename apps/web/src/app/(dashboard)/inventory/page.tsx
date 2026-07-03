"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Package, Plus, ArrowDownCircle, ArrowUpCircle } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAdjustStock, useCreateInventoryItem, useInventory } from "@/hooks/use-inventory";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";
import { formatCurrency } from "@/lib/utils";

function NewItemDialog() {
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
          <Plus /> New Item
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New inventory item</DialogTitle>
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
              toast.success("Item added to inventory");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed");
            }
          })}
          className="grid grid-cols-2 gap-3"
        >
          <div className="col-span-2 space-y-1.5">
            <Label>Name</Label>
            <Input {...register("name", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Input {...register("category")} />
          </div>
          <div className="space-y-1.5">
            <Label>Unit</Label>
            <Input {...register("unit")} placeholder="box, unit..." />
          </div>
          <div className="space-y-1.5">
            <Label>Quantity</Label>
            <Input type="number" {...register("quantity", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Reorder level</Label>
            <Input type="number" {...register("reorderLevel")} />
          </div>
          <div className="col-span-2 space-y-1.5">
            <Label>Unit cost</Label>
            <Input type="number" step="0.01" {...register("unitCost")} />
          </div>
          <DialogFooter className="col-span-2">
            <Button type="submit">Add item</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function InventoryPage() {
  const { data: items, isLoading } = useInventory();
  const adjustStock = useAdjustStock();
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Inventory</h1>
          <p className="text-sm text-muted-foreground">Track supplies and stock levels</p>
        </div>
        {hasPermission("INVENTORY_WRITE") && <NewItemDialog />}
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Item</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Unit cost</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
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
                      <Badge variant={low ? "destructive" : "success"}>{low ? "Low stock" : "In stock"}</Badge>
                    </TableCell>
                    <TableCell className="space-x-1">
                      {hasPermission("INVENTORY_WRITE") && (
                        <>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => adjustStock.mutate({ id: item.id, data: { type: "RESTOCK", quantity: 10 } })}
                            title="Restock +10"
                          >
                            <ArrowUpCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            onClick={() => adjustStock.mutate({ id: item.id, data: { type: "CONSUMPTION", quantity: 1 } })}
                            title="Use 1"
                          >
                            <ArrowDownCircle className="h-4 w-4 text-warning" />
                          </Button>
                        </>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="py-8 text-center text-muted-foreground">
                  No inventory items yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
