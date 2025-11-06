import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step5',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step5.component.html',
})
export class Step5Component {
  @Output() next = new EventEmitter<{ startDay: string }>();
  @Output() back = new EventEmitter<void>();

  startDay: string = '';
  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  onFinish(): void {
    if (this.startDay) {
      this.next.emit({ startDay: this.startDay });
    }
  }

  onBack(): void {
    this.back.emit();
  }
}
