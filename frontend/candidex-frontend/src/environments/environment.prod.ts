/**
 * Production environment configuration.
 *
 * apiUrl is relative so the frontend talks to the backend through the same
 * origin (the reverse proxy / nginx forwards /api to the backend container).
 * This avoids CORS in production entirely.
 */
export const environment = {
  production: true,
  apiUrl: '/api/v1',
  companyAutocompleteUrl: 'https://autocomplete.clearbit.com/v1/companies/suggest',
  logoApiUrl: 'https://img.logo.dev',
  logoApiToken: 'pk_ZrCGxF7NSzGsqp5qUVPvnA',
  nominatimUrl: 'https://nominatim.openstreetmap.org/search',
};
