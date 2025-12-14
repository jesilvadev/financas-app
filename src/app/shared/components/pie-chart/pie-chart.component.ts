import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

export interface PieChartData {
  label: string;
  value: number;
  color: string;
}

@Component({
  selector: 'app-pie-chart',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './pie-chart.component.html',
})
export class PieChartComponent {
  @Input() data: PieChartData[] = [];
  @Input() title: string = '';
  @Input() size: number = 150;
  /**
   * Espaçamento interno (em pixels) entre o anel colorido e o círculo branco central.
   * Valores maiores deixam o anel mais grosso. Padrão pensado para o gráfico de receitas.
   */
  @Input() innerInset = 20;

  get total(): number {
    return this.data.reduce((sum, item) => sum + item.value, 0);
  }

  get isSingleSlice(): boolean {
    return this.data.length === 1 && this.total > 0;
  }

  getPath(index: number): string {
    if (this.total === 0 || index >= this.data.length) return '';

    let currentAngle = 0;
    const radius = this.size / 2 - 2; // Deixa um pouco de espaço para a borda
    const center = this.size / 2;
    const singleSlice = this.data.length === 1;

    // Calcula o ângulo acumulado até o item anterior
    for (let i = 0; i < index; i++) {
      const percentage = this.data[i].value / this.total;
      currentAngle += percentage * 360;
    }

    // Calcula o ângulo do item atual
    const percentage = this.data[index].value / this.total;
    // Quando só existe um item (100%), usar um ângulo levemente menor
    // para evitar que o arco se torne "degenerado" (start === end)
    const angle = (singleSlice ? 359.99 : 360) * percentage;

    // Se o ângulo for muito pequeno ou zero, não desenha
    if (angle < 0.1) return '';

    // Converte para radianos
    const startAngle = (currentAngle * Math.PI) / 180;
    const endAngle = ((currentAngle + angle) * Math.PI) / 180;

    // Calcula os pontos do arco
    const x1 = center + radius * Math.cos(startAngle);
    const y1 = center + radius * Math.sin(startAngle);
    const x2 = center + radius * Math.cos(endAngle);
    const y2 = center + radius * Math.sin(endAngle);

    const largeArcFlag = angle > 180 ? 1 : 0;

    return `M ${center} ${center} L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  }

  getPercentage(value: number): number {
    if (this.total === 0) return 0;
    return (value / this.total) * 100;
  }
}

