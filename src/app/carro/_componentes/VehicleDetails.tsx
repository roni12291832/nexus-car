import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Tag } from "lucide-react";
import { ImageGallery } from "./ImageGallery";
import { StatusBadge } from "./StatusBadge";
import { VehicleTypeBadge } from "./VehicleTypeBadge";
import type { Vehicle } from "../../../../types/vehicle";

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price);
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Left Column - Image Gallery */}
          <div
            className="lg:col-span-3 animate-fade-in"
            style={{ animationDelay: "0.1s" }}
          >
            <ImageGallery images={vehicle.image} alt={vehicle.name} />
          </div>

          {/* Right Column - Vehicle Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Status & Type Badges */}
            <div className="flex flex-wrap gap-3 animate-slide-in">
              <StatusBadge status={vehicle.status} />
              <VehicleTypeBadge type={vehicle.type} />
            </div>

            {/* Vehicle Title */}
            <div
              className="animate-slide-in"
              style={{ animationDelay: "0.3s" }}
            >
              <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                {vehicle.name}
              </h1>
              <p className="text-lg text-muted-foreground mt-1">
                {vehicle.model}
              </p>
            </div>

            {/* Year */}
            <div
              className="flex items-center gap-2 text-muted-foreground animate-slide-in"
              style={{ animationDelay: "0.35s" }}
            >
              <Calendar className="w-5 h-5" />
              <span className="text-lg">{vehicle.year}</span>
            </div>

            {/* Price Card */}
            <Card
              className="border-primary/20 bg-primary/5 animate-scale-in"
              style={{ animationDelay: "0.4s" }}
            >
              <CardContent className="p-6">
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <Tag className="w-4 h-4" />
                  <span className="text-sm">Preço</span>
                </div>
                <p className="text-4xl font-display font-bold text-primary">
                  {formatPrice(vehicle.price)}
                </p>
              </CardContent>
            </Card>

            {/* Vehicle Specs Summary */}
            <Card
              className="animate-fade-in"
              style={{ animationDelay: "0.6s" }}
            >
              <CardContent className="p-6">
                <h3 className="font-semibold text-foreground mb-4">Resumo</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Modelo</p>
                    <p className="font-medium">{vehicle.model}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Ano</p>
                    <p className="font-medium">{vehicle.year}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium">{vehicle.type}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium">{vehicle.status}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
