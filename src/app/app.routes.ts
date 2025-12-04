import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { StatsComponent } from './pages/stats/stats.component';
import { HistoryComponent } from './pages/history/history.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { OnboardingComponent } from './pages/auth/onboarding/onboarding.component';
import { CompletarCadastroComponent } from './pages/auth/completarCadastro/completarCadastro.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { ProfileDadosComponent } from './pages/profile/dados/dados.component';
import { ProfileSegurancaComponent } from './pages/profile/seguranca/seguranca.component';
import { ProfilePersonalizacaoComponent } from './pages/profile/personalizacao/personalizacao.component';
import { RecorrentesComponent } from './pages/recorrentes/recorrentes.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileAlertasComponent } from './pages/profile/alertas/alertas.component';

export const routes: Routes = [
  // Rotas de autenticação (apenas para não autenticados)
  { path: 'signin', component: SigninComponent, canActivate: [guestGuard] },
  { path: 'signup', component: SignupComponent, canActivate: [guestGuard] },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [guestGuard],
  },
  {
    path: 'completar-cadastro',
    component: CompletarCadastroComponent,
    canActivate: [authGuard],
  },

  // Rotas principais com layout (apenas para autenticados)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      { path: '', component: HomeComponent },
      { path: 'stats', component: StatsComponent },
      { path: 'history', component: HistoryComponent },
      { path: 'recorrentes', component: RecorrentesComponent },
      { path: 'notifications', component: NotificationsComponent },
      { path: 'profile', component: ProfileComponent },
      { path: 'profile/dados', component: ProfileDadosComponent },
      { path: 'profile/seguranca', component: ProfileSegurancaComponent },
      { path: 'profile/alertas', component: ProfileAlertasComponent },
      {
        path: 'profile/personalizacao',
        component: ProfilePersonalizacaoComponent,
      },
    ],
  },

  // Fallback - redirecionar qualquer rota não encontrada para signin
  { path: '**', redirectTo: 'signin' },
];