import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';

type EntryType = 'income' | 'expense';

export interface AddEntryPayload {
  type: EntryType;
  amount: number;
  category: string;
}

@Component({
  selector: 'app-add-entry-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-entry-modal.component.html',
})
export class AddEntryModalComponent {
  @Input() open = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<AddEntryPayload>();

  entryType: EntryType | null = null;
  amount: number | null = null;
  category = '';

  private readonly categories: Record<EntryType, string[]> = {
    income: ['Salário', 'Freelance', 'Investimentos', 'Reembolso', 'Outros'],
    expense: ['Alimentação', 'Transporte', 'Moradia', 'Lazer', 'Educação'],
  };

  get availableCategories(): string[] {
    return this.entryType ? this.categories[this.entryType] : [];
  }

  get isFormValid(): boolean {
    return (
      this.entryType !== null &&
      this.amount !== null &&
      this.amount > 0 &&
      !!this.category
    );
  }

  selectType(type: EntryType): void {
    this.entryType = type;
    this.category = '';
  }

  reset(): void {
    this.entryType = null;
    this.amount = null;
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
    if (!this.isFormValid || this.entryType === null || this.amount === null) {
      return;
    }

    this.confirm.emit({
      type: this.entryType,
      amount: Number(this.amount),
      category: this.category,
    });
    this.reset();
  }
}
