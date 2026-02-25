/* eslint-disable */

"use client";

import { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Plus, Filter, Eye, Loader2, Trash, Pencil, X, Upload } from "lucide-react";
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
  type:
  | "SUV"
  | "Sedan"
  | "Hatch"
  | "Crossover"
  | "Minivan"
  | "Caminhão"
  | "Ônibus"
  | "Jipe"
  | "Quadriciclo"
  | "Motocicleta"
  | "Caminhonete";
  image: (File | string)[];
  mileage: number;

  fuel: "Gasolina" | "Álcool" | "Flex" | "Diesel" | "Elétrico" | "Híbrido";

  transmission: "Automático" | "Manual";
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  const openEdit = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsEditDialogOpen(true);
  };

  const [filters, setFilters] = useState({
    search: "",
    type: "",
    minPrice: "",
    maxPrice: "",
    year: "",
  });

  const [newVehicle, setNewVehicle] = useState<Vehicle>({
    name: "",
    year: new Date().getFullYear(),
    model: "",
    price: 0,

    type: "Sedan",

    mileage: 0,

    fuel: "Gasolina",

    transmission: "Manual",

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

    try {
      setIsCreating(true); // 🔥 ativa o loading

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
          mileage: newVehicle.mileage,
          fuel: newVehicle.fuel,
          transmission: newVehicle.transmission,
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
          year: new Date().getFullYear(),
          model: "",
          price: 0,

          type: "Sedan",

          mileage: 0,

          fuel: "Gasolina",

          transmission: "Manual",

          image: [],
          status: "Disponível",
        });
      }
    } catch (err) {
      console.error("Erro inesperado:", err);
      toast.error("Erro ao adicionar veículo");
    } finally {
      setIsCreating(false); // ✅ desativa o loading
    }
  };

  const openDetails = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setIsDialogOpen(true);
  };

  const onDelete = async (id: string) => {
    const { error } = await supabase
      .from("estoque")
      .delete()
      .eq("id", id)
      .eq("user_id", user?.id); // segurança

    if (error) {
      console.error("Erro ao deletar veículo:", error);
      toast.error("Erro ao apagar veículo");
      return;
    }

    toast.success("Veículo apagado com sucesso!");

    // Atualiza a lista localmente sem precisar refazer o fetch
    const updated = vehicles.filter((v) => v.id !== id);
    setVehicles(updated);
    setFilteredVehicles(updated);
  };

  const [isSaving, setIsSaving] = useState(false);

  const saveEdit = async () => {
    if (!selectedVehicle) return;
    setIsSaving(true);

    try {
      // Upload novas fotos (File objects) e manter as existentes (strings)
      const finalImageUrls: string[] = [];

      for (const img of selectedVehicle.image) {
        if (img instanceof File) {
          const fileName = `${user?.id}/${Date.now()}-${img.name}`;
          const { error: uploadError } = await supabase.storage
            .from("veiculos")
            .upload(fileName, img);

          if (uploadError) {
            toast.error("Erro ao enviar foto");
            setIsSaving(false);
            return;
          }

          const { data: urlData } = supabase.storage
            .from("veiculos")
            .getPublicUrl(fileName);

          if (urlData?.publicUrl) finalImageUrls.push(urlData.publicUrl);
        } else if (typeof img === "string") {
          finalImageUrls.push(img);
        }
      }

      const { id, ...dataToUpdate } = selectedVehicle;

      const { error } = await supabase
        .from("estoque")
        .update({
          ...dataToUpdate,
          image: finalImageUrls,
        })
        .eq("id", id)
        .eq("user_id", user?.id);

      if (error) {
        toast.error("Erro ao atualizar veículo");
        return;
      }

      toast.success("Veículo atualizado!");

      const updatedVehicle = { ...selectedVehicle, image: finalImageUrls };
      const updated = vehicles.map((v) => (v.id === id ? updatedVehicle : v));
      setVehicles(updated);
      setFilteredVehicles(updated);
      setIsEditDialogOpen(false);
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const statusColors: Record<string, string> = {
    "Disponível": "bg-green-500/20 text-green-400 border-green-500/30",
    "Reservado": "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    "Vendido": "bg-red-500/20 text-red-400 border-red-500/30",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-violet-500 to-blue-600 flex items-center justify-center shadow-lg">
            <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0l-4-4m4 4l-4 4M5 11l4-4m-4 4l4 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Estoque</h1>
            <p className="text-white/50 text-sm">{filteredVehicles.length} veículos disponíveis</p>
          </div>
        </div>

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" /> Adicionar Veículo
            </Button>
          </DialogTrigger>

          <DialogContent className="sm:max-w-md bg-[#13141a] border border-white/10 text-white">
            <DialogHeader>
              <DialogTitle className="text-white">Adicionar Novo Veículo</DialogTitle>
              <DialogDescription className="text-white/50">
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
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="Hatch">Hatch</SelectItem>
                      <SelectItem value="Crossover">Crossover</SelectItem>
                      <SelectItem value="Minivan">Minivan</SelectItem>
                      <SelectItem value="Caminhão">Caminhão</SelectItem>
                      <SelectItem value="Ônibus">Ônibus</SelectItem>
                      <SelectItem value="Jipe">Jipe</SelectItem>
                      <SelectItem value="Quadriciclo">Quadriciclo</SelectItem>
                      <SelectItem value="Motocicleta">Motocicleta</SelectItem>
                      <SelectItem value="Caminhonete">Caminhonete</SelectItem>
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

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Quilometragem (KM)</Label>
                  <Input
                    type="number"
                    placeholder="45000"
                    value={newVehicle.mileage || ""}
                    onChange={(e) =>
                      setNewVehicle({
                        ...newVehicle,
                        mileage: parseInt(e.target.value, 10) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label>Câmbio</Label>
                  <Select
                    value={newVehicle.transmission}
                    onValueChange={(v: Vehicle["transmission"]) =>
                      setNewVehicle({ ...newVehicle, transmission: v })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Manual">Manual</SelectItem>
                      <SelectItem value="Automático">Automático</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Label>Combustível</Label>
              <Select
                value={newVehicle.fuel}
                onValueChange={(v: Vehicle["fuel"]) =>
                  setNewVehicle({ ...newVehicle, fuel: v })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Gasolina">Gasolina</SelectItem>
                  <SelectItem value="Álcool">Álcool</SelectItem>
                  <SelectItem value="Flex">Flex</SelectItem>
                  <SelectItem value="Diesel">Diesel</SelectItem>
                  <SelectItem value="Elétrico">Elétrico</SelectItem>
                  <SelectItem value="Híbrido">Híbrido</SelectItem>
                </SelectContent>
              </Select>

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
                    Salvando...
                  </>
                ) : (
                  "Adicionar Veículo"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filtros */}
      <div className="bg-white/5 border border-white/10 rounded-2xl p-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="h-4 w-4 text-violet-400" />
          <span className="text-white/70 text-sm font-medium">Filtros</span>
        </div>
        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-6">
          <Input
            placeholder="Buscar por nome ou modelo"
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
          />
          <Select value={filters.type} onValueChange={(v) => setFilters({ ...filters, type: v })}>
            <SelectTrigger className="bg-white/5 border-white/10 text-white">
              <SelectValue placeholder="Tipo do veículo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="SUV">SUV</SelectItem>
              <SelectItem value="Sedan">Sedan</SelectItem>
              <SelectItem value="Hatch">Hatch</SelectItem>
              <SelectItem value="Crossover">Crossover</SelectItem>
              <SelectItem value="Minivan">Minivan</SelectItem>
              <SelectItem value="Caminhão">Caminhão</SelectItem>
              <SelectItem value="Ônibus">Ônibus</SelectItem>
              <SelectItem value="Jipe">Jipe</SelectItem>
              <SelectItem value="Quadriciclo">Quadriciclo</SelectItem>
              <SelectItem value="Motocicleta">Motocicleta</SelectItem>
              <SelectItem value="Caminhonete">Caminhonete</SelectItem>
            </SelectContent>
          </Select>
          <Input placeholder="Preço mínimo" value={filters.minPrice}
            onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          <Input placeholder="Preço máximo" value={filters.maxPrice}
            onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          <Input placeholder="Ano" value={filters.year}
            onChange={(e) => setFilters({ ...filters, year: e.target.value })}
            className="bg-white/5 border-white/10 text-white placeholder:text-white/30" />
          <div className="flex gap-2">
            <Button onClick={applyFilters} className="flex-1 bg-violet-600 hover:bg-violet-500 text-white border-0">Filtrar</Button>
            <Button variant="outline" onClick={clearFilters} className="border-white/10 text-white/60 hover:text-white hover:bg-white/10">Limpar</Button>
          </div>
        </div>
      </div>

      {/* Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredVehicles.map((vehicle) => {
          const firstImage = Array.isArray(vehicle.image) && vehicle.image.length > 0
            ? (typeof vehicle.image[0] === "string" ? vehicle.image[0] : URL.createObjectURL(vehicle.image[0] as File))
            : null;
          return (
            <div key={vehicle.id} className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/40 transition-all duration-200 group">
              {/* Foto */}
              <div className="relative h-44 bg-white/5">
                {firstImage ? (
                  <Image src={firstImage} alt={vehicle.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-white/20">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
                <div className="absolute top-2 right-2">
                  <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${statusColors[vehicle.status] || statusColors["Disponível"]}`}>
                    {vehicle.status}
                  </span>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-xs bg-black/60 text-white/70 px-2 py-0.5 rounded-full">{vehicle.type}</span>
                </div>
              </div>

              {/* Info */}
              <div className="p-4">
                <h3 className="text-white font-semibold">{vehicle.name} <span className="text-white/40">{vehicle.year}</span></h3>
                <p className="text-white/40 text-xs mt-0.5">{vehicle.model} • {vehicle.mileage?.toLocaleString()} km • {vehicle.fuel}</p>
                <div className="text-xl font-bold text-violet-400 mt-2">
                  R$ {vehicle.price.toLocaleString()}
                </div>

                <div className="flex gap-2 mt-4">
                  <Button size="sm" variant="outline" onClick={() => openDetails(vehicle)}
                    className="flex-1 border-white/10 text-white/60 hover:text-white hover:bg-white/10">
                    <Eye className="h-3.5 w-3.5 mr-1.5" /> Detalhes
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => openEdit(vehicle)}
                    className="border-white/10 text-violet-400 hover:bg-violet-500/20 hover:border-violet-500/40">
                    <Pencil className="h-3.5 w-3.5" />
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => vehicle.id && onDelete(vehicle.id)}
                    className="bg-red-500/20 hover:bg-red-500/40 text-red-400 border border-red-500/30 hover:border-red-500/50">
                    <Trash className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de detalhes */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl bg-[#13141a] border border-white/10 text-white">
          <DialogTitle className="text-white">{selectedVehicle?.name}</DialogTitle>
          <span className={`text-xs px-2 py-0.5 rounded-full border font-medium w-fit ${statusColors[selectedVehicle?.status || "Disponível"]}`}>
            {selectedVehicle?.status}
          </span>
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
                  <strong>Km:</strong> {selectedVehicle.mileage}
                </p>
                <p>
                  <strong>Câmbio:</strong> {selectedVehicle.transmission}
                </p>
                <p>
                  <strong>Combustível:</strong> {selectedVehicle.fuel}
                </p>
                <p>
                  <strong>Preço:</strong> R${" "}
                  {selectedVehicle.price.toLocaleString()}
                </p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Veículo</DialogTitle>
            <DialogDescription>
              Atualize as informações abaixo
            </DialogDescription>
          </DialogHeader>

          {selectedVehicle && (
            <div className="space-y-4">
              {/* Nome */}
              <div>
                <Label className="mb-2 ">Nome do Veículo</Label>
                <Input
                  value={selectedVehicle.name}
                  onChange={(e) =>
                    setSelectedVehicle({
                      ...selectedVehicle,
                      name: e.target.value,
                    })
                  }
                />
              </div>

              {/* Ano + Tipo */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="mb-2 ">Ano</Label>
                  <Input
                    type="number"
                    value={selectedVehicle.year}
                    onChange={(e) =>
                      setSelectedVehicle({
                        ...selectedVehicle,
                        year: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                <div>
                  <Label className="mb-2 ">Tipo</Label>
                  <Select
                    value={selectedVehicle.type}
                    onValueChange={(v: Vehicle["type"]) =>
                      setSelectedVehicle({ ...selectedVehicle, type: v })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SUV">SUV</SelectItem>
                      <SelectItem value="Sedan">Sedan</SelectItem>
                      <SelectItem value="Hatch">Hatch</SelectItem>
                      <SelectItem value="Crossover">Crossover</SelectItem>
                      <SelectItem value="Minivan">Minivan</SelectItem>
                      <SelectItem value="Caminhão">Caminhão</SelectItem>
                      <SelectItem value="Ônibus">Ônibus</SelectItem>
                      <SelectItem value="Jipe">Jipe</SelectItem>
                      <SelectItem value="Quadriciclo">Quadriciclo</SelectItem>
                      <SelectItem value="Motocicleta">Motocicleta</SelectItem>
                      <SelectItem value="Caminhonete">Caminhonete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {/* Modelo */}
                <div>
                  <Label className="mb-2 ">Modelo</Label>
                  <Input
                    value={selectedVehicle.model}
                    onChange={(e) =>
                      setSelectedVehicle({
                        ...selectedVehicle,
                        model: e.target.value,
                      })
                    }
                  />
                </div>

                {/* Preço */}
                <div>
                  <Label className="mb-2 ">Preço (R$)</Label>
                  <Input
                    type="number"
                    value={selectedVehicle.price}
                    onChange={(e) =>
                      setSelectedVehicle({
                        ...selectedVehicle,
                        price: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Quilometragem */}
                <div>
                  <Label className="mb-2 ">Quilometragem</Label>
                  <Input
                    type="number"
                    value={selectedVehicle.mileage}
                    onChange={(e) =>
                      setSelectedVehicle({
                        ...selectedVehicle,
                        mileage: Number(e.target.value) || 0,
                      })
                    }
                  />
                </div>

                {/* Combustível */}
                <div>
                  <Label className="mb-2 ">Combustível</Label>
                  <Select
                    value={selectedVehicle.fuel}
                    onValueChange={(v: Vehicle["fuel"]) =>
                      setSelectedVehicle({ ...selectedVehicle, fuel: v })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Gasolina">Gasolina</SelectItem>
                      <SelectItem value="Álcool">Álcool</SelectItem>
                      <SelectItem value="Flex">Flex</SelectItem>
                      <SelectItem value="Diesel">Diesel</SelectItem>
                      <SelectItem value="Elétrico">Elétrico</SelectItem>
                      <SelectItem value="Híbrido">Híbrido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Transmissão */}
                <div>
                  <Label className="mb-2 ">Transmissão</Label>
                  <Select
                    value={selectedVehicle.transmission}
                    onValueChange={(v: Vehicle["transmission"]) =>
                      setSelectedVehicle({
                        ...selectedVehicle,
                        transmission: v,
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Automático">Automático</SelectItem>
                      <SelectItem value="Manual">Manual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Status */}
                <div>
                  <Label className="mb-2 ">Status</Label>
                  <Select
                    value={selectedVehicle.status}
                    onValueChange={(v: Vehicle["status"]) =>
                      setSelectedVehicle({ ...selectedVehicle, status: v })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Disponível">Disponível</SelectItem>
                      <SelectItem value="Reservado">Reservado</SelectItem>
                      <SelectItem value="Vendido">Vendido</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Fotos */}
              <div>
                <Label className="mb-2">Fotos do Veículo</Label>

                {/* Fotos existentes */}
                {Array.isArray(selectedVehicle.image) && selectedVehicle.image.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    {selectedVehicle.image.map((img, i) => (
                      <div key={i} className="relative group">
                        <Image
                          src={typeof img === "string" ? img : URL.createObjectURL(img)}
                          alt={`Foto ${i + 1}`}
                          width={200}
                          height={150}
                          className="rounded-lg w-full h-20 object-cover border"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const newImages = selectedVehicle.image.filter((_, idx) => idx !== i);
                            setSelectedVehicle({ ...selectedVehicle, image: newImages });
                          }}
                          className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* Adicionar novas fotos */}
                <label className="flex items-center gap-2 cursor-pointer border border-dashed rounded-lg p-3 hover:bg-muted/50 transition-colors">
                  <Upload className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Adicionar mais fotos</span>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      if (files.length > 0) {
                        setSelectedVehicle({
                          ...selectedVehicle,
                          image: [...selectedVehicle.image, ...files],
                        });
                      }
                      e.target.value = "";
                    }}
                  />
                </label>
              </div>

              <DialogFooter>
                <DialogClose>
                  <Button variant="outline" className="w-full">Cancelar</Button>
                </DialogClose>
                <Button onClick={saveEdit} disabled={isSaving}>
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Salvando...</> : "Salvar Alterações"}
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
