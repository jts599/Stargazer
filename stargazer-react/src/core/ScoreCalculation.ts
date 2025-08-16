import type { ICelectialDefinition,ICelestialDay,IMoonFunctionDefinition } from "./interfaces";
import { isNullOrEmpty } from "./helpers";


function calculateConstants(moon: ICelectialDefinition | undefined, nextDayMoon: ICelectialDefinition | undefined): IMoonFunctionDefinition | undefined {
    const results: IMoonFunctionDefinition = {};
    if (!moon?.rise || !moon?.set) {
        return undefined; // Not enough data to calculate
    }
    if (nextDayMoon && !isNullOrEmpty(nextDayMoon?.rise)) {
        results.MoonPeriod = (nextDayMoon.rise + (24*60))- moon.rise;
    }
    else {
        results.MoonPeriod = 24*60 + 50 //appx 24 hours in minutes + 50 minutes for the moon to rise again
    }
    const set = moon?.set < moon?.rise ? moon.set + (24 * 60) : moon.set; // Adjust set time if it is before rise time
    results.MoonWidth = (set ?? 0) - (moon.rise ?? 0);
    const insideSin = 0.5*((Math.PI*results.MoonWidth)/(0.5*results.MoonPeriod) - Math.PI);
    results.hConstant = Math.sin(insideSin)
    const phaseShiftSubtractor = (Math.PI * moon.rise) / (0.5 * results.MoonPeriod);
    results.phaseShift = (-1*Math.asin(results.hConstant)) - phaseShiftSubtractor;
    return results
}


const getValueAtTime = (time: number, constants: IMoonFunctionDefinition): number => {
    if (!constants.MoonPeriod || !constants.hConstant || !constants.phaseShift) {
        return 0; // Not enough data to calculate
    }
    const insideSin = (Math.PI * time) / (0.5 * constants.MoonPeriod) + constants.phaseShift;
    return Math.sin(insideSin) + constants.hConstant;
}


function integrate(start: number, end: number, constants: IMoonFunctionDefinition): number {
    const step = 1; // Integration step in minutes
    let sum = 0;
    if (end <= start) {
        let temp = end;
        end = start
        start = temp; // Ensure start is less than end
    }

    for (let t = start; t <= end; t += step) {
        const value = getValueAtTime(t, constants);
        if (value < 0) {
            continue; // Skip negative values
        }
        sum += value;
    }
    return sum * step; // Multiply by the step size to get the area
}


export function scoreDay(day:ICelestialDay, nextDay: ICelestialDay | undefined): void {
    if (!day.sun || !day.moon) {
        __setDefaultScores(day);
        return; // Not enough data to calculate
    }
    const month = day.date.getMonth();
    const dayOfMonth = day.date.getDate();
    if (dayOfMonth === 20 && month === 4) {
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

function __setDefaultScores(day: ICelestialDay): void {
    day.stargazingScore = undefined;
    day.moonFunctionConstants = undefined;
}



