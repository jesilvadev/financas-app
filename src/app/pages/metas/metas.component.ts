import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { ButtonPrimaryComponent } from '../../shared/components/button-primary/button-primary.component';

import { CreateMetaModalComponent } from '../../shared/components/create-meta-modal/create-meta-modal.component';
import { AddAporteModalComponent } from '../../shared/components/add-aporte-modal/add-aporte-modal.component';
import { RemoveAporteModalComponent } from '../../shared/components/remove-aporte-modal/remove-aporte-modal.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { MetaResponse, MetaRequest, AporteRequest } from '../../models/meta.model';
import { MetaService } from '../../services/meta.service';
import { AuthService } from '../../services/auth.service';
import { AlertService } from '../../services/alert.service';
import { LoadingService } from '../../services/loading.service';
import { UsuarioResponse } from '../../models/user.model';

@Component({
  selector: 'app-metas',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIcon,
    ButtonPrimaryComponent,
    CreateMetaModalComponent,
    AddAporteModalComponent,
    RemoveAporteModalComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './metas.component.html',
})
export class MetasComponent implements OnInit {
  metas: MetaResponse[] = [];
  currentUser: UsuarioResponse | null = null;

  filtroStatus: 'TODAS' | 'EM_ANDAMENTO' | 'CONCLUIDAS' = 'TODAS';

  pageSize = 5;
  currentPage = 1;

  isCreateMetaModalOpen = false;
  isAporteModalOpen = false;
  isRemoveAporteModalOpen = false;
  isConfirmDeleteMetaOpen = false;
  selectedMetaForAporte: MetaResponse | null = null;
  selectedMetaForRemoveAporte: MetaResponse | null = null;
  metaToDelete: MetaResponse | null = null;

  loadingMetas = false;
  loadErrorMessage = '';
  creatingMeta = false;
  addingAporte = false;
  removingAporte = false;
  deletingMeta = false;

  private readonly destroyRef = inject(DestroyRef);
  private lastUserId: string | null = null;

  constructor(
    private readonly metaService: MetaService,
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
          this.metas = [];
          return;
        }
        this.lastUserId = userId;
        this.loadMetas();
      });
  }

  get filteredMetas(): MetaResponse[] {
    let list = [...this.metas];

    if (this.filtroStatus === 'EM_ANDAMENTO') {
      list = list.filter((m) => !m.concluida);
    } else if (this.filtroStatus === 'CONCLUIDAS') {
      list = list.filter((m) => m.concluida);
    }

    // Ordena por data alvo (mais próximas primeiro)
    list.sort((a, b) => {
      const dateA = new Date(a.dataAlvo).getTime();
      const dateB = new Date(b.dataAlvo).getTime();
      return dateA - dateB;
    });

    return list;
  }

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.filteredMetas.length / this.pageSize));
  }

  get totalItems(): number {
    return this.filteredMetas.length;
  }

  get pageStart(): number {
    if (!this.totalItems) return 0;
    return (this.currentPage - 1) * this.pageSize + 1;
  }

  get pageEnd(): number {
    if (!this.totalItems) return 0;
    const end = this.currentPage * this.pageSize;
    return end > this.totalItems ? this.totalItems : end;
  }

  get pagedMetas(): MetaResponse[] {
    const start = (this.currentPage - 1) * this.pageSize;
    return this.filteredMetas.slice(start, start + this.pageSize);
  }

  get placeholders(): number[] {
    const missing = Math.max(0, this.pageSize - this.pagedMetas.length);
    return Array.from({ length: missing });
  }

  resetPage(): void {
    this.currentPage = 1;
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage -= 1;
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage += 1;
    }
  }

  openCreateMetaModal(): void {
    this.isCreateMetaModalOpen = true;
  }

  handleCreateMetaModalClose(): void {
    this.isCreateMetaModalOpen = false;
  }

  handleCreateMetaModalConfirm(request: MetaRequest): void {
    if (this.creatingMeta) return;

    this.creatingMeta = true;
    this.loadingService.show('Criando meta...');

    this.metaService.criarMeta(request).subscribe({
      next: () => {
        this.loadingService.hide();
        this.alertService.showSuccess('Meta criada com sucesso!');
        this.creatingMeta = false;
        this.isCreateMetaModalOpen = false;
        this.loadMetas();
      },
      error: (err) => {
        console.error('Erro ao criar meta', err);
        this.loadingService.hide();
        this.creatingMeta = false;
        const mensagem =
          err?.error?.message || err?.message || 'Erro ao criar meta.';
        this.alertService.showError(mensagem);
      },
    });
  }

  openAporteModal(meta: MetaResponse): void {
    this.selectedMetaForAporte = meta;
    this.isAporteModalOpen = true;
  }

  handleAporteModalClose(): void {
    this.isAporteModalOpen = false;
    this.selectedMetaForAporte = null;
  }

  handleAporteModalConfirm(request: AporteRequest): void {
    if (this.addingAporte) return;

    this.addingAporte = true;
    this.loadingService.show('Registrando aporte...');

    this.metaService.adicionarAporte(request).subscribe({
      next: () => {
        this.loadingService.hide();
        this.alertService.showSuccess('Aporte registrado com sucesso!');
        this.addingAporte = false;
        this.isAporteModalOpen = false;
        this.selectedMetaForAporte = null;
        this.loadMetas();
      },
      error: (err) => {
        console.error('Erro ao adicionar aporte', err);
        this.loadingService.hide();
        this.addingAporte = false;
        const mensagem =
          err?.error?.message || err?.message || 'Erro ao registrar aporte.';
        this.alertService.showError(mensagem);
      },
    });
  }

  openRemoveAporteModal(meta: MetaResponse): void {
    // Só abre se houver aportes para remover
    if (meta.aportes && meta.aportes.length > 0) {
      this.selectedMetaForRemoveAporte = meta;
      this.isRemoveAporteModalOpen = true;
    }
  }

  handleRemoveAporteModalClose(): void {
    this.isRemoveAporteModalOpen = false;
    this.selectedMetaForRemoveAporte = null;
  }

  handleRemoveAporteModalConfirm(request: AporteRequest): void {
    if (this.removingAporte) return;

    this.removingAporte = true;
    this.loadingService.show('Removendo aporte...');

    this.metaService.removerAporte(request).subscribe({
      next: () => {
        this.loadingService.hide();
        this.alertService.showSuccess('Aporte removido com sucesso!');
        this.removingAporte = false;
        this.isRemoveAporteModalOpen = false;
        this.selectedMetaForRemoveAporte = null;
        this.loadMetas();
      },
      error: (err) => {
        console.error('Erro ao remover aporte', err);
        this.loadingService.hide();
        this.removingAporte = false;
        const mensagem =
          err?.error?.message || err?.message || 'Erro ao remover aporte.';
        this.alertService.showError(mensagem);
      },
    });
  }

  handleRemoveAporteModalDeleteMeta(metaId: string): void {
    // Fecha o modal de remover aporte
    this.isRemoveAporteModalOpen = false;
    this.selectedMetaForRemoveAporte = null;

    // Encontra a meta para exibir no modal de confirmação
    const meta = this.metas.find((m) => m.id === metaId);
    if (meta) {
      this.metaToDelete = meta;
      this.isConfirmDeleteMetaOpen = true;
    }
  }

  handleConfirmDeleteMetaClose(): void {
    if (this.deletingMeta) return;
    this.isConfirmDeleteMetaOpen = false;
    this.metaToDelete = null;
  }

  confirmDeleteMeta(): void {
    if (!this.metaToDelete || this.deletingMeta) return;

    this.deletingMeta = true;
    this.loadingService.show('Excluindo meta...');

    this.metaService.excluirMeta(this.metaToDelete.id).subscribe({
      next: () => {
        this.loadingService.hide();
        this.alertService.showSuccess('Meta excluída com sucesso!');
        this.deletingMeta = false;
        this.isConfirmDeleteMetaOpen = false;
        this.metaToDelete = null;
        this.loadMetas();
      },
      error: (err) => {
        console.error('Erro ao excluir meta', err);
        this.loadingService.hide();
        this.deletingMeta = false;
        const mensagem =
          err?.error?.message || err?.message || 'Erro ao excluir meta.';
        this.alertService.showError(mensagem);
      },
    });
  }

  private loadMetas(): void {
    this.loadingMetas = true;
    this.loadErrorMessage = '';

    this.metaService.listarMetas().subscribe({
      next: (lista) => {
        this.metas = lista;
        this.loadingMetas = false;
      },
      error: (err) => {
        console.error('Erro ao carregar metas', err);
        this.loadingMetas = false;
        this.loadErrorMessage =
          err?.error?.message || err?.message || 'Erro ao carregar metas';
        this.alertService.showError(this.loadErrorMessage);
      },
    });
  }

  getProgressPercentage(meta: MetaResponse): number {
    return Math.min(100, (meta.valorAtual / meta.valorAlvo) * 100);
  }

  getDaysUntilTarget(meta: MetaResponse): number {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const target = new Date(meta.dataAlvo);
    target.setHours(0, 0, 0, 0);
    const diff = target.getTime() - today.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  getMetaProgressColor(meta: MetaResponse): string {
    const porcentagem = this.getProgressPercentage(meta);

    // Meta concluída: verde específico de sucesso (mesmo tom usado na Home)
    if (meta.concluida) return '#16A34A';

    // Demais estados: paleta azul das estatísticas de metas da Home
    if (porcentagem >= 75) return '#2563EB'; // quase lá
    if (porcentagem >= 50) return '#3B82F6'; // bom progresso
    if (porcentagem >= 25) return '#60A5FA'; // começando bem
    return '#BFDBFE'; // início da meta
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  }

  getDeleteMetaDescription(): string {
    if (this.metaToDelete) {
      return `Tem certeza que deseja excluir a meta "${this.metaToDelete.nome}"? Esta ação não poderá ser desfeita.`;
    }
    return 'Tem certeza que deseja excluir esta meta? Esta ação não poderá ser desfeita.';
  }
}
