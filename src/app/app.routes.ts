import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { StatsComponent } from './pages/stats/stats.component';
import { HistoryComponent } from './pages/history/history.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { OnboardingComponent } from './pages/auth/onboarding/onboarding.component';

export const routes: Routes = [
  // Rotas de autenticação
  { path: 'signin', component: SigninComponent },
  { path: 'signup', component: SignupComponent },
  { path: 'onboarding', component: OnboardingComponent },

  // Rotas principais com layout
  {
    path: '',
    component: MainLayoutComponent,
    children: [
      { path: '', component: HomeComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'profile', component: ProfileComponent },
    ],
  },
];
