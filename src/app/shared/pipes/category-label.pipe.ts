import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';

@Pipe({
  name: 'categoryLabel',
  standalone: true,
  pure: false  // 🔄 Impure para reaccionar a cambios de idioma
})
export class CategoryLabelPipe implements PipeTransform {
  private translocoService = inject(TranslocoService);

  transform(categoria: string): string {
    if (!categoria) return '';

    // 🌐 Usar Transloco
    return this.translocoService.translate(`form.categories.${categoria}`) || categoria;
  }
}
