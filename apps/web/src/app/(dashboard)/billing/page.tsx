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
import { useLocale } from "@/lib/i18n/locale-context";

export default function BillingPage() {
  const [page, setPage] = useState(1);
  const { data: invoices, isLoading } = useInvoices({ page, pageSize: 20 });
  const { data: outstanding } = useOutstandingBalance();
  const { data: claims } = useInsuranceClaims();
  const { hasPermission } = useAuth();
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("dashboard.billing.title")}</h1>
          <p className="text-sm text-muted-foreground">{t("dashboard.billing.subtitle")}</p>
        </div>
        {hasPermission("BILLING_WRITE") && <InvoiceFormDialog />}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          label={t("dashboard.billing.outstandingBalance")}
          value={formatCurrency(outstanding?.outstanding ?? 0)}
          icon={DollarSign}
          accent="warning"
        />
        <StatCard label={t("dashboard.billing.totalInvoices")} value={invoices?.total ?? 0} icon={Receipt} accent="primary" />
        <StatCard
          label={t("dashboard.billing.openClaims")}
          value={claims?.filter((c) => !["APPROVED", "REJECTED", "PAID"].includes(c.status)).length ?? 0}
          icon={FileWarning}
          accent="warning"
        />
      </div>

      <Tabs defaultValue="invoices">
        <TabsList>
          <TabsTrigger value="invoices">{t("dashboard.billing.invoicesTab")}</TabsTrigger>
          <TabsTrigger value="claims">{t("dashboard.billing.claimsTab")}</TabsTrigger>
        </TabsList>

        <TabsContent value="invoices">
          <div className="rounded-xl border border-border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboard.billing.colInvoiceNumber")}</TableHead>
                  <TableHead>{t("dashboard.billing.colPatient")}</TableHead>
                  <TableHead>{t("dashboard.billing.colIssued")}</TableHead>
                  <TableHead>{t("dashboard.billing.colTotal")}</TableHead>
                  <TableHead>{t("dashboard.billing.colPaid")}</TableHead>
                  <TableHead>{t("dashboard.billing.colStatus")}</TableHead>
                  <TableHead />
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7} className="py-8 text-center text-muted-foreground">
                      {t("dashboard.billing.loadingInvoices")}
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
                        <Badge variant={STATUS_BADGE_VARIANT[invoice.status] ?? "secondary"}>
                          {t(`workflowStatus.${invoice.status}`)}
                        </Badge>
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
                      {t("dashboard.billing.noInvoices")}
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
                        {t("dashboard.billing.claimedAmount", { amount: formatCurrency(Number(claim.claimAmount)) })} ·{" "}
                        {formatDate(claim.submittedAt)}
                      </p>
                    </div>
                    <Badge variant={STATUS_BADGE_VARIANT[claim.status] ?? "secondary"}>
                      {t(`workflowStatus.${claim.status}`)}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="p-6 text-center text-sm text-muted-foreground">{t("dashboard.billing.noClaims")}</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
