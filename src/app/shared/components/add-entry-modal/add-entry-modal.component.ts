import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { Categoria } from '../../../models/categoria.model';
import { Transacao, TransacaoRequest } from '../../../models/transacao.model';
import { CategoriaService } from '../../../services/categoria.service';
import { TransacaoService } from '../../../services/transacao.service';
import { AuthService } from '../../../services/auth.service';
import { TipoTransacao } from '../../../models/tipoTransacao.enum';
import { AlertService } from '../../../services/alert.service';

type EntryType = 'income' | 'expense';

@Component({
  selector: 'app-add-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './add-entry-modal.component.html',
})
export class AddEntryModalComponent implements OnChanges {
  @Input() open = false;
  @Input() mode: 'create' | 'edit' = 'create';
  @Input() initialTransacao?: Transacao | null;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<Transacao>();

  entryType: EntryType | null = null;
  amountInput: string = '';
  selectedCategoryId = '';
  descricao = '';
  isSubmitting = false;

  categorias: Categoria[] = [];
  private usuarioId: string | null = null;

  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly transacaoService: TransacaoService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService
  ) {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed())
      .subscribe((user) => {
        const updatedId = user?.id ?? null;
        if (updatedId && updatedId !== this.usuarioId) {
          this.usuarioId = updatedId;
          this.loadCategorias();
        } else if (!updatedId) {
          this.usuarioId = null;
          this.categorias = [];
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    // Recarrega categorias sempre que o modal é aberto
    if (changes['open'] && this.open && this.usuarioId) {
      this.loadCategorias();
    }

    if (
      (changes['open'] || changes['mode'] || changes['initialTransacao']) &&
      this.open &&
      this.mode === 'edit' &&
      this.initialTransacao
    ) {
      const t = this.initialTransacao;
      this.entryType = t.tipo === 'RECEITA' ? 'income' : 'expense';
      // Formata o valor para o mask processar corretamente
      this.amountInput = this.formatValueForMask(t.valor);
      this.selectedCategoryId = t.categoriaId;
      this.descricao = t.descricao ?? '';
      this.usuarioId = t.userId;
      this.loadCategorias();
    } else if (changes['open'] && !this.open) {
      // Limpa os campos quando o modal é fechado
      this.reset();
    }
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
    this.loadCategorias();
  }

  reset(): void {
    this.entryType = null;
    this.amountInput = '';
    this.selectedCategoryId = '';
    this.descricao = '';
    this.isSubmitting = false;
  }

  backToTypeSelection(): void {
    this.entryType = null;
    this.selectedCategoryId = '';
    this.descricao = '';
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

    const now = new Date();
    now.setHours(now.getHours() - 3);

    const payload: TransacaoRequest = {
      tipo: this.entryType === 'income' ? 'RECEITA' : 'DESPESA',
      valor: parsed,
      data: now.toISOString(),
      descricao: this.descricao.trim() ? this.descricao.trim() : undefined,
      userId: this.usuarioId,
      categoriaId: this.selectedCategoryId,
    };

    this.isSubmitting = true;

    if (this.mode === 'edit' && this.initialTransacao) {
      this.transacaoService
        .atualizar(this.initialTransacao.id, payload)
        .subscribe({
          next: (transacao) => {
            this.confirm.emit(transacao);
            this.isSubmitting = false;
            this.reset();
            this.close.emit();
          },
          error: (error) => {
            this.handleClose()
            console.error('Erro ao atualizar transação', error);
            const mensagem =
              error?.error?.message || error?.message || 'Erro ao atualizar';
            this.alertService.showError(mensagem);
            this.isSubmitting = false;
          },
        });
    } else {
      this.transacaoService.criar(payload).subscribe({
        next: (transacao) => {
          this.confirm.emit(transacao);
          this.isSubmitting = false;
          this.reset();
          this.close.emit();
        },
        error: (error) => {
          console.error('Erro ao registrar transação', error);
          const mensagem =
            error?.error?.message || error?.message || 'Erro ao registrar';
          this.alertService.showError(mensagem);
          this.isSubmitting = false;
        },
      });
    }
  }

  private loadCategorias(): void {
    if (!this.usuarioId) {
      return;
    }

    this.categoriaService.listarPorUsuario(this.usuarioId).subscribe({
      next: (categorias) => {
        this.categorias = categorias;
      },
      error: (error) => {
        console.error('Erro ao carregar categorias', error);
        const mensagem =
          error?.error?.message ||
          error?.message ||
          'Erro ao carregar categorias';
        this.alertService.showError(mensagem);
      },
    });
  }

  private parseCurrencyBr(formatted: string): number | null {
    if (!formatted) return null;
    // Remove separadores de milhares e converte vírgula para ponto
    const normalized = formatted.replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  private formatValueForMask(value: number): string {
    // Converte o valor numérico para string no formato que o ngx-mask espera
    // O mask "separator.2" com dropSpecialCharacters=true espera uma string numérica
    // simples com vírgula para decimais, sem separadores de milhares
    // Ex: 1000.00 -> "1000,00" (será formatado como "1.000,00" pelo mask)
    return value.toFixed(2).replace('.', ',');
  }

  private formatCurrencyBr(value: number): string {
    if (!Number.isFinite(value as number)) return '';
    return (value as number).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
