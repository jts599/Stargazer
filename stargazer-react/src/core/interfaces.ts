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

export type CelestialBody = typeof CelestialBody[keyof typeof CelestialBody];

export type MinutesSinceNoon = number;
/**
 * ICelestialDefinition represents the rise and set times of celestial bodies.
 * It includes the hour and minute for both rise and set times.
 */
export interface ICelectialDefinition {
    rise?: MinutesSinceNoon
    set?: MinutesSinceNoon
};

/**
 * ICelestialDay represents the celestial conditions for a specific day,
 */
export interface ICelestialDay {
    date: Date;
    sun?: ICelectialDefinition;
    moon?: ICelectialDefinition;
    illuminationPercentage?: number;
    moonFunctionConstants?: IMoonFunctionDefinition;
    stargazingScore?: number; // Score for the day based on celestial events
    percentileScore?: number; // Percentile score compared to other days
    
};

export interface IMoonPeriod {
    moonRise:number;
    moonFunctionConstants: IMoonFunctionDefinition;
}


export interface IMoonFunctionDefinition {
    MoonPeriod?: number;
    MoonWidth?: number; //Moonset - Moonrise
    hConstant?: number; //Moonrise - Noon
    phaseShift?: number;
}

export interface IMoonDateProps {
    illuminationPercentage: number;
    waxingOrWaning: WaxingOrWaning;
}

export interface ISunDateProps {
    civilTwilight: IRiseSet;
    sunriseSunset: IRiseSet;
    nauticalTwilight: IRiseSet;
    astronomicalTwilight: IRiseSet;
}

export interface IRiseSet {
    rise: Date;
    set: Date;
}

export interface IIlluminationDate {
    year: number;
    month: number;
    day: number;
    moonProps: IMoonDateProps;
    sunProps?: ISunDateProps
}

export type WaxingOrWaning = "Waxing" | "Waning" | "Unknown";
export const WaxingOrWaning = {
    Waxing: "Waxing" as WaxingOrWaning,
    Waning: "Waning" as WaxingOrWaning,
    Unknown: "Unknown" as WaxingOrWaning,
};

