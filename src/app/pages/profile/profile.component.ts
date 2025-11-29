import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { ButtonPrimaryComponent } from '../../shared/components/button-primary/button-primary.component';
import { AuthService } from '../../services/auth.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UsuarioResponse } from '../../models/user.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink, ConfirmModalComponent, ButtonPrimaryComponent],
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  userFullName: string = '';
  userInitial: string = '';
  isConfirmLogoutOpen = false;
  isConfirmingLogout = false;
  private readonly destroyRef = inject(DestroyRef);

  constructor(
    private readonly authService: AuthService,
    private readonly router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user: UsuarioResponse | null) => {
        const full = (user?.nome ?? '').trim();
        const parts = full.split(/\s+/).filter(Boolean);
        this.userFullName =
          parts.length <= 1 ? full : `${parts[0]} ${parts[parts.length - 1]}`;
        this.userInitial = full.charAt(0).toUpperCase();
      });
  }

  openLogoutConfirm(): void {
    this.isConfirmLogoutOpen = true;
  }

  confirmLogout(): void {
    if (this.isConfirmingLogout) return;
    this.isConfirmingLogout = true;
    // nenhuma chamada async necessária, mas permite feedback visual
    setTimeout(() => {
      this.authService.logout();
      this.isConfirmingLogout = false;
      this.isConfirmLogoutOpen = false;
      this.router.navigate(['/signin']);
    }, 0);
  }
}
