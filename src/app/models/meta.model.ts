import { AporteMeta } from "./aporteMeta.model";

export interface Meta {
  id: string;
  nome: string;
  valorAlvo: number;
  valorAtual: number;
  dataAlvo: string | null;
  dataCriacao: string;
  aporteMetas: AporteMeta[];
}