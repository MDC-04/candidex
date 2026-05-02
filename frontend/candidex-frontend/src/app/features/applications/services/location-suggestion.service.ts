import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

export interface LocationSuggestion {
  displayName: string;
  city: string;
  country: string;
}

interface NominatimResult {
  display_name: string;
  address: {
    city?: string;
    town?: string;
    village?: string;
    municipality?: string;
    state?: string;
    country?: string;
  };
}

@Injectable({ providedIn: 'root' })
export class LocationSuggestionService {

  private readonly NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

  constructor(private http: HttpClient) {}

  suggest(query: string): Observable<LocationSuggestion[]> {
    if (!query || query.length < 2) {
      return of([]);
    }
    return this.http
      .get<NominatimResult[]>(this.NOMINATIM_URL, {
        params: {
          q: query,
          format: 'json',
          addressdetails: '1',
          limit: '5',
          'accept-language': 'fr',
        },
      })
      .pipe(
        map(results =>
          results
            .map(r => {
              const city = r.address.city || r.address.town || r.address.village || r.address.municipality || '';
              const country = r.address.country || '';
              const displayName = [city, r.address.state, country].filter(Boolean).join(', ');
              return { displayName, city, country };
            })
            .filter(s => s.city || s.country)
        ),
        catchError(() => of([]))
      );
  }
}
