import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { Categoria } from '../../../../models/categoria.model';

interface IncomeForm {
  value: number | null;
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
  selector: 'app-step1',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step1.component.html',
})
export class Step1Component {
  @Input() categorias: Categoria[] = [];
  @Output() next = new EventEmitter<{ incomes: IncomeResult[] }>();
  @Output() back = new EventEmitter<void>();

  incomes: IncomeForm[] = [{ value: null, categoriaId: '', day: '' }];

  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  get categoriasReceita(): Categoria[] {
    return this.categorias.filter((categoria) => categoria.tipo === 'RECEITA');
  }

  addIncome(): void {
    this.incomes.push({ value: null, categoriaId: '', day: '' });
  }

  removeIncome(index: number): void {
    if (this.incomes.length > 1) {
      this.incomes.splice(index, 1);
    }
  }

  onContinue(): void {
    const validIncomes = this.incomes
      .filter(
        (income) =>
          income.value && income.value > 0 && income.categoriaId && income.day
      )
      .map((income) => ({
        value: Number(income.value),
        categoriaId: income.categoriaId,
        categoriaNome: this.getCategoriaNome(income.categoriaId),
        day: income.day,
      }));

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
        income.value &&
        income.value > 0 &&
        income.categoriaId &&
        income.day &&
        !!this.getCategoriaNome(income.categoriaId)
    );
  }

  private getCategoriaNome(id: string): string {
    return (
      this.categoriasReceita.find((categoria) => categoria.id === id)?.nome ??
      ''
    );
  }
}
