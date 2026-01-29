import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'pwa-root',
  imports: [RouterOutlet],
  template: `
    <h1>Hello, {{ title() }}</h1>

    <router-outlet />
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular.PWA.OfflineForm');
}
