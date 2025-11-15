import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';

import { Categoria } from '../../../../models/categoria.model';

interface ExpenseForm {
  value: number | null;
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
  ],
  templateUrl: './step2.component.html',
})
export class Step2Component {
  @Input() categorias: Categoria[] = [];
  @Output() next = new EventEmitter<{ expenses: ExpenseResult[] }>();
  @Output() back = new EventEmitter<void>();

  expenses: ExpenseForm[] = [{ value: null, categoriaId: '', day: '' }];

  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  get categoriasDespesa(): Categoria[] {
    return this.categorias.filter((categoria) => categoria.tipo === 'DESPESA');
  }

  addExpense(): void {
    this.expenses.push({ value: null, categoriaId: '', day: '' });
  }

  removeExpense(index: number): void {
    if (this.expenses.length > 1) {
      this.expenses.splice(index, 1);
    }
  }

  onContinue(): void {
    const validExpenses = this.expenses
      .filter(
        (expense) =>
          expense.value &&
          expense.value > 0 &&
          expense.categoriaId &&
          expense.day
      )
      .map((expense) => ({
        value: Number(expense.value),
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
    return this.expenses.some(
      (expense) =>
        expense.value &&
        expense.value > 0 &&
        expense.categoriaId &&
        expense.day &&
        !!this.getCategoriaNome(expense.categoriaId)
    );
  }

  private getCategoriaNome(id: string): string {
    return (
      this.categoriasDespesa.find((categoria) => categoria.id === id)?.nome ??
      ''
    );
  }
}
