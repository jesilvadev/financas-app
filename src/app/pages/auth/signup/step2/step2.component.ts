import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-step2',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatIconModule,
    UiInputComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './step2.component.html',
})
export class Step2Component {
  @Input() isLoading: boolean = false;
  @Output() next = new EventEmitter<{ email: string; senha: string }>();
  @Output() back = new EventEmitter<void>();

  email: string = '';
  senha: string = '';
  confirmarSenha: string = '';
  showPassword: boolean = false;
  showConfirmPassword: boolean = false;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onConfirm(): void {
    const emailLimpo = this.email.trim();
    if (
      emailLimpo &&
      this.senha &&
      this.confirmarSenha &&
      this.senha === this.confirmarSenha
    ) {
      this.next.emit({ email: emailLimpo, senha: this.senha });
    }
  }

  onBack(): void {
    this.back.emit();
  }
}
