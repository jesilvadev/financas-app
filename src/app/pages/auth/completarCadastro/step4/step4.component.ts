import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';

@Component({
  selector: 'app-step4',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonPrimaryComponent,
    UiInputComponent,
  ],
  templateUrl: './step4.component.html',
})
export class Step4Component {
  @Input() isLoading: boolean = false;
  @Input() presetStartDay: string = '';
  @Output() next = new EventEmitter<{ startDay: string }>();
  @Output() back = new EventEmitter<void>();

  startDay: string = '';
  dayError: string | null = null;

  get isValidDay(): boolean {
    const num = Number(this.startDay);
    return Number.isInteger(num) && num >= 1 && num <= 31;
  }

  onFinish(): void {
    this.dayError = null;

    // Nenhum dia informado
    if (!this.startDay) {
      this.dayError = 'Informe o dia do mês.';
      return;
    }

    // Dia inválido
    if (!this.isValidDay) {
      this.dayError = 'Informe um dia entre 1 e 31.';
      return;
    }

    if (!this.isLoading) {
      this.next.emit({ startDay: this.startDay });
    }
  }

  onBack(): void {
    this.back.emit();
  }

  handleDayChange(value: string): void {
    this.dayError = null;
    // Mantém apenas dígitos
    const onlyDigits = (value || '').replace(/\D+/g, '');
    // Limita a 2 dígitos
    const trimmed = onlyDigits.slice(0, 2);
    // Converte e limita entre 1 e 31
    const num = Number(trimmed);
    if (!trimmed) {
      this.startDay = '';
      return;
    }
    const clamped = Math.min(Math.max(num, 1), 31);
    // Usa apenas o número (sem zero à esquerda)
    this.startDay = clamped.toString();
  }

  ngOnChanges(): void {
    if (this.presetStartDay && !this.startDay) {
      this.startDay = this.presetStartDay;
    }
  }
}
