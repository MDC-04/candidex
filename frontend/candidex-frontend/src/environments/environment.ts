/**
 * Development environment configuration.
 * Replaced by environment.prod.ts at build time (see angular.json fileReplacements).
 */
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api/v1',
  companyAutocompleteUrl: 'https://autocomplete.clearbit.com/v1/companies/suggest',
  logoApiUrl: 'https://img.logo.dev',
  logoApiToken: 'pk_ZrCGxF7NSzGsqp5qUVPvnA',
  nominatimUrl: 'https://nominatim.openstreetmap.org/search',
};
