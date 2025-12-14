import { Routes } from '@angular/router';
import { MainLayoutComponent } from './layout/main-layout.component';
import { HomeComponent } from './pages/home/home.component';
import { HistoryComponent } from './pages/history/history.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { SigninComponent } from './pages/auth/signin/signin.component';
import { SignupComponent } from './pages/auth/signup/signup.component';
import { OnboardingComponent } from './pages/auth/onboarding/onboarding.component';
import { CompletarCadastroComponent } from './pages/auth/completarCadastro/completarCadastro.component';
import { ForgotPasswordComponent } from './pages/auth/forgot-password/forgot-password.component';
import { authGuard } from './guards/auth.guard';
import { guestGuard } from './guards/guest.guard';
import { ProfileDadosComponent } from './pages/profile/dados/dados.component';
import { ProfileSegurancaComponent } from './pages/profile/seguranca/seguranca.component';
import { ProfilePersonalizacaoComponent } from './pages/profile/personalizacao/personalizacao.component';
import { RecorrentesComponent } from './pages/recorrentes/recorrentes.component';
import { NotificationsComponent } from './pages/notifications/notifications.component';
import { ProfileAlertasComponent } from './pages/profile/alertas/alertas.component';
import { MetasComponent } from './pages/metas/metas.component';

export const routes: Routes = [
  // Rotas de autenticação (apenas para não autenticados)
  {
    path: 'signin',
    component: SigninComponent,
    canActivate: [guestGuard],
    data: { themeColor: '#BFCBFF' },
  },
  {
    path: 'signup',
    component: SignupComponent,
    canActivate: [guestGuard],
    data: { themeColor: '#BFCBFF' },
  },
  {
    path: 'onboarding',
    component: OnboardingComponent,
    canActivate: [guestGuard],
    data: { themeColor: '#BFCBFF' },
  },
  {
    path: 'forgot-password',
    component: ForgotPasswordComponent,
    canActivate: [guestGuard],
    data: { themeColor: '#BFCBFF' },
  },
  {
    path: 'completar-cadastro',
    component: CompletarCadastroComponent,
    canActivate: [authGuard],
    data: { themeColor: '#BFCBFF' },
  },

  {
    path: 'notifications',
    component: NotificationsComponent,
    canActivate: [authGuard],
    data: { themeColor: '#FFFFFF' },
  },

  // Rotas principais com layout (apenas para autenticados)
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    // Default: todas as telas internas herdam #BFCBFF, exceto as que sobrescrevem abaixo.
    data: { themeColor: '#BFCBFF' },
    children: [
      { path: '', component: HomeComponent },
      { path: 'metas', component: MetasComponent },
      { path: 'history', component: HistoryComponent },
      {
        path: 'recorrentes',
        component: RecorrentesComponent,
        data: { themeColor: '#FFFFFF' },
      },
      { path: 'profile', component: ProfileComponent },
      {
        path: 'profile/dados',
        component: ProfileDadosComponent,
        data: { themeColor: '#FFFFFF' },
      },
      {
        path: 'profile/seguranca',
        component: ProfileSegurancaComponent,
        data: { themeColor: '#FFFFFF' },
      },
      {
        path: 'profile/alertas',
        component: ProfileAlertasComponent,
        data: { themeColor: '#FFFFFF' },
      },
      {
        path: 'profile/personalizacao',
        component: ProfilePersonalizacaoComponent,
        data: { themeColor: '#FFFFFF' },
      },
    ],
  },

  // Fallback - redirecionar qualquer rota não encontrada para signin
  { path: '**', redirectTo: 'signin' },
];
