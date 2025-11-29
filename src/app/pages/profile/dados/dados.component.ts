import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../shared/components/button-primary/button-primary.component';
import { AuthService } from '../../../services/auth.service';
import { UsuarioService } from '../../../services/usuario.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioResponse } from '../../../models/user.model';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-profile-dados',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    ButtonPrimaryComponent,
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
  errorMessage = '';
  isEditing = false;

  constructor(
    private readonly authService: AuthService,
    private readonly usuarioService: UsuarioService
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

  salvar(): void {
    if (!this.canSave) return;
    const userId = this.authService.currentUserValue?.id;
    if (!userId) return;

    const nomeNormalizado = this.formatName(this.nome.trim());
    const emailNormalizado = this.email.trim();

    this.saving = true;
    this.errorMessage = '';

    this.usuarioService
      .atualizar(userId, { nome: nomeNormalizado, email: emailNormalizado })
      .subscribe({
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
            },
          });
        },
        error: (err) => {
          this.errorMessage =
            err?.error?.message || err?.message || 'Erro ao salvar dados';
          this.saving = false;
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
    this.errorMessage = '';
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
