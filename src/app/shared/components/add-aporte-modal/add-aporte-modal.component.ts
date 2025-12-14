import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { AporteRequest, MetaResponse } from '../../../models/meta.model';

@Component({
  selector: 'app-add-aporte-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './add-aporte-modal.component.html',
})
export class AddAporteModalComponent implements OnChanges {
  @Input() open = false;
  @Input() meta: MetaResponse | null = null;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<AporteRequest>();

  valorInput = '';
  isSubmitting = false;

  get isFormValid(): boolean {
    return (
      !!this.valorInput &&
      parseFloat(this.valorInput.replace(/\./g, '').replace(',', '.')) > 0
    );
  }

  ngOnChanges(): void {
    if (this.open) {
      this.resetForm();
    }
  }

  handleClose(): void {
    if (this.isSubmitting) return;
    this.resetForm();
    this.close.emit();
  }

  handleBackdropClick(): void {
    this.handleClose();
  }

  submit(): void {
    if (!this.isFormValid || this.isSubmitting || !this.meta) return;

    const valor = parseFloat(
      this.valorInput.replace(/\./g, '').replace(',', '.')
    );

    // Usa automaticamente a data atual
    const dataAtual = new Date().toISOString().split('T')[0];

    const request: AporteRequest = {
      idMeta: this.meta.id,
      valor,
      data: dataAtual,
    };

    this.isSubmitting = true;
    this.confirm.emit(request);
  }

  resetForm(): void {
    this.valorInput = '';
    this.isSubmitting = false;
  }

  onConfirmComplete(): void {
    this.isSubmitting = false;
    this.resetForm();
    this.close.emit();
  }
}

