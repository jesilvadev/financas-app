import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';

import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import {
  AlertaResponse,
  TipoAlerta,
  TIPOS_ALERTA_METADATA,
  SeveridadeAlerta,
  SEVERIDADE_METADATA,
} from '../../models/alerta.model';

type FiltroStatus = 'TODOS' | 'NAO_VISTOS' | 'VISTOS';

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, MatIcon],
  templateUrl: './notifications.component.html',
})
export class NotificationsComponent implements OnInit {
  alertas: AlertaResponse[] = [];
  alertasFiltrados: AlertaResponse[] = [];
  loading = false;
  filtroStatus: FiltroStatus = 'TODOS';

  readonly TIPOS_ALERTA_METADATA = TIPOS_ALERTA_METADATA;
  readonly SEVERIDADE_METADATA = SEVERIDADE_METADATA;

  private readonly destroyRef = inject(DestroyRef);
  private currentUserId: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private notificationService: NotificationService
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
        this.loadNotifications();
      });
  }

  loadNotifications(): void {
    if (!this.currentUserId) {
      return;
    }
    this.loading = true;
    this.notificationService.listarTodosAlertas().subscribe({
      next: (alertas) => {
        // Ordenar por data de criação (mais recentes primeiro)
        this.alertas = alertas.sort((a, b) => {
          const dateA = new Date(a.dataCriacao).getTime();
          const dateB = new Date(b.dataCriacao).getTime();
          return dateB - dateA;
        });
        this.aplicarFiltro();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar notificações:', error);
        this.loading = false;
      },
    });
  }

  aplicarFiltro(): void {
    switch (this.filtroStatus) {
      case 'NAO_VISTOS':
        this.alertasFiltrados = this.alertas.filter((a) => !a.visto);
        break;
      case 'VISTOS':
        this.alertasFiltrados = this.alertas.filter((a) => a.visto);
        break;
      default:
        this.alertasFiltrados = this.alertas;
    }
  }

  alterarFiltro(status: FiltroStatus): void {
    this.filtroStatus = status;
    this.aplicarFiltro();
  }

  marcarComoVisto(alerta: AlertaResponse, event?: Event): void {
    if (event) {
      event.stopPropagation();
    }

    if (alerta.visto) {
      return;
    }

    this.notificationService.marcarComoVisto(alerta.id).subscribe({
      next: () => {
        // Atualizar o alerta localmente
        alerta.visto = true;
        alerta.dataVisto = new Date().toISOString();
        this.aplicarFiltro();
      },
      error: (error) => {
        console.error('Erro ao marcar alerta como visto:', error);
      },
    });
  }

  getTipoAlertaMetadata(tipo: TipoAlerta) {
    return TIPOS_ALERTA_METADATA[tipo] || {
      nome: tipo,
      icon: 'info',
      color: 'primary',
    };
  }

  getSeveridadeMetadata(severidade: SeveridadeAlerta) {
    return SEVERIDADE_METADATA[severidade] || {
      label: severidade,
      color: 'primary',
      icon: 'info',
    };
  }
}
