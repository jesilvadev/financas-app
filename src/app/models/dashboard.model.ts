export interface TransacaoRecente {
  id: string;
  tipo: string;
  valor: number;
  data: string; // ISO date (YYYY-MM-DD)
  descricao: string;
  categoria: string;
}

export interface GastoPorCategoria {
  categoria: string;
  valor: number;
}

export interface DashboardResponse {
  saldoAtual: number;
  totalReceitas: number;
  totalDespesas: number;
  transacoesRecentes: TransacaoRecente[];
  gastosPorCategoria: GastoPorCategoria[];
}