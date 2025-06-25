import type { ICelectialDefinition } from "./interfaces";
import { isNullOrEmpty } from "./helpers";

interface IMoonFunctionDefinition {
    MoonPeriod?: number;
    MoonWidth?: number; //Moonset - Moonrise
    hConstant?: number; //Moonrise - Noon
    phaseShift?: number;
}

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
   
    results.MoonWidth = (moon.set ?? 0) - (moon.rise ?? 0);
    const insideSin = 0.5*((Math.PI*results.MoonWidth)/(0.5*results.MoonPeriod) - Math.PI);
    results.hConstant = Math.sin(insideSin)
    const phaseShiftSubtractor = (Math.PI * moon.rise) / (0.5 * results.MoonPeriod);
    results.phaseShift = (-1*Math.asin(results.hConstant)) - phaseShiftSubtractor;
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
    for (let t = start; t <= end; t += step) {
        const value = getValueAtTime(t, constants);
        if (value < 0) {
            continue; // Skip negative values
        }
        sum += value;
    }
    return sum * step; // Multiply by the step size to get the area
}


export function scoreDay(sun: ICelectialDefinition | undefined, moon: ICelectialDefinition | undefined, nextDayMoon: ICelectialDefinition | undefined): number {
    const constants = calculateConstants(moon, nextDayMoon);
    if (!constants) {
        return 0; // Not enough data to calculate
    }
    const start = sun?.set ?? 8*24 //Default to 8 pm if no set time
    const end = sun?.rise ?? 18 * 60; // Default to 6 am if no rise time
    return integrate(start, end, constants);
}


