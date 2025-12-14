import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../shared/components/button-primary/button-primary.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../services/auth.service';
import { PerfilService } from '../../../services/perfil.service';
import { UpdateSenhaRequest } from '../../../models/perfil.model';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-profile-seguranca',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    UiInputComponent,
    ButtonPrimaryComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './seguranca.component.html',
})
export class ProfileSegurancaComponent {
  // alteração de senha
  senhaAtual = '';
  novaSenha = '';
  confirmarSenha = '';
  savingSenha = false;
  senhaErrorMessage = '';
  senhaSuccessMessage = '';
  isSenhaModalOpen = false;

  // exclusão de conta
  isDeleteModalOpen = false;
  deleting = false;
  deleteErrorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly perfilService: PerfilService,
    private readonly router: Router,
    private readonly alertService: AlertService
  ) {}

  get senhaAtualVazia(): boolean {
    return !this.senhaAtual.trim();
  }

  get novaSenhaVazia(): boolean {
    return !this.novaSenha.trim();
  }

  get confirmarSenhaVazia(): boolean {
    return !this.confirmarSenha.trim();
  }

  get novaSenhaMuitoCurta(): boolean {
    return this.novaSenha.trim().length > 0 && this.novaSenha.trim().length < 6;
  }

  get senhasNaoCoincidem(): boolean {
    const nova = this.novaSenha.trim();
    const confirm = this.confirmarSenha.trim();
    return nova.length > 0 && confirm.length > 0 && nova !== confirm;
  }

  get senhaValidationMessage(): string {
    if (
      this.senhaAtualVazia &&
      (this.novaSenha.trim() || this.confirmarSenha.trim())
    ) {
      return 'Por favor, informe sua senha atual.';
    }
    if (this.novaSenhaMuitoCurta) {
      return 'A nova senha deve ter pelo menos 6 caracteres.';
    }
    if (this.senhasNaoCoincidem) {
      return 'As senhas não coincidem. Verifique e tente novamente.';
    }
    if (
      !this.novaSenhaVazia &&
      !this.confirmarSenhaVazia &&
      !this.senhaAtualVazia
    ) {
      return '';
    }
    return '';
  }

  get canChangePassword(): boolean {
    const atual = this.senhaAtual.trim();
    const nova = this.novaSenha.trim();
    const confirm = this.confirmarSenha.trim();

    if (this.savingSenha) return false;
    if (!atual || !nova || !confirm) return false;
    if (nova.length < 6) return false;
    if (nova !== confirm) return false;

    return true;
  }

  openSenhaModal(): void {
    if (!this.canChangePassword) {
      // Mostra mensagem de validação se houver
      if (this.senhaValidationMessage) {
        this.senhaErrorMessage = this.senhaValidationMessage;
      }
      return;
    }
    this.senhaErrorMessage = '';
    this.isSenhaModalOpen = true;
  }

  closeSenhaModal(): void {
    if (this.savingSenha) return;
    this.isSenhaModalOpen = false;
  }

  alterarSenha(): void {
    if (!this.canChangePassword) {
      return;
    }

    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      const mensagem = 'Não foi possível identificar o usuário.';
      this.senhaErrorMessage = mensagem;
      this.alertService.showError(mensagem);
      this.isSenhaModalOpen = false;
      return;
    }

    this.savingSenha = true;
    this.senhaErrorMessage = '';
    this.senhaSuccessMessage = '';

    const payload: UpdateSenhaRequest = {
      senhaAtual: this.senhaAtual.trim(),
      novaSenha: this.novaSenha.trim(),
      confirmarNovaSenha: this.confirmarSenha.trim(),
    };

    this.perfilService.atualizarSenha(userId, payload).subscribe({
      next: () => {
        this.savingSenha = false;
        this.senhaAtual = '';
        this.novaSenha = '';
        this.confirmarSenha = '';
        this.senhaSuccessMessage = 'Senha alterada com sucesso!';
        this.senhaErrorMessage = '';
        this.isSenhaModalOpen = false;
        this.alertService.showSuccess(this.senhaSuccessMessage);
      },
      error: (err) => {
        this.savingSenha = false;
        this.isSenhaModalOpen = false;
        const errorMessage = err?.error?.message || err?.message || '';

        // Mensagens específicas baseadas no erro do backend
        if (
          errorMessage.toLowerCase().includes('senha atual') ||
          errorMessage.toLowerCase().includes('senha incorreta') ||
          errorMessage.toLowerCase().includes('current password')
        ) {
          this.senhaErrorMessage =
            'Senha atual incorreta. Verifique e tente novamente.';
        } else if (
          errorMessage.toLowerCase().includes('senha') &&
          errorMessage.toLowerCase().includes('igual')
        ) {
          this.senhaErrorMessage =
            'A nova senha deve ser diferente da senha atual.';
        } else if (errorMessage) {
          this.senhaErrorMessage = errorMessage;
        } else {
          this.senhaErrorMessage = 'Erro ao alterar senha. Tente novamente.';
        }

        if (this.senhaErrorMessage) {
          this.alertService.showError(this.senhaErrorMessage);
        }
      },
    });
  }

  // Limpa mensagens quando o usuário começa a digitar
  onSenhaInputChange(): void {
    if (this.senhaErrorMessage && this.canChangePassword) {
      this.senhaErrorMessage = '';
    }
  }

  // exclusão de conta
  openDeleteModal(): void {
    if (this.deleting) return;
    this.deleteErrorMessage = '';
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.deleting) return;
    this.isDeleteModalOpen = false;
  }

  confirmarExclusao(): void {
    if (this.deleting) return;

    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      this.deleteErrorMessage = 'Não foi possível identificar o usuário.';
      this.alertService.showError(this.deleteErrorMessage);
      return;
    }

    this.deleting = true;
    this.deleteErrorMessage = '';

    this.perfilService.deletarConta(userId).subscribe({
      next: () => {
        // Garante que o usuário seja deslogado antes de navegar
        this.authService.logout();
        this.deleting = false;
        this.isDeleteModalOpen = false;
        // Navega para a tela de login após o logout
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteErrorMessage =
          err?.error?.message || err?.message || 'Erro ao excluir conta.';
        this.alertService.showError(this.deleteErrorMessage);
      },
    });
  }
}
