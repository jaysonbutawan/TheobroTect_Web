import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TranslationService {
  private API_URL = 'http://127.0.0.1:8000/api/translate';

  constructor(private http: HttpClient) {}

  async translate(text: string): Promise<string> {
    if (!text || !text.trim()) return '';

    try {
      const response: any = await firstValueFrom(
        this.http.post(this.API_URL, {
          text: text,
          source: 'en',
          target: 'tl',
        }),
      );

      return response.translatedText || '';
    } catch (error) {
      return text;
    }
  }
}
