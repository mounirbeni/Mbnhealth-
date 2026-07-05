"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { flexRender, getCoreRowModel, useReactTable, type ColumnDef } from "@tanstack/react-table";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PatientFormDialog } from "@/components/patients/patient-form-dialog";
import { usePatients } from "@/hooks/use-patients";
import { useAuth } from "@/lib/auth-context";
import { formatDate, initials } from "@/lib/utils";
import type { Patient } from "@/types";
import { useLocale } from "@/lib/i18n/locale-context";

export default function PatientsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const { hasPermission } = useAuth();
  const router = useRouter();
  const { data, isLoading } = usePatients({ search, page, pageSize: 20 });
  const { t } = useLocale();

  const columns = useMemo<ColumnDef<Patient>[]>(
    () => [
      {
        header: t("dashboard.patients.colPatient"),
        accessorKey: "firstName",
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <Avatar className="h-8 w-8">
              <AvatarFallback>{initials(row.original.firstName, row.original.lastName)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">
                {row.original.firstName} {row.original.lastName}
              </p>
              <p className="text-xs text-muted-foreground">{row.original.mrn}</p>
            </div>
          </div>
        ),
      },
      { header: t("dashboard.patients.colDob"), accessorKey: "dob", cell: ({ getValue }) => formatDate(getValue<string>()) },
      { header: t("dashboard.patients.colPhone"), accessorKey: "phone", cell: ({ getValue }) => getValue<string>() ?? "—" },
      {
        header: t("dashboard.patients.colBloodType"),
        accessorKey: "bloodType",
        cell: ({ getValue }) => getValue<string>() ?? "—",
      },
      {
        header: t("dashboard.patients.colStatus"),
        accessorKey: "status",
        cell: ({ getValue }) => (
          <Badge variant={getValue<string>() === "ACTIVE" ? "success" : "secondary"}>
            {t(`patientStatus.${getValue<string>()}`)}
          </Badge>
        ),
      },
      {
        header: t("dashboard.patients.colAppointments"),
        accessorFn: (row) => row._count?.appointments ?? 0,
      },
    ],
    [t],
  );

  const table = useReactTable({
    data: data?.items ?? [],
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const totalPages = data ? Math.max(1, Math.ceil(data.total / data.pageSize)) : 1;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">{t("dashboard.patients.title")}</h1>
          <p className="text-sm text-muted-foreground">
            {t("dashboard.patients.countRegistered", { count: data?.total ?? 0 })}
          </p>
        </div>
        {hasPermission("PATIENTS_WRITE") && <PatientFormDialog />}
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground rtl:left-auto rtl:right-3" />
        <Input
          placeholder={t("dashboard.patients.searchPlaceholder")}
          className="pl-9 rtl:pl-3 rtl:pr-9"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />
      </div>

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((hg) => (
              <TableRow key={hg.id}>
                {hg.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.patients.loading")}
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows.length === 0 ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="py-8 text-center text-muted-foreground">
                  {t("dashboard.patients.empty")}
                </TableCell>
              </TableRow>
            ) : (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  className="cursor-pointer"
                  onClick={() => router.push(`/patients/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
                  ))}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">{t("dashboard.patients.page", { page, totalPages })}</p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            {t("dashboard.patients.previous")}
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            {t("dashboard.patients.next")}
          </Button>
        </div>
      </div>
    </div>
  );
}
