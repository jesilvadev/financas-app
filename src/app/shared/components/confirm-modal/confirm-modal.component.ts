import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-confirm-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirm-modal.component.html',
})
export class ConfirmModalComponent {
  @Input() open = false;
  @Input() title: string = 'Confirmar ação';
  @Input() description?: string;
  @Input() confirmLabel: string = 'Confirmar';
  @Input() cancelLabel: string = 'Cancelar';
  @Input() confirming: boolean = false;

  @Output() close = new EventEmitter<void>();
  @Output() confirm = new EventEmitter<void>();

  handleBackdropClick(): void {
    if (this.confirming) return;
    this.close.emit();
  }

  handleCancel(): void {
    if (this.confirming) return;
    this.close.emit();
  }

  handleConfirm(): void {
    if (this.confirming) return;
    this.confirm.emit();
  }
}
