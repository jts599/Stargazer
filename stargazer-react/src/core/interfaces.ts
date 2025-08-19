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
 * ICelestialDay represents the celestial definitions for a specific day,
 */
export interface ICelestialDay {
    date: Date;
    sun?: ICelectialDefinition;
    moon?: ICelectialDefinition;
    illuminationPercentage?: number;
    moonFunctionConstants?: IMoonFunctionDefinition;
    stargazingScore?: number; // Score for the day based on celestial events
    
};


export interface IMoonFunctionDefinition {
    MoonPeriod?: number;
    MoonWidth?: number; //Moonset - Moonrise
    hConstant?: number; //Moonrise - Noon
    phaseShift?: number;
}

