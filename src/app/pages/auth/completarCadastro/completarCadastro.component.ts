import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { catchError, finalize, forkJoin, of, timer } from 'rxjs';

import { IntroComponent } from './intro/intro.component';
import { Step1Component } from './step1/step1.component';
import { Step2Component } from './step2/step2.component';
import { Step3Component } from './step3/step3.component';
import { ConclusaoComponent } from './conclusao/conclusao.component';
import { OnboardingService } from '../../../services/onboarding.service';
import { OnboardingRequest } from '../../../models/onboarding.model';
import { TransacaoRecorrenteOnboardingRequest } from '../../../models/transacaoRecorrente.model';
import { TipoTransacao } from '../../../models/tipoTransacao.enum';
import { AuthService } from '../../../services/auth.service';
import { CategoriaService } from '../../../services/categoria.service';
import { Categoria } from '../../../models/categoria.model';
import { Step4Component } from './step4/step4.component';
import { AlertService } from '../../../services/alert.service';

interface IncomePayload {
  incomes: RecorrenciaFormEntry[];
}

interface ExpensePayload {
  expenses: RecorrenciaFormEntry[];
}

interface StartDayPayload {
  startDay: string;
}

interface RecorrenciaFormEntry {
  value: number;
  categoriaId: string;
  categoriaNome: string;
  day: string;
}

@Component({
  selector: 'app-completar-cadastro',
  standalone: true,
  imports: [
    CommonModule,
    IntroComponent,
    Step1Component,
    Step2Component,
    Step3Component,
    Step4Component,
    ConclusaoComponent,
  ],
  templateUrl: './completarCadastro.component.html',
})
export class CompletarCadastroComponent {
  currentStep = 0;
  isLoading = false;

  private usuarioId: string | null = null;
  private saldoAtual: number = 0;
  private receitas: RecorrenciaFormEntry[] = [];
  private despesas: RecorrenciaFormEntry[] = [];
  private startDaySelected: string = '';

  categoriasReceita: Categoria[] = [];
  categoriasDespesa: Categoria[] = [];
  categoriasLoading = false;
  categoriasError = '';

  constructor(
    private readonly router: Router,
    private readonly onboardingService: OnboardingService,
    private readonly authService: AuthService,
    private readonly categoriaService: CategoriaService,
    private readonly alertService: AlertService
  ) {
    const user = this.authService.currentUserValue;

    if (!user) {
      this.router.navigate(['/signin']);
      return;
    }

    if (!user.primeiroAcesso) {
      console.warn(
        '[CompletarCadastro] Usuário já concluiu onboarding, redirecionando'
      );
      this.router.navigate(['/']);
      return;
    }

    this.usuarioId = user.id;
    this.loadCategorias();
  }

  headerBack(): void {
    if (this.currentStep === 0) {
      this.router.navigate(['/signin']);
      return;
    }
    if (this.currentStep === 1) {
      this.onStep1Back();
      return;
    }
    if (this.currentStep === 2) {
      this.onStep2Back();
      return;
    }
    if (this.currentStep === 3) {
      this.onStep3Back();
      return;
    }
    if (this.currentStep === 4) {
      this.onStep4Back();
      return;
    }
    if (this.currentStep === 5) {
      // Não permite voltar da conclusão
      return;
    }
  }

  onIntroNext(): void {
    const user = this.authService.currentUserValue;
    if (user && !user.primeiroAcesso) {
      console.warn(
        '[CompletarCadastro] Usuário já concluiu onboarding, redirecionando'
      );
      this.router.navigate(['/']);
      return;
    }
    this.currentStep = 1;
  }

  onStep1Next({ saldoAtual }: { saldoAtual: number }): void {
    console.log(
      '[CompletarCadastro] Step 1 (saldo atual) payload recebido:',
      saldoAtual
    );
    this.saldoAtual = saldoAtual;
    this.currentStep = 2;
  }

  onStep1Back(): void {
    this.currentStep = 0;
  }

  onStep2Next({ incomes }: IncomePayload): void {
    console.log('[CompletarCadastro] Step 2 payload recebido:', incomes);
    this.receitas = incomes.map((income) => ({ ...income }));
    this.currentStep = 3;
  }

  onStep2Back(): void {
    this.currentStep = 1;
  }

  onStep3Next({ expenses }: ExpensePayload): void {
    console.log('[CompletarCadastro] Step 3 payload recebido:', expenses);
    this.despesas = expenses.map((expense) => ({ ...expense }));
    this.currentStep = 4;
  }

  onStep3Back(): void {
    this.currentStep = 2;
  }

  onStep4Next({ startDay }: StartDayPayload): void {
    this.startDaySelected = startDay;
    this.enviarOnboarding(startDay);
  }

  onStep4Back(): void {
    this.currentStep = 3;
  }

  private enviarOnboarding(startDay: string): void {
    if (!this.usuarioId) {
      this.alertService.showError('Usuário não identificado.');
      return;
    }

    const payload: OnboardingRequest = {
      dataInicioControle: this.buildDataInicioControle(startDay),
      saldoAtual: this.saldoAtual,
      transacoesRecorrentes: [
        ...this.mapToRecorrencia(this.receitas, 'RECEITA'),
        ...this.mapToRecorrencia(this.despesas, 'DESPESA'),
      ],
    };

    console.log('[CompletarCadastro] Preparando envio do onboarding:', {
      usuarioId: this.usuarioId,
      payload,
    });

    this.isLoading = true;

    this.onboardingService
      .enviarOnboarding(payload, this.usuarioId)
      .pipe(finalize(() => (this.isLoading = false)))
      .subscribe({
        next: () => {
          console.log('[CompletarCadastro] Onboarding concluído com sucesso');
          this.currentStep = 5;
          forkJoin([
            this.authService
              .fetchCurrentUser()
              .pipe(catchError(() => of(null))),
            timer(3000), // garante spinner por pelo menos 3s
          ]).subscribe(() => {
            this.router.navigate(['/']);
          });
        },
        error: (error) => {
          console.error('[CompletarCadastro] Erro ao concluir onboarding', {
            error,
            usuarioId: this.usuarioId,
            payload,
          });
          const mensagem =
            error?.error?.message ||
            error?.message ||
            'Erro ao concluir cadastro';
          this.alertService.showError(mensagem);
        },
      });
  }

  private loadCategorias(): void {
    if (!this.usuarioId) {
      return;
    }

    this.categoriasLoading = true;
    this.categoriasError = '';

    this.categoriaService.listarPorUsuario(this.usuarioId).subscribe({
      next: (categorias) => {
        console.log(
          '[CompletarCadastro] Categorias carregadas para usuário',
          this.usuarioId,
          categorias
        );
        this.categoriasReceita = categorias.filter(
          (categoria) => categoria.tipo === 'RECEITA'
        );
        this.categoriasDespesa = categorias.filter(
          (categoria) => categoria.tipo === 'DESPESA'
        );
        this.categoriasLoading = false;
      },
      error: (error) => {
        console.error('[CompletarCadastro] Erro ao carregar categorias', {
          error,
          usuarioId: this.usuarioId,
        });
        this.categoriasError =
          error?.error?.message ||
          error?.message ||
          'Erro ao carregar categorias';
        this.categoriasLoading = false;
        this.alertService.showError(this.categoriasError);
      },
    });
  }

  private mapToRecorrencia(
    entries: RecorrenciaFormEntry[],
    tipo: TipoTransacao
  ): TransacaoRecorrenteOnboardingRequest[] {
    return entries.map((entry) => ({
      tipo,
      valor: entry.value,
      descricao: entry.categoriaNome || undefined,
      diaRecorrencia: Number(entry.day),
      categoriaId: entry.categoriaId || null,
    }));
  }

  private buildDataInicioControle(day: string): string {
    const today = new Date();
    const year = today.getFullYear();
    const month = today.getMonth();
    const maxDay = new Date(year, month + 1, 0).getDate();
    const targetDay = Math.min(Number(day), maxDay);

    const date = new Date(Date.UTC(year, month, targetDay));
    return date.toISOString().split('T')[0];
  }

  // Mapeamentos para reidratar os steps ao voltar
  get presetIncomesForStep(): {
    value: number;
    categoriaId: string;
    day: string;
  }[] {
    return this.receitas.map(({ value, categoriaId, day }) => ({
      value,
      categoriaId,
      day,
    }));
  }

  get presetExpensesForStep(): {
    value: number;
    categoriaId: string;
    day: string;
  }[] {
    return this.despesas.map(({ value, categoriaId, day }) => ({
      value,
      categoriaId,
      day,
    }));
  }

  get presetStartDayForStep(): string {
    return this.startDaySelected;
  }

  get presetSaldoAtualForStep(): number | null {
    return this.saldoAtual !== undefined ? this.saldoAtual : null;
  }
}
