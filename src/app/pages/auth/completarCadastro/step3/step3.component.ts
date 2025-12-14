import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';
import { MatIconModule } from '@angular/material/icon';
import { AlertService } from '../../../../services/alert.service';

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
  selector: 'app-step3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    ButtonPrimaryComponent,
    MatIconModule,
  ],
  templateUrl: './step3.component.html',
})
export class Step3Component {
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
  valueError: string | null = null;

  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  get categoriasDespesa(): Categoria[] {
    return this.categorias.filter((categoria) => categoria.tipo === 'DESPESA');
  }

  constructor(private readonly alertService: AlertService) {}

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
    this.valueError = null;

    const expense = this.currentExpense;
    const parsed = this.parseCurrencyBr(expense.value);
    const hasValue = parsed !== null && parsed > 0;
    const hasCategoria = !!expense.categoriaId;
    const hasDay = !!expense.day;

    // Valor inválido -> mensagem abaixo do input
    if (!hasValue) {
      this.valueError = 'Informe um valor válido para o gasto.';
      return;
    }

    // Categoria / dia ausentes -> mensagens via DisplayAlert
    if (!hasCategoria && !hasDay) {
      this.alertService.showError('Informe a categoria e o dia do gasto.');
      return;
    }

    if (!hasCategoria) {
      this.alertService.showError('Informe a categoria do gasto.');
      return;
    }

    if (!hasDay) {
      this.alertService.showError('Informe o dia do gasto.');
      return;
    }

    this.finalizedExpenses.push({
      value: parsed,
      categoriaId: this.currentExpense.categoriaId,
      day: this.currentExpense.day,
    });
    this.currentExpense = { value: null, categoriaId: '', day: '' };
  }

  deleteFinalized(index: number): void {
    this.finalizedExpenses = this.finalizedExpenses.filter(
      (_expense, idx) => idx !== index
    );
  }

  onContinue(): void {
    this.valueError = null;

    const base: ExpenseForm[] = [...this.finalizedExpenses];

    const expense = this.currentExpense;
    const hasAnyField =
      (expense.value !== null && `${expense.value}`.trim() !== '') ||
      !!expense.categoriaId ||
      !!expense.day;

    if (hasAnyField) {
      const parsed = this.parseCurrencyBr(expense.value);
      const hasValue = parsed !== null && parsed > 0;
      const hasCategoria = !!expense.categoriaId;
      const hasDay = !!expense.day;

      if (!hasValue) {
        this.valueError = 'Informe um valor válido para o gasto.';
        return;
      }

      if (!hasCategoria && !hasDay) {
        this.alertService.showError('Informe a categoria e o dia do gasto.');
        return;
      }

      if (!hasCategoria) {
        this.alertService.showError('Informe a categoria do gasto.');
        return;
      }

      if (!hasDay) {
        this.alertService.showError('Informe o dia do gasto.');
        return;
      }

      if (parsed !== null && parsed > 0) {
        base.push({
          value: parsed,
          categoriaId: expense.categoriaId,
          day: expense.day,
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
    } else {
      this.alertService.showError('Informe pelo menos um gasto válido.');
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
