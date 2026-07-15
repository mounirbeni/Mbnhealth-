"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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
  const { data: claims, isLoading: isLoadingClaims } = useInsuranceClaims();
  const { hasPermission } = useAuth();
  const { t } = useLocale();

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-page-title">{t("dashboard.billing.title")}</h1>
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
          <div className="surface-card overflow-hidden">
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
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 7 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
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
          <div className="surface-card overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("dashboard.billing.colPatient")}</TableHead>
                  <TableHead>{t("dashboard.billing.colProvider")}</TableHead>
                  <TableHead>{t("dashboard.billing.colClaimAmount")}</TableHead>
                  <TableHead>{t("dashboard.billing.colSubmitted")}</TableHead>
                  <TableHead>{t("dashboard.billing.colStatus")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingClaims ? (
                  Array.from({ length: 4 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 5 }).map((_, j) => (
                        <TableCell key={j}>
                          <Skeleton className="h-4 w-full" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : claims && claims.length > 0 ? (
                  claims.map((claim) => (
                    <TableRow key={claim.id}>
                      <TableCell className="font-medium">
                        {claim.patient.firstName} {claim.patient.lastName}
                      </TableCell>
                      <TableCell>{claim.provider}</TableCell>
                      <TableCell>{formatCurrency(Number(claim.claimAmount))}</TableCell>
                      <TableCell>{formatDate(claim.submittedAt)}</TableCell>
                      <TableCell>
                        <Badge variant={STATUS_BADGE_VARIANT[claim.status] ?? "secondary"}>
                          {t(`workflowStatus.${claim.status}`)}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                      {t("dashboard.billing.noClaims")}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
