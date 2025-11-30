import { Injectable } from '@angular/core';
import { DisplayAlertComponent } from '../shared/components/display-alert/display-alert.component';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertComponent?: DisplayAlertComponent;

  register(alert: DisplayAlertComponent) {
    this.alertComponent = alert;
  }

  show(
    message: string,
    type: 'error' | 'success' | 'info' | 'warning' = 'info',
    duration?: number
  ) {
    this.alertComponent?.abrir(message, type, duration);
  }

  showError(message: string, duration?: number) {
    this.show(message, 'error', duration);
  }

  showSuccess(message: string, duration?: number) {
    this.show(message, 'success', duration);
  }

  showInfo(message: string, duration?: number) {
    this.show(message, 'info', duration);
  }

  showWarning(message: string, duration?: number) {
    this.show(message, 'warning', duration);
  }
}


