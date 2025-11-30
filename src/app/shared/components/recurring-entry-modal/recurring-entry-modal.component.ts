import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
  SimpleChanges,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { TipoTransacao } from '../../../models/tipoTransacao.enum';
import {
  TransacaoRecorrente,
  TransacaoRecorrenteRequest,
} from '../../../models/transacaoRecorrente.model';
import { Categoria } from '../../../models/categoria.model';
import { CategoriaService } from '../../../services/categoria.service';
import { TransacaoRecorrenteService } from '../../../services/transacaoRecorrente.service';
import { AuthService } from '../../../services/auth.service';
import { AlertService } from '../../../services/alert.service';

type RecurringMode = 'create' | 'edit';

@Component({
  selector: 'app-recurring-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './recurring-entry-modal.component.html',
})
export class RecurringEntryModalComponent implements OnChanges {
  @Input() open = false;
  @Input() mode: RecurringMode = 'create';
  @Input() initialRecorrente?: TransacaoRecorrente | null;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<TransacaoRecorrente>();

  // tipo começa nulo para exibir a etapa inicial (ganho x gasto) em modo create
  tipo: TipoTransacao | null = null;
  valorInput = '';
  categoriaId = '';
  diaRecorrencia: number | null = null;

  saving = false;

  categorias: Categoria[] = [];
  private usuarioId: string | null = null;
  private carregouCategorias = false;

  constructor(
    private readonly categoriaService: CategoriaService,
    private readonly recorrenteService: TransacaoRecorrenteService,
    private readonly authService: AuthService,
    private readonly alertService: AlertService
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

  ngOnChanges(changes: SimpleChanges): void {
    if (
      (changes['open'] || changes['mode'] || changes['initialRecorrente']) &&
      this.open &&
      this.mode === 'edit' &&
      this.initialRecorrente
    ) {
      const r = this.initialRecorrente;
      this.tipo = r.tipo;
      this.valorInput = this.formatCurrencyBr(r.valor);
      this.categoriaId = r.categoriaId;
      this.diaRecorrencia = r.diaRecorrencia;
      this.usuarioId = r.userId;
      this.loadCategorias();
    }

    if (changes['open'] && !this.open) {
      this.resetForm();
    }
  }

  get availableCategorias(): Categoria[] {
    if (!this.tipo) return [];
    return this.categorias.filter((c) => c.tipo === this.tipo);
  }

  get isFormValid(): boolean {
    if (!this.usuarioId || !this.tipo) return false;
    const parsed = this.parseCurrencyBr(this.valorInput);
    const dia = this.diaRecorrencia;

    return (
      parsed !== null &&
      parsed > 0 &&
      !!this.categoriaId &&
      dia !== null &&
      Number.isInteger(dia) &&
      dia >= 1 &&
      dia <= 31
    );
  }

  selecionarTipo(tipo: TipoTransacao): void {
    this.tipo = tipo;
    this.categoriaId = '';
  }

  handleClose(): void {
    if (this.saving) return;
    this.resetForm();
    this.close.emit();
  }

  submit(): void {
    const parsed = this.parseCurrencyBr(this.valorInput);
    if (!this.isFormValid || !this.usuarioId || parsed === null) {
      return;
    }

    const payload: TransacaoRecorrenteRequest = {
      tipo: this.tipo as TipoTransacao,
      valor: parsed,
      diaRecorrencia: this.diaRecorrencia as number,
      ativa: true,
      userId: this.usuarioId,
      categoriaId: this.categoriaId,
    };

    this.saving = true;

    if (this.mode === 'edit' && this.initialRecorrente) {
      this.recorrenteService
        .atualizar(this.initialRecorrente.id, payload)
        .subscribe({
          next: (rec) => {
            this.confirm.emit(rec);
            this.saving = false;
            this.resetForm();
            this.close.emit();
          },
          error: (error) => {
            console.error('Erro ao atualizar recorrência', error);
            const mensagem =
              error?.error?.message ||
              error?.message ||
              'Erro ao atualizar recorrência';
            this.alertService.showError(mensagem);
            this.saving = false;
          },
        });
    } else {
      this.recorrenteService.criar(payload).subscribe({
        next: (rec) => {
          this.confirm.emit(rec);
          this.saving = false;
          this.resetForm();
          this.close.emit();
        },
        error: (error) => {
          console.error('Erro ao criar recorrência', error);
          const mensagem =
            error?.error?.message ||
            error?.message ||
            'Erro ao criar recorrência';
          this.alertService.showError(mensagem);
          this.saving = false;
        },
      });
    }
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
        const mensagem =
          error?.error?.message ||
          error?.message ||
          'Erro ao carregar categorias';
        this.alertService.showError(mensagem);
      },
    });
  }

  private resetForm(): void {
    this.tipo = null;
    this.valorInput = '';
    this.categoriaId = '';
    this.diaRecorrencia = null;
    this.saving = false;
  }

  private parseCurrencyBr(formatted: string): number | null {
    if (!formatted) return null;
    const normalized = formatted.replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  private formatCurrencyBr(value: number): string {
    if (!Number.isFinite(value as number)) return '';
    return (value as number).toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}


