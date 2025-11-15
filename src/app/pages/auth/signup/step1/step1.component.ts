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

  onContinue(): void {
    const nomeLimpo = this.nome.trim();
    if (nomeLimpo) {
      this.next.emit({ nome: nomeLimpo });
    }
  }
}
