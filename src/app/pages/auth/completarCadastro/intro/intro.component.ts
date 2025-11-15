import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-completar-cadastro-intro',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './intro.component.html',
})
export class IntroComponent {
  @Output() next = new EventEmitter<void>();

  start(): void {
    this.next.emit();
  }
}

