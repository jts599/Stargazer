import { formatMinutesSinceNoon } from "../../core/helpers";
import type { ICelestialDay } from "../../core/interfaces";
import React from "react";
import { Moon } from "../Moon/Moon";
import "../../components/Moon/Moon.css";
import "./DateInfoDisplayChip.css";

export interface DateDisplayProps {
    celestialDay: ICelestialDay;
    isWaxing?: boolean;
}

export function DateInfoDisplayChip({ celestialDay, isWaxing }: DateDisplayProps): React.ReactElement {
    const date = new Date(celestialDay.date);
    const debug = false;
    const illumination = 100 * (celestialDay.illuminationPercentage ?? 0);

    const illumination255 = (celestialDay.stargazingScore ?? 0) * 255 / 100;
    const illuminationRed = Math.max((255-illumination255), 34);
    const illuminationGreen = Math.max(illumination255, 34);

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
                            <div className="date-info-value">{formatMinutesSinceNoon(celestialDay.sun?.rise)}</div>
                        </div>
                        
                        <div className="date-info-data-item">
                            <div className="date-info-label">Sunset</div>
                            <div className="date-info-value">{formatMinutesSinceNoon(celestialDay.sun?.set)}</div>
                        </div>
                        
                        <div className="date-info-data-item">
                            <div className="date-info-label">Moonrise</div>
                            <div className="date-info-value">{formatMinutesSinceNoon(celestialDay?.moon?.rise)}</div>
                        </div>
                        
                        <div className="date-info-data-item">
                            <div className="date-info-label">Moonset</div>
                            <div className="date-info-value">{formatMinutesSinceNoon(celestialDay?.moon?.set)}</div>
                        </div>
                    </div>
                </div>

                <div className="date-info-score" style={{ backgroundColor: backgroundColor, border: `1px solid ${borderColor}` }}>
                        <div className="date-info-label" >Stargazing Score</div>
                        <div className="date-info-score-value" style={{ color: color }}>
                            {celestialDay.stargazingScore?.toFixed(1)}
                        </div>
                    </div>
                </div>
                
                {debug && celestialDay.moonFunctionConstants && (
                    <div className="date-info-debug">
                        <div className="date-info-debug-title">Debug Info</div>
                        <div>Moon Period: {celestialDay.moonFunctionConstants.MoonPeriod}</div>
                        <div>Moon Width: {celestialDay.moonFunctionConstants.MoonWidth}</div>
                        <div>h Constant: {celestialDay.moonFunctionConstants.hConstant}</div>
                        <div>Phase Shift: {celestialDay.moonFunctionConstants.phaseShift}</div>
                    </div>
                )}

            </div>
    );
}
