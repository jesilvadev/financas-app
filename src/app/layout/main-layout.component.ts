import { CommonModule } from '@angular/common';
import { Component, OnInit, DestroyRef, inject } from '@angular/core';
import {
  Router,
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
  private readonly destroyRef = inject(DestroyRef);

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
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

        this.userName = user.nome;
        this.userInitial = user.nome.charAt(0).toUpperCase();
      });
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
