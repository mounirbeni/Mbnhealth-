"use client";

import { useState } from "react";
import { Command } from "cmdk";
import { Check, ChevronsUpDown } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePatients } from "@/hooks/use-patients";

export function PatientCombobox({ value, onChange }: { value?: string; onChange: (id: string, label: string) => void }) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const { data } = usePatients({ search, pageSize: 20 });

  const selected = data?.items.find((p) => p.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" className="w-full justify-between font-normal">
          {selected ? `${selected.firstName} ${selected.lastName} (${selected.mrn})` : "Select patient..."}
          <ChevronsUpDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
        <Command shouldFilter={false}>
          <Command.Input
            value={search}
            onValueChange={setSearch}
            placeholder="Search patients..."
            className="w-full border-b border-border px-3 py-2 text-sm outline-none"
          />
          <Command.List className="max-h-64 overflow-y-auto p-1">
            <Command.Empty className="py-4 text-center text-sm text-muted-foreground">No patients found.</Command.Empty>
            {data?.items.map((p) => (
              <Command.Item
                key={p.id}
                onSelect={() => {
                  onChange(p.id, `${p.firstName} ${p.lastName}`);
                  setOpen(false);
                }}
                className="flex cursor-pointer items-center gap-2 rounded-md px-2 py-1.5 text-sm data-[selected=true]:bg-accent"
              >
                <Check className={cn("h-4 w-4", value === p.id ? "opacity-100" : "opacity-0")} />
                {p.firstName} {p.lastName}
                <span className="text-xs text-muted-foreground">{p.mrn}</span>
              </Command.Item>
            ))}
          </Command.List>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
