import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { finalize, switchMap, timer } from 'rxjs';

import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { AuthService } from '../../../services/auth.service';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
} from '../../../models/auth.model';

interface Step1Payload {
  nome: string;
}

interface Step2Payload {
  email: string;
  senha: string;
}

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, Step1Component, Step2Component],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  currentStep: number = 1;
  signupData: AuthRegisterRequest = {
    nome: '',
    email: '',
    senha: '',
  };
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  onStep1Next({ nome }: Step1Payload): void {
    this.signupData.nome = nome;
    this.currentStep = 2;
  }

  onStep2Next({ email, senha }: Step2Payload): void {
    this.signupData.email = email;
    this.signupData.senha = senha;
    this.register();
  }

  onStep2Back(): void {
    this.currentStep = 1;
  }

  private register(): void {
    this.isLoading = true;
    this.errorMessage = '';

    const loginPayload: AuthLoginRequest = {
      email: this.signupData.email,
      senha: this.signupData.senha,
    };

    timer(1000)
      .pipe(
        switchMap(() => this.authService.register(this.signupData)),
        switchMap(() => this.authService.login(loginPayload)),
        finalize(() => (this.isLoading = false))
      )
      .subscribe({
        next: () => {
          this.router.navigate(['/completar-cadastro']);
        },
        error: (error) => {
          console.error('Erro no cadastro:', error);
          this.errorMessage =
            error?.error?.message || error?.message || 'Erro ao criar conta';
          this.currentStep = 2;
        },
      });
  }
}
