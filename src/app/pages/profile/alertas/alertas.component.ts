import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIcon],
  templateUrl: './alertas.component.html',
})
export class ProfileAlertasComponent implements OnInit {
  saldoAtual = 0;
  totalReceitas = 0;
  totalDespesas = 0;

  loading = false;

  private readonly destroyRef = inject(DestroyRef);
  private currentUserId: string | null = null;

  constructor(
    private readonly authService: AuthService,
  ) {}

  ngOnInit(): void {
    this.loading = true;
    this.authService.currentUser$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        const userId = user?.id ?? null;
        this.currentUserId = userId;
        if (!userId) {
          this.loading = false;
          return;
        }
      });
  }
}
