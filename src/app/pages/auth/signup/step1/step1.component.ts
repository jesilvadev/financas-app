import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './step1.component.html',
})
export class Step1Component {
  @Output() next = new EventEmitter<{ fullName: string }>();

  fullName: string = '';

  onContinue(): void {
    if (this.fullName.trim()) {
      this.next.emit({ fullName: this.fullName });
    }
  }
}
