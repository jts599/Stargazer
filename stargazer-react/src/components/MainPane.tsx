import React, { useState } from 'react';
import { StargazerCalendar } from './StargazerCalendar';
import { DateInfoDisplayChip } from './DateDisplay/DateInfoDisplayChip';
import type { ICelestialDay } from '../core/interfaces';
import { matchCelestialDay } from '../core/helpers';

interface IMainPaneProps {
    celestialData: ICelestialDay[];
    year: number;
    onYearChange?: (newYear: number) => void;
}

/**
 * Displays the primary calendar and selected-day details.
 * @param props Celestial data, active year, and optional year-change callback.
 * @returns Main content pane for the Stargazer app.
 * @sideEffects Updates local selected-date state and calls onYearChange when year selection changes.
 */
export function MainPane({ celestialData, year, onYearChange }: IMainPaneProps): React.ReactElement {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(year, new Date().getMonth(), new Date().getDate()));
    const [currentCelestialDay, setCurrentCelestialDay] = useState<ICelestialDay | undefined>(matchCelestialDay(new Date(), celestialData));

    /**
     * Updates selected date state and selected celestial-day details.
     * @param date Date selected in the child calendar.
     * @returns Nothing.
     * @sideEffects Mutates local React state and may call onYearChange.
     */
    const handleDateSelect = (date: Date): void => {
        const newYear = date.getFullYear();

        setSelectedDate(date);

        if (newYear !== year && onYearChange) {
            onYearChange(newYear);
        }

        const day = matchCelestialDay(date, celestialData);
        setCurrentCelestialDay(day);
    };

    return (
        <div style={{ 
            flex: 1, 
            display: 'flex', 
            flexDirection: 'column', 
            padding: '20px',
            height: '100%'
        }}>
            <div style={{ 
                display: 'flex', 
                justifyContent: 'center', 
                alignItems: 'flex-start', 
                gap: '20px',
                padding: '20px 0'
            }}>
                <StargazerCalendar 
                    year={year} 
                    celestialData={celestialData}
                    onYearChange={onYearChange}
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                />
                {currentCelestialDay && (
                    <DateInfoDisplayChip celestialDay={currentCelestialDay} />
                )}
            </div>
        </div>
    );
}
