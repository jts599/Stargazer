/**
 * StargazingDate.ts
 * This module defines the structure and functions related to stargazing dates.
 */

import type { ICelestialDay } from "./interfaces";

/**
 * IStargazingDate represents the stargazing properties for a specific date.
 */
export interface IStargazingDate {
    celestialDay?: ICelestialDay;
    stargazingScore: number;
};


