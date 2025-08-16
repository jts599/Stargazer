import React, { useState, useCallback } from 'react';
import { Calendar } from './Calendar';
import type {  ICelestialDay } from '../core/interfaces';
import { matchCelestialDay } from '../core/helpers';
import { DateDisplay } from './DateDislay';


interface IStargazerCalendarProps {
    celestialData: ICelestialDay[];
    year: number;
}

export function StargazerCalendar(props: IStargazerCalendarProps): React.ReactElement {
    
    const { celestialData, year } = props;
    const [selectedDate, setSelectedDate] = useState<Date>(new Date());
    const [currentCelestialDay, setCurrentCelestialDay] = useState<ICelestialDay | undefined>(matchCelestialDay(new Date(), celestialData));

    const handleDateSelect = (date: Date): void => {
        setSelectedDate(date);
        console.log('Selected date:', date.toLocaleDateString());
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
                <h1>Stargazer Calendar</h1>
                
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



