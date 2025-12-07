import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, OnChanges, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NgxMaskDirective } from 'ngx-mask';
import { MetaRequest } from '../../../models/meta.model';

@Component({
  selector: 'app-create-meta-modal',
  standalone: true,
  imports: [CommonModule, FormsModule, NgxMaskDirective],
  templateUrl: './create-meta-modal.component.html',
})
export class CreateMetaModalComponent implements OnChanges {
  @Input() open = false;
  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<MetaRequest>();

  nome = '';
  valorAlvoInput = '';
  dataAlvo = '';

  isSubmitting = false;

  ngOnChanges(): void {
    if (this.open) {
      this.resetForm();
    }
  }

  get isFormValid(): boolean {
    return (
      !!this.nome.trim() &&
      !!this.valorAlvoInput &&
      parseFloat(this.valorAlvoInput.replace(/\./g, '').replace(',', '.')) > 0 &&
      !!this.dataAlvo
    );
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
    if (!this.isFormValid || this.isSubmitting) return;

    const valorAlvo = parseFloat(
      this.valorAlvoInput.replace(/\./g, '').replace(',', '.')
    );

    const request: MetaRequest = {
      nome: this.nome.trim(),
      valorAlvo,
      dataAlvo: this.dataAlvo,
    };

    this.isSubmitting = true;
    this.confirm.emit(request);
  }

  resetForm(): void {
    this.nome = '';
    this.valorAlvoInput = '';
    this.dataAlvo = '';
    this.isSubmitting = false;
  }

  onConfirmComplete(): void {
    this.isSubmitting = false;
    this.resetForm();
    this.close.emit();
  }

  getTodayDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}

