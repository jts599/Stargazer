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

/**
 * Renders the yearly stargazing calendar and forwards date/year changes upward.
 * @param props Calendar data, active year, selected date, and optional change callbacks.
 * @returns Calendar wrapped in a constrained layout container.
 * @sideEffects Calls supplied callbacks when the user selects dates.
 */
export function StargazerCalendar(props: IStargazerCalendarProps): React.ReactElement {
    const { celestialData, year, onYearChange, selectedDate, onDateSelect } = props;
    const currentSelectedDate = selectedDate || new Date(year, new Date().getMonth(), new Date().getDate());

    /**
     * Handles date selection and requests a new year when the selected date crosses year bounds.
     * @param date Date selected by the calendar.
     * @returns Nothing.
     * @sideEffects Calls onYearChange and onDateSelect when provided.
     */
    const handleDateSelect = (date: Date): void => {
        const newYear = date.getFullYear();

        if (newYear !== year && onYearChange) {
            onYearChange(newYear);
        }

        if (onDateSelect) {
            onDateSelect(date);
        }
    };

    /**
     * Resolves the display score for one calendar date.
     * @param date Date to score.
     * @returns Percentile score for the matching day, or zero when no data exists.
     * @sideEffects None.
     */
    const getScoreForDate = useCallback((date: Date): number => {
        const day = matchCelestialDay(date, celestialData);
        return day?.percentileScore ?? 0;
    }, [celestialData]);

    return (
        <div style={{ maxWidth: '400px', margin: '0 auto' }}>
            <Calendar
                selectedDate={currentSelectedDate}
                onDateSelect={handleDateSelect}
                highlightedDates={celestialData.map(day => new Date(day.date))}
                minDate={new Date(year, 0, 1)}
                maxDate={new Date(year, 11, 31)}
                dateColorCodeFormatingFunction={getScoreForDate}
            />
        </div>
    );
}


