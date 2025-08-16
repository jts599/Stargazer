import { formatMinutesSinceNoon } from "../core/helpers";
import type { ICelestialDay } from "../core/interfaces";
import React from "react";


export interface DateDisplayProps {
    celestialDay: ICelestialDay;
    selectedDate: Date;
}

export function DateDisplay({ celestialDay, selectedDate }: DateDisplayProps): React.ReactElement {
    const date = new Date(celestialDay.date);
    const isSelected = date.toDateString() === selectedDate.toDateString();
    const debug = true;

    return (
        <div className={`date-display ${isSelected ? 'selected' : ''}`}>
            <div className="date">{date.toLocaleDateString()}</div>
            <div className="sunrise">Sunrise: {formatMinutesSinceNoon(celestialDay.sun?.rise)}  {debug && "[" + celestialDay.sun?.rise + "]"}</div>
            <div className="sunset">Sunset: {formatMinutesSinceNoon(celestialDay.sun?.set)}  {debug && "[" + celestialDay.sun?.set + "]"}</div>
            <div className="moonrise">Moonrise: {formatMinutesSinceNoon(celestialDay?.moon?.rise)}  {debug && "[" + celestialDay?.moon?.rise + "]"}</div>
            <div className="moonset">Moonset: {formatMinutesSinceNoon(celestialDay?.moon?.set)}  {debug && "[" + celestialDay?.moon?.set + "]"}</div>
            <div className="moon-phase">Illumination Pct: {celestialDay.illuminationPercentage}</div>
            <div className="stargazing-score">Stargazing Score: {celestialDay.stargazingScore}</div>
            <div className="moon-function-constants">
                {celestialDay.moonFunctionConstants && (
                    <>
                        <div>Moon Period: {celestialDay.moonFunctionConstants.MoonPeriod}</div>
                        <div>Moon Width: {celestialDay.moonFunctionConstants.MoonWidth}</div>
                        <div>h Constant: {celestialDay.moonFunctionConstants.hConstant}</div>
                        <div>Phase Shift: {celestialDay.moonFunctionConstants.phaseShift}</div>
                    </>
                )}
            </div>
        </div>
    );
}