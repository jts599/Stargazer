import { formatUtcInstantForTimezone } from "../../core/helpers";
import type { ICelestialDay } from "../../core/interfaces";
import React from "react";
import { Moon } from "../Moon/Moon";
import { DayTimelineChart } from "./DayTimelineChart";
import "../../components/Moon/Moon.css";
import "./DateInfoDisplayChip.css";

const PERCENT_SCALE = 100;
const RGB_CHANNEL_MAX = 255;
const MIN_SCORE_CHANNEL = 34;

export interface DateDisplayProps {
    celestialDay: ICelestialDay;
    isWaxing?: boolean;
    onNextDay?: () => void;
    onPreviousDay?: () => void;
}

/**
 * Renders detailed stargazing data for a selected day.
 * @param props Selected celestial day and optional moon waxing flag.
 * @returns Date information card with rise/set times, moon phase, and score.
 * @sideEffects None.
 */
export function DateInfoDisplayChip({ celestialDay, isWaxing, onNextDay, onPreviousDay }: DateDisplayProps): React.ReactElement {
    const date = new Date(celestialDay.date);
    const debug = false;
    const timezone = celestialDay.timezone;
    const illumination = PERCENT_SCALE * (celestialDay.illuminationPercentage ?? 0);
    const weekdayText = date.toLocaleDateString('en-US', { weekday: 'long' });
    const dateText = date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    const illumination255 = (celestialDay.percentileScore ?? 0) * RGB_CHANNEL_MAX / PERCENT_SCALE;
    const illuminationRed = Math.max((RGB_CHANNEL_MAX - illumination255), MIN_SCORE_CHANNEL);
    const illuminationGreen = Math.max(illumination255, MIN_SCORE_CHANNEL);

    const color = `rgb(${illuminationRed}, ${illuminationGreen}, 16)`;
    const backgroundColor = `rgba(${illuminationRed}, ${illuminationGreen}, 94, 0.1)`;
    const borderColor = `rgba(${illuminationRed}, ${illuminationGreen}, 94, 0.3)`;

    return (
        <div className="date-info-card">
            <div className="date-info-card-content">
                <div
                    className="date-info-score-badge"
                    aria-label={`Stargazing score ${celestialDay?.percentileScore ?? "No score"}`}
                    tabIndex={0}
                    style={{ backgroundColor: backgroundColor, border: `1px solid ${borderColor}`, color: color }}
                >
                    {celestialDay?.percentileScore}
                    <div className="date-info-score-tooltip">Stargazing Score</div>
                </div>
                <div className="date-info-header">
                    <button
                        className="date-info-day-nav"
                        type="button"
                        aria-label="Previous day"
                        onClick={onPreviousDay}
                    >
                        &lt;
                    </button>
                    <div className="date-info-header-main">
                        <div className="date-info-date-text">
                            <div className="date-info-weekday">{weekdayText}</div>
                            <div className="date-info-calendar-date">{dateText}</div>
                        </div>
                    </div>
                    <button
                        className="date-info-day-nav"
                        type="button"
                        aria-label="Next day"
                        onClick={onNextDay}
                    >
                        &gt;
                    </button>
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

                    <DayTimelineChart celestialDay={celestialDay} />
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
