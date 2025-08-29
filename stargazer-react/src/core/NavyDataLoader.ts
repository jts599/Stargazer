import axios from 'axios';
import * as cheerio from 'cheerio';
import { CelestialBody, type ICelestialDay, type MinutesSinceNoon } from '../core/interfaces';
import { minutesSinceNoon, monthToNavyAbreviation } from './helpers';
import { addIlluminationDataToCelestialDays } from './NavyIlluminationDataLoader';
import {scoreDay} from './ScoreCalculation';


/**
 * Loads raw data from the Navy API for a specific celestial body and year.
 * This will need to be parsed to extract the relevant information.
 * @param body Celestial body to load data for.
 * @param year Year to load data for.
 * @param longitude Longitude of the location.
 * @param latitude Latitude of the location.
 * @returns 
 */
export async function LoadNavyDataRaw(body: CelestialBody, year: number, latitude:number, longitude:number, timezone:number): Promise<string> {
    const tzSign = timezone < 0 ? -1 : 1; // Sign of the timezone offset
    const tz = Math.abs(timezone); // Absolute value of the timezone offset
    const id = "SG"
    const label = "Gathered"; // Label for the data
    const lat = latitude.toFixed(2); // Latitude formatted to 2 decimal places
    const lon = longitude.toFixed(2); // Longitude formatted to 2 decimal places
    // Construct the URL for the Navy API
    const url = `https://aa.usno.navy.mil/calculated/rstt/year?ID=${id}&year=${year}&task=${body}&lat=${lat}&lon=${lon}&label=${label}&tz=${tz}&tz_sign=${tzSign}&submit=Get+Data`;
    const site_data = await axios.get(url)
    const $ = cheerio.load(site_data.data);
    const preElement = $('pre').text();
    return preElement // Join the rows with newlines to return the raw data

}

export async function CollectCelestialData(year: number, latitude:number, longitude:number, sunOption: CelestialBody = CelestialBody.AstronomicalTwilight, timezone = -6 ) : Promise<ICelestialDay[]> {

    const civilTwilightData = parseNavyTable(await LoadNavyDataRaw(CelestialBody.CivilTwilight, year, latitude, longitude, timezone), year);
    const nauticalTwilightData = parseNavyTable(await LoadNavyDataRaw(CelestialBody.NauticalTwilight, year, latitude, longitude, timezone), year);
    const astroTwilightData = parseNavyTable(await LoadNavyDataRaw(CelestialBody.AstronomicalTwilight, year, latitude, longitude, timezone), year);
    const sunsetData = parseNavyTable(await LoadNavyDataRaw(CelestialBody.Sun, year, latitude, longitude, timezone), year);

    const sunData = (() => {
        switch (sunOption) {
            case CelestialBody.CivilTwilight:
                return civilTwilightData;
            case CelestialBody.NauticalTwilight:
                return nauticalTwilightData;
            case CelestialBody.AstronomicalTwilight:
                return astroTwilightData;
            default:
                return sunsetData;
        }
    })();

    const moonData = parseNavyTable(await LoadNavyDataRaw(CelestialBody.Moon, year, latitude, longitude,timezone),year);
    let days: ICelestialDay[] = __setupCelestialEvents(year);
    
    for (const day of days) {
        __fillCelestialEvents(day, sunData, moonData);
    }
    __fillInEmptyMoonEvents(days);
    await addIlluminationDataToCelestialDays(year, days, timezone); 
    __calculateStargazingScores(days);
    __normalizeStargazingScores(days);
    return days;
}

function __normalizeStargazingScores(days: ICelestialDay[]): ICelestialDay[] {
    const nonZeroScores = days.filter(day => day.stargazingScore !== undefined && day.stargazingScore > 0);
    if (nonZeroScores.length === 0) return days; // No valid scores to normalize
    for (const day of days) {
        if (day.stargazingScore !== undefined && day.stargazingScore > 0) {
            //This is not efficient but it is fast enough for now
            const rank = nonZeroScores.filter(d => (d.stargazingScore ?? 0) < (day.stargazingScore ?? 0)).length;
            const percentile = (rank / nonZeroScores.length) * 100;
            day.percentileScore = 100 - percentile;
        } else {
            day.percentileScore = 100;
        }
        day.percentileScore = Math.round(day.percentileScore);
    }
    return days;
}


function __calculateStargazingScores(days: ICelestialDay[]): ICelestialDay[] {
    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const nextDay = i < days.length - 1 ? days[i + 1] : undefined;
        scoreDay(day, nextDay);
    }
    return days;
}

function __setupCelestialEvents(year:number): ICelestialDay[] {
    const days: ICelestialDay[] = [];
    let dayOfyear = 1;
    while (true) {
        const date = new Date(year, 0, dayOfyear)
        if (date.getFullYear() !== year) {
            break; // Stop if we go past the end of the year
        }
        days.push({
            date: new Date(date)
        })
        dayOfyear++;
    }
    return days;
}
    
function __fillCelestialEvents(day:ICelestialDay, sunEvents: INavyCelestialEvent[], moonEvents: INavyCelestialEvent[]): ICelestialDay {
    const sunEvent = getEventForDate(sunEvents, day.date);
    const moonEvent = getEventForDate(moonEvents, day.date);

    if (sunEvent) {
        day.sun = {
            rise: __tryGetMinutesSinceNoon(sunEvent.rise),
            set: __tryGetMinutesSinceNoon(sunEvent.set)
        };
    }

    if (moonEvent) {
        day.moon = {
            rise: __tryGetMinutesSinceNoon(moonEvent.rise),
            set: __tryGetMinutesSinceNoon(moonEvent.set)
        };
    }

    day.illuminationPercentage = 0;

    return day;
}

function __fillInEmptyMoonEvents(days: ICelestialDay[]): void {
    for (let i = 0; i < days.length; i++) {
        const day = days[i];
        const prevDay = i > 0 ? days[i - 1] : null;
        const nextDay = i < days.length - 1 ? days[i + 1] : null;
        if (!day.moon) {
            day.moon = {};
        }

        if (!day.moon.rise){
            day.moon.rise = __estimateMoonTime(prevDay?.moon?.rise, nextDay?.moon?.rise);
        }

        if (!day.moon.set) {
            day.moon.set = __estimateMoonTime(prevDay?.moon?.set, nextDay?.moon?.set);
        }
    }
}


const EstimationMode = {
    average: 0,
    nextDay: 1
} as const;
type EstimationMode = typeof EstimationMode[keyof typeof EstimationMode];

function __estimateMoonTime(prevDay: MinutesSinceNoon | undefined, nextDay: MinutesSinceNoon | undefined, estimationMode: EstimationMode = EstimationMode.nextDay): MinutesSinceNoon | undefined  {

    if (estimationMode === EstimationMode.nextDay) {
        return nextDay
    }

    if (!prevDay || !nextDay) return undefined; // No data to estimate from

    if (prevDay < 0) {
        prevDay += (24 * 60); // Adjust previous day to be in the same range as next day
        prevDay %= (24 * 60); // Ensure it wraps around correctly

    }

    if (nextDay < 0) {
        nextDay += (24 * 60); // Adjust next day to be in the same range as previous day
        nextDay %= (24 * 60); // Ensure it wraps around correctly
    }


    const result =  Math.floor((prevDay + nextDay) / 2) - (24 * 60); // Return average adjusted back to minutes since noon
    return __ensureMinutesSinceNoonProperSignage(result); // Ensure the result is in the correct range
}

function __ensureMinutesSinceNoonProperSignage(time: MinutesSinceNoon):MinutesSinceNoon {
    const abs = Math.abs(time);
    const sign = time < 0 ? -1 : 1; // Preserve the sign of the time

    if (abs > (24 * 60)) {
        time = sign * (abs % (24*60))
    }
    if(abs < (12*60)){
        return time; // No adjustment needed
    }

    const diff = abs - (12 * 60); // how far off from midnight it is
    const res = (12*60)-diff;   // how far off from noon it is
    return -1 * sign * res;     //make sure direction is correct
}

function __tryGetMinutesSinceNoon(time: string | null): MinutesSinceNoon | undefined{
    if (!time) return undefined;
    const hours = parseInt(time.slice(0, 2), 10);
    const minutes = parseInt(time.slice(2, 4), 10);
    if (isNaN(hours) || isNaN(minutes)) return undefined;
    return minutesSinceNoon(hours, minutes);
}

function getEventForDate(events: INavyCelestialEvent[], date: Date): INavyCelestialEvent | null  {
    const month = date.getMonth();
    if (!month) return null; // Invalid month
    const day = date.getDate();
    return events.find(e => e.month === month && e.day === day) || null;
}

export interface INavyCelestialEvent {
    year: number;
    day: number;
    month: number;
    hours: number;
    minutes: number;
    event: "Rise" | "Set";
}

export function parseNavyTable(raw: string, year:number): INavyCelestialEvent[] {
    const lines = raw.split('\n').map(l => l.trimEnd());
    // Find the header line with months
    const monthHeaderIdx = lines.findIndex(line => line.match(/Jan\./));
    if (monthHeaderIdx === -1) throw new Error("Month header not found");
    const months = lines[monthHeaderIdx].match(/[A-Za-z]+/g) || [];
    // Data starts after two more lines (header + column header)
    const dataLines = lines.slice(monthHeaderIdx + 2).filter(line => /^\d{2}/.test(line));
    const events: INavyCelestialEvent[] = [];
    for (const line of dataLines) {
        const day = parseInt(line.slice(0, 2), 10);
        let rest = line.slice(4);
        // Each month has two 4-char fields (rise/set), possibly blank
        for (let m = 0; m < months.length; m++) {
            const riseStart = m*11
            const setStart = riseStart + 5
            const rise = rest.slice(riseStart, riseStart+4).trim() || null;
            const set = rest.slice(setStart, setStart+4).trim() || null;

            if (rise !== null && rise !== "") {
                const [riseHours, riseMinutes] = __stringTimeToHoursAndMinutes(rise);
                events.push({
                    year,
                    day,
                    month: m,
                    hours: riseHours,
                    minutes: riseMinutes,
                    event: "Rise"
                });
            }

            if (set !== null && set !== "") {
                const [setHours, setMinutes] = __stringTimeToHoursAndMinutes(set);
                events.push({
                    year,
                    day,
                    month: m,
                    hours: setHours,
                    minutes: setMinutes,
                    event: "Set"
                });
            }
        }
    }
    return events;
}


/**
 * Converts string time to hours and minutes
 * @param time in format HHMM
 */
function __stringTimeToHoursAndMinutes(time: string): [number,number] {
    const hours = parseInt(time.slice(0, 2), 10);
    const minutes = parseInt(time.slice(2, 4), 10);
    return [hours, minutes];
}

