import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { GastoCategoria } from '../../../models/dashboard.model';

@Component({
  selector: 'app-category-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './category-chart.component.html',
})
export class CategoryChartComponent {
  @Input() gastos: GastoCategoria[] = [];
  @Input() title: string = 'Gastos por Categoria';

  get maxValue(): number {
    if (this.gastos.length === 0) return 1;
    return Math.max(...this.gastos.map((g) => g.valor));
  }

  getBarWidth(valor: number): number {
    if (this.maxValue === 0) return 0;
    return (valor / this.maxValue) * 100;
  }

  // Retorna os gastos ordenados do maior para o menor valor para aplicar melhor as cores
  get sortedGastos(): GastoCategoria[] {
    return [...this.gastos].sort((a, b) => b.valor - a.valor);
  }

  getColors(): string[] {
    // Paleta focada em despesas: tons de vermelho e laranja (sem roxos)
    return [
      '#EF4444', // vermelho principal
      '#F97373', // vermelho claro
      '#DC2626', // vermelho escuro
      '#F97316', // laranja intenso
      '#FB923C', // laranja claro
      '#B91C1C', // vermelho profundo
      '#F59E0B', // amarelo-alaranjado
      '#EA580C', // laranja queimado
    ];
  }

  getColor(index: number): string {
    const colors = this.getColors();
    return colors[index % colors.length];
  }
}
