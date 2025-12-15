import { VehicleDetails } from "../_componentes/VehicleDetails";
import type { Vehicle } from "../../../../types/vehicle";
import { supabase } from "@/lib/supabase/server";

interface PageProps {
  params: {
    id: string;
  };
}

export default async function Page({ params }: PageProps) {
  const id = Number(params.id);

  if (isNaN(id)) {
    return <div>ID inválido.</div>;
  }

  const { data, error } = await supabase
    .from("estoque")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) {
    console.error("Erro ao buscar veículo:", error);
    return <div>Nenhum veículo encontrado.</div>;
  }

  const vehicle: Vehicle = {
    id: data.id,
    name: data.name,
    year: data.year,
    model: data.model,
    price: data.price,
    type: data.type,
    image: data.image, // array de URLs
    status: data.status,
  };

  return <VehicleDetails vehicle={vehicle} />;
}
