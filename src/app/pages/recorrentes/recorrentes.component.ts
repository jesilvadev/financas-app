import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { RecurringEntryModalComponent } from '../../shared/components/recurring-entry-modal/recurring-entry-modal.component';
import { TransacaoRecorrente } from '../../models/transacaoRecorrente.model';
import { TransacaoRecorrenteService } from '../../services/transacaoRecorrente.service';
import { Categoria } from '../../models/categoria.model';
import { CategoriaService } from '../../services/categoria.service';
import { AuthService } from '../../services/auth.service';
import { UsuarioResponse } from '../../models/user.model';
import { RouterLink } from '@angular/router';
import { AlertService } from '../../services/alert.service';

@Component({
  selector: 'app-recorrentes',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    ConfirmModalComponent,
    RecurringEntryModalComponent,
  ],
  templateUrl: './recorrentes.component.html',
})
export class RecorrentesComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  // dados carregados
  recorrentesReceita: TransacaoRecorrente[] = [];
  recorrentesDespesa: TransacaoRecorrente[] = [];

  categoriasReceita: Categoria[] = [];
  categoriasDespesa: Categoria[] = [];

  loading = false;

  // exclusão
  isDeleteModalOpen = false;
  deleting = false;
  deleteErrorMessage = '';
  recorrenteParaExcluir: TransacaoRecorrente | null = null;

  // modal criar/editar recorrente
  isRecurringModalOpen = false;
  modalMode: 'create' | 'edit' = 'create';
  editingRecorrenteModal: TransacaoRecorrente | null = null;

  private currentUser: UsuarioResponse | null = null;

  constructor(
    private readonly recorrenteService: TransacaoRecorrenteService,
    private readonly categoriaService: CategoriaService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUser = user;
        const userId = user?.id;
        if (!userId) {
          this.resetDados();
          this.loading = false;
          return;
        }

        this.carregarCategorias(userId);
        this.carregarRecorrentes(userId);
      });
  }

  // exclusão
  solicitarExclusao(item: TransacaoRecorrente): void {
    if (this.deleting) return;
    this.recorrenteParaExcluir = item;
    this.deleteErrorMessage = '';
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.deleting) return;
    this.isDeleteModalOpen = false;
    this.recorrenteParaExcluir = null;
  }

  confirmarExclusao(): void {
    if (!this.recorrenteParaExcluir || this.deleting) return;

    const id = this.recorrenteParaExcluir.id;
    this.deleting = true;
    this.deleteErrorMessage = '';

    this.recorrenteService.excluir(id).subscribe({
      next: () => {
        this.recorrentesReceita = this.recorrentesReceita.filter(
          (r) => r.id !== id
        );
        this.recorrentesDespesa = this.recorrentesDespesa.filter(
          (r) => r.id !== id
        );
        this.deleting = false;
        this.isDeleteModalOpen = false;
        this.recorrenteParaExcluir = null;
      },
      error: (err) => {
        this.deleting = false;
        this.deleteErrorMessage =
          err?.error?.message ||
          err?.message ||
          'Erro ao excluir recorrência.';
        this.alertService.showError(this.deleteErrorMessage);
      },
    });
  }

  // modal criar/editar recorrente
  abrirNovoRecorrente(): void {
    this.modalMode = 'create';
    this.editingRecorrenteModal = null;
    this.isRecurringModalOpen = true;
  }

  abrirEdicaoRecorrente(item: TransacaoRecorrente): void {
    this.modalMode = 'edit';
    this.editingRecorrenteModal = item;
    this.isRecurringModalOpen = true;
  }

  fecharModalRecorrente(): void {
    if (this.deleting) return;
    this.isRecurringModalOpen = false;
    this.editingRecorrenteModal = null;
  }

  handleModalConfirm(rec: TransacaoRecorrente): void {
    this.atualizarListaLocal(rec);
    this.isRecurringModalOpen = false;
    this.editingRecorrenteModal = null;
  }

  private carregarCategorias(userId: string): void {
    this.categoriaService.listarPorUsuario(userId).subscribe({
      next: (lista) => {
        this.categoriasReceita = lista.filter((c) => c.tipo === 'RECEITA');
        this.categoriasDespesa = lista.filter((c) => c.tipo === 'DESPESA');
      },
      error: (err) => {
        console.error('Erro ao carregar categorias', err);
        const mensagem =
          err?.error?.message ||
          err?.message ||
          'Erro ao carregar categorias.';
        this.alertService.showError(mensagem);
      },
    });
  }

  private carregarRecorrentes(userId: string): void {
    this.loading = true;

    this.recorrenteService.listarPorUsuario(userId).subscribe({
      next: (lista) => {
        this.recorrentesReceita = lista.filter((r) => r.tipo === 'RECEITA');
        this.recorrentesDespesa = lista.filter((r) => r.tipo === 'DESPESA');
        this.loading = false;
      },
      error: (err) => {
        console.error('Erro ao carregar recorrências', err);
        const mensagem =
          err?.error?.message ||
          err?.message ||
          'Erro ao carregar transações recorrentes.';
        this.alertService.showError(mensagem);
        this.loading = false;
      },
    });
  }

  private atualizarListaLocal(updated: TransacaoRecorrente): void {
    if (updated.tipo === 'RECEITA') {
      this.recorrentesReceita = this.recorrentesReceita
        .filter((r) => r.id !== updated.id)
        .concat(updated);
      this.recorrentesDespesa = this.recorrentesDespesa.filter(
        (r) => r.id !== updated.id
      );
    } else {
      this.recorrentesDespesa = this.recorrentesDespesa
        .filter((r) => r.id !== updated.id)
        .concat(updated);
      this.recorrentesReceita = this.recorrentesReceita.filter(
        (r) => r.id !== updated.id
      );
    }
  }

  private resetForm(): void {
    this.modalMode = 'create';
    this.editingRecorrenteModal = null;
  }

  private resetDados(): void {
    this.recorrentesReceita = [];
    this.recorrentesDespesa = [];
    this.categoriasReceita = [];
    this.categoriasDespesa = [];
  }
}


