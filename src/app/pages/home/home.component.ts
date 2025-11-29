import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Transacao } from '../../models/transacao.model';
import { TransacaoService } from '../../services/transacao.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  saldoTotal = 0;
  totalReceitas = 0;
  totalDespesas = 0;

  loading = false;
  errorMessage = '';

  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly transacaoService: TransacaoService,
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

    this.transacaoService.listarPorUsuario(userId).subscribe({
      next: (lista: Transacao[]) => {
        let receitas = 0;
        let despesas = 0;

        for (const t of lista) {
          if (t.tipo === 'RECEITA') {
            receitas += t.valor;
          } else if (t.tipo === 'DESPESA') {
            despesas += t.valor;
          }
        }

        this.totalReceitas = receitas;
        this.totalDespesas = despesas;
        this.saldoTotal = receitas - despesas;
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
    this.saldoTotal = 0;
    this.totalReceitas = 0;
    this.totalDespesas = 0;
  }
}
