import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

export interface CompanySuggestion {
  name: string;
  domain: string;
  logoUrl: string;
}

@Injectable({ providedIn: 'root' })
export class CompanySuggestionService {

  private readonly AUTOCOMPLETE_URL = environment.companyAutocompleteUrl;

  constructor(private http: HttpClient) {}

  suggest(query: string): Observable<CompanySuggestion[]> {
    if (!query || query.length < 2) {
      return of([]);
    }
    return this.http
      .get<{ name: string; domain: string; logo: string | null }[]>(this.AUTOCOMPLETE_URL, {
        params: { query }
      })
      .pipe(
        map(items =>
          items.map(item => ({
            name: item.name,
            domain: item.domain,
            logoUrl: this.getLogoUrl(item.domain)
          }))
        ),
        catchError(() => of([]))
      );
  }

  getLogoUrl(domain: string | undefined | null): string {
    if (!domain) return '';
    return `${environment.logoApiUrl}/${encodeURIComponent(domain)}?token=${environment.logoApiToken}&size=128&format=png`;
  }
}
