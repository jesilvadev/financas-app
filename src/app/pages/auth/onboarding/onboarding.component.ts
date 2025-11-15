// src/app/pages/auth/onboarding/onboarding.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ButtonPrimaryComponent } from '../../../shared/components/button-primary/button-primary.component';

@Component({
  selector: 'app-onboarding',
  standalone: true,
  imports: [CommonModule, RouterModule, ButtonPrimaryComponent],
  templateUrl: './onboarding.component.html',
})
export class OnboardingComponent {
  currentStep = 1;

  constructor(private router: Router) {}

  nextStep() {
    if (this.currentStep < 3) this.currentStep++;
  }

  previousStep() {
    if (this.currentStep > 1) this.currentStep--;
  }

  get primaryLabel(): string {
    return this.currentStep === 3 ? 'Começar' : 'Continuar';
  }

  onPrimaryClick(): void {
    if (this.currentStep < 3) {
      this.nextStep();
    } else {
      this.router.navigate(['/signup']);
    }
  }
}
