/**
 * Utilities for resolving map coordinates into timezone values used by Navy data.
 */
import timezoneLookup from 'tz-lookup';

const COORDINATE_FRACTION_DIGITS = 6;
const MIN_LATITUDE = -90;
const MAX_LATITUDE = 90;
const MIN_LONGITUDE = -180;
const MAX_LONGITUDE = 180;
const MONTH_INDEX_OFFSET = 1;
const MS_PER_MINUTE = 60 * 1000;
const MS_PER_HOUR = 60 * 60 * 1000;

/**
 * Confirms a coordinate pair is finite and within geographic bounds.
 * @param latitude Latitude in decimal degrees; required, finite, -90 through 90.
 * @param longitude Longitude in decimal degrees; required, finite, -180 through 180.
 * @returns True when both coordinate values can be used for map and timezone lookup.
 * @throws Does not throw.
 * @sideEffects None.
 */
export function isValidCoordinate(latitude: number, longitude: number): boolean {
  return Number.isFinite(latitude)
    && Number.isFinite(longitude)
    && latitude >= MIN_LATITUDE
    && latitude <= MAX_LATITUDE
    && longitude >= MIN_LONGITUDE
    && longitude <= MAX_LONGITUDE;
}

/**
 * Rounds coordinates before storage and display to avoid noisy geolocation precision.
 * @param coordinate Decimal-degree coordinate value; required and finite.
 * @returns Coordinate rounded to six decimal places.
 * @throws Does not throw.
 * @sideEffects None.
 */
export function roundCoordinate(coordinate: number): number {
  return Number(coordinate.toFixed(COORDINATE_FRACTION_DIGITS));
}

/**
 * Looks up the IANA timezone for a coordinate pair.
 * @param latitude Latitude in decimal degrees; required, finite, -90 through 90.
 * @param longitude Longitude in decimal degrees; required, finite, -180 through 180.
 * @returns IANA timezone identifier such as "America/Chicago", or undefined when invalid.
 * @throws Does not throw; lookup validation errors are converted to undefined.
 * @sideEffects None.
 */
export function getTimezoneIdForCoordinates(latitude: number, longitude: number): string | undefined {
  if (!isValidCoordinate(latitude, longitude)) {
    return undefined;
  }

  try {
    return timezoneLookup(latitude, longitude);
  } catch {
    return undefined;
  }
}

/**
 * Computes a numeric UTC offset for a named timezone at a specific instant.
 * @param timezoneId IANA timezone identifier; required.
 * @param date Date whose instant determines daylight-saving offset; required.
 * @returns Offset in hours east of UTC, or undefined when the timezone cannot be formatted.
 * @throws Does not throw; Intl failures are converted to undefined.
 * @sideEffects Uses Intl timezone formatting APIs.
 */
export function getTimezoneOffsetHours(timezoneId: string, date: Date): number | undefined {
  try {
    const parts = getTimezoneDateParts(timezoneId, date);
    const timezoneMs = Date.UTC(
      parts.year,
      parts.month - MONTH_INDEX_OFFSET,
      parts.day,
      parts.hour,
      parts.minute,
      parts.second,
    );

    return Math.round((timezoneMs - date.getTime()) / MS_PER_MINUTE) * MS_PER_MINUTE / MS_PER_HOUR;
  } catch {
    return undefined;
  }
}

interface TimezoneDateParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
  second: number;
}

/**
 * Formats an instant into numeric wall-clock parts for a specific timezone.
 * @param timezoneId IANA timezone identifier accepted by Intl.DateTimeFormat.
 * @param date Instant to format.
 * @returns Calendar and clock parts interpreted in the requested timezone.
 * @throws Throws when Intl cannot format the timezone or expected parts are missing.
 * @sideEffects Uses Intl timezone formatting APIs.
 */
function getTimezoneDateParts(timezoneId: string, date: Date): TimezoneDateParts {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: timezoneId,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
  const values = Object.fromEntries(
    formatter.formatToParts(date)
      .filter((part) => part.type !== 'literal')
      .map((part) => [part.type, Number(part.value)]),
  );

  return {
    year: requireNumber(values.year),
    month: requireNumber(values.month),
    day: requireNumber(values.day),
    hour: requireNumber(values.hour),
    minute: requireNumber(values.minute),
    second: requireNumber(values.second),
  };
}

/**
 * Returns a numeric Intl part or raises when formatting produced an invalid value.
 * @param value Parsed date-part value; required.
 * @returns The input value when it is finite.
 * @throws Error when the part is missing or not numeric.
 * @sideEffects None.
 */
function requireNumber(value: number): number {
  if (!Number.isFinite(value)) {
    throw new Error('Missing timezone date part.');
  }

  return value;
}
