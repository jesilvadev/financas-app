import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';

type EntryType = 'income' | 'expense';

export interface AddEntryPayload {
  type: EntryType;
  amount: number;
  category: string;
}

@Component({
  selector: 'app-add-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './add-entry-modal.component.html',
  providers: [],
})
export class AddEntryModalComponent {
  @Input() open = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<AddEntryPayload>();

  entryType: EntryType | null = null;
  amountInput: string = '';
  category = '';

  private readonly categories: Record<EntryType, string[]> = {
    income: ['Salário', 'Freelance', 'Investimentos', 'Reembolso', 'Outros'],
    expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Educação'],
  };

  get availableCategories(): string[] {
    return this.entryType ? this.categories[this.entryType] : [];
  }

  get isFormValid(): boolean {
    const parsed = this.parseCurrencyBr(this.amountInput);
    return (
      this.entryType !== null &&
      parsed !== null &&
      parsed > 0 &&
      !!this.category
    );
  }

  selectType(type: EntryType): void {
    this.entryType = type;
    this.category = '';
  }

  reset(): void {
    this.entryType = null;
    this.amountInput = '';
    this.category = '';
  }

  backToTypeSelection(): void {
    this.entryType = null;
    this.category = '';
  }

  handleClose(): void {
    this.reset();
    this.close.emit();
  }

  submit(): void {
    const parsed = this.parseCurrencyBr(this.amountInput);
    if (!this.isFormValid || this.entryType === null || parsed === null) {
      return;
    }

    this.confirm.emit({
      type: this.entryType,
      amount: parsed,
      category: this.category,
    });
    this.reset();
  }

  private parseCurrencyBr(formatted: string): number | null {
    if (!formatted) return null;
    const normalized = formatted.replace(/\\./g, '').replace(',', '.');
    const num = Number(normalized);
    return Number.isFinite(num) ? num : null;
  }
}
