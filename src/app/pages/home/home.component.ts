import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIcon],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  saldoAtual = 0;
  totalReceitas = 0;
  totalDespesas = 0;

  loading = false;
  errorMessage = '';

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const userId = user?.id;
        if (!userId) {
          this.resetResumo();
          this.loading = false;
          return;
        }
        this.carregarResumo(userId);
      });
  }

  private carregarResumo(userId: string): void {
    this.loading = true;
    this.errorMessage = '';

    this.dashboardService.obterDashboard(userId).subscribe({
      next: (dashboard) => {
        this.saldoAtual = dashboard.saldoAtual;
        this.totalReceitas = dashboard.totalReceitas;
        this.totalDespesas = dashboard.totalDespesas;
        this.loading = false;
      },
      error: (err) => {
        this.resetResumo();
        this.errorMessage =
          err?.error?.message ||
          err?.message ||
          'Erro ao carregar saldo e movimentações.';
        this.loading = false;
      },
    });
  }

  private resetResumo(): void {
    this.saldoAtual = 0;
    this.totalReceitas = 0;
    this.totalDespesas = 0;
  }
}
