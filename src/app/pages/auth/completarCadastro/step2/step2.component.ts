import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';
import { MatIconModule } from '@angular/material/icon';

import { Categoria } from '../../../../models/categoria.model';

interface ExpenseForm {
  value: number | string | null;
  categoriaId: string;
  day: string;
}

export interface ExpenseResult {
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
  @Input() presetExpenses: {
    value: number;
    categoriaId: string;
    day: string;
  }[] = [];
  @Output() next = new EventEmitter<{ expenses: ExpenseResult[] }>();
  @Output() back = new EventEmitter<void>();

  finalizedExpenses: ExpenseForm[] = [];
  currentExpense: ExpenseForm = { value: null, categoriaId: '', day: '' };
  showDayModal = false;

  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  get categoriasDespesa(): Categoria[] {
    return this.categorias.filter((categoria) => categoria.tipo === 'DESPESA');
  }

  ngOnChanges(): void {
    if (
      this.presetExpenses &&
      this.presetExpenses.length &&
      this.finalizedExpenses.length === 0
    ) {
      this.finalizedExpenses = this.presetExpenses.map((e) => ({
        value: e.value,
        categoriaId: e.categoriaId,
        day: e.day,
      }));
    }
  }

  addExpense(): void {
    if (!this.isCurrentExpenseValid()) return;
    const parsed = this.parseCurrencyBr(this.currentExpense.value);
    if (parsed === null || parsed <= 0) return;
    this.finalizedExpenses.push({
      value: parsed,
      categoriaId: this.currentExpense.categoriaId,
      day: this.currentExpense.day,
    });
    this.currentExpense = { value: null, categoriaId: '', day: '' };
  }

  deleteFinalized(index: number): void {
    this.finalizedExpenses.splice(index, 1);
  }

  onContinue(): void {
    const base: ExpenseForm[] = [...this.finalizedExpenses];
    if (this.isCurrentExpenseValid()) {
      const parsed = this.parseCurrencyBr(this.currentExpense.value);
      if (parsed !== null && parsed > 0) {
        base.push({
          value: parsed,
          categoriaId: this.currentExpense.categoriaId,
          day: this.currentExpense.day,
        });
      }
    }

    const validExpenses: ExpenseResult[] = base.map((expense) => ({
      value:
        typeof expense.value === 'number'
          ? expense.value
          : this.parseCurrencyBr(expense.value) ?? 0,
      categoriaId: expense.categoriaId,
      categoriaNome: this.getCategoriaNome(expense.categoriaId),
      day: expense.day,
    }));

    if (validExpenses.length > 0) {
      this.next.emit({ expenses: validExpenses });
    }
  }

  onBack(): void {
    this.back.emit();
  }

  isFormValid(): boolean {
    return this.finalizedExpenses.length > 0 || this.isCurrentExpenseValid();
  }

  getCategoriaNome(id: string): string {
    return (
      this.categoriasDespesa.find((categoria) => categoria.id === id)?.nome ??
      ''
    );
  }

  openDayModal(): void {
    this.showDayModal = true;
  }

  closeDayModal(): void {
    this.showDayModal = false;
  }

  selectDay(day: string): void {
    this.currentExpense.day = day;
    this.closeDayModal();
  }

  isDaySelected(day: string): boolean {
    return this.currentExpense.day === day;
  }

  isCurrentExpenseValid(): boolean {
    const expense = this.currentExpense;
    const parsed = this.parseCurrencyBr(expense.value);
    return !!(
      parsed &&
      parsed > 0 &&
      expense.categoriaId &&
      expense.day &&
      this.getCategoriaNome(expense.categoriaId)
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
