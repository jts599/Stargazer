import React, { useCallback } from 'react';
import { Calendar } from './Calendar/Calendar';
import type {  ICelestialDay } from '../core/interfaces';
import { matchCelestialDay } from '../core/helpers';


interface IStargazerCalendarProps {
    celestialData: ICelestialDay[];
    year: number;
    onYearChange?: (newYear: number) => void;
    selectedDate?: Date;
    onDateSelect?: (date: Date) => void;
}

export function StargazerCalendar(props: IStargazerCalendarProps): React.ReactElement {
    
    const { celestialData, year, onYearChange, selectedDate, onDateSelect } = props;
    
    // Use props or defaults
    const currentSelectedDate = selectedDate || new Date(year, new Date().getMonth(), new Date().getDate());

    const handleDateSelect = (date: Date): void => {
        // Check if year has changed and notify parent component
        const newYear = date.getFullYear();

        if (newYear !== year && onYearChange) {
            onYearChange(newYear);
        }

        // Call the parent's onDateSelect if provided
        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    const getScoreForDate = useCallback((date: Date): number => {
        const day = matchCelestialDay(date, celestialData);
        return day?.stargazingScore ?? 0;
    }, [celestialData]);

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Calendar
                selectedDate={currentSelectedDate}
                onDateSelect={handleDateSelect}
                highlightedDates={celestialData.map(day => new Date(day.date))}
                minDate={new Date(year, 0, 1)} // January 1, 2020
                maxDate={new Date(year, 11, 31)} // December 31, 2030
                dateColorCodeFormatingFunction={getScoreForDate}
            />
        </div>
    );
}



