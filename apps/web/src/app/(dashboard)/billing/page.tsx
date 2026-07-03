"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { StatCard } from "@/components/dashboard/stat-card";
import { InvoiceFormDialog } from "@/components/billing/invoice-form-dialog";
import { PaymentDialog } from "@/components/billing/payment-dialog";
import { useInvoices, useInsuranceClaims, useOutstandingBalance } from "@/hooks/use-billing";
import { useAuth } from "@/lib/auth-context";
import { formatCurrency, formatDate } from "@/lib/utils";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { DollarSign, FileWarning, Receipt } from "lucide-react";

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const { data: invoices, isLoading } = useInvoices({ page, pageSize: 20 });
  const { data: outstanding } = useOutstandingBalance();
  const { data: claims } = useInsuranceClaims();
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Billing</h1>
          <p className="text-sm text-muted-foreground">Invoices, payments and insurance claims</p>
        </div>
        {hasPermission("BILLING_WRITE") && <InvoiceFormDialog />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard label="Outstanding Balance" value={formatCurrency(outstanding?.outstanding ?? 0)} icon={DollarSign} accent="warning" />
        <StatCard label="Total Invoices" value={invoices?.total ?? 0} icon={Receipt} accent="primary" />
        <StatCard label="Open Insurance Claims" value={claims?.filter((c) => !["APPROVED", "REJECTED", "PAID"].includes(c.status)).length ?? 0} icon={FileWarning} accent="warning" />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">Invoices</TabsTrigger>
          <TabsTrigger value="claims">Insurance Claims</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Patient</TableHead>
                  <TableHead>Issued</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Paid</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      Loading invoices...
                    </TableCell>
                  </TableRow>
                ) : invoices && invoices.items.length > 0 ? (
                  invoices.items.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                      <TableCell>
                        {invoice.patient.firstName} {invoice.patient.lastName}
                      </TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{formatCurrency(Number(invoice.totalAmount))}</TableCell>
                      <TableCell>{formatCurrency(Number(invoice.paidAmount))}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANT[invoice.status] ?? "secondary"}>{invoice.status}</Badge>
                      </TableCell>
                      <TableCell>
                        {invoice.status !== "PAID" && invoice.status !== "VOID" && hasPermission("BILLING_WRITE") && (
                          <PaymentDialog invoiceId={invoice.id} balanceDue={Number(invoice.totalAmount) - Number(invoice.paidAmount)} />
                        )}
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      No invoices yet.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardContent className="divide-y divide-border p-0">
              {claims && claims.length > 0 ? (
                claims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4">
                    <div>
                      <p className="text-sm font-medium">
                        {claim.patient.firstName} {claim.patient.lastName} · {claim.provider}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Claimed {formatCurrency(Number(claim.claimAmount))} · {formatDate(claim.submittedAt)}
                      </p>
                    </div>
                    <Badge variant={STATUS_BADGE_VARIANT[claim.status] ?? "secondary"}>{claim.status}</Badge>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground">No insurance claims submitted.</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
