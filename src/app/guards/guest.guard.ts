import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const guestGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (!authService.isAuthenticated) {
    // Se ainda não viu o onboarding, forçar redirecionamento para onboarding
    const hasSeenOnboarding = localStorage.getItem('onboardingSeen') === 'true';
    if (!hasSeenOnboarding && state.url !== '/onboarding') {
      router.navigate(['/onboarding']);
      return false;
    }
    return true;
  }

  // Se já estiver autenticado, redirecionar para home
  router.navigate(['/']);
  return false;
};
