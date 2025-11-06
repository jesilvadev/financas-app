import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step3Component } from './step3/step3.component';
import { Step4Component } from './step4/step4.component';
import { Step5Component } from './step5/step5.component';
import { ConclusaoComponent } from './conclusao/conclusao.component';
import { AuthService } from '../../../services/auth.service';
import { SignupData } from '../../../models/user.model';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    Step5Component,
    ConclusaoComponent,
  ],
  templateUrl: './signup.component.html',
})
export class SignupComponent {
  currentStep: number = 1;
  signupData: SignupData = {
    fullName: '',
    email: '',
    password: '',
    incomes: [],
    expenses: [],
    startDay: '',
  };
  isLoading: boolean = false;
  errorMessage: string = '';

  constructor(private authService: AuthService, private router: Router) {}

  // Step 1
  onStep1Next(data: any): void {
    this.signupData.fullName = data.fullName;
    this.currentStep = 2;
  }

  // Step 2
  onStep2Next(data: any): void {
    this.signupData.email = data.email;
    this.signupData.password = data.password;
    this.currentStep = 3;
  }

  onStep2Back(): void {
    this.currentStep = 1;
  }

  // Step 3
  onStep3Next(data: any): void {
    this.signupData.incomes = data.incomes;
    this.currentStep = 4;
  }

  onStep3Back(): void {
    this.currentStep = 2;
  }

  // Step 4
  onStep4Next(data: any): void {
    this.signupData.expenses = data.expenses;
    this.currentStep = 5;
  }

  onStep4Back(): void {
    this.currentStep = 3;
  }

  // Step 5
  onStep5Next(data: any): void {
    this.signupData.startDay = data.startDay;
    this.completeSignup();
  }

  onStep5Back(): void {
    this.currentStep = 4;
  }

  // Finalizar cadastro
  completeSignup(): void {
    this.isLoading = true;
    this.errorMessage = '';

    console.log('Dados do cadastro:', this.signupData);

    this.authService.signup(this.signupData).subscribe({
      next: (user) => {
        console.log('Cadastro bem-sucedido:', user);
        this.isLoading = false;
        this.currentStep = 6;
      },
      error: (error) => {
        console.error('Erro no cadastro:', error);
        this.errorMessage = error.message || 'Erro ao criar conta';
        this.isLoading = false;
        // Voltar para o step 2 onde estão os dados de email/senha
        this.currentStep = 2;
      },
    });
  }
}
