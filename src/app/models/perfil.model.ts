import { UsuarioResponse } from './user.model';

export interface UpdatePerfilRequest {
  nome?: string;
  email?: string;
  faixaSalario?: number;
}

// Re-exporta UsuarioResponse para manter compatibilidade
export type { UsuarioResponse };

export interface UpdateSenhaRequest {
  senhaAtual: string;
  novaSenha: string;
  confirmarNovaSenha: string;
}

// Response dos endpoints de atualizar senha e excluir conta (mensagem de sucesso)
export interface MensagemResponse {
  message: string;
}
