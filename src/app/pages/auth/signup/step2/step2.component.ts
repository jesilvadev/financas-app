import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './step2.component.html',
})
export class Step2Component {
  @Output() next = new EventEmitter<{ email: string; password: string }>();
  @Output() back = new EventEmitter<void>();

  email: string = '';
  password: string = '';
  confirmPassword: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onContinue(): void {
    if (this.email && this.password && this.password === this.confirmPassword) {
      this.next.emit({ email: this.email, password: this.password });
    }
  }

  onBack(): void {
    this.back.emit();
  }
}
