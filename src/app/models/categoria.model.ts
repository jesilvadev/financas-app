import { TipoTransacao } from "./tipoTransacao.enum";

export interface Categoria {
  id: string;
  nome: string;
  tipo: TipoTransacao;
  userId: string | null;
}

export interface CategoriaRequest {
  nome: string;
  tipo: TipoTransacao;
  userId: string;
}