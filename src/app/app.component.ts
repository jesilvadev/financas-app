import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { DisplayAlertComponent } from './shared/components/display-alert/display-alert.component';
import { SpinnerScreenComponent } from './shared/components/spinner-screen/spinner-screen.component';
import { AlertService } from './services/alert.service';
import { LoadingService } from './services/loading.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DisplayAlertComponent, SpinnerScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements AfterViewInit {
  title = 'financas-app';

  @ViewChild('globalAlert') globalAlert?: DisplayAlertComponent;
  @ViewChild('globalSpinner') globalSpinner?: SpinnerScreenComponent;

  constructor(
    private readonly alertService: AlertService,
    private readonly loadingService: LoadingService
  ) {}

  ngAfterViewInit(): void {
    if (this.globalAlert) {
      this.alertService.register(this.globalAlert);
    }
    if (this.globalSpinner) {
      this.loadingService.register(this.globalSpinner);
    }
  }
}
