import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Income {
  value: number | null;
  category: string;
  day: string;
}

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step3.component.html',
})
export class Step3Component {
  @Output() next = new EventEmitter<{ incomes: Income[] }>();
  @Output() back = new EventEmitter<void>();

  incomes: Income[] = [{ value: null, category: '', day: '' }];

  incomeCategories: string[] = [
    'Salário',
    'Freelance',
    'Investimentos',
    'Aluguel',
    'Pensão',
    'Outros',
  ];

  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  addIncome(): void {
    this.incomes.push({ value: null, category: '', day: '' });
  }

  removeIncome(index: number): void {
    if (this.incomes.length > 1) {
      this.incomes.splice(index, 1);
    }
  }

  onContinue(): void {
    const validIncomes = this.incomes.filter(
      (income) =>
        income.value && income.value > 0 && income.category && income.day
    );

    if (validIncomes.length > 0) {
      this.next.emit({ incomes: validIncomes });
    }
  }

  onBack(): void {
    this.back.emit();
  }

  isFormValid(): boolean {
    return this.incomes.some(
      (income) =>
        income.value && income.value > 0 && income.category && income.day
    );
  }
}
