import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { MetaDashboard } from '../../../models/dashboard.model';

@Component({
  selector: 'app-metas-summary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './metas-summary.component.html',
})
export class MetasSummaryComponent {
  @Input() metas: MetaDashboard[] = [];
  @Input() title: string = 'Metas';

  getProgressColor(porcentagem: number): string {
    if (porcentagem >= 100) return '#27BE61'; // Verde - concluída
    if (porcentagem >= 75) return '#22C55E'; // Verde claro
    if (porcentagem >= 50) return '#FACC15'; // Amarelo
    if (porcentagem >= 25) return '#FF4B4B'; // Vermelho claro
    return '#EF4444'; // Vermelho
  }

  getProgressWidth(porcentagem: number): number {
    return Math.min(100, Math.max(0, porcentagem));
  }
}

