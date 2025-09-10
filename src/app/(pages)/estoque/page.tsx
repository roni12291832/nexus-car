"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Search, Filter, Eye } from "lucide-react";

import Image from "next/image";

import type { StaticImageData } from "next/image";

interface Vehicle {
  id: string;
  name: string;
  year: number;
  model: string;
  price: number;
  type: "SUV" | "Sedan" | "Hatch";
  image?: string | StaticImageData;
  status: "Disponível" | "Vendido" | "Reservado";
  views: number;
}

export default function Inventory() {
  const [vehicles] = useState<Vehicle[]>([
    {
      id: "1",
      name: "Honda HR-V",
      year: 2022,
      model: "EXL CVT",
      price: 95000,
      type: "SUV",

      status: "Disponível",
      views: 45,
    },
    {
      id: "2",
      name: "Honda Civic",
      year: 2020,
      model: "Sport",
      price: 85000,
      type: "Sedan",

      status: "Disponível",
      views: 32,
    },
    {
      id: "3",
      name: "Volkswagen Polo",
      year: 2021,
      model: "Highline",
      price: 65000,
      type: "Hatch",

      status: "Reservado",
      views: 28,
    },
  ]);

  const [filteredVehicles, setFilteredVehicles] = useState(vehicles);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    minPrice: "",
    maxPrice: "",
    year: "",
  });

  const [newVehicle, setNewVehicle] = useState({
    name: "",
    year: "",
    model: "",
    price: "",
    type: "",
  });

  const applyFilters = () => {
    let filtered = vehicles;

    if (filters.search) {
      filtered = filtered.filter(
        (vehicle) =>
          vehicle.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          vehicle.model.toLowerCase().includes(filters.search.toLowerCase())
      );
    }

    if (filters.type && filters.type !== "all") {
      filtered = filtered.filter((vehicle) => vehicle.type === filters.type);
    }

    if (filters.minPrice) {
      filtered = filtered.filter(
        (vehicle) => vehicle.price >= parseInt(filters.minPrice)
      );
    }

    if (filters.maxPrice) {
      filtered = filtered.filter(
        (vehicle) => vehicle.price <= parseInt(filters.maxPrice)
      );
    }

    if (filters.year) {
      filtered = filtered.filter(
        (vehicle) => vehicle.year.toString() === filters.year
      );
    }

    setFilteredVehicles(filtered);
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      type: "all",
      minPrice: "",
      maxPrice: "",
      year: "",
    });
    setFilteredVehicles(vehicles);
  };

  const addVehicle = () => {
    setNewVehicle({
      name: "",
      year: "",
      model: "",
      price: "",
      type: "",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Disponível":
        return "bg-success text-success-foreground";
      case "Reservado":
        return "bg-warning text-warning-foreground";
      case "Vendido":
        return "bg-destructive text-destructive-foreground";
      default:
        return "bg-muted text-muted-foreground";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-muted-foreground">
            Gerencie os veículos disponíveis em sua loja
          </p>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Veículo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Veículo</DialogTitle>
              <DialogDescription>
                Preencha as informações do veículo
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vehicleName">Nome do Veículo</Label>
                <Input
                  id="vehicleName"
                  placeholder="Honda Civic"
                  value={newVehicle.name}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, name: e.target.value })
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="vehicleYear">Ano</Label>
                  <Input
                    id="vehicleYear"
                    placeholder="2022"
                    value={newVehicle.year}
                    onChange={(e) =>
                      setNewVehicle({ ...newVehicle, year: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="vehicleType">Tipo</Label>
                  <Select
                    value={newVehicle.type}
                    onValueChange={(value) =>
                      setNewVehicle({ ...newVehicle, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="Hatch">Hatch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehicleModel">Modelo</Label>
                <Input
                  id="vehicleModel"
                  placeholder="EXL CVT"
                  value={newVehicle.model}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, model: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="vehiclePrice">Preço (R$)</Label>
                <Input
                  id="vehiclePrice"
                  placeholder="85000"
                  value={newVehicle.price}
                  onChange={(e) =>
                    setNewVehicle({ ...newVehicle, price: e.target.value })
                  }
                />
              </div>

              <Button onClick={addVehicle} className="w-full">
                Adicionar Veículo
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <div className="space-y-2">
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="search"
                  placeholder="Nome ou modelo"
                  className="pl-10"
                  value={filters.search}
                  onChange={(e) =>
                    setFilters({ ...filters, search: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterType">Tipo</Label>
              <Select
                value={filters.type}
                onValueChange={(value) =>
                  setFilters({ ...filters, type: value })
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="SUV">SUV</SelectItem>
                  <SelectItem value="Sedan">Sedan</SelectItem>
                  <SelectItem value="Hatch">Hatch</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minPrice">Preço Mín.</Label>
              <Input
                id="minPrice"
                placeholder="50000"
                value={filters.minPrice}
                onChange={(e) =>
                  setFilters({ ...filters, minPrice: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxPrice">Preço Máx.</Label>
              <Input
                id="maxPrice"
                placeholder="100000"
                value={filters.maxPrice}
                onChange={(e) =>
                  setFilters({ ...filters, maxPrice: e.target.value })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="filterYear">Ano</Label>
              <Input
                id="filterYear"
                placeholder="2022"
                value={filters.year}
                onChange={(e) =>
                  setFilters({ ...filters, year: e.target.value })
                }
              />
            </div>

            <div className="space-y-2 flex flex-col justify-end">
              <div className="flex gap-2">
                <Button onClick={applyFilters} size="sm">
                  Filtrar
                </Button>
                <Button onClick={clearFilters} variant="outline" size="sm">
                  Limpar
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Veículos */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <div className="aspect-video bg-muted relative">
              <Image
                src={vehicle.image}
                alt={`${vehicle.name} ${vehicle.year}`}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 right-2">
                <Badge className={getStatusColor(vehicle.status)}>
                  {vehicle.status}
                </Badge>
              </div>
            </div>

            <CardContent className="p-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold">
                    {vehicle.name} {vehicle.year}
                  </h3>
                  <Badge variant="secondary">{vehicle.type}</Badge>
                </div>

                <p className="text-sm text-muted-foreground">{vehicle.model}</p>

                <div className="flex items-center justify-between">
                  <div className="text-2xl font-bold text-primary">
                    R$ {vehicle.price.toLocaleString()}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {vehicle.views} visualizações
                  </div>
                </div>

                <Button variant="outline" className="w-full">
                  <Eye className="h-4 w-4 mr-2" />
                  Ver Detalhes
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <p className="text-muted-foreground">
              Nenhum veículo encontrado com os filtros aplicados.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
