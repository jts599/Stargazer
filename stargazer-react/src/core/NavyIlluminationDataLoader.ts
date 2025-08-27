import { WaxingOrWaning, type ICelestialDay, type IIlluminationDate } from "./interfaces";
import axios from "axios";
import * as cheerio from "cheerio";

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
            day.illuminationPercentage = 0; // Default to 0 if no data found
        }
    }
}

async function __loadIlluminationDataRaw(year:number, timeShift: number) : Promise<IIlluminationDate[]> {
    const tzSign = timeShift < 0 ? -1 : 1;
    const tz = Math.abs(timeShift);
    const url = `https://aa.usno.navy.mil/calculated/moon/fraction?year=${year}&task=00&tz=${tz}&tz_sign=${tzSign}&tz_label=false&submit=Get+Data`;
    const site_data = await axios.get(url)
    const $ = cheerio.load(site_data.data);
    
    
    const months: string[] = [];

    const tableWithData = $('table').eq(1); // The second table contains the illumination data
    const rows = tableWithData.find('tr')
    // Find the header row with months
    rows.eq(1).find('td').each((i, el) => {
        if (i > 0) months.push($(el).text().replace('.', '').trim());
    });
    
    const results: IIlluminationDate[] = [];
    // Iterate over each data row
    rows.slice(2).each((_, row) => {
        const cells = $(row).find('td');
        if (cells.length === 0) return;
        const day = parseInt($(cells[0]).text(), 10);
        if (isNaN(day)) return;
        for (let i = 1; i < cells.length; i++) {
            const value = $(cells[i]).text().trim();
            if (value === '--') continue; // Skip empty cells
            results.push({
                year: year,
                month: (i-1),
                day,
                illuminationPercentage: parseFloat(value),
                waxingOrWaning: WaxingOrWaning.Unknown // Placeholder, real value can be set later
            });
        }
    });

    __fillWaxingOrWaning(results);
    return results;
}

/**
 * Fills the waxing or waning phase for each illumination date.
 * @param illuminationData The illumination data to process.
 */
function __fillWaxingOrWaning(illuminationData: IIlluminationDate[]): void {
    let lastWaxingWaning = WaxingOrWaning.Unknown;
    for (let i = 0; i < illuminationData.length; i++) {
        const thisDay = illuminationData[i].illuminationPercentage;
        const nextDay = (() => {
            let ii = i + 1;
            while (ii < illuminationData.length && illuminationData[ii].illuminationPercentage === thisDay) { ii++; }
            if (ii >= illuminationData.length) return undefined;
            return illuminationData[ii].illuminationPercentage;
        })();
        if (nextDay == undefined) {
            illuminationData[i].waxingOrWaning = lastWaxingWaning;
        } else {
            lastWaxingWaning = nextDay > thisDay ? WaxingOrWaning.Waxing : WaxingOrWaning.Waning;
            illuminationData[i].waxingOrWaning = lastWaxingWaning;
        }
    }
}

