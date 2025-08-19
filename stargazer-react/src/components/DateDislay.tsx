import { formatMinutesSinceNoon } from "../core/helpers";
import type { ICelestialDay } from "../core/interfaces";
import React from "react";
import { Moon } from "./Moon/Moon";
import "../components/Moon/Moon.css";

export interface DateDisplayProps {
    celestialDay: ICelestialDay;
    selectedDate: Date;
}

export function DateDisplay({ celestialDay, selectedDate }: DateDisplayProps): React.ReactElement {
    const date = new Date(celestialDay.date);
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const debug = false;
    
    // Determine if the moon is waxing or waning
    // For this simplified example, we'll say days 1-15 of the month are waxing,
    // and days 16-31 are waning. In a real app, you'd calculate this based on lunar phases.
    const isWaxing = date.getDate() <= 15;

    return (
        <div className={`date-display ${isSelected ? 'selected' : ''}`}>
            <div className="date">{date.toLocaleDateString()}</div>
            
            <div style={{ display: 'flex', alignItems: 'center', gap: '15px', margin: '15px 0' }}>
                <Moon 
                    illuminationPercentage={celestialDay.illuminationPercentage ?? 0}
                    size={60}
                    isWaxing={isWaxing}
                    className="moon"
                />
                <div>
                    <div><strong>Moon: {celestialDay.illuminationPercentage?.toFixed(1)}% Illuminated</strong></div>
                    <div>{isWaxing ? 'Waxing' : 'Waning'} Phase</div>
                </div>
            </div>

            <div className="sunrise">Sunrise: {formatMinutesSinceNoon(celestialDay.sun?.rise)}  {debug && "[" + celestialDay.sun?.rise + "]"}</div>
            <div className="sunset">Sunset: {formatMinutesSinceNoon(celestialDay.sun?.set)}  {debug && "[" + celestialDay.sun?.set + "]"}</div>
            <div className="moonrise">Moonrise: {formatMinutesSinceNoon(celestialDay?.moon?.rise)}  {debug && "[" + celestialDay?.moon?.rise + "]"}</div>
            <div className="moonset">Moonset: {formatMinutesSinceNoon(celestialDay?.moon?.set)}  {debug && "[" + celestialDay?.moon?.set + "]"}</div>
            <div className="stargazing-score">Stargazing Score: {celestialDay.stargazingScore?.toFixed(1)}</div>
            
            {debug && celestialDay.moonFunctionConstants && (
                <div className="moon-function-constants">
                    <div>Moon Period: {celestialDay.moonFunctionConstants.MoonPeriod}</div>
                    <div>Moon Width: {celestialDay.moonFunctionConstants.MoonWidth}</div>
                    <div>h Constant: {celestialDay.moonFunctionConstants.hConstant}</div>
                    <div>Phase Shift: {celestialDay.moonFunctionConstants.phaseShift}</div>
                </div>
            )}
        </div>
    );
}