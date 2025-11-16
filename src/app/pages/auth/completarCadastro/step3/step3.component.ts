import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonPrimaryComponent,
    UiInputComponent,
  ],
  templateUrl: './step3.component.html',
})
export class Step3Component {
  @Input() isLoading: boolean = false;
  @Input() presetStartDay: string = '';
  @Output() next = new EventEmitter<{ startDay: string }>();
  @Output() back = new EventEmitter<void>();

  startDay: string = '';

  get isValidDay(): boolean {
    const num = Number(this.startDay);
    return Number.isInteger(num) && num >= 1 && num <= 31;
  }

  onFinish(): void {
    if (this.isValidDay && !this.isLoading) {
      this.next.emit({ startDay: this.startDay });
    }
  }

  onBack(): void {
    this.back.emit();
  }

  handleDayChange(value: string): void {
    // Mantém apenas dígitos
    const onlyDigits = (value || '').replace(/\\D+/g, '');
    // Limita a 2 dígitos
    const trimmed = onlyDigits.slice(0, 2);
    // Converte e limita entre 1 e 31
    const num = Number(trimmed);
    if (!trimmed) {
      this.startDay = '';
      return;
    }
    const clamped = Math.min(Math.max(num, 1), 31);
    this.startDay = clamped.toString().padStart(2, '0');
  }

  ngOnChanges(): void {
    if (this.presetStartDay && !this.startDay) {
      this.startDay = this.presetStartDay;
    }
  }
}
