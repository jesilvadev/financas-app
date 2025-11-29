import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../shared/components/button-primary/button-primary.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';

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

  // exclusão de conta
  isDeleteModalOpen = false;
  deleting = false;
  deleteErrorMessage = '';

  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService,
    private readonly router: Router
  ) {}

  get canChangePassword(): boolean {
    const nova = this.novaSenha.trim();
    const confirm = this.confirmarSenha.trim();

    if (this.savingSenha) return false;
    if (!nova || !confirm) return false;
    if (nova.length < 6) return false;
    if (nova !== confirm) return false;

    return true;
  }

  alterarSenha(): void {
    if (!this.canChangePassword) return;

    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      this.senhaErrorMessage = 'Não foi possível identificar o usuário.';
      return;
    }

    this.savingSenha = true;
    this.senhaErrorMessage = '';
    this.senhaSuccessMessage = '';

    this.usuarioService
      .atualizar(userId, { senha: this.novaSenha.trim() })
      .subscribe({
        next: () => {
          this.savingSenha = false;
          this.senhaAtual = '';
          this.novaSenha = '';
          this.confirmarSenha = '';
          this.senhaSuccessMessage = 'Senha alterada com sucesso.';
        },
        error: (err) => {
          this.savingSenha = false;
          this.senhaErrorMessage =
            err?.error?.message || err?.message || 'Erro ao alterar senha.';
        },
      });
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
      return;
    }

    this.deleting = true;
    this.deleteErrorMessage = '';

    this.usuarioService.deletar(userId).subscribe({
      next: () => {
        this.deleting = false;
        this.isDeleteModalOpen = false;
        this.authService.logout();
        this.router.navigate(['/signin']);
      },
      error: (err) => {
        this.deleting = false;
        this.deleteErrorMessage =
          err?.error?.message || err?.message || 'Erro ao excluir conta.';
      },
    });
  }
}
