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

export function MainPane({ celestialData, year, onYearChange }: IMainPaneProps): React.ReactElement {
    const [selectedDate, setSelectedDate] = useState<Date>(new Date(year, new Date().getMonth(), new Date().getDate()));
    const [currentCelestialDay, setCurrentCelestialDay] = useState<ICelestialDay | undefined>(matchCelestialDay(new Date(), celestialData));

    const handleDateSelect = (date: Date): void => {
        // Check if year has changed and notify parent component
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
            {/* StargazerCalendar and DateInfoDisplayChip side by side */}
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
