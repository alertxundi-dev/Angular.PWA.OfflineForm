import { Component, inject } from '@angular/core';
import { PendingFormsStateService } from '../services/pending-forms-state.service';
import { TranslocoModule } from '@jsverse/transloco';

@Component({
  selector: 'pwa-pending-forms-indicator',
  imports: [TranslocoModule],
  standalone: true,
  template: `
    @if (pendingFormsState.hasPendingForms()) {
      <span class="pending-forms-badge">
        {{ 'pendingForms' | transloco: {count: pendingFormsState.pendingFormsCount().toString()} }}
      </span>
    }
  `,
  styleUrl: './pending-forms-indicator.css',
})
export class PendingFormsIndicator {
  protected pendingFormsState = inject(PendingFormsStateService);
}
