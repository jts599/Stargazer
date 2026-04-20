import React from 'react';
import { DateInfoDisplayChip } from './DateDisplay/DateInfoDisplayChip';
import type { ICelestialDay } from '../core/interfaces';
import { matchCelestialDay } from '../core/helpers';

interface IMainPaneProps {
    celestialData: ICelestialDay[];
    selectedDate: Date;
    onDateSelect: (date: Date) => void;
}

/**
 * Displays the selected-day details for the active stargazing date.
 * @param props Celestial data, selected date, and date-selection callback.
 * @returns Main content pane for the Stargazer app.
 * @sideEffects Calls onDateSelect when day navigation buttons are used.
 */
export function MainPane({ celestialData, selectedDate, onDateSelect }: IMainPaneProps): React.ReactElement {
    const currentCelestialDay = matchCelestialDay(selectedDate, celestialData);

    /**
     * Selects the day offset from the current detail view.
     * @param dayOffset Number of local calendar days to move.
     * @returns Nothing.
     * @sideEffects Calls onDateSelect with the offset local date.
     */
    const handleRelativeDateSelect = (dayOffset: number): void => {
        onDateSelect(addCalendarDays(selectedDate, dayOffset));
    };

    return (
        <div className="main-pane">
            {currentCelestialDay && (
                <DateInfoDisplayChip
                    celestialDay={currentCelestialDay}
                    onNextDay={() => handleRelativeDateSelect(1)}
                    onPreviousDay={() => handleRelativeDateSelect(-1)}
                />
            )}
        </div>
    );
}

/**
 * Adds whole local calendar days without mutating the source date.
 * @param date Starting local date.
 * @param dayOffset Number of days to add; may be negative.
 * @returns New date offset by the requested number of local days.
 * @sideEffects None.
 */
function addCalendarDays(date: Date, dayOffset: number): Date {
    return new Date(date.getFullYear(), date.getMonth(), date.getDate() + dayOffset);
}
