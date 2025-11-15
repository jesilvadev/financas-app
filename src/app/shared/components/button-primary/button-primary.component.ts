import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-button-primary',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button-primary.component.html',
})
export class ButtonPrimaryComponent {
  @Input() label: string = 'Confirmar';
  @Input() loadingText: string = 'Carregando...';
  @Input() loading: boolean = false;
  @Input() disabled: boolean = false;
  @Input() type: 'button' | 'submit' | 'reset' = 'button';

  @Output() clicked = new EventEmitter<Event>();

  onClick(event: Event): void {
    if (this.disabled || this.loading) return;
    this.clicked.emit(event);
  }
}
