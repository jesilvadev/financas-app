import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { UiInputComponent } from '../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../shared/components/button-primary/button-primary.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { Categoria, CategoriaRequest } from '../../../models/categoria.model';
import { TipoTransacao } from '../../../models/tipoTransacao.enum';
import { CategoriaService } from '../../../services/categoria.service';
import { AuthService } from '../../../services/auth.service';
import { UsuarioResponse } from '../../../models/user.model';

@Component({
  selector: 'app-profile-personalizacao',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    RouterLink,
    UiInputComponent,
    ButtonPrimaryComponent,
    ConfirmModalComponent,
  ],
  templateUrl: './personalizacao.component.html',
})
export class ProfilePersonalizacaoComponent implements OnInit {
  private readonly destroyRef = inject(DestroyRef);

  categoriasReceita: Categoria[] = [];
  categoriasDespesa: Categoria[] = [];

  loadingCategorias = false;
  categoriasErrorMessage = '';

  // criação de categoria
  novaCategoriaNome = '';
  novaCategoriaTipo: TipoTransacao = 'RECEITA';
  creating = false;
  createErrorMessage = '';

  // exclusão de categoria
  categoriaParaExcluir: Categoria | null = null;
  isDeleteModalOpen = false;
  deleting = false;
  deleteErrorMessage = '';

  private currentUser: UsuarioResponse | null = null;

  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly authService: AuthService
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        this.currentUser = user;
        if (user?.id) {
          this.carregarCategorias(user.id);
        }
      });
  }

  private carregarCategorias(userId: string): void {
    this.loadingCategorias = true;
    this.categoriasErrorMessage = '';

    this.categoriaService.listarPorUsuario(userId).subscribe({
      next: (categorias) => {
        this.categoriasReceita = categorias.filter((c) => c.tipo === 'RECEITA');
        this.categoriasDespesa = categorias.filter((c) => c.tipo === 'DESPESA');
        this.loadingCategorias = false;
      },
      error: (err) => {
        this.loadingCategorias = false;
        this.categoriasErrorMessage =
          err?.error?.message || err?.message || 'Erro ao carregar categorias.';
      },
    });
  }

  get canCreateCategoria(): boolean {
    if (this.creating || !this.currentUser?.id) return false;
    return this.novaCategoriaNome.trim().length >= 2;
  }

  criarCategoria(): void {
    if (!this.canCreateCategoria || !this.currentUser?.id) return;

    const payload: CategoriaRequest = {
      nome: this.novaCategoriaNome.trim(),
      tipo: this.novaCategoriaTipo,
      userId: this.currentUser.id,
    };

    this.creating = true;
    this.createErrorMessage = '';

    this.categoriaService.criar(payload).subscribe({
      next: (categoria) => {
        if (categoria.tipo === 'RECEITA') {
          this.categoriasReceita = [...this.categoriasReceita, categoria];
        } else {
          this.categoriasDespesa = [...this.categoriasDespesa, categoria];
        }
        this.novaCategoriaNome = '';
        this.novaCategoriaTipo = 'RECEITA';
        this.creating = false;
      },
      error: (err) => {
        this.creating = false;
        this.createErrorMessage =
          err?.error?.message || err?.message || 'Erro ao criar categoria.';
      },
    });
  }

  // exclusão
  podeExcluir(categoria: Categoria): boolean {
    // Categorias padrão do sistema (userId null) não podem ser excluídas
    return categoria.userId !== null;
  }

  solicitarExclusao(categoria: Categoria): void {
    if (this.deleting) return;
    // Verifica se a categoria pode ser excluída (não é padrão do sistema)
    if (!this.podeExcluir(categoria)) {
      this.deleteErrorMessage =
        'Categorias padrão do sistema não podem ser excluídas.';
      return;
    }
    this.categoriaParaExcluir = categoria;
    this.deleteErrorMessage = '';
    this.isDeleteModalOpen = true;
  }

  closeDeleteModal(): void {
    if (this.deleting) return;
    this.isDeleteModalOpen = false;
    this.categoriaParaExcluir = null;
    this.deleteErrorMessage = '';
  }

  confirmarExclusao(): void {
    if (!this.categoriaParaExcluir || this.deleting) return;

    this.deleting = true;
    this.deleteErrorMessage = '';

    this.categoriaService.excluir(this.categoriaParaExcluir.id).subscribe({
      next: () => {
        const id = this.categoriaParaExcluir?.id;
        this.categoriasReceita = this.categoriasReceita.filter(
          (c) => c.id !== id
        );
        this.categoriasDespesa = this.categoriasDespesa.filter(
          (c) => c.id !== id
        );
        this.deleting = false;
        this.isDeleteModalOpen = false;
        this.categoriaParaExcluir = null;
      },
      error: (err) => {
        this.deleting = false;
        this.deleteErrorMessage =
          err?.error?.message || err?.message || 'Erro ao excluir categoria.';
      },
    });
  }
}
