// ============================================================================
// ENUMS
// ============================================================================

export enum TipoAlerta {
  GASTO_ACIMA_MEDIA = 'GASTO_ACIMA_MEDIA',
  META_PROXIMA_VENCIMENTO = 'META_PROXIMA_VENCIMENTO',
  PROJECAO_SALDO_NEGATIVO = 'PROJECAO_SALDO_NEGATIVO',
  PROGRESSO_META_LENTO = 'PROGRESSO_META_LENTO',
  META_ALCANCADA = 'META_ALCANCADA',
  GASTO_CATEGORIA_ELEVADO = 'GASTO_CATEGORIA_ELEVADO',
  ECONOMIA_POSITIVA = 'ECONOMIA_POSITIVA'
}

export enum SeveridadeAlerta {
  BAIXA = 'BAIXA',
  MEDIA = 'MEDIA',
  ALTA = 'ALTA'
}

// ============================================================================
// INTERFACES - RESPONSES
// ============================================================================

/**
 * Alerta individual retornado pela API
 */
export interface AlertaResponse {
  id: string;
  tipo: TipoAlerta;
  mensagem: string;
  severidade: SeveridadeAlerta;
  dataCriacao: string;      // ISO date-time
  visto: boolean;
  dataVisto?: string | null; // ISO date-time
}

/**
 * Informações sobre um tipo de alerta disponível
 */
export interface TipoAlertaInfo {
  tipo: TipoAlerta;
  nome: string;
  descricao: string;
  ativo: boolean;
  ativoPorPadrao: boolean;
}

/**
 * Resposta da verificação manual de alertas
 */
export interface VerificacaoAlertasResponse {
  dataVerificacao: string;  // ISO date-time
  totalUsuariosVerificados: number;
  totalAlertasCriados: number;
  alertasPorTipo: Record<string, number>;
  mensagem: string;
}

// ============================================================================
// INTERFACES - REQUESTS
// ============================================================================

/**
 * Request para atualizar preferência de um tipo de alerta
 */
export interface AtualizarPreferenciaAlertaRequest {
  tipo: TipoAlerta;
  ativo: boolean;
}

// ============================================================================
// METADADOS DOS TIPOS DE ALERTA (opcional, para usar no frontend)
// ============================================================================

export interface TipoAlertaMetadata {
  tipo: TipoAlerta;
  nome: string;
  descricao: string;
  icon?: string;        // Nome do ícone (ex: 'warning', 'trending_up')
  color?: string;       // Cor (ex: 'warn', 'primary')
}

/**
 * Metadados dos tipos de alerta para usar no frontend
 */
export const TIPOS_ALERTA_METADATA: Record<TipoAlerta, TipoAlertaMetadata> = {
  [TipoAlerta.GASTO_ACIMA_MEDIA]: {
    tipo: TipoAlerta.GASTO_ACIMA_MEDIA,
    nome: 'Gasto acima da média',
    descricao: 'Notifica quando o gasto em uma categoria está significativamente acima da média histórica',
    icon: 'trending_up',
    color: 'warn'
  },
  [TipoAlerta.META_PROXIMA_VENCIMENTO]: {
    tipo: TipoAlerta.META_PROXIMA_VENCIMENTO,
    nome: 'Meta próxima do vencimento',
    descricao: 'Notifica quando uma meta está próxima da data alvo (7 dias ou menos)',
    icon: 'event',
    color: 'accent'
  },
  [TipoAlerta.PROJECAO_SALDO_NEGATIVO]: {
    tipo: TipoAlerta.PROJECAO_SALDO_NEGATIVO,
    nome: 'Projeção de saldo negativo',
    descricao: 'Notifica quando a projeção indica saldo negativo ao final do mês',
    icon: 'warning',
    color: 'warn'
  },
  [TipoAlerta.PROGRESSO_META_LENTO]: {
    tipo: TipoAlerta.PROGRESSO_META_LENTO,
    nome: 'Progresso de meta abaixo do esperado',
    descricao: 'Notifica quando o progresso de uma meta está abaixo do esperado em relação ao tempo decorrido',
    icon: 'schedule',
    color: 'accent'
  },
  [TipoAlerta.META_ALCANCADA]: {
    tipo: TipoAlerta.META_ALCANCADA,
    nome: 'Meta alcançada',
    descricao: 'Notifica quando uma meta foi alcançada com sucesso',
    icon: 'celebration',
    color: 'primary'
  },
  [TipoAlerta.GASTO_CATEGORIA_ELEVADO]: {
    tipo: TipoAlerta.GASTO_CATEGORIA_ELEVADO,
    nome: 'Gasto elevado em categoria',
    descricao: 'Notifica quando o gasto em uma categoria excede um percentual significativo da renda',
    icon: 'priority_high',
    color: 'warn'
  },
  [TipoAlerta.ECONOMIA_POSITIVA]: {
    tipo: TipoAlerta.ECONOMIA_POSITIVA,
    nome: 'Economia acima do esperado',
    descricao: 'Notifica quando você economizou mais do que o esperado no período',
    icon: 'savings',
    color: 'primary'
  }
};

/**
 * Metadados das severidades para usar no frontend
 */
export const SEVERIDADE_METADATA = {
  [SeveridadeAlerta.BAIXA]: {
    label: 'Baixa',
    color: 'primary',
    icon: 'info'
  },
  [SeveridadeAlerta.MEDIA]: {
    label: 'Média',
    color: 'accent',
    icon: 'warning'
  },
  [SeveridadeAlerta.ALTA]: {
    label: 'Alta',
    color: 'warn',
    icon: 'error'
  }
};

