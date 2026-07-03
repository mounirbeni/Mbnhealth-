"use client";

import { useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import { Plus, UserX } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useCreateStaff, useDeactivateStaff, useRoles, useStaff } from "@/hooks/use-users";
import { ApiError } from "@/lib/api-client";
import { initials } from "@/lib/utils";

function NewStaffDialog() {
  const [open, setOpen] = useState(false);
  const { data: roles } = useRoles();
  const createStaff = useCreateStaff();
  const { register, handleSubmit, control, reset } = useForm<{
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    roleId: string;
  }>();

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm">
          <Plus /> New Staff Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite staff member</DialogTitle>
        </DialogHeader>
        <form
          onSubmit={handleSubmit(async (v) => {
            try {
              await createStaff.mutateAsync(v);
              toast.success("Staff member added");
              reset();
              setOpen(false);
            } catch (e) {
              toast.error(e instanceof ApiError ? e.message : "Failed");
            }
          })}
          className="space-y-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>First name</Label>
              <Input {...register("firstName", { required: true })} />
            </div>
            <div className="space-y-1.5">
              <Label>Last name</Label>
              <Input {...register("lastName", { required: true })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Email</Label>
            <Input type="email" {...register("email", { required: true })} />
          </div>
          <div className="space-y-1.5">
            <Label>Temporary password</Label>
            <Input type="password" {...register("password", { required: true, minLength: 8 })} />
          </div>
          <div className="space-y-1.5">
            <Label>Role</Label>
            <Controller
              control={control}
              name="roleId"
              rules={{ required: true }}
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {roles?.map((r) => (
                      <SelectItem key={r.id} value={r.id}>
                        {r.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </div>
          <DialogFooter>
            <Button type="submit">Add staff member</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function StaffPage() {
  const [search, setSearch] = useState("");
  const { data: staff, isLoading } = useStaff(search);
  const deactivate = useDeactivateStaff();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-semibold tracking-tight">Staff</h1>
          <p className="text-sm text-muted-foreground">Manage your clinic&apos;s team members and roles</p>
        </div>
        <NewStaffDialog />
      </div>

      <Input placeholder="Search staff..." value={search} onChange={(e) => setSearch(e.target.value)} className="max-w-sm" />

      <div className="rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Status</TableHead>
              <TableHead />
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  Loading...
                </TableCell>
              </TableRow>
            ) : staff && staff.length > 0 ? (
              staff.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="flex items-center gap-2 font-medium">
                    <Avatar className="h-7 w-7">
                      <AvatarFallback>{initials(s.firstName, s.lastName)}</AvatarFallback>
                    </Avatar>
                    {s.firstName} {s.lastName}
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">{s.role?.name}</Badge>
                  </TableCell>
                  <TableCell>{s.email}</TableCell>
                  <TableCell>
                    <Badge variant={s.isActive ? "success" : "secondary"}>{s.isActive ? "Active" : "Inactive"}</Badge>
                  </TableCell>
                  <TableCell>
                    {s.isActive && (
                      <Button size="icon" variant="ghost" onClick={() => deactivate.mutate(s.id)} title="Deactivate">
                        <UserX className="h-4 w-4 text-destructive" />
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={5} className="py-8 text-center text-muted-foreground">
                  No staff members found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
