import { formatUtcInstantForTimezone } from "../../core/helpers";
import type { ICelestialDay } from "../../core/interfaces";
import React from "react";
import { Moon } from "../Moon/Moon";
import "../../components/Moon/Moon.css";
import "./DateInfoDisplayChip.css";

const PERCENT_SCALE = 100;
const RGB_CHANNEL_MAX = 255;
const MIN_SCORE_CHANNEL = 34;

export interface DateDisplayProps {
    celestialDay: ICelestialDay;
    isWaxing?: boolean;
}

/**
 * Renders detailed stargazing data for a selected day.
 * @param props Selected celestial day and optional moon waxing flag.
 * @returns Date information card with rise/set times, moon phase, and score.
 * @sideEffects None.
 */
export function DateInfoDisplayChip({ celestialDay, isWaxing }: DateDisplayProps): React.ReactElement {
    const date = new Date(celestialDay.date);
    const debug = false;
    const timezone = celestialDay.timezone;
    const illumination = PERCENT_SCALE * (celestialDay.illuminationPercentage ?? 0);

    const illumination255 = (celestialDay.percentileScore ?? 0) * RGB_CHANNEL_MAX / PERCENT_SCALE;
    const illuminationRed = Math.max((RGB_CHANNEL_MAX - illumination255), MIN_SCORE_CHANNEL);
    const illuminationGreen = Math.max(illumination255, MIN_SCORE_CHANNEL);

    const color = `rgb(${illuminationRed}, ${illuminationGreen}, 16)`;
    const backgroundColor = `rgba(${illuminationRed}, ${illuminationGreen}, 94, 0.1)`;
    const borderColor = `rgba(${illuminationRed}, ${illuminationGreen}, 94, 0.3)`;

    return (
        <div className="date-info-card">
            <div className="date-info-card-content">
                <div className="date-info-header">
                    {date.toLocaleDateString('en-US', { 
                        weekday: 'long', 
                        year: 'numeric', 
                        month: 'long', 
                        day: 'numeric' 
                    })}
                </div>
                <div className="date-info-top-row">
                    <div className="date-info-moon-section">
                        <div className="date-info-moon-phase-display">
                            <Moon 
                                illuminationPercentage={illumination}
                                size={80}
                                className="moon"
                            />
                            <div className="date-info-moon-phase-title">
                                {illumination?.toFixed(0)}% Illuminated
                            </div>
                            <div className="date-info-moon-phase-subtitle">
                                {isWaxing ? "(Waxing)" : "(Waning)"}
                            </div>
                        </div>
                    </div>
                

                    <div className="date-info-data-grid">
                        <div className="date-info-data-item">
                            <div className="date-info-label">Sunrise</div>
                            <div className="date-info-value">{formatUtcInstantForTimezone(celestialDay.sun?.rise, timezone)}</div>
                        </div>
                        
                        <div className="date-info-data-item">
                            <div className="date-info-label">Sunset</div>
                            <div className="date-info-value">{formatUtcInstantForTimezone(celestialDay.sun?.set, timezone)}</div>
                        </div>
                        
                        <div className="date-info-data-item">
                            <div className="date-info-label">Moonrise</div>
                            <div className="date-info-value">{formatUtcInstantForTimezone(celestialDay?.moon?.rise, timezone)}</div>
                        </div>
                        
                        <div className="date-info-data-item">
                            <div className="date-info-label">Moonset</div>
                            <div className="date-info-value">{formatUtcInstantForTimezone(celestialDay?.moon?.set, timezone)}</div>
                        </div>
                    </div>
                </div>

                <div className="date-info-score" style={{ backgroundColor: backgroundColor, border: `1px solid ${borderColor}` }}>
                        <div className="date-info-label" >Stargazing Score</div>
                        <div className="date-info-score-value" style={{ color: color }}>
                            {celestialDay?.percentileScore}
                        </div>
                    </div>
                </div>
                
                {debug && celestialDay.moonFunctionConstants && (
                    <div className="date-info-debug">
                        <div className="date-info-debug-title">Debug Info</div>
                        <div>Cycle Start: {formatUtcInstantForTimezone(celestialDay.moonFunctionConstants.cycleStart, timezone)}</div>
                        <div>Cycle End: {formatUtcInstantForTimezone(celestialDay.moonFunctionConstants.cycleEnd, timezone)}</div>
                        <div>Period: {celestialDay.moonFunctionConstants.periodMinutes}</div>
                        <div>Visible Duration: {celestialDay.moonFunctionConstants.visibleDurationMinutes}</div>
                    </div>
                )}

            </div>
    );
}
