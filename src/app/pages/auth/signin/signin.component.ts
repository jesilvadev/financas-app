import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { AuthLoginRequest, AuthResponse } from '../../../models/auth.model';
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../shared/components/button-primary/button-primary.component';
import { MatIconModule } from '@angular/material/icon';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-signin',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    UiInputComponent,
    ButtonPrimaryComponent,
    MatIconModule,
  ],
  templateUrl: './signin.component.html',
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;
  emailError: string | null = null;
  passwordError: string | null = null;

  constructor(
    private authService: AuthService,
    private router: Router,
    private readonly alertService: AlertService
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    this.emailError = null;
    this.passwordError = null;

    const trimmedEmail = this.email.trim();

    if (!trimmedEmail) {
      this.emailError = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      this.emailError = 'Informe um e-mail válido.';
    }

    if (!this.password) {
      this.passwordError = 'Informe sua senha.';
    }

    if (this.emailError || this.passwordError) {
      return;
    }

    this.isLoading = true;
    const startTime = Date.now();

    const payload: AuthLoginRequest = {
      email: trimmedEmail,
      senha: this.password,
    };

    this.authService.login(payload).subscribe({
      next: (response: AuthResponse) => {
        console.log('Login bem-sucedido:', response.usuario);

        const elapsed = Date.now() - startTime;
        const remaining = 1000 - elapsed;

        if (remaining > 0) {
          setTimeout(() => {
            this.isLoading = false;
            this.router.navigate(['/']);
          }, remaining);
        } else {
          this.isLoading = false;
          this.router.navigate(['/']);
        }
      },
      error: (error) => {
        console.error('Erro no login:', error);
        this.isLoading = false;
        // Tenta pegar a mensagem do corpo da resposta da API
        const apiMessage = error?.error?.message;
        // Se não tiver, tenta a mensagem padrão do erro HTTP
        const httpMessage = error?.message;
        // Fallback para mensagem genérica
        const mensagem = apiMessage || httpMessage || 'Erro ao fazer login';
        this.alertService.showError(mensagem);
      },
    });
  }
}
