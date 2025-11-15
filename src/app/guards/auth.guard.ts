import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.isAuthenticated) {
    return true;
  }

  // Primeiro acesso: enviar para onboarding; senão, para login
  const hasSeenOnboarding = localStorage.getItem('onboardingSeen') === 'true';
  router.navigate([hasSeenOnboarding ? '/signin' : '/onboarding']);
  return false;
};
