import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';

import { DashboardService } from '../../services/dashboard.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { TransacaoService } from '../../services/transacao.service';
import { MatIcon } from '@angular/material/icon';
import {
  PeriodoDashboard,
  DashboardResponse,
  TransacaoResponse,
} from '../../models/dashboard.model';
import {
  PieChartComponent,
  PieChartData,
} from '../../shared/components/pie-chart/pie-chart.component';
import { CategoryChartComponent } from '../../shared/components/category-chart/category-chart.component';
import { MetasSummaryComponent } from '../../shared/components/metas-summary/metas-summary.component';
import {
  RelatorioModalComponent,
  RelatorioPeriodo,
} from '../../shared/components/relatorio-modal/relatorio-modal.component';
import { RelatorioService } from '../../services/relatorio.service';
import { LoadingService } from '../../services/loading.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatIcon,
    FormsModule,
    PieChartComponent,
    CategoryChartComponent,
    MetasSummaryComponent,
    RelatorioModalComponent,
  ],
  templateUrl: './home.component.html',
})
export class HomeComponent implements OnInit {
  PeriodoDashboard = PeriodoDashboard; // Expõe o enum para o template

  saldoAtual = 0;
  totalReceitas = 0;
  totalDespesas = 0;

  periodoSelecionado: PeriodoDashboard = PeriodoDashboard.MES_ATUAL;
  periodos = [
    { value: PeriodoDashboard.MES_ATUAL, label: 'Mês Atual' },
    { value: PeriodoDashboard.ULTIMOS_3_MESES, label: 'Últimos 3 Meses' },
    { value: PeriodoDashboard.ULTIMOS_6_MESES, label: 'Últimos 6 Meses' },
    { value: PeriodoDashboard.ULTIMOS_12_MESES, label: 'Últimos 12 Meses' },
    { value: PeriodoDashboard.TODA_UTILIZACAO, label: 'Toda Utilização' },
  ];

  dashboardData: DashboardResponse | null = null;
  receitasChartData: PieChartData[] = [];
  despesasChartData: PieChartData[] = [];

  loading = false;
  isRelatorioModalOpen = false;
  gerandoRelatorio = false;

  private readonly destroyRef = inject(DestroyRef);
  private currentUserId: string | null = null;

  constructor(
    private readonly dashboardService: DashboardService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly transacaoService: TransacaoService,
    private readonly relatorioService: RelatorioService,
    private readonly loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    // Carrega período salvo do localStorage
    this.periodoSelecionado = this.dashboardService.obterPeriodoSalvo();

    this.loading = true;
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const userId = user?.id ?? null;
        this.currentUserId = userId;
        if (!userId) {
          this.resetResumo();
          this.loading = false;
          return;
        }
        this.carregarResumo(userId);
      });

    this.transacaoService.transacoesAtualizadas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.currentUserId) {
          this.carregarResumo(this.currentUserId);
        }
      });
  }

  onPeriodoChange(): void {
    // Salva o período no localStorage
    this.dashboardService.salvarPeriodo(this.periodoSelecionado);

    // Recarrega os dados
    if (this.currentUserId) {
      this.carregarResumo(this.currentUserId);
    }
  }

  private carregarResumo(userId: string): void {
    this.loading = true;

    this.dashboardService
      .obterDashboard(userId, this.periodoSelecionado)
      .subscribe({
        next: (dashboard) => {
          this.dashboardData = dashboard;
          this.saldoAtual = dashboard.saldoAtual;
          this.totalReceitas = dashboard.totalReceitas;
          this.totalDespesas = dashboard.totalDespesas;

          // Prepara dados para gráficos de pizza
          this.prepararDadosGraficos(dashboard.transacoesRecentes);

          this.loading = false;
        },
        error: (err) => {
          this.resetResumo();
          const mensagem =
            err?.error?.message ||
            err?.message ||
            'Erro ao carregar dashboard.';
          this.alertService.showError(mensagem);
          this.loading = false;
        },
      });
  }

  private prepararDadosGraficos(transacoes: TransacaoResponse[]): void {
    // Agrupa receitas por categoria
    const receitasPorCategoria = new Map<string, number>();
    const despesasPorCategoria = new Map<string, number>();

    transacoes.forEach((transacao) => {
      if (transacao.tipo === 'RECEITA') {
        const atual = receitasPorCategoria.get(transacao.categoria) || 0;
        receitasPorCategoria.set(transacao.categoria, atual + transacao.valor);
      } else if (transacao.tipo === 'DESPESA') {
        const atual = despesasPorCategoria.get(transacao.categoria) || 0;
        despesasPorCategoria.set(transacao.categoria, atual + transacao.valor);
      }
    });

    // Paletas distintas para reforçar o significado das transações
    // Receitas: tons positivos (verdes/azuis) com bastante contraste entre si
    const coresReceitas = [
      '#16A34A', // verde médio
      '#22C55E', // verde claro
      '#166534', // verde musgo escuro
      '#0EA5E9', // azul claro
      '#0284C7', // azul médio
      '#22C1C3', // teal vibrante
      '#0D9488', // verde água escuro
      '#38BDF8', // azul suave
    ];

    // Despesas: tons negativos (vermelhos/laranjas) bem variados
    const coresDespesas = [
      '#EF4444', // vermelho vivo
      '#991B1B', // vinho escuro
      '#F97316', // laranja intenso
      '#7F1D1D', // bordô profundo
      '#FB923C', // laranja claro
      '#B91C1C', // vermelho profundo
      '#F59E0B', // amarelo-alaranjado
      '#EA580C', // laranja queimado
    ];

    // Ordena categorias por valor (maior -> menor) para aplicar cores na ordem
    const receitasOrdenadas = Array.from(receitasPorCategoria.entries()).sort(
      (a, b) => b[1] - a[1]
    );
    const despesasOrdenadas = Array.from(despesasPorCategoria.entries()).sort(
      (a, b) => b[1] - a[1]
    );

    // Prepara dados de receitas com paleta positiva (maior valor recebe cor mais forte)
    this.receitasChartData = receitasOrdenadas.map(
      ([categoria, valor], index) => ({
        label: categoria,
        value: valor,
        color: coresReceitas[index % coresReceitas.length],
      })
    );

    // Prepara dados de despesas com paleta negativa (maior valor recebe cor mais forte)
    this.despesasChartData = despesasOrdenadas.map(
      ([categoria, valor], index) => ({
        label: categoria,
        value: valor,
        color: coresDespesas[index % coresDespesas.length],
      })
    );
  }

  private resetResumo(): void {
    this.saldoAtual = 0;
    this.totalReceitas = 0;
    this.totalDespesas = 0;
    this.dashboardData = null;
    this.receitasChartData = [];
    this.despesasChartData = [];
  }

  openRelatorioModal(): void {
    this.isRelatorioModalOpen = true;
  }

  handleRelatorioModalClose(): void {
    this.isRelatorioModalOpen = false;
  }

  handleRelatorioModalConfirm(periodo: RelatorioPeriodo): void {
    if (this.gerandoRelatorio || !this.currentUserId) return;

    this.gerandoRelatorio = true;
    this.loadingService.show('Gerando relatório...');

    // Primeiro obtém o relatório
    this.relatorioService
      .obterRelatorioMensal(this.currentUserId, periodo.mes, periodo.ano)
      .subscribe({
        next: (relatorio) => {
          this.loadingService.hide();
          this.gerandoRelatorio = false;
          this.isRelatorioModalOpen = false;

          // Mostra mensagem de sucesso
          this.alertService.showSuccess(
            `Relatório de ${this.getMesNome(periodo.mes)}/${
              periodo.ano
            } gerado com sucesso!`
          );

          // Faz download do relatório em CSV
          this.downloadRelatorio(periodo);
        },
        error: (err) => {
          this.loadingService.hide();
          this.gerandoRelatorio = false;
          const mensagem =
            err?.error?.message || err?.message || 'Erro ao gerar relatório.';
          this.alertService.showError(mensagem);
        },
      });
  }

  private downloadRelatorio(periodo: RelatorioPeriodo): void {
    if (!this.currentUserId) return;

    this.relatorioService
      .exportarTransacoesMensal(
        this.currentUserId,
        periodo.mes,
        periodo.ano,
        'csv'
      )
      .subscribe({
        next: (blob) => {
          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `relatorio_${periodo.mes}_${periodo.ano}.csv`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          window.URL.revokeObjectURL(url);
        },
        error: (err) => {
          console.error('Erro ao fazer download do relatório', err);
        },
      });
  }

  private getMesNome(mes: number): string {
    const meses = [
      'Janeiro',
      'Fevereiro',
      'Março',
      'Abril',
      'Maio',
      'Junho',
      'Julho',
      'Agosto',
      'Setembro',
      'Outubro',
      'Novembro',
      'Dezembro',
    ];
    return meses[mes - 1] || '';
  }
}
