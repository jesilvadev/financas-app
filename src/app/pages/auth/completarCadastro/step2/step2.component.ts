import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';
import { MatIconModule } from '@angular/material/icon';

import { Categoria } from '../../../../models/categoria.model';

interface IncomeForm {
  value: number | string | null;
  categoriaId: string;
  day: string;
}

export interface IncomeResult {
  value: number;
  categoriaId: string;
  categoriaNome: string;
  day: string;
}

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    ButtonPrimaryComponent,
    MatIconModule,
  ],
  templateUrl: './step2.component.html',
})
export class Step2Component {
  @Input() categorias: Categoria[] = [];
  @Input() presetIncomes: {
    value: number;
    categoriaId: string;
    day: string;
  }[] = [];
  @Output() next = new EventEmitter<{ incomes: IncomeResult[] }>();
  @Output() back = new EventEmitter<void>();

  finalizedIncomes: IncomeForm[] = [];
  currentIncome: IncomeForm = { value: null, categoriaId: '', day: '' };
  showDayModal = false;
  valueError: string | null = null;

  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  get categoriasReceita(): Categoria[] {
    return this.categorias.filter((categoria) => categoria.tipo === 'RECEITA');
  }

  ngOnChanges(): void {
    if (
      this.presetIncomes &&
      this.presetIncomes.length &&
      this.finalizedIncomes.length === 0
    ) {
      this.finalizedIncomes = this.presetIncomes.map((i) => ({
        value: i.value,
        categoriaId: i.categoriaId,
        day: i.day,
      }));
    }
  }

  addIncome(): void {
    this.valueError = null;
    if (!this.isCurrentIncomeValid()) {
      this.valueError = 'Informe valor, categoria e dia da renda.';
      return;
    }
    const parsed = this.parseCurrencyBr(this.currentIncome.value);
    if (parsed === null || parsed <= 0) return;
    this.finalizedIncomes.push({
      value: parsed,
      categoriaId: this.currentIncome.categoriaId,
      day: this.currentIncome.day,
    });
    this.currentIncome = { value: null, categoriaId: '', day: '' };
  }

  deleteFinalized(index: number): void {
    this.finalizedIncomes.splice(index, 1);
  }

  onContinue(): void {
    this.valueError = null;

    const base: IncomeForm[] = [...this.finalizedIncomes];
    if (this.isCurrentIncomeValid()) {
      const parsed = this.parseCurrencyBr(this.currentIncome.value);
      if (parsed !== null && parsed > 0) {
        base.push({
          value: parsed,
          categoriaId: this.currentIncome.categoriaId,
          day: this.currentIncome.day,
        });
      }
    }

    const validIncomes: IncomeResult[] = base.map((income) => ({
      value:
        typeof income.value === 'number'
          ? income.value
          : this.parseCurrencyBr(income.value) ?? 0,
      categoriaId: income.categoriaId,
      categoriaNome: this.getCategoriaNome(income.categoriaId),
      day: income.day,
    }));

    if (validIncomes.length > 0) {
      this.next.emit({ incomes: validIncomes });
    } else {
      this.valueError = 'Informe pelo menos uma renda válida.';
    }
  }

  onBack(): void {
    this.back.emit();
  }

  openDayModal(): void {
    this.showDayModal = true;
  }

  closeDayModal(): void {
    this.showDayModal = false;
  }

  selectDay(day: string): void {
    this.currentIncome.day = day;
    this.closeDayModal();
  }

  isFormValid(): boolean {
    return this.finalizedIncomes.length > 0 || this.isCurrentIncomeValid();
  }

  isCurrentIncomeValid(): boolean {
    const income = this.currentIncome;
    const parsed = this.parseCurrencyBr(income.value);
    return !!(
      parsed &&
      parsed > 0 &&
      income.categoriaId &&
      income.day &&
      this.getCategoriaNome(income.categoriaId)
    );
  }

  getCategoriaNome(id: string): string {
    return (
      this.categoriasReceita.find((categoria) => categoria.id === id)?.nome ??
      ''
    );
  }

  private parseCurrencyBr(formatted: unknown): number | null {
    if (formatted === null || formatted === undefined) return null;
    if (typeof formatted === 'number')
      return Number.isFinite(formatted) ? formatted : null;
    const str = String(formatted).trim();
    if (!str) return null;
    const normalized = str.replace(/\./g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }
}
