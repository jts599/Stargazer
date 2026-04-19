import type { ICelestialDay } from "./interfaces";

const NAVY_MONTH_ABBREVIATIONS = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"] as const;
const HOURS_TO_MS = 60 * 60 * 1000;

/**
 * Finds celestial data for the same local calendar day as the provided date.
 * @param date Local date to match.
 * @param celestialDays Candidate day records.
 * @returns Matching day record, or undefined when the date is not present.
 * @sideEffects None.
 */
export function matchCelestialDay(date: Date, celestialDays: ICelestialDay[]): ICelestialDay | undefined {
    return celestialDays.find(day => day.date.getFullYear() === date.getFullYear() &&
                                     day.date.getMonth() === date.getMonth() &&
                                     day.date.getDate() === date.getDate());
}

/**
 * Formats a UTC instant using the fixed offset that produced the Navy table.
 * @param instant UTC instant to display, or undefined when no event exists.
 * @param timezone Fixed UTC offset in hours.
 * @returns Local 12-hour clock string, or "No event" for missing/invalid instants.
 * @sideEffects None.
 */
export function formatUtcInstantForTimezone(instant: Date | undefined, timezone: number): string {
    if (!instant || isNaN(instant.getTime())) {
        return "No event";
    }

    const localTime = new Date(instant.getTime() + timezone * HOURS_TO_MS);
    const hours = localTime.getUTCHours();
    const mins = localTime.getUTCMinutes();
    const hour12 = hours % 12 || 12;
    const amPm = hours < 12 ? "AM" : "PM";
    return `${hour12.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')} ${amPm}`;
}
/**
 * Converts javaScript month index (0-11) to the Navy's month abbreviation.
 * @param month Month index from 0 to 11.
 * @returns Navy month abbreviation, or null when the index is out of range.
 * @sideEffects None.
 */
export function monthToNavyAbreviation(month: number): string | null {
    return NAVY_MONTH_ABBREVIATIONS[month] ?? null;
}


/**
 * Checks if a value is null, undefined, an empty string, an empty array, or an empty object.
 * @param value Value to check.
 * @returns True if the value is null, undefined, an empty string, an empty array, or an empty object; otherwise false.
 * @sideEffects None.
 */
export function isNullOrEmpty(value: unknown): boolean {
    if (value === null || value === undefined) {
        return true;
    }
    if (typeof value === 'string') {
        return value.trim() === '';
    }
    if (Array.isArray(value)) {
        return value.length === 0;
    }
    if (typeof value === 'object') {
        return Object.keys(value).length === 0;
    }
    return false;
}
