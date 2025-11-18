import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonPrimaryComponent } from '../../../../shared/components/button-primary/button-primary.component';
import { Router } from '@angular/router';
import { AuthService } from '../../../../services/auth.service';

@Component({
  selector: 'app-completar-cadastro-intro',
  standalone: true,
  imports: [CommonModule, ButtonPrimaryComponent],
  templateUrl: './intro.component.html',
})
export class IntroComponent {
  @Output() next = new EventEmitter<void>();

  constructor(private router: Router, private authService: AuthService) {}

  start(): void {
    this.next.emit();
  }

  onExit(): void {
    try {
      this.authService.logout();
    } catch {}
    this.router.navigate(['/signin']);
  }
}
