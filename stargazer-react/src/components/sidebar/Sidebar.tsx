import React, { useState } from 'react';
import { SidebarConfiguration } from './SidebarConfiguration';
import { StargazerCalendar } from '../StargazerCalendar';
import type { ICelestialDay, IStargazerLocation } from '../../core/interfaces';
import './sidebar.css';

interface SidebarProps {
  celestialData: ICelestialDay[];
  location: IStargazerLocation;
  selectedDate: Date;
  year: number;
  onApplyLocation: (location: IStargazerLocation) => void;
  onDateSelect: (date: Date) => void;
}

type ActiveFlyout = 'location' | 'date' | null;

/**
 * Renders a narrow configuration rail and flyout cards for location and date selection.
 * @param props Current app data, applied location, selected date, and update callbacks.
 * @returns Sidebar rail with toggle buttons and the active flyout card.
 * @sideEffects Calls supplied callbacks when users apply location or select dates.
 */
export function Sidebar(props: SidebarProps): React.ReactElement {
  const {
    celestialData,
    location,
    selectedDate,
    year,
    onApplyLocation,
    onDateSelect,
  } = props;
  const [activeFlyout, setActiveFlyout] = useState<ActiveFlyout>(null);

  /**
   * Opens a requested flyout or hides it when already active.
   * @param flyout Flyout identifier to toggle.
   * @returns Nothing.
   * @sideEffects Mutates local active-flyout state.
   */
  const toggleFlyout = (flyout: Exclude<ActiveFlyout, null>): void => {
    setActiveFlyout((currentFlyout) => currentFlyout === flyout ? null : flyout);
  };

  return (
    <aside className="sidebar-shell" aria-label="Stargazer configuration">
      <div className="sidebar-rail">
        <div className="sidebar-brand" aria-hidden="true">S</div>
        <button
          aria-controls="location-config-card"
          aria-expanded={activeFlyout === 'location'}
          aria-label="Location settings"
          className={`sidebar-icon-button ${activeFlyout === 'location' ? 'active' : ''}`}
          type="button"
          onClick={() => toggleFlyout('location')}
        >
          <span aria-hidden="true">L</span>
        </button>
        <button
          aria-controls="date-config-card"
          aria-expanded={activeFlyout === 'date'}
          aria-label="Date selection"
          className={`sidebar-icon-button ${activeFlyout === 'date' ? 'active' : ''}`}
          type="button"
          onClick={() => toggleFlyout('date')}
        >
          <span aria-hidden="true">D</span>
        </button>
      </div>

      <div className={`sidebar-flyout ${activeFlyout === null ? 'hidden' : ''}`}>
        {activeFlyout === 'location' && (
          <section
            className="sidebar-config-card"
            id="location-config-card"
            aria-label="Location settings"
          >
            <h2>Location</h2>
            <SidebarConfiguration
              latitude={location.latitude}
              longitude={location.longitude}
              timezone={location.timezone}
              onApply={onApplyLocation}
            />
          </section>
        )}

        {activeFlyout === 'date' && (
          <section
            className="sidebar-config-card sidebar-calendar-card"
            id="date-config-card"
            aria-label="Date selection"
          >
            <h2>Date</h2>
            <StargazerCalendar
              year={year}
              celestialData={celestialData}
              selectedDate={selectedDate}
              onDateSelect={onDateSelect}
            />
          </section>
        )}
      </div>
    </aside>
  );
}

export default Sidebar;
