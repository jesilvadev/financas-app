import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, of, switchMap, timer } from 'rxjs';

import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step3Component } from './step3/step3.component';
import { AuthService } from '../../../services/auth.service';
import {
  AuthLoginRequest,
  AuthRegisterRequest,
} from '../../../models/auth.model';
import { AlertService } from '../../../services/alert.service';

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
  imports: [CommonModule, Step1Component, Step2Component, Step3Component],
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

  constructor(
    private authService: AuthService,
    private router: Router,
    private readonly alertService: AlertService
  ) {}

  headerBack(): void {
    if (this.currentStep === 1) {
      this.router.navigate(['/signin']);
    } else {
      this.onStep2Back();
    }
  }

  onStep1Next({ nome }: Step1Payload): void {
    this.signupData.nome = nome;
    this.currentStep = 2;
  }

  onStep2Next({ email, senha }: Step2Payload): void {
    this.signupData.email = email;
    this.signupData.senha = senha;
    this.currentStep = 3;
    this.register();
  }

  onStep2Back(): void {
    this.currentStep = 1;
  }

  private register(): void {
    this.isLoading = true;

    const loginPayload: AuthLoginRequest = {
      email: this.signupData.email,
      senha: this.signupData.senha,
    };

    const process$ = this.authService.register(this.signupData).pipe(
      switchMap(() => this.authService.login(loginPayload)),
      catchError((error) => {
        console.error('Erro no cadastro:', error);
        const mensagem =
          error?.error?.message || error?.message || 'Erro ao criar conta';
        this.alertService.showError(mensagem);
        // Volta para a step 2 em caso de erro
        this.currentStep = 2;
        return of(null);
      })
    );

    // Garante loader por pelo menos 3s e só então navega em caso de sucesso
    forkJoin([process$, timer(3000)])
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe(([result]) => {
        if (result) {
          this.router.navigate(['/completar-cadastro']);
        }
      });
  }
}
