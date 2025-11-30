import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../shared/components/button-primary/button-primary.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { AuthService } from '../../../services/auth.service';
import { PerfilService } from '../../../services/perfil.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UpdatePerfilRequest } from '../../../models/perfil.model';
import { UsuarioResponse } from '../../../models/user.model';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-profile-dados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    ButtonPrimaryComponent,
    ConfirmModalComponent,
    RouterLink,
  ],
  templateUrl: './dados.component.html',
})
export class ProfileDadosComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  nome: string = '';
  email: string = '';
  originalNome: string = '';
  originalEmail: string = '';

  loading = false;
  saving = false;
  isEditing = false;
  isConfirmModalOpen = false;

  constructor(
    private readonly authService: AuthService,
    private readonly perfilService: PerfilService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user: UsuarioResponse | null) => {
        const full = (user?.nome ?? '').trim();
        this.nome = this.formatName(full);
        this.email = user?.email ?? '';
        this.originalNome = this.nome;
        this.originalEmail = this.email;
        this.loading = false;
      });
  }

  get canSave(): boolean {
    if (this.saving || this.loading) return false;
    const nameOk = this.nome.trim().length >= 2;
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email.trim());
    const changed =
      this.nome.trim() !== this.originalNome.trim() ||
      this.email.trim() !== this.originalEmail.trim();
    return this.isEditing && nameOk && emailOk && changed;
  }

  openConfirmModal(): void {
    if (!this.canSave) return;
    this.isConfirmModalOpen = true;
  }

  closeConfirmModal(): void {
    if (this.saving) return;
    this.isConfirmModalOpen = false;
  }

  salvar(): void {
    if (!this.canSave) return;
    const userId = this.authService.currentUserValue?.id;
    if (!userId) {
      this.isConfirmModalOpen = false;
      this.alertService.showError('Não foi possível identificar o usuário.');
      return;
    }

    const nomeNormalizado = this.formatName(this.nome.trim());
    const emailNormalizado = this.email.trim();

    this.saving = true;

    const payload: UpdatePerfilRequest = {
      nome: nomeNormalizado,
      email: emailNormalizado,
    };

    this.perfilService.atualizarPerfil(userId, payload).subscribe({
      next: () => {
        // Atualiza estado local e AuthService
        this.nome = nomeNormalizado;
        this.email = emailNormalizado;
        this.originalNome = nomeNormalizado;
        this.originalEmail = emailNormalizado;
        this.authService.fetchCurrentUser().subscribe({
          complete: () => {
            this.saving = false;
            this.isEditing = false;
            this.isConfirmModalOpen = false;
          },
        });
      },
      error: (err) => {
        const mensagem =
          err?.error?.message || err?.message || 'Erro ao salvar dados';
        this.alertService.showError(mensagem);
        this.saving = false;
        this.isConfirmModalOpen = false;
      },
    });
  }

  editar(): void {
    if (this.loading || this.saving) return;
    this.isEditing = true;
  }

  cancelar(): void {
    if (this.saving) return;
    this.nome = this.originalNome;
    this.email = this.originalEmail;
    this.isEditing = false;
  }

  private formatName(value: string): string {
    const trimmed = (value ?? '').trim();
    if (!trimmed) return '';

    // Deixa a primeira letra de CADA palavra maiúscula e o resto minúsculo
    return trimmed
      .toLowerCase()
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
