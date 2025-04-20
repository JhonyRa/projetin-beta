"use client";

import { useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

export type PermissionItem = {
  id: string;
  name: string;
  type: "user" | "group";
};

// Mock data for users and groups
const mockData = [
  { id: "user1", name: "John Doe", type: "user" },
  { id: "user2", name: "Jane Smith", type: "user" },
  { id: "user3", name: "Bob Johnson", type: "user" },
  { id: "group1", name: "Marketing Team", type: "group" },
  { id: "group2", name: "Development Team", type: "group" },
  { id: "group3", name: "Management", type: "group" },
] as PermissionItem[];

interface PermissionSelectorProps {
  onSelect: (items: PermissionItem[]) => void;
  initialPermissions?: PermissionItem[];
}

export function PermissionSelector({
  onSelect,
  initialPermissions = [],
}: PermissionSelectorProps) {
  const [open, setOpen] = useState(false);
  const [selectedItems, setSelectedItems] =
    useState<PermissionItem[]>(initialPermissions);

  const handleSelect = (item: PermissionItem) => {
    const newSelectedItems = selectedItems.some((i) => i.id === item.id)
      ? selectedItems.filter((i) => i.id !== item.id)
      : [...selectedItems, item];
    setSelectedItems(newSelectedItems);
    onSelect(newSelectedItems);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedItems.length > 0
            ? `${selectedItems.length} selected`
            : "Select users or groups"}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput placeholder="Search users or groups..." />
          <CommandEmpty>No user or group found.</CommandEmpty>
          <CommandGroup>
            {mockData.map((item) => (
              <CommandItem key={item.id} onSelect={() => handleSelect(item)}>
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    selectedItems.some((i) => i.id === item.id)
                      ? "opacity-100"
                      : "opacity-0"
                  )}
                />
                {item.name}
                <span className="ml-auto text-xs text-muted-foreground">
                  {item.type}
                </span>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}