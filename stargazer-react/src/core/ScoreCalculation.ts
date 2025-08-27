// Import necessary types and helper functions
import type { ICelectialDefinition, ICelestialDay, IMoonFunctionDefinition } from "./interfaces";
import { isNullOrEmpty } from "./helpers";

/**
 * Calculates constants for a sine wave simulating the moons movement for the day
 * @param moon - The moon's celestial definition for the current day.
 * @param nextDayMoon - The moon's celestial definition for the next day.
 * @returns An object containing constants for the moon's movement, or undefined if insufficient data is available.
 */
function calculateConstants(moon: ICelectialDefinition | undefined, nextDayMoon: ICelectialDefinition | undefined): IMoonFunctionDefinition | undefined {
    const results: IMoonFunctionDefinition = {};
    if (!moon?.rise || !moon?.set) {
        return undefined; // Not enough data to calculate
    }
    results.MoonPeriod = __calculateMoonPeriod(moon, nextDayMoon);
    const set = moon?.set < moon?.rise ? moon.set + (24 * 60) : moon.set; // Adjust set time if it is before rise time
    results.MoonWidth = (set ?? 0) - (moon.rise ?? 0);
    const insideSin = 0.5*((Math.PI*results.MoonWidth)/(0.5*results.MoonPeriod) - Math.PI);
    results.hConstant = Math.sin(insideSin)
    const phaseShiftSubtractor = (Math.PI * moon.rise) / (0.5 * results.MoonPeriod);
    results.phaseShift = (-1*Math.asin(results.hConstant)) - phaseShiftSubtractor;
    return results
}

/**
 * Calculates how long a moon cycle is based on next day's celestial definition.
 * @param moon - The moon's celestial definition for the current day.
 * @param nextDayMoon - The moon's celestial definition for the next day.
 * @returns The calculated moon period in minutes.
 */
function __calculateMoonPeriod(moon: ICelectialDefinition, nextDayMoon: ICelectialDefinition | undefined): number {
    if (nextDayMoon && !isNullOrEmpty(nextDayMoon?.rise) && !isNullOrEmpty(moon?.rise)) {
        let moonPeriod = (nextDayMoon.rise + (24 * 60)) - (moon.rise);
        if (moonPeriod < 120) {
            // If the moon period rolls over midnight, the sign flips and things get weird
            // When that happens, we will still get the amount of time between two moonrises, but it will be short a full day
            // Add a day to account for that when it happens. For now, we will detect this with a simple conditional, 
            // but it feels like there could be something more robust to do
            moonPeriod += (24 * 60); 
        }
        return moonPeriod;
    } else {
        return 24 * 60 + 50; // Approx. 24 hours in minutes + 50 minutes for the moon to rise again
    }
}

/**
 * Calculates the value of the moon's height in the sky at a specific time.
 * @param time - The time in minutes since midnight.
 * @param constants - The constants for the moon's movement.
 * @returns The sine value representing the moon's height at the given time.
 */
const __getValueAtTime = (time: number, constants: IMoonFunctionDefinition): number => {
    if (!constants.MoonPeriod || !constants.hConstant || !constants.phaseShift) {
        return 0; // Not enough data to calculate
    }
    const insideSin = (Math.PI * time) / (0.5 * constants.MoonPeriod) + constants.phaseShift;
    return Math.sin(insideSin) + constants.hConstant;
};

/**
 * Calculates the value of the moon's height in the sky at a specific time.
 * @param date - The date object representing the time.
 * @param constants - The constants for the moon's movement that apply for the given time.
 * @returns The sine value representing the moon's height at the given time.
 */
export const getValueAtTime = (date: Date, constants: IMoonFunctionDefinition): number => {
    const time = date.getTime()
    return __getValueAtTime(time, constants);
}

/**
 * Integrates the moon's movement over a specified time range.
 * @param start - The start time in minutes since midnight.
 * @param end - The end time in minutes since midnight.
 * @param constants - The constants for the moon's movement.
 * @returns The integrated value over the time range.
 */
function integrate(start: number, end: number, constants: IMoonFunctionDefinition): number {
    const step = 1; // Integration step in minutes
    let sum = 0;
    if (end <= start) {
        let temp = end;
        end = start
        start = temp; // Ensure start is less than end
    }

    for (let t = start; t <= end; t += step) {
        const value = __getValueAtTime(t, constants);
        if (value < 0) {
            continue; // Skip negative values
        }
        sum += value;
    }
    return sum * step; // Multiply by the step size to get the area
}

/**
 * Calculates the stargazing score for a specific day.
 * @param day - The celestial day for which the score is calculated.
 * @param nextDay - The celestial day for the next day.
 * @returns void. Updates the stargazing score and moon function constants in the day object.
 */
export function scoreDay(day: ICelestialDay, nextDay: ICelestialDay | undefined): void {
    if (!day.sun || !day.moon) {
        __setDefaultScores(day);
        return; // Not enough data to calculate
    }
    const month = day.date.getMonth();
    const dayOfMonth = day.date.getDate();
    if (dayOfMonth === 18 && month === 6) {
        console.log("Loading");
    }
    const constants = calculateConstants(day.moon, nextDay?.moon);
    day.moonFunctionConstants = constants;
    if (!constants) {
        __setDefaultScores(day);
        return; // Not enough data to calculate
    }
    const start = day.sun.set ?? 8 * 24; // Default to 8 pm if no set time
    const end = start + 3 * 60; // 3 hours after sunset in minutes

    day.stargazingScore = (day.illuminationPercentage ?? 0) * integrate(start, end, constants)
}

/**
 * Sets default scores for a celestial day.
 * @param day - The celestial day object to update.
 * @returns void. Updates the stargazing score and moon function constants in the day object.
 */
function __setDefaultScores(day: ICelestialDay): void {
    day.stargazingScore = undefined;
    day.moonFunctionConstants = undefined;
}



