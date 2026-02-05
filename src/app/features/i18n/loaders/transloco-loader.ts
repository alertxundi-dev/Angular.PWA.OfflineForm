import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { TranslocoLoader, Translation } from '@jsverse/transloco';
import { catchError, of } from 'rxjs';

@Injectable({
    providedIn: 'root'
})
export class TranslocoHttpLoader implements TranslocoLoader {
    private readonly http = inject(HttpClient);

    getTranslation(lang: string) {
        return this.http.get<Translation>(`/assets/i18n/${lang}.json`).pipe(
            catchError((error) => {
                console.warn(`Failed to load translation for language: ${lang}`, error);
                return of({});
            })
        );
    }
}