import { Injectable } from '@angular/core';


@Injectable({
  providedIn: 'root',
})
export class UtilityService {

  copy(text: string): void {
    if (!text) return;

    navigator.clipboard
      .writeText(text)
      .then(() => console.log('Copied:', text))
      .catch((err) => console.error('Copy failed', err));
  }

  formatDateTimeDdMmYyyy12h(input: string | Date | null | undefined): string {
    if (!input) return '';

    const d = input instanceof Date ? input : new Date(input);
    if (isNaN(d.getTime())) return ''; // invalid date

    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();

    let hours = d.getHours();
    const minutes = String(d.getMinutes()).padStart(2, '0');

    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours === 0 ? 12 : hours; // 0 => 12

    return `${dd}-${mm}-${yyyy} ${hours}:${minutes} ${ampm}`;
  }

}
