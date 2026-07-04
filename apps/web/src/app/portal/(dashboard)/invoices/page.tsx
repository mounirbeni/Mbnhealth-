"use client";

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { usePortalInvoices } from "@/hooks/use-portal-data";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function PortalInvoicesPage() {
  const { data: invoices, isLoading } = usePortalInvoices();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Invoices</h1>
        <p className="text-sm text-muted-foreground">Your billing history</p>
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice #</TableHead>
              <TableHead>Issue date</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Paid</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : invoices && invoices.length > 0 ? (
              invoices.map((inv: any) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.invoiceNumber}</TableCell>
                  <TableCell>{formatDate(inv.issueDate)}</TableCell>
                  <TableCell>{formatCurrency(Number(inv.totalAmount))}</TableCell>
                  <TableCell>{formatCurrency(Number(inv.paidAmount))}</TableCell>
                  <TableCell>
                    <Badge variant={STATUS_BADGE_VARIANT[inv.status] ?? "secondary"}>{inv.status}</Badge>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No invoices found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
