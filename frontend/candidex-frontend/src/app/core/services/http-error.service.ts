import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';

type AuthAction = 'login' | 'register';

@Injectable({
  providedIn: 'root'
})
export class HttpErrorService {

  getAuthMessage(error: unknown, action: AuthAction): string {
    const httpError = this.asHttpError(error);
    if (!httpError) {
      return this.getAuthFallback(action);
    }

    if (httpError.status === 401 && action === 'login') {
      return 'Informations de connexion erronées. Vérifiez votre email et mot de passe.';
    }

    if (httpError.status === 409 && action === 'register') {
      return 'Cette adresse email est déjà utilisée.';
    }

    if (httpError.status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    }

    if (httpError.status >= 500) {
      return action === 'login'
        ? 'Erreur serveur. Impossible de vous connecter pour le moment.'
        : 'Erreur serveur. Impossible de finaliser votre inscription pour le moment.';
    }

    const backendMessage = this.extractBackendMessage(httpError);
    return backendMessage || this.getAuthFallback(action);
  }

  getActionMessage(error: unknown, actionLabel: string, fallback?: string): string {
    const httpError = this.asHttpError(error);
    if (!httpError) {
      return fallback || `Échec de ${actionLabel}. Veuillez réessayer.`;
    }

    const backendMessage = this.extractBackendMessage(httpError);

    if (httpError.status === 0) {
      return 'Impossible de joindre le serveur. Vérifiez votre connexion.';
    }

    if (httpError.status === 401) {
      return 'Votre session a expiré. Reconnectez-vous puis réessayez.';
    }

    if (httpError.status === 403) {
      return 'Vous n\'avez pas les droits nécessaires pour cette action.';
    }

    if (httpError.status === 404) {
      return backendMessage || `Impossible de ${actionLabel}: élément introuvable.`;
    }

    if (httpError.status === 400 || httpError.status === 422) {
      return backendMessage || `Les données envoyées pour ${actionLabel} sont invalides.`;
    }

    if (httpError.status === 409) {
      return backendMessage || `Conflit détecté pendant ${actionLabel}.`;
    }

    if (httpError.status >= 500) {
      return `Erreur serveur pendant ${actionLabel}. Veuillez réessayer.`;
    }

    return backendMessage || fallback || `Échec de ${actionLabel}. Veuillez réessayer.`;
  }

  private getAuthFallback(action: AuthAction): string {
    return action === 'login'
      ? 'Échec de la connexion. Veuillez réessayer.'
      : 'Échec de l\'inscription. Veuillez réessayer.';
  }

  private asHttpError(error: unknown): HttpErrorResponse | null {
    return error instanceof HttpErrorResponse ? error : null;
  }

  private extractBackendMessage(httpError: HttpErrorResponse): string | null {
    const payload = this.normalizePayload(httpError.error);

    if (typeof payload === 'string' && this.isUseful(payload)) {
      return payload.trim();
    }

    if (payload && typeof payload === 'object') {
      const data = payload as Record<string, unknown>;
      const directMessage = this.firstUsefulString(
        data['message'],
        data['error'],
        data['reason'],
        data['detail'],
        data['title']
      );

      if (directMessage) {
        return directMessage;
      }

      const validationErrors = data['validationErrors'];
      if (validationErrors && typeof validationErrors === 'object') {
        const firstValidationMessage = Object.values(validationErrors as Record<string, unknown>)
          .find(value => this.isUseful(value));

        if (typeof firstValidationMessage === 'string') {
          return firstValidationMessage.trim();
        }
      }
    }

    const transportMessage = httpError.message;
    if (this.isUseful(transportMessage) && !transportMessage.startsWith('Http failure response')) {
      return transportMessage.trim();
    }

    return null;
  }

  private normalizePayload(payload: unknown): unknown {
    if (typeof payload !== 'string') {
      return payload;
    }

    const trimmed = payload.trim();
    if (!trimmed) {
      return null;
    }

    try {
      return JSON.parse(trimmed);
    } catch {
      return trimmed;
    }
  }

  private firstUsefulString(...candidates: unknown[]): string | null {
    for (const candidate of candidates) {
      if (this.isUseful(candidate)) {
        return candidate.trim();
      }
    }
    return null;
  }

  private isUseful(value: unknown): value is string {
    return typeof value === 'string' && value.trim().length > 0;
  }
}
