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

  getColors(): string[] {
    return [
      '#6B54EC',
      '#b90093',
      '#5FB948',
      '#006c05',
      '#3B82F6',
      '#FACC15',
      '#c59e00',
      '#EF4444',
    ];
  }

  getColor(index: number): string {
    const colors = this.getColors();
    return colors[index % colors.length];
  }
}

