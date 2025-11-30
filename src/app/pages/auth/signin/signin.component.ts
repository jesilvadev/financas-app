import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { AuthService } from '../../../services/auth.service';
import { AuthLoginRequest, AuthResponse } from '../../../models/auth.model';
import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../shared/components/button-primary/button-primary.component';
import { MatIconModule } from '@angular/material/icon';
import { DisplayAlertUnauthComponent } from '../../../shared/components/display-alert/display-alert-unauth.component';

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
    DisplayAlertUnauthComponent,
  ],
  templateUrl: './signin.component.html',
})
export class SigninComponent {
  email: string = '';
  password: string = '';
  showPassword: boolean = false;
  isLoading: boolean = false;

  @ViewChild(DisplayAlertUnauthComponent)
  authAlert?: DisplayAlertUnauthComponent;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.authAlert?.abrir('Por favor, preencha todos os campos', 'error');
      return;
    }

    this.isLoading = true;

    const payload: AuthLoginRequest = {
      email: this.email.trim(),
      senha: this.password,
    };

    this.authService
      .login(payload)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: (response: AuthResponse) => {
          console.log('Login bem-sucedido:', response.usuario);
          this.router.navigate(['/']);
        },
        error: (error) => {
          console.error('Erro no login:', error);
          // Tenta pegar a mensagem do corpo da resposta da API
          const apiMessage = error?.error?.message;
          // Se não tiver, tenta a mensagem padrão do erro HTTP
          const httpMessage = error?.message;
          // Fallback para mensagem genérica
          const mensagem =
            apiMessage || httpMessage || 'Erro ao fazer login';
          this.authAlert?.abrir(mensagem, 'error');
        },
      });
  }
}
