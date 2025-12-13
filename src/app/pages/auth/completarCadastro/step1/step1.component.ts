import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ButtonPrimaryComponent,
    UiInputComponent,
  ],
  templateUrl: './step1.component.html',
})
export class Step1Component implements OnChanges {
  @Input() presetSaldoAtual: number | null = null;
  @Input() isLoading: boolean = false;
  @Output() next = new EventEmitter<{ saldoAtual: number }>();
  @Output() back = new EventEmitter<void>();

  saldoAtual: string = '';
  saldoError: string | null = null;

  get isValidSaldo(): boolean {
    const parsed = this.parseCurrencyBr(this.saldoAtual);
    return parsed !== null && parsed >= 0;
  }

  onFinish(): void {
    this.saldoError = null;

    const parsed = this.parseCurrencyBr(this.saldoAtual);

    if (parsed === null || parsed < 0) {
      this.saldoError = 'Informe um saldo válido.';
      return;
    }

    if (!this.isLoading) {
      this.next.emit({ saldoAtual: parsed });
    }
  }

  onBack(): void {
    this.back.emit();
  }

  ngOnChanges(): void {
    // Só pré-preenche o campo se vier um saldo REALMENTE definido e maior que zero.
    // Quando o backend enviar 0, o campo permanece vazio para o usuário informar.
    if (
      this.presetSaldoAtual !== null &&
      this.presetSaldoAtual !== undefined &&
      this.presetSaldoAtual > 0 &&
      !this.saldoAtual
    ) {
      this.saldoAtual = this.formatCurrencyBr(this.presetSaldoAtual);
    }
  }

  private parseCurrencyBr(formatted: unknown): number | null {
    if (formatted === null || formatted === undefined) return null;
    if (typeof formatted === 'number')
      return Number.isFinite(formatted) ? formatted : null;
    const str = String(formatted).trim();
    if (!str) return null;
    const normalized = str
      .replace(/\./g, '')
      .replace(',', '.')
      .replace('R$', '')
      .trim();
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }

  private formatCurrencyBr(value: number): string {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
}
