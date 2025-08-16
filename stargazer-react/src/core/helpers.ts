import type { ICelestialDay } from "./interfaces";

/**
 * This function calculates the total minutes since noon (12:00 PM).
 * @param hour - The hour of the day (0-23).
 * @param minute - The minute of the hour (0-59).
 * @returns how many minutes have passed since noon.
 *          Returns a negative value if the time is before noon.
 */
export function minutesSinceNoon(hour: number, minute: number): number {
    // Calculate the total minutes since noon
    return (hour * 60 + minute) - (12 * 60);
};

export function matchCelestialDay(date: Date, celestialDays: ICelestialDay[]): ICelestialDay | undefined {
    // Find the celestial day that matches the given date
    return celestialDays.find(day => day.date.getFullYear() === date.getFullYear() &&
                                     day.date.getMonth() === date.getMonth() &&
                                     day.date.getDate() === date.getDate());
}

/**
 * Converts minutes since noon to a formatted string.
 * @param minutes - The number of minutes since noon (can be negative for times before noon).
 * @returns ""HH:MM AM/PM"" formatted string representing the time.
 */
export function formatMinutesSinceNoon(minutes: number | undefined): string {
    
    if (minutes === undefined || isNaN(minutes)) {
        return "Invalid time";
    }

    // Convert minutes since noon to hours and minutes
    const date = dateFromMinutesSinceNoon(minutes);
    const hours = date.getHours();
    const mins = date.getMinutes();
    

    // Format the output
    // If minutes < 0, it's before noon (AM)
    // If minutes >= 0, it's after noon (PM)
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
}
/**
 * Converts javaScript month index (0-11) to the Navy's month abbreviation.
 * @param month Month index (0-11)
 * @returns How the navy reports the month as an abbreviation.
 */
export function monthToNavyAbreviation(month: number): string | null {
    switch (month) {
        case 0: return "Jan";
        case 1: return "Feb";
        case 2: return "Mar";
        case 3: return "Apr";
        case 4: return "May";
        case 5: return "June";
        case 6: return "July";
        case 7: return "Aug";
        case 8: return "Sep";
        case 9: return "Oct";
        case 10: return "Nov";
        case 11: return "Dec";
    }
    return null;
}


function dateFromMinutesSinceNoon(minutes: number): Date {
    // Calculate the date based on minutes since noon
        minutes = minutes + (12 * 60); // Adjust to get the actual time
        minutes = minutes % (24 * 60); // Wrap around if it exceeds 24 hours
    const now = new Date();
    const hours = Math.floor(minutes / 60);
    minutes = minutes % 60;
    const date = new Date(now.getFullYear(), now.getMonth(), now.getDate(),hours, minutes);
    return date;
}

/**
 * Checks if a value is null, undefined, an empty string, an empty array, or an empty object.
 * @param value The value to check.
 * @returns True if the value is null, undefined, an empty string, an empty array, or an empty object; otherwise false.
 */
export function isNullOrEmpty(value: any): value is Exclude<any, (null | undefined)> {
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