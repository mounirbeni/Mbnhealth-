import { FileText, Stethoscope } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDateTime } from "@/lib/utils";
import { useLocale } from "@/lib/i18n/locale-context";

export interface MedicalRecordSummary {
  id: string;
  visitDate: string;
  status: string;
  subjective?: string | null;
  objective?: string | null;
  assessment?: string | null;
  plan?: string | null;
  doctor: { user: { firstName: string; lastName: string } };
  diagnoses?: { id: string; description: string }[];
}

export function RecordCard({
  record,
  onFinalize,
  isFinalizing,
  className,
}: {
  record: MedicalRecordSummary;
  onFinalize?: (id: string) => void;
  isFinalizing?: boolean;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <Stethoscope className="h-4 w-4 text-primary" />
          <CardTitle className="text-sm">
            {t("patientPortal.clinicProfile.doctorTitle", {
              name: `${record.doctor.user.firstName} ${record.doctor.user.lastName}`,
            })}{" "}
            · {formatDateTime(record.visitDate)}
          </CardTitle>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={record.status === "FINALIZED" ? "success" : "secondary"}>
            {t(`workflowStatus.${record.status}`)}
          </Badge>
          {record.status === "DRAFT" && onFinalize && (
            <Button size="sm" variant="outline" onClick={() => onFinalize(record.id)} disabled={isFinalizing}>
              {t("dashboard.medicalRecords.finalize")}
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 text-sm">
        <div>
          <p className="font-medium text-muted-foreground">{t("dashboard.medicalRecords.subjective")}</p>
          <p>{record.subjective || "—"}</p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">{t("dashboard.medicalRecords.objective")}</p>
          <p>{record.objective || "—"}</p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">{t("dashboard.medicalRecords.assessment")}</p>
          <p>{record.assessment || "—"}</p>
        </div>
        <div>
          <p className="font-medium text-muted-foreground">{t("dashboard.medicalRecords.plan")}</p>
          <p>{record.plan || "—"}</p>
        </div>
        {!!record.diagnoses?.length && (
          <div className="col-span-2 flex flex-wrap gap-1.5">
            {record.diagnoses.map((d) => (
              <Badge key={d.id} variant="outline">
                <FileText className="mr-1 h-3 w-3" /> {d.description}
              </Badge>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
