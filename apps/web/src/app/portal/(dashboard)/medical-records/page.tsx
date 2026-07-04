"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { usePortalMedicalRecords } from "@/hooks/use-portal-data";
import { formatDate } from "@/lib/utils";

export default function PortalMedicalRecordsPage() {
  const { data: records, isLoading } = usePortalMedicalRecords();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Medical Records</h1>
        <p className="text-sm text-muted-foreground">Visit notes finalized by your care team</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : records && records.length > 0 ? (
        <div className="space-y-3">
          {records.map((r: any) => (
            <Card key={r.id}>
              <CardHeader>
                <CardTitle className="text-base">
                  Visit on {formatDate(r.visitDate)} · Dr. {r.doctor?.user?.firstName} {r.doctor?.user?.lastName}
                </CardTitle>
                <CardDescription>{r.status}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                {r.assessment && (
                  <p>
                    <span className="font-medium">Assessment: </span>
                    {r.assessment}
                  </p>
                )}
                {r.plan && (
                  <p>
                    <span className="font-medium">Plan: </span>
                    {r.plan}
                  </p>
                )}
                {!r.assessment && !r.plan && <p className="text-muted-foreground">No details recorded.</p>}
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No medical records yet.</p>
      )}
    </div>
  );
}
