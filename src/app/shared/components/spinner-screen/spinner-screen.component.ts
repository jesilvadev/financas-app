import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-spinner-screen',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './spinner-screen.component.html',
  styleUrls: ['./spinner-screen.component.scss'],
  host: {
    class: 'pointer-events-none',
  },
})
export class SpinnerScreenComponent {
  @Input() show = false;
  @Input() message = 'Carregando...';
}


