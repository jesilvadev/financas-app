import { Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class ThemeColorService {
  constructor(private readonly meta: Meta) {}

  setThemeColor(color: string): void {
    const content = (color ?? '').trim();
    if (!content) return;

    // Atualiza ou cria a meta tag que controla a cor do "chrome" do navegador (principalmente Android/Chromium).
    this.meta.updateTag(
      { name: 'theme-color', content },
      "name='theme-color'"
    );
  }
}


