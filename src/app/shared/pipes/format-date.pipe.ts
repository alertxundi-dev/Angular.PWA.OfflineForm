import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'formatDate',
  standalone: true,
  pure: true
})
export class FormatDatePipe implements PipeTransform {

  transform(timestamp: number): string {
    if (!timestamp || typeof timestamp !== 'number') {
      return '';
    }

    return new Date(timestamp).toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}
