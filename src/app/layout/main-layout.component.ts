import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import {
  Router,
  NavigationEnd,
  RouterLink,
  RouterLinkActive,
  RouterOutlet,
} from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { AuthService } from '../services/auth.service';
import { UsuarioResponse } from '../models/user.model';
import { AddEntryModalComponent } from '../shared/components/add-entry-modal/add-entry-modal.component';
import { Transacao } from '../models/transacao.model';
import { AlertService } from '../services/alert.service';
import { LoadingService } from '../services/loading.service';
import { NotificationService } from '../services/notification.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';
import { interval, switchMap, startWith, of, EMPTY } from 'rxjs';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    AddEntryModalComponent,
  ],
  templateUrl: './main-layout.component.html',
  styleUrls: ['./main-layout.component.scss'],
})
export class MainLayoutComponent implements OnInit {
  userName: string = '';
  userInitial: string = '';
  isAddModalOpen = false;
  isHome: boolean = false;
  showHeader: boolean = true;
  showBottomNav: boolean = true;
  hasActiveAlert = false;
  unreadNotificationsCount = 0;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private authService: AuthService,
    private router: Router,
    private readonly alertService: AlertService,
    private readonly loadingService: LoadingService,
    private readonly notificationService: NotificationService
  ) {}

  ngOnInit(): void {
    // estado inicial e atualização por navegação
    this.isHome = this.isHomeRoute(this.router.url);
    this.showHeader = this.computeShowHeader(this.router.url);
    this.showBottomNav = this.computeShowBottomNav(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        this.isHome = this.isHomeRoute(e.urlAfterRedirects ?? e.url);
        this.showHeader = this.computeShowHeader(e.urlAfterRedirects ?? e.url);
        this.showBottomNav = this.computeShowBottomNav(
          e.urlAfterRedirects ?? e.url
        );
        // Atualizar contador quando sair da página de notificações
        const path = (e.urlAfterRedirects ?? e.url).split('?')[0].split('#')[0];
        if (path !== '/notifications') {
          this.atualizarContadorNotificacoes();
        }
      });

    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user: UsuarioResponse | null) => {
        if (user?.primeiroAcesso && this.router.url !== '/completar-cadastro') {
          this.router.navigate(['/completar-cadastro']);
          return;
        }

        if (!user) {
          this.userName = '';
          this.userInitial = '';
          return;
        }

        const rawName = (user.nome ?? '').trim();
        const parts = rawName.split(/\s+/).filter(Boolean);

        const formatWord = (word: string): string =>
          word
            ? word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
            : '';

        const formattedParts = parts.map(formatWord);

        this.userName =
          formattedParts.length <= 1
            ? (formattedParts[0] ?? '')
            : `${formattedParts[0]} ${
                formattedParts[formattedParts.length - 1]
              }`;

        // Inicial com primeira letra do primeiro e do último nome (ex: "João Silva" -> "JS")
        if (parts.length === 0) {
          this.userInitial = '';
        } else if (parts.length === 1) {
          const single = parts[0];
          const first = single.charAt(0);
          const second = single.slice(1).trim().charAt(0);
          this.userInitial = (first + (second || '')).toUpperCase();
        } else {
          const first = parts[0].charAt(0);
          const last = parts[parts.length - 1].charAt(0);
          this.userInitial = (first + last).toUpperCase();
        }
      });

    this.alertService.visible$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((visible) => {
        this.hasActiveAlert = visible;
      });

    // Carregar contador de notificações não vistas e atualizar a cada 30 segundos
    this.authService.currentUser$
      .pipe(
        switchMap((user) => {
          if (!user) {
            this.unreadNotificationsCount = 0;
            return EMPTY;
          }
          // Atualizar imediatamente e depois a cada 30 segundos
          return interval(30000).pipe(
            startWith(0),
            switchMap(() => this.notificationService.contarAlertasNaoVistos())
          );
        }),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe({
        next: (count) => {
          this.unreadNotificationsCount = count;
        },
        error: (error) => {
          console.error('Erro ao carregar contador de notificações:', error);
          this.unreadNotificationsCount = 0;
        },
      });
  }

  private isHomeRoute(url: string): boolean {
    const path = (url ?? '').split('?')[0].split('#')[0];
    return path === '/' || path === '';
  }

  private computeShowHeader(url: string): boolean {
    const path = (url ?? '').split('?')[0].split('#')[0];
    return (
      path === '/' ||
      path === '' ||
      path === '/metas' ||
      path === '/history' ||
      path === '/profile' ||
      path === '/notifications'
    );
  }

  private computeShowBottomNav(url: string): boolean {
    const path = (url ?? '').split('?')[0].split('#')[0];
    // Esconder menu inferior em telas específicas (ex.: dados do perfil, recorrentes)
    if (path.startsWith('/profile/dados')) {
      return false;
    }
    if (path.startsWith('/recorrentes')) {
      return false;
    }
    return true;
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/signin']);
  }

  openAddModal(): void {
    this.isAddModalOpen = true;
  }

  closeAddModal(): void {
    this.isAddModalOpen = false;
  }

  handleAddEntry(transacao: Transacao): void {
    console.log('Nova movimentação registrada:', transacao);
    this.closeAddModal();
    const tipoLabel = transacao.tipo === 'RECEITA' ? 'Ganho' : 'Gasto';
    this.loadingService.show(`Registrando ${tipoLabel.toLowerCase()}...`);
    setTimeout(() => {
      this.loadingService.hide();
      this.alertService.showSuccess(`${tipoLabel} registrado com sucesso!`);
    }, 2000);
  }

  navigateToNotifications(): void {
    this.router.navigate(['/notifications']);
  }

  private atualizarContadorNotificacoes(): void {
    // Método simples para atualizar o contador sem criar nova subscription
    this.notificationService.contarAlertasNaoVistos().subscribe({
      next: (count) => {
        this.unreadNotificationsCount = count;
      },
      error: (error) => {
        console.error('Erro ao atualizar contador:', error);
      },
    });
  }
}
