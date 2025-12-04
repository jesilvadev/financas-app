import { CommonModule } from '@angular/common';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIcon } from '@angular/material/icon';

import { AuthService } from '../../../services/auth.service';
import { NotificationService } from '../../../services/notification.service';
import {
  TipoAlertaInfo,
  TipoAlerta,
  TIPOS_ALERTA_METADATA,
} from '../../../models/alerta.model';
import { AlertService } from '../../../services/alert.service';

@Component({
  selector: 'app-alertas',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIcon],
  templateUrl: './alertas.component.html',
})
export class ProfileAlertasComponent implements OnInit {
  tiposAlertas: TipoAlertaInfo[] = [];
  loading = false;
  atualizando: Record<string, boolean> = {};

  readonly TIPOS_ALERTA_METADATA = TIPOS_ALERTA_METADATA;

  private readonly destroyRef = inject(DestroyRef);
  private currentUserId: string | null = null;

  constructor(
    private readonly authService: AuthService,
    private readonly notificationService: NotificationService,
    private readonly alertService: AlertService
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
        this.carregarTiposAlertas();
      });
  }

  carregarTiposAlertas(): void {
    if (!this.currentUserId) {
      return;
    }
    this.loading = true;
    this.notificationService.listarTiposAlertas().subscribe({
      next: (tipos) => {
        // Ordenar por nome para melhor visualização
        this.tiposAlertas = tipos.sort((a, b) => {
          const nomeA = this.getNomeAlerta(a.tipo);
          const nomeB = this.getNomeAlerta(b.tipo);
          return nomeA.localeCompare(nomeB);
        });
        this.loading = false;
      },
      error: (error) => {
        console.error('Erro ao carregar tipos de alertas:', error);
        this.alertService.showError(
          'Erro ao carregar configurações de alertas'
        );
        this.loading = false;
      },
    });
  }

  toggleAlerta(tipoAlerta: TipoAlertaInfo): void {
    if (this.atualizando[tipoAlerta.tipo]) {
      return;
    }

    const novoStatus = !tipoAlerta.ativo;
    this.atualizando[tipoAlerta.tipo] = true;

    this.notificationService
      .atualizarPreferencia({
        tipo: tipoAlerta.tipo,
        ativo: novoStatus,
      })
      .subscribe({
        next: () => {
          // Atualizar localmente
          tipoAlerta.ativo = novoStatus;
          this.atualizando[tipoAlerta.tipo] = false;
          this.alertService.showSuccess(
            `${this.getNomeAlerta(tipoAlerta.tipo)} ${
              novoStatus ? 'ativado' : 'desativado'
            } com sucesso`
          );
        },
        error: (error) => {
          console.error('Erro ao atualizar preferência:', error);
          this.alertService.showError(
            'Erro ao atualizar configuração de alerta'
          );
          this.atualizando[tipoAlerta.tipo] = false;
        },
      });
  }

  getNomeAlerta(tipo: TipoAlerta): string {
    return TIPOS_ALERTA_METADATA[tipo]?.nome || tipo;
  }

  getDescricaoAlerta(tipo: TipoAlerta): string {
    return TIPOS_ALERTA_METADATA[tipo]?.descricao || '';
  }

  getIconAlerta(tipo: TipoAlerta): string {
    return TIPOS_ALERTA_METADATA[tipo]?.icon || 'info';
  }

  getColorAlerta(tipo: TipoAlerta): string {
    return TIPOS_ALERTA_METADATA[tipo]?.color || 'primary';
  }

  estaAtualizando(tipo: TipoAlerta): boolean {
    return this.atualizando[tipo] || false;
  }
}
