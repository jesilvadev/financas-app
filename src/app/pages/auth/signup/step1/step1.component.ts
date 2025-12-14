import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { UiInputComponent } from '../../../../shared/components/ui-input/ui-input.component';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';

@Component({
  selector: 'app-step1',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    UiInputComponent,
    ButtonPrimaryComponent,
  ],
  templateUrl: './step1.component.html',
})
export class Step1Component {
  @Output() next = new EventEmitter<{ nome: string }>();

  nome: string = '';
  nomeError: string | null = null;

  onContinue(): void {
    this.nomeError = null;

    // Normaliza espaços em branco
    const nomeLimpo = this.nome.trim().replace(/\s+/g, ' ');

    if (!nomeLimpo) {
      this.nomeError = 'Informe seu nome completo.';
      return;
    }

    // Permite apenas letras (incluindo acentos) e espaços
    const nomeValido = /^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(nomeLimpo);
    if (!nomeValido) {
      this.nomeError = 'Nome inválido.';
      return;
    }

    // Exige pelo menos duas palavras (nome e sobrenome)
    const partes = nomeLimpo.split(' ').filter(Boolean);
    if (partes.length < 2) {
      this.nomeError = 'Informe seu nome completo.';
      return;
    }

    this.next.emit({ nome: nomeLimpo });
  }
}
