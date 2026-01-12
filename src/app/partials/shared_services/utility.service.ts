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
  
}
