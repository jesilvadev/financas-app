import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  forwardRef,
  Input,
  Output,
} from '@angular/core';
import {
  ControlValueAccessor,
  FormsModule,
  NG_VALUE_ACCESSOR,
} from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

@Component({
  selector: 'app-ui-input',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './ui-input.component.html',
  providers: [
    {
      provide: NG_VALUE_ACCESSOR,
      useExisting: forwardRef(() => UiInputComponent),
      multi: true,
    },
  ],
})
export class UiInputComponent implements ControlValueAccessor {
  @Input() placeholder = '';
  @Input() type: 'text' | 'password' | 'email' | 'tel' | 'number' = 'text';
  @Input() inputMode?: string;
  @Input() autocomplete?: string;
  @Input() disabled = false;
  @Input() error: string | null = null;

  // Visual add-ons
  @Input() prefix?: string; // Ex.: "R$"

  // Mask support (opcional)
  @Input() useMask = false;
  @Input() mask: string = 'separator.2';
  @Input() thousandSeparator: string = '.';
  @Input() decimalMarker: '.' | ',' | ['.', ','] = ',';
  @Input() dropSpecialCharacters: boolean = false;

  // Modo moeda: digitação vai preenchendo centavos (ex.: 1 -> 0,01; 2 -> 0,12; 3 -> 1,23)
  @Input() moneyMode: boolean = false;

  @Output() enter = new EventEmitter<void>();

  value: string = '';

  private onChange: (value: any) => void = () => {};
  private onTouchedCb: () => void = () => {};

  writeValue(obj: any): void {
    this.value = obj ?? '';
  }

  registerOnChange(fn: any): void {
    this.onChange = fn;
  }

  registerOnTouched(fn: any): void {
    this.onTouchedCb = fn;
  }

  setDisabledState(isDisabled: boolean): void {
    this.disabled = isDisabled;
  }

  onTouched(): void {
    this.onTouchedCb();
  }

  onInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    let rawValue = target.value ?? '';

    if (this.moneyMode) {
      const digits = rawValue.replace(/\D+/g, '');

      if (!digits) {
        this.value = '';
        this.onChange(this.value);
        target.value = '';
        return;
      }

      const cents = Number(digits);
      const amount = cents / 100;

      const formatted = amount.toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      });

      this.value = formatted;
      this.onChange(this.value);
      target.value = formatted;
      return;
    }

    this.value = rawValue;
    this.onChange(this.value);
  }
}
