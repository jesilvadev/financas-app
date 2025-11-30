import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { DisplayAlertComponent } from '../shared/components/display-alert/display-alert.component';

@Injectable({
  providedIn: 'root',
})
export class AlertService {
  private alertComponent?: DisplayAlertComponent;

  private readonly visibleSubject = new BehaviorSubject<boolean>(false);
  readonly visible$ = this.visibleSubject.asObservable();

  register(alert: DisplayAlertComponent) {
    this.alertComponent = alert;
  }

  setVisible(visible: boolean) {
    this.visibleSubject.next(visible);
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

