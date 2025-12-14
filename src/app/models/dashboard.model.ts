export enum PeriodoDashboard {
  MES_ATUAL = 'MES_ATUAL',
  ULTIMOS_3_MESES = 'ULTIMOS_3_MESES',
  ULTIMOS_6_MESES = 'ULTIMOS_6_MESES',
  ULTIMOS_12_MESES = 'ULTIMOS_12_MESES',
  TODA_UTILIZACAO = 'TODA_UTILIZACAO'
}

export interface TransacaoResponse {
  id: string;
  tipo: string;  // 'RECEITA' | 'DESPESA'
  valor: number;
  data: string;  // ISO date-time
  descricao?: string | null;
  categoria: string;
  porcentagem: number;
}

export interface GastoCategoria {
  categoria: string;
  valor: number;
  porcentagem: number;
}

export interface MetaDashboard {
  nome: string;
  porcentagem: number;
}

export interface DashboardResponse {
  saldoAtual: number;
  totalReceitas: number;
  totalDespesas: number;
  transacoesRecentes: TransacaoResponse[];
  gastosPorCategoria: GastoCategoria[];
  metas: MetaDashboard[];
}