import type { ICelestialDay, ICelectialDefinition, IMoonCycle, IMoonFunctionDefinition } from "./interfaces";

const VIEWING_WINDOW_MS = 3 * 60 * 60 * 1000;
const INTEGRATION_STEP_MS = 60 * 1000;
const MS_PER_MINUTE = 60000;

/**
 * Scores a day by integrating moon presence during the first three hours after sunset.
 * @param day Day record with sun set time and illumination data.
 * @param moonCycles Moonrise-to-moonrise cycles surrounding the day.
 * @param viewingBoundary Rise/set pair whose set event starts the viewing window.
 * @returns Nothing; score fields are written directly onto the day record.
 * @sideEffects Mutates day.stargazingScore and day.moonFunctionConstants.
 */
export function scoreDay(day: ICelestialDay, moonCycles: IMoonCycle[], viewingBoundary: ICelectialDefinition | undefined = day.sun): void {
    if (!viewingBoundary?.set) {
        __setDefaultScores(day);
        return;
    }

    const startMs = viewingBoundary.set.getTime();
    const endMs = startMs + VIEWING_WINDOW_MS;
    const overlapCycles = moonCycles.filter(cycle => cycle.startRise.getTime() < endMs && cycle.endRise.getTime() > startMs);

    if (overlapCycles.length === 0) {
        __setDefaultScores(day);
        return;
    }

    day.moonFunctionConstants = __toMoonFunctionDefinition(overlapCycles[0]);
    day.stargazingScore = (day.illuminationPercentage ?? 0) * __integrateMoonPresence(startMs, endMs, overlapCycles);
}

/**
 * Integrates a simple moon-height curve over a viewing interval.
 * @param startMs UTC start time in milliseconds.
 * @param endMs UTC end time in milliseconds.
 * @param moonCycles Moon cycles that overlap the interval.
 * @returns Approximate moon presence area in minute units.
 * @sideEffects None.
 */
function __integrateMoonPresence(startMs: number, endMs: number, moonCycles: IMoonCycle[]): number {
    let sum = 0;

    for (let timeMs = startMs; timeMs <= endMs; timeMs += INTEGRATION_STEP_MS) {
        const cycle = moonCycles.find(c => c.startRise.getTime() <= timeMs && c.endRise.getTime() > timeMs);
        if (!cycle) {
            continue;
        }
        sum += __moonHeightAt(timeMs, cycle);
    }

    return sum * (INTEGRATION_STEP_MS / MS_PER_MINUTE);
}

/**
 * Estimates normalized moon height for a cycle at one instant.
 * @param timeMs UTC instant in milliseconds.
 * @param cycle Moonrise-to-moonrise cycle that contains the instant.
 * @returns Height clamped to the visible half of the sine curve.
 * @sideEffects None.
 */
function __moonHeightAt(timeMs: number, cycle: IMoonCycle): number {
    const phase = ((timeMs - cycle.startRise.getTime()) % cycle.periodMs) / cycle.periodMs;
    const height = Math.sin(phase * 2 * Math.PI);
    return Math.max(0, height);
}

/**
 * Converts an internal moon cycle to debug/display metadata.
 * @param cycle Moon cycle used during scoring.
 * @returns Public moon function definition in minute units.
 * @sideEffects None.
 */
function __toMoonFunctionDefinition(cycle: IMoonCycle): IMoonFunctionDefinition {
    return {
        cycleStart: cycle.startRise,
        cycleEnd: cycle.endRise,
        periodMinutes: cycle.periodMs / MS_PER_MINUTE,
        visibleDurationMinutes: cycle.visibleDurationMs ? cycle.visibleDurationMs / MS_PER_MINUTE : undefined,
    };
}

/**
 * Clears score fields when the day does not have enough data.
 * @param day Day record to reset.
 * @returns Nothing.
 * @sideEffects Mutates day.stargazingScore and day.moonFunctionConstants.
 */
function __setDefaultScores(day: ICelestialDay): void {
    day.stargazingScore = undefined;
    day.moonFunctionConstants = undefined;
}
