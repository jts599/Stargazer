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