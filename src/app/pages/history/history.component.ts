import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { AddEntryModalComponent } from '../../shared/components/add-entry-modal/add-entry-modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { Transacao } from '../../models/transacao.model';
import { Categoria } from '../../models/categoria.model';
import { TransacaoService } from '../../services/transacao.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { LoadingService } from '../../services/loading.service';
import { UsuarioResponse } from '../../models/user.model';

// Interface estendida para incluir saldo inicial
interface TransacaoComSaldoInicial extends Transacao {
  isSaldoInicial?: boolean;
}

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    AddEntryModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './history.component.html',
})
export class HistoryComponent implements OnInit {
  transacoes: Transacao[] = [];
  categorias: Categoria[] = [];
  currentUser: UsuarioResponse | null = null;

  filtroTipo: 'TODOS' | 'RECEITA' | 'DESPESA' = 'TODOS';
  filtroCategoriaId: string = '';
  filtroDataInicio: string = '';
  filtroDataFim: string = '';

  pageSize = 10;
  currentPage = 1;

  isEntryModalOpen = false;
  entryModalMode: 'create' | 'edit' = 'create';
  editingTransacao: Transacao | null = null;

  isConfirmDeleteOpen = false;
  deletingTransacao: Transacao | null = null;
  confirmingDelete = false;
  loadingTransacoes = false;
  loadErrorMessage = '';

  private readonly destroyRef = inject(DestroyRef);
  private lastUserId: string | null = null;

  constructor(
    private readonly transacaoService: TransacaoService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly loadingService: LoadingService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const userId = user?.id;
        this.currentUser = user;
        if (!userId) {
          this.transacoes = [];
          return;
        }
        this.lastUserId = userId;
        this.loadTransacoes(userId);
      });

    this.transacaoService.transacoesAtualizadas$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.lastUserId) {
          this.loadTransacoes(this.lastUserId);
        }
      });
  }

  get filteredTransacoes(): TransacaoComSaldoInicial[] {
    let list: TransacaoComSaldoInicial[] = [...this.transacoes];

    // Adiciona saldo inicial como primeira entrada se existir
    if (
      this.currentUser?.saldoInicial != null &&
      this.currentUser.saldoInicial !== 0
    ) {
      const saldoInicial: TransacaoComSaldoInicial = {
        id: 'saldo-inicial',
        tipo: 'RECEITA',
        valor: this.currentUser.saldoInicial,
        data:
          this.currentUser.dataInicioControle || this.currentUser.dataCriacao,
        descricao: null,
        userId: this.currentUser.id,
        categoriaId: '',
        categoriaNome: 'Saldo inicial',
        isSaldoInicial: true,
      };
      list = [saldoInicial, ...list];
    }

    // Aplica filtros (saldo inicial sempre aparece quando filtro é TODOS ou RECEITA)
    if (this.filtroTipo !== 'TODOS') {
      list = list.filter((t) => {
        if (t.isSaldoInicial) {
          return this.filtroTipo === 'RECEITA';
        }
        return t.tipo === this.filtroTipo;
      });
    }
    if (this.filtroCategoriaId) {
      list = list.filter(
        (t) => !t.isSaldoInicial && t.categoriaId === this.filtroCategoriaId
      );
    }
    if (this.filtroDataInicio) {
      const start = new Date(this.filtroDataInicio);
      list = list.filter((t) => {
        if (t.isSaldoInicial) return true; // Saldo inicial sempre aparece
        return new Date(t.data) >= start;
      });
    }
    if (this.filtroDataFim) {
      const end = new Date(this.filtroDataFim);
      end.setHours(23, 59, 59, 999);
      list = list.filter((t) => {
        if (t.isSaldoInicial) return true; // Saldo inicial sempre aparece
        return new Date(t.data) <= end;
      });
    }

    // Ordena: saldo inicial primeiro, depois por data (mais recente primeiro)
    list.sort((a, b) => {
      if (a.isSaldoInicial) return -1;
      if (b.isSaldoInicial) return 1;
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });

    return list;
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredTransacoes.length / this.pageSize)
    );
  }

  get pagedTransacoes(): TransacaoComSaldoInicial[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTransacoes.slice(start, start + this.pageSize);
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  openEdit(t: TransacaoComSaldoInicial): void {
    // Saldo inicial não pode ser editado
    if (t.isSaldoInicial) return;
    this.entryModalMode = 'edit';
    this.editingTransacao = t;
    this.isEntryModalOpen = true;
  }

  openDelete(t: TransacaoComSaldoInicial): void {
    // Saldo inicial não pode ser deletado
    if (t.isSaldoInicial) return;
    this.deletingTransacao = t;
    this.isConfirmDeleteOpen = true;
  }

  // callbacks do modal de edição
  handleEntryModalClose(): void {
    this.isEntryModalOpen = false;
    this.editingTransacao = null;
    this.entryModalMode = 'create';
  }

  handleEntryModalConfirm(updated: Transacao): void {
    const isEdit = this.entryModalMode === 'edit';
    // Recarrega da API para garantir categoriaNome atualizado
    if (this.lastUserId) {
      this.loadTransacoes(this.lastUserId);
    } else {
      // fallback: atualiza somente em memória
      this.transacoes = this.transacoes.map((t) =>
        t.id === updated.id ? updated : t
      );
    }

    this.isEntryModalOpen = false;
    this.editingTransacao = null;
    this.entryModalMode = 'create';

    const tipoLabel = updated.tipo === 'RECEITA' ? 'Ganho' : 'Gasto';
    const loadingMessage = isEdit
      ? `Atualizando ${tipoLabel.toLowerCase()}...`
      : `Registrando ${tipoLabel.toLowerCase()}...`;
    const successMessage = isEdit
      ? `${tipoLabel} atualizado com sucesso!`
      : `${tipoLabel} registrado com sucesso!`;

    this.loadingService.show(loadingMessage);
    setTimeout(() => {
      this.loadingService.hide();
      this.alertService.showSuccess(successMessage);
    }, 2000);
  }

  // callbacks do modal de exclusão
  handleDeleteModalClose(): void {
    if (this.confirmingDelete) return;
    this.isConfirmDeleteOpen = false;
    this.deletingTransacao = null;
  }

  confirmDelete(): void {
    if (!this.deletingTransacao || this.confirmingDelete) return;

    const id = this.deletingTransacao.id;
    this.confirmingDelete = true;

    this.transacaoService.excluir(id).subscribe({
      next: () => {
        this.transacoes = this.transacoes.filter((t) => t.id !== id);
        this.confirmingDelete = false;
        this.isConfirmDeleteOpen = false;
        this.deletingTransacao = null;
      },
      error: (err) => {
        console.error('Erro ao excluir transação', err);
        this.confirmingDelete = false;
        const mensagem =
          err?.error?.message ||
          err?.message ||
          'Erro ao excluir transação.';
        this.alertService.showError(mensagem);
      },
    });
  }

  private loadTransacoes(userId: string): void {
    this.loadingTransacoes = true;
    this.loadErrorMessage = '';

    this.transacaoService.listarPorUsuario(userId).subscribe({
      next: (lista) => {
        this.transacoes = lista.sort(
          (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
        );

        console.log('Transações carregadas (ordenadas):', this.transacoes);

        this.loadingTransacoes = false;
      },
      error: (err) => {
        console.error('Erro ao carregar transações', err);
        this.loadingTransacoes = false;
        this.loadErrorMessage =
          err?.error?.message || err?.message || 'Erro ao carregar histórico';
        this.alertService.showError(this.loadErrorMessage);
      },
    });
  }
}
