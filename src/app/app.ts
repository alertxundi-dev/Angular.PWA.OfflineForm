import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MainForm } from "./main-form/main-form";
import { OfflineData } from "./offline-data/offline-data";
import { StatusBar } from "./status-bar/status-bar";
import { UpdateNotification } from "./update-notification/update-notification";

@Component({
  selector: 'pwa-root',
  imports: [RouterOutlet, MainForm, OfflineData, StatusBar, UpdateNotification],
  template: `
    <pwa-update-notification />
    <main class="main-content">
      <h1>Hola, {{ title() }}</h1>
      <pwa-main-form />
      <pwa-offline-data />
      <router-outlet />
    </main>
    <pwa-status-bar />
  `,
  styleUrl: './app.css'
})
export class App {
  protected readonly title = signal('Angular.PWA.OfflineForm');
}
