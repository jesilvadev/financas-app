import { CommonModule } from '@angular/common';
import {
  Component,
  EventEmitter,
  Input,
  OnChanges,
  Output,
} from '@angular/core';
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

  get valorMaximoPermitido(): number {
    if (!this.meta) return 0;
    return Math.max(0, this.meta.valorAlvo - this.meta.valorAtual);
  }

  get valorAtualDigitado(): number {
    if (!this.valorInput) return 0;
    return (
      parseFloat(this.valorInput.replace(/\./g, '').replace(',', '.')) || 0
    );
  }

  get isFormValid(): boolean {
    if (!this.valorInput || !this.meta || this.meta.concluida) return false;

    const valor = this.valorAtualDigitado;
    return valor > 0 && valor <= this.valorMaximoPermitido;
  }

  get valorExcedeMaximo(): boolean {
    if (!this.valorInput || !this.meta) return false;
    return this.valorAtualDigitado > this.valorMaximoPermitido;
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

    // Não permite aporte se a meta já está concluída
    if (this.meta.concluida) {
      return;
    }

    const valor = this.valorAtualDigitado;

    // Validação adicional de segurança
    if (valor > this.valorMaximoPermitido) {
      return;
    }

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
