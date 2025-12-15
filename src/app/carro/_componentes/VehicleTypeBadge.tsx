import { cn } from "@/lib/utils";
import { Car, Truck, CircleDot } from "lucide-react";
import type { Vehicle } from "../../../../types/vehicle";
import { Badge } from "@/components/ui/badge";

interface VehicleTypeBadgeProps {
  type: Vehicle["type"];
  className?: string;
}

export const typeConfig = {
  SUV: {
    icon: Truck,
    bgClass: "bg-blue-500/15",
    textClass: "text-blue-600",
  },
  Sedan: {
    icon: Car,
    bgClass: "bg-emerald-500/15",
    textClass: "text-emerald-600",
  },
  Hatch: {
    icon: CircleDot,
    bgClass: "bg-purple-500/15",
    textClass: "text-purple-600",
  },
  Crossover: {
    icon: Truck,
    bgClass: "bg-indigo-500/15",
    textClass: "text-indigo-600",
  },
  Minivan: {
    icon: Truck,
    bgClass: "bg-teal-500/15",
    textClass: "text-teal-600",
  },
  Caminhão: {
    icon: Truck,
    bgClass: "bg-orange-500/15",
    textClass: "text-orange-600",
  },
  Ônibus: {
    icon: Truck,
    bgClass: "bg-red-500/15",
    textClass: "text-red-600",
  },
  Jipe: {
    icon: Truck,
    bgClass: "bg-lime-500/15",
    textClass: "text-lime-600",
  },
  Quadriciclo: {
    icon: Truck,
    bgClass: "bg-fuchsia-500/15",
    textClass: "text-fuchsia-600",
  },
  Motocicleta: {
    icon: CircleDot,
    bgClass: "bg-yellow-500/20",
    textClass: "text-yellow-700",
  },
  Caminhonete: {
    icon: Truck,
    bgClass: "bg-cyan-500/15",
    textClass: "text-cyan-600",
  },
} as const;

export function VehicleTypeBadge({ type, className }: VehicleTypeBadgeProps) {
  const config = typeConfig[type];
  const Icon = config.icon;

  return (
    <Badge variant="outline">
      <Icon className="w-4 h-4" />
      {type}
    </Badge>
  );
}
