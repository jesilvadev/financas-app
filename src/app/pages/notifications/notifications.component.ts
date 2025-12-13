import { CommonModule, Location } from '@angular/common';
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
import { forkJoin } from 'rxjs';

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
  /** IDs das notificações que eram não vistas quando o usuário entrou na tela */
  private novosAlertasIds: Set<string> = new Set<string>();

  readonly TIPOS_ALERTA_METADATA = TIPOS_ALERTA_METADATA;
  readonly SEVERIDADE_METADATA = SEVERIDADE_METADATA;

  private readonly destroyRef = inject(DestroyRef);
  private currentUserId: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private notificationService: NotificationService,
    private readonly location: Location
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

        // Marca automaticamente todos como vistos ao entrar na tela
        const naoVistos = this.alertas.filter((a) => !a.visto);
        if (naoVistos.length > 0) {
          // Guarda quais eram novas nesta visita para destacar visualmente
          this.novosAlertasIds = new Set(naoVistos.map((a) => a.id));

          // Atualiza estado local para refletir imediatamente
          const agora = new Date().toISOString();
          naoVistos.forEach((a) => {
            a.visto = true;
            a.dataVisto = agora;
          });

          // Dispara requisições para marcar como vistos no backend
          forkJoin(
            naoVistos.map((a) =>
              this.notificationService.marcarComoVisto(a.id)
            )
          ).subscribe({
            error: (error) =>
              console.error('Erro ao marcar notificações como vistas:', error),
          });
        }

        this.aplicarFiltro();
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar notificações:', error);
        this.loading = false;
      },
    });
  }

  voltar(): void {
    this.location.back();
  }

  aplicarFiltro(): void {
    // Sem filtros na interface: sempre exibe todas as notificações
    this.alertasFiltrados = this.alertas;
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
        this.novosAlertasIds.delete(alerta.id);
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

  isNovo(alerta: AlertaResponse): boolean {
    return this.novosAlertasIds.has(alerta.id);
  }
}
