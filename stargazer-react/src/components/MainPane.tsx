import React from 'react';
import { DateInfoDisplayChip } from './DateDisplay/DateInfoDisplayChip';
import { SidebarConfiguration } from './sidebar/SidebarConfiguration';
import { StargazerCalendar } from './StargazerCalendar';
import type { ActiveCard } from '../App';
import type { ICelestialDay, IStargazerLocation } from '../core/interfaces';
import { matchCelestialDay } from '../core/helpers';

interface IMainPaneProps {
    activeCard: ActiveCard;
    celestialData: ICelestialDay[];
    location: IStargazerLocation;
    selectedDate: Date;
    year: number;
    onApplyLocation: (location: IStargazerLocation) => void;
    onDateSelect: (date: Date) => void;
}

/**
 * Displays the one active Stargazer card in the main application pane.
 * @param props Active card, celestial data, location, selected date, and update callbacks.
 * @returns Main content pane for the Stargazer app.
 * @sideEffects Calls callbacks when users apply location or select dates.
 */
export function MainPane(props: IMainPaneProps): React.ReactElement {
    const {
        activeCard,
        celestialData,
        location,
        selectedDate,
        year,
        onApplyLocation,
        onDateSelect,
    } = props;
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

    const cardContent = renderActiveCard({
        activeCard,
        celestialData,
        currentCelestialDay,
        location,
        selectedDate,
        year,
        onApplyLocation,
        onDateSelect,
        onNextDay: () => handleRelativeDateSelect(1),
        onPreviousDay: () => handleRelativeDateSelect(-1),
    });

    return <div className="main-pane">{cardContent}</div>;
}

interface ActiveCardRenderProps {
    activeCard: ActiveCard;
    celestialData: ICelestialDay[];
    currentCelestialDay: ICelestialDay | undefined;
    location: IStargazerLocation;
    selectedDate: Date;
    year: number;
    onApplyLocation: (location: IStargazerLocation) => void;
    onDateSelect: (date: Date) => void;
    onNextDay: () => void;
    onPreviousDay: () => void;
}

/**
 * Resolves the single card element shown in the main pane.
 * @param props Active card data and callbacks required by each card variant.
 * @returns React element for the requested card, or null when day data is unavailable.
 * @sideEffects None.
 */
function renderActiveCard(props: ActiveCardRenderProps): React.ReactElement | null {
    const {
        activeCard,
        celestialData,
        currentCelestialDay,
        location,
        selectedDate,
        year,
        onApplyLocation,
        onDateSelect,
        onNextDay,
        onPreviousDay,
    } = props;

    if (activeCard === 'location') {
        return (
            <section className="main-config-card" id="main-card" aria-label="Location settings">
                <SidebarConfiguration
                    latitude={location.latitude}
                    longitude={location.longitude}
                    timezone={location.timezone}
                    onApply={onApplyLocation}
                />
            </section>
        );
    }

    if (activeCard === 'date') {
        return (
            <section className="main-config-card main-calendar-card" id="main-card" aria-label="Date selection">
                <StargazerCalendar
                    year={year}
                    celestialData={celestialData}
                    selectedDate={selectedDate}
                    onDateSelect={onDateSelect}
                />
            </section>
        );
    }

    if (currentCelestialDay === undefined) {
        return null;
    }

    return (
        <DateInfoDisplayChip
            celestialDay={currentCelestialDay}
            onNextDay={onNextDay}
            onPreviousDay={onPreviousDay}
        />
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
