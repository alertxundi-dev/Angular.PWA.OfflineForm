import { Component, inject, computed, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { toSignal } from '@angular/core/rxjs-interop';
import { map } from 'rxjs';
import { ApiService } from '../services/api.service';
import { NetworkService } from '../services/network.service';
import { PendingFormsIndicator } from "../pending-forms-indicator/pending-forms-indicator";
import { Loader } from "../loader/loader";
import { LanguageSelector } from "../language-selector/language-selector";
import { TranslocoModule } from '@jsverse/transloco';

export interface FormData {
  nombre: string;
  apellido: string;
  email: string;
  categoria: 'general' | 'support' | 'sales' | 'feedback';
  observaciones?: string;
}

@Component({
  selector: 'pwa-main-form',
  imports: [ReactiveFormsModule, PendingFormsIndicator, Loader, LanguageSelector, TranslocoModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="main-form-container">
      <!-- Estado de conexión -->
      <div class="connection-status" 
           [class]="networkService.isOnline() ? 'online' : 'offline'">
        <div class="connection-status-content">
          <span class="connection-indicator">
            @if (networkService.isOnline()) {
              {{ 'connection.connected' | transloco }}
            } @else {
              {{ 'connection.offline' | transloco }}
            }
          </span>
          <pwa-pending-forms-indicator />
        </div>
      </div>

      <form [formGroup]="form" (ngSubmit)="onSubmit()" class="form-container">
        <div class="form-group">
          <label for="nombre" class="form-label required">{{ 'form.fields.name' | transloco }}</label>
          <input id="nombre" type="text" formControlName="nombre" 
                 class="form-input">
          @if(form.get('nombre')?.invalid && form.get('nombre')?.touched) {
            <span class="form-error">{{ 'form.errors.nameRequired' | transloco }}</span>
          }
        </div>

        <div class="form-group">
          <label for="apellido" class="form-label required">{{ 'form.fields.lastname' | transloco }}</label>
          <input id="apellido" type="text" formControlName="apellido"
                 class="form-input">
          @if(form.get('apellido')?.invalid && form.get('apellido')?.touched) {
            <span class="form-error">{{ 'form.errors.lastnameRequired' | transloco }}</span>
          }
        </div>

        <div class="form-group">
          <label for="email" class="form-label required">{{ 'form.fields.email' | transloco }}</label>
          <input id="email" type="email" formControlName="email"
                 class="form-input">
          @if(form.get('email')?.invalid && form.get('email')?.touched) {
            <span class="form-error">{{ 'form.errors.emailInvalid' | transloco }}</span>
          }
        </div>

        <div class="form-group">
          <label for="categoria" class="form-label required">{{ 'form.fields.category' | transloco }}</label>
          <select id="categoria" formControlName="categoria"
                  class="form-select">
            <option value="">{{ 'form.placeholders.selectCategory' | transloco }}</option>
            <option value="general">{{ 'form.categories.general' | transloco }}</option>
            <option value="support">{{ 'form.categories.support' | transloco }}</option>
            <option value="sales">{{ 'form.categories.sales' | transloco }}</option>
            <option value="feedback">{{ 'form.categories.feedback' | transloco }}</option>
          </select>
          @if(form.get('categoria')?.invalid && form.get('categoria')?.touched) {
            <span class="form-error">{{ 'form.errors.categoryRequired' | transloco }}</span>
          }
        </div>

        <div class="form-group">
          <label for="observaciones" class="form-label">{{ 'form.fields.observations' | transloco }}</label>
          <textarea id="observaciones" formControlName="observaciones" rows="3"
                    class="form-textarea"></textarea>
        </div>

        <button type="submit" [disabled]="!formValid() || isSubmitting()"
                [class]="isSubmitting() ? 'submit-button loading' : 'submit-button'">
          @if (isSubmitting()) {
            <pwa-loader text="{{ 'form.actions.submitting' | transloco }}" size="small" />
          } @else {
            <span>{{ 'form.actions.submit' | transloco }}</span>
          }
        </button>

        @if (hasError()) {
          <div class="status-message" 
               [class]="apiService.error()?.includes('guardado localmente') ? 'warning' : 'error'">
            {{ apiService.error() }}
          </div>
        }

        @if (apiService.value()) {
          <div class="status-message success">
            <span>{{ 'form.success' | transloco  }}</span>
          </div>
        }
      </form>
    </div>
  `,
  styleUrl: './main-form.css'
})
export class MainForm {
  private fb = inject(FormBuilder);
  protected apiService = inject(ApiService);
  protected networkService = inject(NetworkService);

  form = this.fb.group({
    nombre: ['', Validators.required],
    apellido: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    categoria: ['', Validators.required],
    observaciones: ['']
  });

  // this.form.valid es una propiedad no reactiva, por lo que se convierte en un signal
  // no puedo usar computed porque no es reactiva
  readonly formValid = toSignal(this.form.statusChanges.pipe(
    map(() => this.form.valid)
  ), { initialValue: false });

  readonly isSubmitting = computed(() => this.apiService.isLoading());
  readonly hasError = computed(() => !!this.apiService.error());

  async onSubmit(): Promise<void> {
    if (this.formValid()) {
      const formData: FormData = {
        nombre: this.form.value.nombre!,
        apellido: this.form.value.apellido!,
        email: this.form.value.email!,
        categoria: this.form.value.categoria as 'general' | 'support' | 'sales' | 'feedback',
        observaciones: this.form.value.observaciones || undefined
      };

      await this.apiService.enviarFormulario(formData);

      // Resetear después de 3 segundos si hay éxito (o si se guardó offline)
      if (this.apiService.value() || this.apiService.error()?.includes('guardado localmente')) {
        setTimeout(() => {
          this.apiService.reset();
          this.form.reset();
        }, 3000);
      }
    }
  }
}
