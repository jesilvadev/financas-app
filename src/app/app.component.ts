import { AfterViewInit, Component, DestroyRef, OnInit, ViewChild, inject } from '@angular/core';
import { ActivatedRoute, NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { DisplayAlertComponent } from './shared/components/display-alert/display-alert.component';
import { SpinnerScreenComponent } from './shared/components/spinner-screen/spinner-screen.component';
import { AlertService } from './services/alert.service';
import { LoadingService } from './services/loading.service';
import { ThemeColorService } from './services/theme-color.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, DisplayAlertComponent, SpinnerScreenComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, AfterViewInit {
  title = 'financas-app';
  private readonly destroyRef = inject(DestroyRef);

  @ViewChild('globalAlert') globalAlert?: DisplayAlertComponent;
  @ViewChild('globalSpinner') globalSpinner?: SpinnerScreenComponent;

  constructor(
    private readonly alertService: AlertService,
    private readonly loadingService: LoadingService,
    private readonly router: Router,
    private readonly activatedRoute: ActivatedRoute,
    private readonly themeColorService: ThemeColorService
  ) {}

  ngOnInit(): void {
    const applyThemeColorFromRoute = () => {
      // Pega a rota mais profunda (child) e procura a primeira `data.themeColor`
      // subindo a árvore (para herdar do parent quando o child não define).
      let current: ActivatedRoute | null = this.activatedRoute;
      while (current?.firstChild) current = current.firstChild;

      let themeColor: string | undefined;
      let cursor: ActivatedRoute | null = current;
      while (cursor && !themeColor) {
        themeColor = cursor.snapshot.data?.['themeColor'] as string | undefined;
        cursor = cursor.parent;
      }

      this.themeColorService.setThemeColor(themeColor ?? '#BFCBFF');
    };

    // Aplica no carregamento inicial e a cada navegação.
    applyThemeColorFromRoute();
    this.router.events
      .pipe(
        filter((e): e is NavigationEnd => e instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe(() => applyThemeColorFromRoute());
  }

  ngAfterViewInit(): void {
    if (this.globalAlert) {
      this.alertService.register(this.globalAlert);
    }
    if (this.globalSpinner) {
      this.loadingService.register(this.globalSpinner);
    }
  }
}
