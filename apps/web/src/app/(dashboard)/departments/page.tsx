"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { Plus, Trash2, Building2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateDepartment, useDeleteDepartment, useDepartments } from "@/hooks/use-departments";
import { useAuth } from "@/lib/auth-context";
import { ApiError } from "@/lib/api-client";

function NewDepartmentDialog() {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, reset } = useForm<{ name: string; description?: string; color?: string }>();
  const createDepartment = useCreateDepartment();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Department
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New department</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createDepartment.mutateAsync(v);
              toast.success("Department created");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed");
            }
          })}
          className="space-y-4"
        >
          <div className="space-y-1.5">
            <Label>Name</Label>
            <Input {...register("name", { required: true })} placeholder="Cardiology" />
          </div>
          <div className="space-y-1.5">
            <Label>Description</Label>
            <Input {...register("description")} />
          </div>
          <div className="space-y-1.5">
            <Label>Color</Label>
            <Input type="color" {...register("color")} defaultValue="#0EA5E9" className="h-9 w-16 p-1" />
          </div>
          <DialogFooter>
            <Button type="submit">Create</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function DepartmentsPage() {
  const { data: departments, isLoading } = useDepartments();
  const deleteDepartment = useDeleteDepartment();
  const { hasPermission } = useAuth();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Departments</h1>
          <p className="text-sm text-muted-foreground">Organize doctors and appointments by department</p>
        </div>
        {hasPermission("DEPARTMENTS_MANAGE") && <NewDepartmentDialog />}
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Loading...</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {departments?.map((dept) => (
            <Card key={dept.id}>
              <CardContent className="flex items-start gap-3 p-5">
                <div
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
                  style={{ backgroundColor: `${dept.color ?? "#0EA5E9"}22`, color: dept.color ?? "#0EA5E9" }}
                >
                  <Building2 className="h-5 w-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{dept.name}</p>
                  <p className="truncate text-sm text-muted-foreground">{dept.description ?? "No description"}</p>
                  <div className="mt-2 flex gap-2">
                    <Badge variant="secondary">{dept._count?.doctors ?? 0} doctors</Badge>
                    <Badge variant="secondary">{dept._count?.appointments ?? 0} appointments</Badge>
                  </div>
                </div>
                {hasPermission("DEPARTMENTS_MANAGE") && (
                  <Button variant="ghost" size="icon" onClick={() => deleteDepartment.mutate(dept.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
