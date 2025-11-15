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
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  onSubmit(): void {
    if (!this.email || !this.password) {
      this.errorMessage = 'Por favor, preencha todos os campos';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

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
          this.errorMessage =
            error?.error?.message || error?.message || 'Erro ao fazer login';
        },
      });
  }
}
