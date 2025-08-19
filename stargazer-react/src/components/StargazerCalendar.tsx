import React, { useState, useCallback } from 'react';
import { Calendar } from './Calendar/Calendar';
import type {  ICelestialDay } from '../core/interfaces';
import { matchCelestialDay } from '../core/helpers';
import { DateDisplay } from './DateDislay';


interface IStargazerCalendarProps {
    celestialData: ICelestialDay[];
    year: number;
    onYearChange?: (newYear: number) => void;
}

export function StargazerCalendar(props: IStargazerCalendarProps): React.ReactElement {
    
    const { celestialData, year, onYearChange } = props;
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

    const getScoreForDate = useCallback((date: Date): number => {
        const day = matchCelestialDay(date, celestialData);
        return day?.stargazingScore ?? 0;
    }, [celestialData]);

    return (
        <>
            <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
                
                <Calendar
                    selectedDate={selectedDate}
                    onDateSelect={handleDateSelect}
                    highlightedDates={celestialData.map(day => new Date(day.date))}
                    minDate={new Date(year, 0, 1)} // January 1, 2020
                    maxDate={new Date(year, 11, 31)} // December 31, 2030
                    dateColorCodeFormatingFunction={getScoreForDate}
                />
            </div>
            <div style={{ padding: '20px', maxWidth: '500px', margin: '0 auto' }}>
                <h2>Selected Date: {selectedDate.toLocaleDateString()}</h2>
                {currentCelestialDay && (
                    <DateDisplay celestialDay={currentCelestialDay} selectedDate={selectedDate} />
                )}
            </div>
        </>
    );


}



