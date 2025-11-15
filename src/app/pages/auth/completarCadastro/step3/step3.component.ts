import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step3',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step3.component.html',
})
export class Step3Component {
  @Input() isLoading: boolean = false;
  @Output() next = new EventEmitter<{ startDay: string }>();
  @Output() back = new EventEmitter<void>();

  startDay: string = '';
  days: string[] = Array.from({ length: 31 }, (_, i) =>
    (i + 1).toString().padStart(2, '0')
  );

  onFinish(): void {
    if (this.startDay && !this.isLoading) {
      this.next.emit({ startDay: this.startDay });
    }
  }

  onBack(): void {
    this.back.emit();
  }
}
