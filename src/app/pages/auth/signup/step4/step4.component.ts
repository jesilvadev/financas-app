import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Expense {
  value: number | null;
  category: string;
  day: string;
}

@Component({
  selector: 'app-step4',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step4.component.html',
})
export class Step4Component {
  @Output() next = new EventEmitter<{ expenses: Expense[] }>();
  @Output() back = new EventEmitter<void>();

  expenses: Expense[] = [{ value: null, category: '', day: '' }];

  expenseCategories: string[] = [
    'Aluguel',
    'Condomínio',
    'Energia',
    'Água',
    'Internet',
    'Telefone',
    'Streaming',
    'Academia',
    'Seguro',
    'Transporte',
    'Outros',
  ];

  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  addExpense(): void {
    this.expenses.push({ value: null, category: '', day: '' });
  }

  removeExpense(index: number): void {
    if (this.expenses.length > 1) {
      this.expenses.splice(index, 1);
    }
  }

  onContinue(): void {
    const validExpenses = this.expenses.filter(
      (expense) =>
        expense.value && expense.value > 0 && expense.category && expense.day
    );

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
        expense.value && expense.value > 0 && expense.category && expense.day
    );
  }
}
