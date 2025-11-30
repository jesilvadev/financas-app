import { Injectable } from '@angular/core';
import { SpinnerScreenComponent } from '../shared/components/spinner-screen/spinner-screen.component';

@Injectable({
  providedIn: 'root',
})
export class LoadingService {
  private spinner?: SpinnerScreenComponent;
  private timer?: any;

  register(spinner: SpinnerScreenComponent) {
    this.spinner = spinner;
  }

  show(message?: string) {
    if (!this.spinner) return;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    if (message) {
      this.spinner.message = message;
    }
    this.spinner.show = true;
  }

  hide() {
    if (!this.spinner) return;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = undefined;
    }
    this.spinner.show = false;
  }

  showFor(duration: number, message?: string) {
    this.show(message);
    if (!this.spinner) return;
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.hide();
    }, duration);
  }
}


