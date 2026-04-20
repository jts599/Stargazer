/**
 * Client-side geocoding helpers for resolving user-entered locations.
 */
import { isValidCoordinate } from './timezone';

const NOMINATIM_SEARCH_URL = 'https://nominatim.openstreetmap.org/search';
const SEARCH_RESULT_LIMIT = '1';

export interface GeocodingResult {
  latitude: number;
  longitude: number;
  displayName: string;
}

interface NominatimSearchResult {
  lat: string;
  lon: string;
  display_name: string;
}

/**
 * Searches OpenStreetMap Nominatim for one best-match location.
 * @param query Free-form location or address text; required and non-empty after trimming.
 * @returns Best valid geocoding result, or undefined when no valid result is returned.
 * @throws Error when the geocoding request fails or returns invalid JSON.
 * @sideEffects Performs one network request to the Nominatim search endpoint.
 */
export async function searchLocation(query: string): Promise<GeocodingResult | undefined> {
  const trimmedQuery = query.trim();

  if (trimmedQuery.length === 0) {
    return undefined;
  }

  const response = await fetch(buildSearchUrl(trimmedQuery), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error('Location search failed.');
  }

  const payload: unknown = await response.json();

  if (!Array.isArray(payload) || payload.length === 0) {
    return undefined;
  }

  return toGeocodingResult(payload[0]);
}

/**
 * Builds the public Nominatim search URL for a single free-form query.
 * @param query Trimmed user search query.
 * @returns URL string with encoded query parameters.
 * @throws Does not throw.
 * @sideEffects None.
 */
function buildSearchUrl(query: string): string {
  const params = new URLSearchParams({
    q: query,
    format: 'jsonv2',
    limit: SEARCH_RESULT_LIMIT,
    addressdetails: '0',
  });

  return `${NOMINATIM_SEARCH_URL}?${params.toString()}`;
}

/**
 * Converts a raw Nominatim result into the app's coordinate shape.
 * @param result Candidate result from the Nominatim response.
 * @returns Valid geocoding result, or undefined when required fields are missing.
 * @throws Does not throw.
 * @sideEffects None.
 */
function toGeocodingResult(result: unknown): GeocodingResult | undefined {
  if (!isNominatimSearchResult(result)) {
    return undefined;
  }

  const latitude = Number(result.lat);
  const longitude = Number(result.lon);

  if (!isValidCoordinate(latitude, longitude)) {
    return undefined;
  }

  return {
    latitude,
    longitude,
    displayName: result.display_name,
  };
}

/**
 * Checks the subset of Nominatim fields needed by Stargazer.
 * @param result Unknown JSON value from the search response.
 * @returns True when the value has string latitude, longitude, and label fields.
 * @throws Does not throw.
 * @sideEffects None.
 */
function isNominatimSearchResult(result: unknown): result is NominatimSearchResult {
  if (typeof result !== 'object' || result === null) {
    return false;
  }

  const candidate = result as Record<string, unknown>;

  return typeof candidate.lat === 'string'
    && typeof candidate.lon === 'string'
    && typeof candidate.display_name === 'string';
}
