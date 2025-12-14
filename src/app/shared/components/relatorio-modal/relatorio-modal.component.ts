import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

export interface RelatorioPeriodo {
  mes: number;
  ano: number;
}

@Component({
  selector: 'app-relatorio-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './relatorio-modal.component.html',
})
export class RelatorioModalComponent implements OnChanges {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<RelatorioPeriodo>();

  mes: number = new Date().getMonth() + 1; // Mês atual (1-12)
  ano: number = new Date().getFullYear(); // Ano atual

  isSubmitting = false;

  meses = [
    { value: 1, label: 'Janeiro' },
    { value: 2, label: 'Fevereiro' },
    { value: 3, label: 'Março' },
    { value: 4, label: 'Abril' },
    { value: 5, label: 'Maio' },
    { value: 6, label: 'Junho' },
    { value: 7, label: 'Julho' },
    { value: 8, label: 'Agosto' },
    { value: 9, label: 'Setembro' },
    { value: 10, label: 'Outubro' },
    { value: 11, label: 'Novembro' },
    { value: 12, label: 'Dezembro' },
  ];

  get anos(): number[] {
    const anoAtual = new Date().getFullYear();
    const anos: number[] = [];
    // Últimos 5 anos + ano atual
    for (let i = anoAtual; i >= anoAtual - 5; i--) {
      anos.push(i);
    }
    return anos;
  }

  ngOnChanges(): void {
    if (this.open) {
      // Reseta para mês e ano atual quando abre
      const hoje = new Date();
      this.mes = hoje.getMonth() + 1;
      this.ano = hoje.getFullYear();
      this.isSubmitting = false;
    }
  }

  handleClose(): void {
    if (this.isSubmitting) return;
    this.close.emit();
  }

  handleBackdropClick(): void {
    this.handleClose();
  }

  submit(): void {
    if (this.isSubmitting) return;

    const periodo: RelatorioPeriodo = {
      mes: this.mes,
      ano: this.ano,
    };

    this.isSubmitting = true;
    this.confirm.emit(periodo);
  }

  onConfirmComplete(): void {
    this.isSubmitting = false;
    this.close.emit();
  }
}

