import { GastoCategoria, TransacaoResponse } from "./dashboard.model";

export interface RelatorioMensalResponse {
  totalReceitas: number;
  totalDespesas: number;
  saldo: number;
  transacoes: TransacaoResponse[];
  gastosPorCategoria: GastoCategoria[];
}