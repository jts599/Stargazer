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

    return (
        <div className={`date-display ${isSelected ? 'selected' : ''}`}>
            <div className="date">{date.toLocaleDateString()}</div>
            <div className="sunrise">Sunrise: {formatMinutesSinceNoon(celestialDay.sun?.rise)}</div>
            <div className="sunset">Sunset: {formatMinutesSinceNoon(celestialDay.sun?.set)}</div>
            <div className="moonrise">Moonrise: {formatMinutesSinceNoon(celestialDay?.moon?.rise)}</div>
            <div className="moonset">Moonset: {formatMinutesSinceNoon(celestialDay?.moon?.set)}</div>
        </div>
    );
}