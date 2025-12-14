import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { Meta } from '@angular/platform-browser';

@Injectable({ providedIn: 'root' })
export class ThemeColorService {
  constructor(
    private readonly meta: Meta,
    @Inject(DOCUMENT) private readonly document: Document
  ) {}

  setThemeColor(color: string): void {
    const content = (color ?? '').trim();
    if (!content) return;

    // Atualiza ou cria a meta tag que controla a cor do "chrome" do navegador (principalmente Android/Chromium).
    this.meta.updateTag(
      { name: 'theme-color', content },
      "name='theme-color'"
    );

    // Em alguns navegadores (ex.: iOS Safari, web app não instalado), a “barra de baixo”
    // tende a usar o background real do documento, não o theme-color.
    // Ajustar html/body ajuda a “pintar” a área atrás das barras.
    this.setDocumentBackgroundColor(content);
  }

  private setDocumentBackgroundColor(color: string): void {
    const c = (color ?? '').trim();
    if (!c) return;

    const html = this.document.documentElement;
    const body = this.document.body;

    if (html) html.style.backgroundColor = c;
    if (body) body.style.backgroundColor = c;
  }
}


