import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AddEntryModalComponent } from '../../shared/components/add-entry-modal/add-entry-modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { Transacao } from '../../models/transacao.model';
import { TransacaoService } from '../../services/transacao.service';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';

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
  private readonly destroyRef = inject(DestroyRef);

  transacoes: Transacao[] = [];
  categorias: Categoria[] = [];

  loading = false;
  errorMessage = '';

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

  constructor(
    private readonly authService: AuthService,
    private readonly transacaoService: TransacaoService,
    private readonly categoriaService: CategoriaService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const userId = user?.id ?? null;
        if (!userId) {
          this.transacoes = [];
          this.categorias = [];
          return;
        }
        this.loadCategorias(userId);
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

  openCreate(): void {
    this.entryModalMode = 'create';
    this.editingTransacao = null;
    this.isEntryModalOpen = true;
  }

  openEdit(t: Transacao): void {
    this.entryModalMode = 'edit';
    this.editingTransacao = t;
    this.isEntryModalOpen = true;
  }

  closeEntryModal(): void {
    this.isEntryModalOpen = false;
    this.entryModalMode = 'create';
    this.editingTransacao = null;
  }

  handleEntryConfirm(_: Transacao): void {
    const userId = this.authService.currentUserValue?.id;
    if (userId) {
      this.loadTransacoes(userId);
    }
  }

  openDelete(t: Transacao): void {
    this.deletingTransacao = t;
    this.isConfirmDeleteOpen = true;
  }

  confirmDelete(): void {
    if (!this.deletingTransacao) return;
    this.confirmingDelete = true;
    this.transacaoService.excluir(this.deletingTransacao.id).subscribe({
      next: () => {
        this.confirmingDelete = false;
        this.isConfirmDeleteOpen = false;
        const userId = this.authService.currentUserValue?.id;
        if (userId) {
          this.loadTransacoes(userId);
        }
      },
      error: () => {
        this.confirmingDelete = false;
        this.isConfirmDeleteOpen = false;
      },
    });
  }

  private loadTransacoes(userId: string): void {
    this.loading = true;
    this.errorMessage = '';
    this.transacaoService.listarPorUsuario(userId).subscribe({
      next: (transacoes) => {
        this.transacoes = transacoes ?? [];
        this.loading = false;
        this.resetPage();
      },
      error: (err) => {
        console.error(err);
        this.errorMessage =
          err?.error?.message || err?.message || 'Erro ao carregar transações';
        this.transacoes = [];
        this.loading = false;
      },
    });
  }

  private loadCategorias(userId: string): void {
    this.categoriaService.listarPorUsuario(userId).subscribe({
      next: (cats) => (this.categorias = cats ?? []),
      error: () => (this.categorias = []),
    });
  }
}
