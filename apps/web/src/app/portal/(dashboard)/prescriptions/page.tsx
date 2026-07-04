"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { usePortalPrescriptions } from "@/hooks/use-portal-data";
import { STATUS_BADGE_VARIANT } from "@/lib/status-styles";
import { formatDate } from "@/lib/utils";

export default function PortalPrescriptionsPage() {
  const { data: prescriptions, isLoading } = usePortalPrescriptions();

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold tracking-tight">Prescriptions</h1>
        <p className="text-sm text-muted-foreground">Medications prescribed by your care team</p>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : prescriptions && prescriptions.length > 0 ? (
        <div className="space-y-3">
          {prescriptions.map((p: any) => (
            <Card key={p.id}>
              <CardHeader className="flex-row items-center justify-between space-y-0">
                <div>
                  <CardTitle className="text-base">
                    {formatDate(p.issuedDate)} · Dr. {p.doctor?.user?.firstName} {p.doctor?.user?.lastName}
                  </CardTitle>
                  {p.notes && <CardDescription>{p.notes}</CardDescription>}
                </div>
                <Badge variant={STATUS_BADGE_VARIANT[p.status] ?? "secondary"}>{p.status}</Badge>
              </CardHeader>
              <CardContent>
                <ul className="space-y-1 text-sm">
                  {p.items?.map((item: any) => (
                    <li key={item.id}>
                      <span className="font-medium">{item.drugName}</span>
                      {item.dosage ? ` — ${item.dosage}` : ""}
                      {item.frequency ? `, ${item.frequency}` : ""}
                      {item.duration ? `, ${item.duration}` : ""}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">No prescriptions yet.</p>
      )}
    </div>
  );
}
