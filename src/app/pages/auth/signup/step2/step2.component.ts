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
  emailError: string | null = null;
  senhaError: string | null = null;
  confirmarSenhaError: string | null = null;

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.showConfirmPassword = !this.showConfirmPassword;
  }

  onConfirm(): void {
    this.emailError = null;
    this.senhaError = null;
    this.confirmarSenhaError = null;

    const emailLimpo = this.email.trim();

    if (!emailLimpo) {
      this.emailError = 'Informe seu e-mail.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailLimpo)) {
      this.emailError = 'Informe um e-mail válido.';
    }

    if (!this.senha) {
      this.senhaError = 'Informe uma senha.';
    }

    if (!this.confirmarSenha) {
      this.confirmarSenhaError = 'Confirme sua senha.';
    } else if (!this.senhaError && this.senha !== this.confirmarSenha) {
      this.confirmarSenhaError = 'As senhas não coincidem.';
    }

    if (this.emailError || this.senhaError || this.confirmarSenhaError) {
      return;
    }

    this.next.emit({ email: emailLimpo, senha: this.senha });
  }

  onBack(): void {
    this.back.emit();
  }
}
