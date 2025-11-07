/* eslint-disable */

"use client";

import { useEffect, useState } from "react";
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
import { Plus, Filter, Eye, Loader2 } from "lucide-react";
import { toast } from "sonner";
import Image from "next/image";
import { supabase } from "@/lib/supabase/server";
import { useAuth } from "@/contexts/AuthContext";

interface Vehicle {
  id?: string;
  name: string;
  year: number;
  model: string;
  price: number;
  type: "SUV" | "Sedan" | "Hatch";
  image: (File | string)[];
  status: "Disponível" | "Vendido" | "Reservado";
}

export default function Inventory() {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [filteredVehicles, setFilteredVehicles] = useState<Vehicle[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [isCreating, setIsCreating] = useState(false);

  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    minPrice: "",
    maxPrice: "",
    year: "",
  });

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    name: "",
    year: 0,
    model: "",
    price: 0,
    type: "Sedan",
    image: [],
    status: "Disponível",
  });

  useEffect(() => {
    if (!user) return;

    const fetchVehicles = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("estoque")
        .select("*")
        .order("name", { ascending: true })
        .eq("user_id", user.id);

      if (error) {
        console.error("Erro ao buscar veículos:", error);
        toast.error("Erro ao carregar veículos");
      } else if (data) {
        const vehiclesWithStatus = data.map(
          (v: any): Vehicle => ({
            ...v,
            image:
              typeof v.image === "string" ? JSON.parse(v.image) : v.image ?? [],
            status: (v.status as Vehicle["status"]) || "Disponível",
          })
        );
        setVehicles(vehiclesWithStatus);
        setFilteredVehicles(vehiclesWithStatus);
      }
      setLoading(false);
    };

    fetchVehicles();
  }, [user]);

  // 🎯 Aplicar filtros
  const applyFilters = () => {
    let filtered = vehicles;
    if (filters.search) {
      filtered = filtered.filter(
        (v) =>
          v.name.toLowerCase().includes(filters.search.toLowerCase()) ||
          v.model.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    if (filters.type !== "all")
      filtered = filtered.filter((v) => v.type === filters.type);
    if (filters.minPrice)
      filtered = filtered.filter((v) => v.price >= parseInt(filters.minPrice));
    if (filters.maxPrice)
      filtered = filtered.filter((v) => v.price <= parseInt(filters.maxPrice));
    if (filters.year)
      filtered = filtered.filter(
        (v) => v.year.toString() === filters.year.trim()
      );
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

  // ➕ Adicionar novo veículo
  const addVehicle = async () => {
    if (
      !newVehicle.name ||
      !newVehicle.year ||
      !newVehicle.model ||
      !newVehicle.type ||
      !newVehicle.price
    ) {
      toast.error("Preencha todos os campos!");
      return;
    }

    if (!user) {
      toast.error("Você precisa estar logado para adicionar um veículo.");
      return;
    }

    let imageUrls: string[] = [];

    for (const file of newVehicle.image) {
      if (file instanceof File) {
        const fileName = `${user.id}/${Date.now()}-${file.name}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from("veiculos")
          .upload(filePath, file);

        if (uploadError) {
          console.error("Erro no upload:", uploadError);
          toast.error("Erro ao enviar imagem");
          return;
        }

        const { data: publicUrlData } = supabase.storage
          .from("veiculos")
          .getPublicUrl(filePath);

        if (publicUrlData?.publicUrl) imageUrls.push(publicUrlData.publicUrl);
      } else if (typeof file === "string") {
        imageUrls.push(file);
      }
    }

    const { error } = await supabase.from("estoque").insert([
      {
        name: newVehicle.name,
        year: newVehicle.year,
        model: newVehicle.model,
        type: newVehicle.type,
        price: newVehicle.price,
        status: "Disponível",
        user_id: user.id,
        image: imageUrls,
      },
    ]);

    if (error) {
      console.error("Erro ao adicionar veículo:", error);
      toast.error("Erro ao adicionar veículo");
    } else {
      toast.success("Veículo adicionado com sucesso!");
      setNewVehicle({
        name: "",
        year: 0,
        model: "",
        price: 0,
        type: "Sedan",
        image: [],
        status: "Disponível",
      });
    }
  };

  const openDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  if (loading) return <p>Carregando veículos...</p>;

  return (
    <div className="space-y-6">
      {/* 🔘 Cabeçalho */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Gerencie os veículos disponíveis em sua loja
        </p>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Adicionar Veículo
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
              <Label>Nome do Veículo</Label>
              <Input
                placeholder="Honda Civic"
                value={newVehicle.name}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, name: e.target.value })
                }
              />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ano</Label>
                  <Input
                    type="number"
                    value={newVehicle.year || ""}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        year: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={newVehicle.type}
                    onValueChange={(v: Vehicle["type"]) =>
                      setNewVehicle({ ...newVehicle, type: v })
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

              <Label>Modelo</Label>
              <Input
                placeholder="EXL CVT"
                value={newVehicle.model}
                onChange={(e) =>
                  setNewVehicle({ ...newVehicle, model: e.target.value })
                }
              />

              <Label>Preço (R$)</Label>
              <Input
                type="number"
                placeholder="85000"
                value={newVehicle.price || ""}
                onChange={(e) =>
                  setNewVehicle({
                    ...newVehicle,
                    price: parseFloat(e.target.value) || 0,
                  })
                }
              />

              <Label>Fotos</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => {
                  const files = e.target.files;
                  if (files && files.length > 0) {
                    setNewVehicle({
                      ...newVehicle,
                      image: Array.from(files),
                    });
                  }
                }}
              />

              <Button
                onClick={addVehicle}
                className="w-full"
                disabled={isCreating}
              >
                {isCreating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Adicionando...
                  </>
                ) : (
                  "Adicionar Veículo"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* 🧩 Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" /> Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
            <Input
              placeholder="Buscar por nome ou modelo"
              value={filters.search}
              onChange={(e) =>
                setFilters({ ...filters, search: e.target.value })
              }
            />
            <Select
              value={filters.type}
              onValueChange={(v) => setFilters({ ...filters, type: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="SUV">SUV</SelectItem>
                <SelectItem value="Sedan">Sedan</SelectItem>
                <SelectItem value="Hatch">Hatch</SelectItem>
              </SelectContent>
            </Select>
            <Input
              placeholder="Preço mínimo"
              value={filters.minPrice}
              onChange={(e) =>
                setFilters({ ...filters, minPrice: e.target.value })
              }
            />
            <Input
              placeholder="Preço máximo"
              value={filters.maxPrice}
              onChange={(e) =>
                setFilters({ ...filters, maxPrice: e.target.value })
              }
            />
            <Input
              placeholder="Ano"
              value={filters.year}
              onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            />
            <div className="flex gap-2">
              <Button onClick={applyFilters}>Filtrar</Button>
              <Button variant="outline" onClick={clearFilters}>
                Limpar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 📦 Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="overflow-hidden">
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">
                  {vehicle.name} {vehicle.year}
                </h3>
                <Badge variant="secondary">{vehicle.type}</Badge>
              </div>
              <p className="text-sm text-muted-foreground">{vehicle.model}</p>
              <div className="text-2xl font-bold text-primary">
                R$ {vehicle.price.toLocaleString()}
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => openDetails(vehicle)}
              >
                <Eye className="h-4 w-4 mr-2" /> Ver Detalhes
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 🪟 Modal de detalhes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl">
          <DialogTitle>{selectedVehicle?.name}</DialogTitle>
          {selectedVehicle && (
            <div className="space-y-4">
              {Array.isArray(selectedVehicle.image) &&
              selectedVehicle.image.length > 0 ? (
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedVehicle.image.map((img, i) => (
                    <Image
                      key={i}
                      src={
                        typeof img === "string" ? img : URL.createObjectURL(img)
                      }
                      alt={`Foto ${i + 1}`}
                      width={800}
                      height={600}
                      className="rounded-lg w-full h-40 object-cover border"
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma imagem disponível.
                </p>
              )}

              <div className="grid grid-cols-2 gap-4 text-sm">
                <p>
                  <strong>Nome:</strong> {selectedVehicle.name}
                </p>
                <p>
                  <strong>Modelo:</strong> {selectedVehicle.model}
                </p>
                <p>
                  <strong>Ano:</strong> {selectedVehicle.year}
                </p>
                <p>
                  <strong>Tipo:</strong> {selectedVehicle.type}
                </p>
                <p>
                  <strong>Preço:</strong> R${" "}
                  {selectedVehicle.price.toLocaleString()}
                </p>
                <p>
                  <strong>Status:</strong>{" "}
                  <Badge>{selectedVehicle.status}</Badge>
                </p>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Fechar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
