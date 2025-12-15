export interface Vehicle {
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
  status: "Disponível" | "Vendido" | "Reservado";
}
