import axios from 'axios';
import * as cheerio from 'cheerio';
import { CelestialBody, type ICelestialDay, type IMoonCycle, type UtcInstant } from '../core/interfaces';
import { monthToNavyAbreviation } from './helpers';
import { addIlluminationDataToCelestialDays } from './NavyIlluminationDataLoader';
import { scoreDay } from './ScoreCalculation';

const NAVY_REQUEST_ID = "SG";
const NAVY_REQUEST_LABEL = "Gathered";
const NAVY_TIME_FIELD_WIDTH = 4;
const NAVY_MONTH_FIELD_WIDTH = 11;
const NAVY_SET_FIELD_OFFSET = 5;
const HOURS_TO_MS = 60 * 60 * 1000;

/**
 * Loads the raw Navy rise/set table for one celestial body and location.
 * @param body Celestial body or twilight table requested from the Navy endpoint.
 * @param year Four-digit calendar year to load.
 * @param latitude Latitude in decimal degrees; positive values are north.
 * @param longitude Longitude in decimal degrees; positive values are east.
 * @param timezone Fixed UTC offset in hours used by the Navy table.
 * @returns Raw text content from the Navy table's preformatted block.
 * @throws Propagates axios network errors and response parsing failures.
 * @sideEffects Performs an HTTP GET request to the Navy API.
 */
export async function LoadNavyDataRaw(body: CelestialBody, year: number, latitude: number, longitude: number, timezone: number): Promise<string> {
    const tzSign = timezone < 0 ? -1 : 1;
    const tz = Math.abs(timezone);
    const lat = latitude.toFixed(2);
    const lon = longitude.toFixed(2);
    const url = `https://aa.usno.navy.mil/calculated/rstt/year?ID=${NAVY_REQUEST_ID}&year=${year}&task=${body}&lat=${lat}&lon=${lon}&label=${NAVY_REQUEST_LABEL}&tz=${tz}&tz_sign=${tzSign}&submit=Get+Data`;
    const siteData = await axios.get(url);
    const $ = cheerio.load(siteData.data);
    const preElement = $('pre').text();
    return preElement;
}

/**
 * Builds scored celestial data for every day in a year.
 * @param year Four-digit calendar year to collect.
 * @param latitude Latitude in decimal degrees; positive values are north.
 * @param longitude Longitude in decimal degrees; positive values are east.
 * @param sunOption Navy table to use for the evening boundary; defaults to astronomical twilight.
 * @param timezone Fixed UTC offset in hours for the requested location.
 * @returns Ordered celestial day records with sun, moon, illumination, and score data.
 * @throws Propagates HTTP, Navy table parsing, illumination parsing, and scoring failures.
 * @sideEffects Performs multiple HTTP requests and mutates the created day records while enriching them.
 */
export async function CollectCelestialData(
    year: number,
    latitude: number,
    longitude: number,
    sunOption: CelestialBody = CelestialBody.AstronomicalTwilight,
    timezone = -6,
): Promise<ICelestialDay[]> {
    const [sunRaw, previousMoonRaw, moonRaw, nextMoonRaw] = await Promise.all([
        LoadNavyDataRaw(sunOption, year, latitude, longitude, timezone),
        LoadNavyDataRaw(CelestialBody.Moon, year - 1, latitude, longitude, timezone),
        LoadNavyDataRaw(CelestialBody.Moon, year, latitude, longitude, timezone),
        LoadNavyDataRaw(CelestialBody.Moon, year + 1, latitude, longitude, timezone),
    ]);
    const sunData = parseNavyTable(sunRaw);
    const previousYearMoonData = parseNavyTable(previousMoonRaw);
    const moonData = parseNavyTable(moonRaw);
    const nextYearMoonData = parseNavyTable(nextMoonRaw);
    const moonCycles = __buildMoonCycles([
        ...__toDatedMoonEvents(previousYearMoonData, year - 1, timezone),
        ...__toDatedMoonEvents(moonData, year, timezone),
        ...__toDatedMoonEvents(nextYearMoonData, year + 1, timezone),
    ]);
    const days: ICelestialDay[] = __setupCelestialEvents(year, timezone);

    for (const day of days) {
        __fillCelestialEvents(day, sunData, moonData, timezone);
    }
    await addIlluminationDataToCelestialDays(year, days, timezone); 
    __calculateStargazingScores(days, moonCycles);
    __normalizeStargazingScores(days);
    return days;
}

/**
 * Converts positive raw scores into an inverse percentile scale.
 * @param days Day records whose stargazingScore values have already been calculated.
 * @returns The same day array after percentileScore values are assigned.
 * @sideEffects Mutates each day.percentileScore.
 */
function __normalizeStargazingScores(days: ICelestialDay[]): ICelestialDay[] {
    const nonZeroScores = days.filter(day => day.stargazingScore !== undefined && day.stargazingScore > 0);
    if (nonZeroScores.length === 0) return days;
    for (const day of days) {
        if (day.stargazingScore !== undefined && day.stargazingScore > 0) {
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

/**
 * Applies moon-aware stargazing scores to each day.
 * @param days Day records to score.
 * @param moonCycles Chronological moonrise-to-moonrise cycles.
 * @returns The same day array after score fields are mutated.
 * @sideEffects Mutates stargazingScore and moonFunctionConstants on each day.
 */
function __calculateStargazingScores(days: ICelestialDay[], moonCycles: IMoonCycle[]): ICelestialDay[] {
    for (const day of days) {
        scoreDay(day, moonCycles);
    }
    return days;
}

/**
 * Creates empty day records for every local date in a year.
 * @param year Four-digit calendar year.
 * @param timezone Fixed UTC offset in hours associated with the records.
 * @returns One ICelestialDay per day in chronological order.
 * @sideEffects None.
 */
function __setupCelestialEvents(year: number, timezone: number): ICelestialDay[] {
    const days: ICelestialDay[] = [];
    let dayOfYear = 1;
    while (true) {
        const date = new Date(year, 0, dayOfYear);
        if (date.getFullYear() !== year) {
            break;
        }
        days.push({
            date: new Date(date),
            timezone,
        });
        dayOfYear++;
    }
    return days;
}

/**
 * Copies Navy rise/set rows onto a day as UTC instants.
 * @param day Day record to enrich.
 * @param sunEvents Parsed sun or twilight rows for the current year.
 * @param moonEvents Parsed moon rows for the current year.
 * @param timezone Fixed UTC offset in hours used by the Navy rows.
 * @returns The same day record after event fields are populated.
 * @sideEffects Mutates day.sun, day.moon, and day.illuminationPercentage.
 */
function __fillCelestialEvents(day: ICelestialDay, sunEvents: INavyCelestialEvent[], moonEvents: INavyCelestialEvent[], timezone: number): ICelestialDay {
    const sunEvent = getEventForDate(sunEvents, day.date);
    const moonEvent = getEventForDate(moonEvents, day.date);

    if (sunEvent) {
        day.sun = {
            rise: __tryGetUtcInstant(sunEvent.rise, day.date, timezone),
            set: __tryGetUtcInstant(sunEvent.set, day.date, timezone)
        };
    }

    if (moonEvent) {
        day.moon = {
            rise: __tryGetUtcInstant(moonEvent.rise, day.date, timezone),
            set: __tryGetUtcInstant(moonEvent.set, day.date, timezone)
        };
    }

    day.illuminationPercentage = 0;

    return day;
}

/**
 * Converts a Navy HHMM local clock value into a UTC Date.
 * @param time Navy time string in HHMM form, or null for no event.
 * @param date Local date associated with the time.
 * @param timezone Fixed UTC offset in hours.
 * @returns UTC instant for the local event, or undefined for empty/invalid input.
 * @sideEffects None.
 */
function __tryGetUtcInstant(time: string | null, date: Date, timezone: number): UtcInstant | undefined {
    if (!time) return undefined;
    const hours = parseInt(time.slice(0, 2), 10);
    const minutes = parseInt(time.slice(2, 4), 10);
    if (isNaN(hours) || isNaN(minutes)) return undefined;
    const localClockMs = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), hours, minutes);
    return new Date(localClockMs - timezone * HOURS_TO_MS);
}

/**
 * Converts parsed moon rows into dated UTC moon events.
 * @param events Parsed Navy moon rows.
 * @param year Calendar year represented by the rows.
 * @param timezone Fixed UTC offset in hours used by the rows.
 * @returns Dated moon events, excluding invalid month/day combinations.
 * @sideEffects None.
 */
function __toDatedMoonEvents(events: INavyCelestialEvent[], year: number, timezone: number): IDatedMoonEvent[] {
    return events.flatMap(event => {
        const monthIndex = __monthIndexFromNavyAbbreviation(event.month);
        if (monthIndex === undefined) return [];

        const localDate = new Date(year, monthIndex, event.day);
        if (localDate.getFullYear() !== year || localDate.getMonth() !== monthIndex) {
            return [];
        }

        return [{
            rise: __tryGetUtcInstant(event.rise, localDate, timezone),
            set: __tryGetUtcInstant(event.set, localDate, timezone)
        }];
    });
}

/**
 * Pairs consecutive moonrises with the set between them to describe cycles.
 * @param events Chronological or unsorted moon events with optional rise and set instants.
 * @returns Chronological moon cycles suitable for scoring.
 * @sideEffects None.
 */
function __buildMoonCycles(events: IDatedMoonEvent[]): IMoonCycle[] {
    const rises = events
        .map(event => event.rise)
        .filter((rise): rise is Date => rise !== undefined)
        .sort((a, b) => a.getTime() - b.getTime());
    const sets = events
        .map(event => event.set)
        .filter((set): set is Date => set !== undefined)
        .sort((a, b) => a.getTime() - b.getTime());
    const cycles: IMoonCycle[] = [];

    for (let i = 0; i < rises.length - 1; i++) {
        const startRise = rises[i];
        const endRise = rises[i + 1];
        const set = sets.find(candidate => candidate.getTime() > startRise.getTime() && candidate.getTime() < endRise.getTime());
        cycles.push({
            startRise,
            endRise,
            set,
            periodMs: endRise.getTime() - startRise.getTime(),
            visibleDurationMs: set ? set.getTime() - startRise.getTime() : undefined,
        });
    }

    return cycles;
}

/**
 * Converts Navy month abbreviations into JavaScript month indexes.
 * @param month Navy month label, with or without a trailing period.
 * @returns Month index from 0 to 11, or undefined for unknown labels.
 * @sideEffects None.
 */
function __monthIndexFromNavyAbbreviation(month: string): number | undefined {
    const normalizedMonth = month.replace('.', '');
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "June", "July", "Aug", "Sept", "Oct", "Nov", "Dec"];
    const index = months.indexOf(normalizedMonth);
    return index === -1 ? undefined : index;
}

/**
 * Finds the Navy row matching a local date.
 * @param events Parsed Navy rows.
 * @param date Local date to match.
 * @returns Matching row, or null when no row is available.
 * @sideEffects None.
 */
function getEventForDate(events: INavyCelestialEvent[], date: Date): INavyCelestialEvent | null {
    const month = monthToNavyAbreviation(date.getMonth());
    if (!month) return null;
    const day = date.getDate();
    return events.find(e => e.month === month && e.day === day) || null;
}

export interface INavyCelestialEvent {
    day: number;
    month: string;
    rise: string | null;
    set: string | null;
}

interface IDatedMoonEvent {
    rise?: UtcInstant;
    set?: UtcInstant;
}

/**
 * Parses the fixed-width Navy rise/set table into event rows.
 * @param raw Raw preformatted table text returned by LoadNavyDataRaw.
 * @returns Parsed events keyed by month abbreviation and day number.
 * @throws Error when the expected month header is missing.
 * @sideEffects None.
 */
export function parseNavyTable(raw: string): INavyCelestialEvent[] {
    const lines = raw.split('\n').map(l => l.trimEnd());
    const monthHeaderIdx = lines.findIndex(line => line.match(/Jan\./));
    if (monthHeaderIdx === -1) throw new Error("Month header not found");
    const months = lines[monthHeaderIdx].match(/[A-Za-z]+/g) || [];
    const dataLines = lines.slice(monthHeaderIdx + 2).filter(line => /^\d{2}/.test(line));
    const events: INavyCelestialEvent[] = [];
    for (const line of dataLines) {
        const day = parseInt(line.slice(0, 2), 10);
        const rest = line.slice(4);
        for (let m = 0; m < months.length; m++) {
            const riseStart = m * NAVY_MONTH_FIELD_WIDTH;
            const setStart = riseStart + NAVY_SET_FIELD_OFFSET;
            const rise = rest.slice(riseStart, riseStart + NAVY_TIME_FIELD_WIDTH).trim() || null;
            const set = rest.slice(setStart, setStart + NAVY_TIME_FIELD_WIDTH).trim() || null;
           
            if (!rise && !set) {
                continue;
            }

            events.push({
                day,
                month: months[m],
                rise: rise?.length ? rise : null,
                set: set?.length ? set : null,
            });
        }
    }
    return events;
}
