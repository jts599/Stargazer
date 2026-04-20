import React from 'react';
import type { ActiveCard } from '../../App';
import appIcon from '../../resources/icons/icon_square.png';
import calendarIcon from '../../resources/icons/calendar.svg';
import locationIcon from '../../resources/icons/location.svg';
import './sidebar.css';

interface SidebarProps {
  activeCard: ActiveCard;
  onCardSelect: (card: ActiveCard) => void;
}

/**
 * Renders a narrow configuration rail for choosing the visible main card.
 * @param props Active main-card key and card-selection callback.
 * @returns Sidebar rail with toggle buttons for location and date cards.
 * @sideEffects Calls the supplied callback when users choose a card.
 */
export function Sidebar(props: SidebarProps): React.ReactElement {
  const { activeCard, onCardSelect } = props;

  /**
   * Requests a card from the application-level single-card slot.
   * @param card Card identifier to show.
   * @returns Nothing.
   * @sideEffects Calls the parent card-selection callback.
   */
  const selectCard = (card: ActiveCard): void => {
    onCardSelect(card);
  };

  return (
    <aside className="sidebar-shell" aria-label="Stargazer configuration">
      <div className="sidebar-rail">
        <div className="sidebar-brand" aria-hidden="true">
          <img className="sidebar-brand-icon" src={appIcon} alt="" />
        </div>
        <button
          aria-controls="main-card"
          aria-expanded={activeCard === 'location'}
          aria-label="Location settings"
          className={`sidebar-icon-button ${activeCard === 'location' ? 'active' : ''}`}
          type="button"
          onClick={() => selectCard('location')}
        >
          <img className="sidebar-button-icon" src={locationIcon} alt="" aria-hidden="true" />
        </button>
        <button
          aria-controls="main-card"
          aria-expanded={activeCard === 'date'}
          aria-label="Date selection"
          className={`sidebar-icon-button ${activeCard === 'date' ? 'active' : ''}`}
          type="button"
          onClick={() => selectCard('date')}
        >
          <img className="sidebar-button-icon" src={calendarIcon} alt="" aria-hidden="true" />
        </button>
      </div>
    </aside>
  );
}

export default Sidebar;
