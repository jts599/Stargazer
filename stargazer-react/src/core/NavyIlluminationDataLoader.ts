import type { ICelestialDay } from "./interfaces";
import axios from "axios";
import * as cheerio from "cheerio";

const ILLUMINATION_TABLE_INDEX = 1;
const ILLUMINATION_MONTH_HEADER_ROW = 1;
const ILLUMINATION_FIRST_DATA_ROW = 2;

interface IIlluminationDate {
    month: number;
    day: number;
    illuminationPercentage: number;
}

/**
 * Adds Navy moon illumination percentages to existing day records.
 * @param year Four-digit calendar year to load.
 * @param days Day records to enrich.
 * @param timeShift Fixed UTC offset in hours used by the Navy endpoint.
 * @returns Promise that resolves after all matching days have illumination values.
 * @throws Propagates axios network errors and HTML parsing failures.
 * @sideEffects Performs an HTTP request and mutates days.illuminationPercentage.
 */
export async function addIlluminationDataToCelestialDays(year: number, days: ICelestialDay[], timeShift: number): Promise<void> {
    const illuminationData = await __loadIlluminationDataRaw(year, timeShift);
    for (const day of days) {
        const date = day.date;
        const monthIndex = date.getMonth();
        const dayOfMonth = date.getDate();
        const illumination = illuminationData.find(d => d.month === monthIndex && d.day === dayOfMonth);
        if (illumination) {
            day.illuminationPercentage = illumination.illuminationPercentage;
        } else {
            day.illuminationPercentage = 0;
        }
    }
}

/**
 * Loads and parses the Navy moon illumination table.
 * @param year Four-digit calendar year to load.
 * @param timeShift Fixed UTC offset in hours used by the Navy endpoint.
 * @returns Parsed illumination values by zero-based month and day.
 * @throws Propagates axios network errors and malformed response access failures.
 * @sideEffects Performs an HTTP GET request to the Navy API.
 */
async function __loadIlluminationDataRaw(year: number, timeShift: number): Promise<IIlluminationDate[]> {
    const tzSign = timeShift < 0 ? -1 : 1;
    const tz = Math.abs(timeShift);
    const url = `https://aa.usno.navy.mil/calculated/moon/fraction?year=${year}&task=00&tz=${tz}&tz_sign=${tzSign}&tz_label=false&submit=Get+Data`;
    const siteData = await axios.get(url);
    const $ = cheerio.load(siteData.data);
    
    
    const months: string[] = [];

    const tableWithData = $('table').eq(ILLUMINATION_TABLE_INDEX);
    const rows = tableWithData.find('tr');
    rows.eq(ILLUMINATION_MONTH_HEADER_ROW).find('td').each((i, el) => {
        if (i > 0) months.push($(el).text().replace('.', '').trim());
    });

    const results: IIlluminationDate[] = [];
    rows.slice(ILLUMINATION_FIRST_DATA_ROW).each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length === 0) return;
        const day = parseInt($(cells[0]).text(), 10);
        if (isNaN(day)) return;
        for (let i = 1; i < cells.length; i++) {
            const value = $(cells[i]).text().trim();
            if (value === '--') continue;
            results.push({
                month: i - 1,
                day,
                illuminationPercentage: parseFloat(value),
            });
        }
    });

    return results;
}
