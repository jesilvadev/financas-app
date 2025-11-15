import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Categoria } from '../../../models/categoria.model';
import { Transacao, TransacaoRequest } from '../../../models/transacao.model';
import { CategoriaService } from '../../../services/categoria.service';
import { TransacaoService } from '../../../services/transacao.service';
import { AuthService } from '../../../services/auth.service';
import { TipoTransacao } from '../../../models/tipoTransacao.enum';

type EntryType = 'income' | 'expense';

@Component({
  selector: 'app-add-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './add-entry-modal.component.html',
})
export class AddEntryModalComponent {
  @Input() open = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<Transacao>();

  entryType: EntryType | null = null;
  amountInput: string = '';
  selectedCategoryId = '';
  descricao = '';
  isSubmitting = false;
  errorMessage = '';

  categorias: Categoria[] = [];
  private usuarioId: string | null = null;
  private carregouCategorias = false;

  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly transacaoService: TransacaoService,
    private readonly authService: AuthService
  ) {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe((user) => {
        const updatedId = user?.id ?? null;
        if (updatedId && updatedId !== this.usuarioId) {
          this.usuarioId = updatedId;
          this.carregouCategorias = false;
          this.loadCategorias();
        } else if (!updatedId) {
          this.usuarioId = null;
          this.categorias = [];
        }
      });
  }

  get availableCategories(): Categoria[] {
    if (!this.entryType) return [];
    const tipo: TipoTransacao =
      this.entryType === 'income' ? 'RECEITA' : 'DESPESA';
    return this.categorias.filter((categoria) => categoria.tipo === tipo);
  }

  get isFormValid(): boolean {
    const parsed = this.parseCurrencyBr(this.amountInput);
    return (
      this.entryType !== null &&
      parsed !== null &&
      parsed > 0 &&
      !!this.selectedCategoryId &&
      !!this.usuarioId
    );
  }

  selectType(type: EntryType): void {
    this.entryType = type;
    this.selectedCategoryId = '';
    this.descricao = '';
    this.errorMessage = '';
    this.loadCategorias();
  }

  reset(): void {
    this.entryType = null;
    this.amountInput = '';
    this.selectedCategoryId = '';
    this.descricao = '';
    this.errorMessage = '';
    this.isSubmitting = false;
  }

  backToTypeSelection(): void {
    this.entryType = null;
    this.selectedCategoryId = '';
    this.descricao = '';
    this.errorMessage = '';
  }

  handleClose(): void {
    this.reset();
    this.close.emit();
  }

  submit(): void {
    const parsed = this.parseCurrencyBr(this.amountInput);
    if (
      !this.isFormValid ||
      this.entryType === null ||
      parsed === null ||
      !this.usuarioId
    ) {
      return;
    }

    const payload: TransacaoRequest = {
      tipo: this.entryType === 'income' ? 'RECEITA' : 'DESPESA',
      valor: parsed,
      data: new Date().toISOString().split('T')[0],
      descricao: this.descricao.trim() ? this.descricao.trim() : undefined,
      userId: this.usuarioId,
      categoriaId: this.selectedCategoryId,
    };

    this.isSubmitting = true;
    this.errorMessage = '';

    this.transacaoService.criar(payload).subscribe({
      next: (transacao) => {
        this.confirm.emit(transacao);
        this.isSubmitting = false;
        this.reset();
        this.close.emit();
      },
      error: (error) => {
        console.error('Erro ao registrar transação', error);
        this.errorMessage =
          error?.error?.message || error?.message || 'Erro ao registrar';
        this.isSubmitting = false;
      },
    });
  }

  private loadCategorias(): void {
    if (!this.usuarioId || this.carregouCategorias) {
      return;
    }

    this.categoriaService.listarPorUsuario(this.usuarioId).subscribe({
      next: (categorias) => {
        this.categorias = categorias;
        this.carregouCategorias = true;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias', error);
        this.errorMessage =
          error?.error?.message ||
          error?.message ||
          'Erro ao carregar categorias';
      },
    });
  }

  private parseCurrencyBr(formatted: string): number | null {
    if (!formatted) return null;
    const normalized = formatted.replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }
}
