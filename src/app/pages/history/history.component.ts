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
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const userId = user?.id;
        if (!userId) {
          this.transacoes = [];
          return;
        }
        this.lastUserId = userId;
        this.loadTransacoes(userId);
      });
  }

  get filteredTransacoes(): Transacao[] {
    let list = [...this.transacoes];

    if (this.filtroTipo !== 'TODOS') {
      list = list.filter((t) => t.tipo === this.filtroTipo);
    }
    if (this.filtroCategoriaId) {
      list = list.filter((t) => t.categoriaId === this.filtroCategoriaId);
    }
    if (this.filtroDataInicio) {
      const start = new Date(this.filtroDataInicio);
      list = list.filter((t) => new Date(t.data) >= start);
    }
    if (this.filtroDataFim) {
      const end = new Date(this.filtroDataFim);
      end.setHours(23, 59, 59, 999);
      list = list.filter((t) => new Date(t.data) <= end);
    }
    list.sort(
      (a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()
    );
    return list;
  }

  get totalPages(): number {
    return Math.max(
      1,
      Math.ceil(this.filteredTransacoes.length / this.pageSize)
    );
  }

  get pagedTransacoes(): Transacao[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredTransacoes.slice(start, start + this.pageSize);
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  openEdit(t: Transacao): void {
    this.entryModalMode = 'edit';
    this.editingTransacao = t;
    this.isEntryModalOpen = true;
  }

  openDelete(t: Transacao): void {
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
    // Recarrega da API para garantir categoriaNome atualizado
    if (this.lastUserId) {
      this.loadTransacoes(this.lastUserId);
    } else {
      // fallback: atualiza somente em memória
      this.transacoes = this.transacoes.map((t) =>
        t.id === updated.id ? updated : t
      );
    }
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
      },
    });
  }

  private loadTransacoes(userId: string): void {
    this.loadingTransacoes = true;
    this.loadErrorMessage = '';

    this.transacaoService.listarPorUsuario(userId).subscribe({
      next: (lista) => {
        this.transacoes = lista;
        this.loadingTransacoes = false;
      },
      error: (err) => {
        console.error('Erro ao carregar transações', err);
        this.loadingTransacoes = false;
        this.loadErrorMessage =
          err?.error?.message || err?.message || 'Erro ao carregar histórico';
      },
    });
  }
}