// npm i sorted-btree
import BTree from 'sorted-btree';
import type { IIlluminationDate, IMoonFunctionDefinition } from './interfaces';
import { getValueAtTime } from './ScoreCalculation';
import type { INavyCelestialEvent } from './NavyDataLoader';
import { dateInMinutes, diffDate } from './helpers';


interface IMoonMath {
    //Date is the MoonRise time
    height: BTree<Date, IMoonFunctionDefinition>;

    //Date will be midnight on day of interest
    illumination: BTree<Date, number>;
}

/**
 * Get the composite brightness of the moon at a specific time.
 * @param moonMath MoonMath object to calculate from
 * @param date The date to get the composite brightness for
 * @returns The composite brightness of the moon at the specified time
 */
export function getCompositeBrightnessAtTime(moonMath: IMoonMath, date: Date): number {
    const height = getMoonHeightAtTime(moonMath, date);
    const illumination = getMoonIlluminationAtTime(moonMath, date);
    return height * illumination;
}

/**
 * Get the moon's height at a specific time.
 * @param moonMath MoonMath object to calculate from
 * @param date The date to get the height for
 * @returns The moon's height at the specified time
 */
export function getMoonHeightAtTime(moonMath: IMoonMath, date: Date): number {
    // Implement the logic to calculate the moon's height at the given time
    let functionDefs = moonMath.height.getPairOrNextLower(date);
    if (functionDefs === undefined) {
        functionDefs = moonMath.height.getPairOrNextHigher(date);
    }

    if (functionDefs === undefined) {
        return 0;
    }

    const mathConstants = functionDefs[1];
    return getValueAtTime(date, mathConstants);
}

/**
 * Get the moon's illumination at a specific time.
 * @param moonMath MoonMath object to calculate from
 * @param date The date to get the illumination for
 * @returns The moon's illumination at the specified time
 */
export function getMoonIlluminationAtTime(moonMath: IMoonMath, date: Date): number {
    // Implement the logic to calculate the moon's illumination at the given time
    let illumination = moonMath.illumination.getPairOrNextLower(date);
    if (illumination === undefined) {
        illumination = moonMath.illumination.getPairOrNextHigher(date);
    }

    if (illumination === undefined) {
        return 0;
    }

    return illumination[1];
}

/**
 * Build the moon math data structure from the provided moon and illumination data.
 * @param moonData The moon data events.
 * @param illuminationData The illumination data events.
 * @returns The constructed IMoonMath object.
 */
export function BuildMoonMath(moonData: INavyCelestialEvent[], illuminationData: IIlluminationDate[]) : IMoonMath {

    const height = new BTree<Date, IMoonFunctionDefinition>();
    const illumination = new BTree<Date, number>();

    for(let i = 0; i < moonData.length; i++) {
        const celestialEvent = moonData[i];
        if (celestialEvent.event === "Set") {
            continue;
        }
        const moonSet = moonData[i + 1];
        if (moonSet.event !== "Set") {
            continue; // Skip if the next event is not a set
        }
        const nextMoonRise = moonData[i + 2];
        if (nextMoonRise.event !== "Rise") {
            continue; // Skip if the next event is not a rise
        }
        const eventDate = new Date(celestialEvent.year, celestialEvent.month, celestialEvent.day);
        height.set(eventDate, calculateMoonFunctionDefinitions(celestialEvent, moonSet, nextMoonRise));
    }

    illuminationData.forEach(illuminationEvent => {
        const eventDate = new Date(illuminationEvent.year, illuminationEvent.month - 1, illuminationEvent.day);
        illumination.set(eventDate, illuminationEvent.illuminationPercentage);
    });

    return { height, illumination };
}


/**
 * Given a moon rise time, a moon set time, and the next day's moon rise time, Calculate the moon constants
 * @param moonRise Moon Rise
 * @param moonSet Moon Set
 * @param nextMoonRise Next Moon Rise
 * @returns a Moon function definition
 */
function calculateMoonFunctionDefinitions(moonRise:INavyCelestialEvent, moonSet:INavyCelestialEvent, nextMoonRise:INavyCelestialEvent) : IMoonFunctionDefinition {

    const moonRiseDate = new Date(moonRise.year, moonRise.month, moonRise.day, moonRise.hours, moonRise.minutes);
    const moonSetDate = new Date(moonSet.year, moonSet.month, moonSet.day, moonSet.hours, moonSet.minutes);
    const nextMoonRiseDate = new Date(nextMoonRise.year, nextMoonRise.month, nextMoonRise.day, nextMoonRise.hours, nextMoonRise.minutes);

    const duration = diffDate(moonSetDate, moonRiseDate);
    const period = diffDate(nextMoonRiseDate, moonSetDate);
   
    const results: IMoonFunctionDefinition = {
        MoonPeriod: period,
        MoonWidth: duration,
        hConstant: 0,
        phaseShift: 0
    };

    const moonRiseMins = dateInMinutes(moonRiseDate)

    const insideSin = 0.5*((Math.PI*duration)/(0.5*period) - Math.PI);
    results.hConstant = Math.sin(insideSin)
    const phaseShiftSubtractor = (Math.PI * moonRiseMins) / (0.5 * period);
    results.phaseShift = (-1*Math.asin(results.hConstant)) - phaseShiftSubtractor;


    return results;
}


