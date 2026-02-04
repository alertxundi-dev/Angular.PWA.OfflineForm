import { Component, input, computed } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';

type LoaderSize = 'small' | 'medium' | 'large';

@Component({
  selector: 'pwa-loader',
  imports: [TranslocoModule],
  template: `
    <div class="loader-container" [class]="sizeClass()">
      @if (showSpinner()) {
        <div class="spinner" [class]="sizeClass()"></div>
      }
      <span class="loader-text" [class]="sizeClass()">{{ text() || ('loading' | transloco) }}</span>
    </div>
  `,
  styleUrl: './loader.css',
})
export class Loader {
  text = input('');
  size = input<LoaderSize>('medium');
  showSpinner = input(true);

  protected sizeClass = computed(() => `loader-${this.size()}`);
}
