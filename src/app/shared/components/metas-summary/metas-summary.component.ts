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

  // Ordena as metas pela maior porcentagem para aplicar melhor as cores e manter consistência visual
  get sortedMetas(): MetaDashboard[] {
    return [...this.metas].sort((a, b) => b.porcentagem - a.porcentagem);
  }

  getProgressColor(porcentagem: number): string {
    // Paleta específica para metas em tons de azul (do mais suave ao mais intenso)
    if (porcentagem >= 100) return '#1D4ED8'; // Azul forte - meta atingida/superada
    if (porcentagem >= 75) return '#2563EB'; // Azul médio - quase lá
    if (porcentagem >= 50) return '#3B82F6'; // Azul padrão - em bom progresso
    if (porcentagem >= 25) return '#60A5FA'; // Azul claro - começando bem
    return '#BFDBFE'; // Azul bem suave - início da meta
  }

  getProgressWidth(porcentagem: number): number {
    return Math.min(100, Math.max(0, porcentagem));
  }
}

