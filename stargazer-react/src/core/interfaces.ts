/**
 * Type of data to load from the Navy API.
 */
export const CelestialBody = {
    Sun: 0,
    Moon: 1,
    CivilTwilight: 2,
    NauticalTwilight: 3,
    AstronomicalTwilight: 4,
} as const;

/**
 * Numeric Navy API task identifier for a celestial body or twilight table.
 */
export type CelestialBody = typeof CelestialBody[keyof typeof CelestialBody];

/**
 * UTC Date used for celestial rise and set events.
 */
export type UtcInstant = Date;

/**
 * User-selected observing location, fixed timezone offset, and optional IANA zone.
 */
export interface IStargazerLocation {
    latitude: number;
    longitude: number;
    timezone: number;
    timezoneId?: string;
}

/**
 * ICelestialDefinition represents the rise and set times of celestial bodies.
 * Values are optional because the Navy tables omit events on some dates.
 */
export interface ICelectialDefinition {
    rise?: UtcInstant;
    set?: UtcInstant;
}

/**
 * Celestial and scoring data for one local calendar day.
 */
export interface ICelestialDay {
    date: Date;
    timezone: number;
    sun?: ICelectialDefinition;
    civilTwilight?: ICelectialDefinition;
    nauticalTwilight?: ICelectialDefinition;
    astronomicalTwilight?: ICelectialDefinition;
    moon?: ICelectialDefinition;
    illuminationPercentage?: number;
    moonCycle?: IMoonFunctionDefinition;
    moonCycles?: IMoonFunctionDefinition[];
    moonFunctionConstants?: IMoonFunctionDefinition;
    stargazingScore?: number;
    percentileScore?: number;
}

/**
 * Debug/display metadata for the moon cycle selected during scoring.
 */
export interface IMoonFunctionDefinition {
    cycleStart: UtcInstant;
    cycleEnd: UtcInstant;
    periodMinutes: number;
    visibleDurationMinutes?: number;
}

/**
 * Moonrise-to-moonrise cycle used to estimate moon presence in the sky.
 */
export interface IMoonCycle {
    startRise: UtcInstant;
    endRise: UtcInstant;
    set?: UtcInstant;
    periodMs: number;
    visibleDurationMs?: number;
}
