import { Component, Input, signal } from '@angular/core';
import { NgIf, CommonModule } from '@angular/common';

@Component({
  selector: 'app-display-alert',
  standalone: true,
  imports: [NgIf, CommonModule],
  templateUrl: './display-alert.component.html',
  styleUrls: ['./display-alert.component.scss'],
  host: {
    class:
      'fixed inset-0 flex items-start justify-center pointer-events-none z-50',
  },
})
export class DisplayAlertComponent {
  @Input() mensagem = '';
  @Input() tipo: 'error' | 'success' | 'info' | 'warning' = 'info';
  @Input() duracao = 4000;

  visible = signal(false);
  currentDuration = this.duracao;
  progressKey = 0;
  private timer?: any;

  abrir(
    mensagem: string,
    tipo: 'error' | 'success' | 'info' | 'warning' = 'info',
    duracao?: number
  ) {
    this.mensagem = mensagem;
    this.tipo = tipo;
    this.currentDuration = duracao ?? this.duracao;
    this.visible.set(true);
    this.progressKey = Date.now();
    if (this.timer) clearTimeout(this.timer);
    this.timer = setTimeout(() => {
      this.visible.set(false);
    }, this.currentDuration);
  }

  fechar() {
    if (this.timer) clearTimeout(this.timer);
    this.visible.set(false);
  }
}
