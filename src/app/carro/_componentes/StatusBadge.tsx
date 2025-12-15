import { cn } from "@/lib/utils";
import type { Vehicle } from "../../../../types/vehicle";
import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
  status: Vehicle["status"];
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <Badge>{status}</Badge>;
}
