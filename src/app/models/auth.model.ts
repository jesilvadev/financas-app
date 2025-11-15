import { UsuarioResponse } from "./user.model";

export interface AuthLoginRequest {
  email: string;
  senha: string;
}

export interface AuthRegisterRequest {
  nome: string;
  email: string;
  senha: string;
}

export interface AuthResponse {
  token: string;
  usuario: UsuarioResponse;
  primeiroAcesso: boolean;
  dataInicioControle: string | null;
}