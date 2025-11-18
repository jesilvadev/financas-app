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
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

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
})
export class MainLayoutComponent implements OnInit {
  userName: string = '';
  userInitial: string = '';
  isAddModalOpen = false;
  isHome: boolean = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    // estado inicial e atualização por navegação
    this.isHome = this.isHomeRoute(this.router.url);
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((e) => {
        this.isHome = this.isHomeRoute(e.urlAfterRedirects ?? e.url);
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
        this.userName =
          parts.length <= 1
            ? rawName
            : `${parts[0]} ${parts[parts.length - 1]}`;
        this.userInitial = rawName.charAt(0).toUpperCase();
      });
  }

  private isHomeRoute(url: string): boolean {
    const path = (url ?? '').split('?')[0].split('#')[0];
    return path === '/' || path === '';
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
  }
}
