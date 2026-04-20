import React, { useEffect, useState } from 'react';
import type { IStargazerLocation } from '../../core/interfaces';

interface SidebarConfigurationProps {
  latitude: number;
  longitude: number;
  timezone: number;
  onApply: (location: IStargazerLocation) => void;
}

/**
 * Renders draft numeric inputs for Stargazer location settings.
 * @param props Applied latitude, longitude, timezone, and apply callback.
 * @returns Location configuration form with an explicit Apply action.
 * @sideEffects Calls onApply when the user submits valid location values.
 */
export function SidebarConfiguration(props: SidebarConfigurationProps): React.ReactElement {
  const { latitude, longitude, timezone, onApply } = props;
  const [draftLatitude, setDraftLatitude] = useState(latitude);
  const [draftLongitude, setDraftLongitude] = useState(longitude);
  const [draftTimezone, setDraftTimezone] = useState(timezone);

  useEffect(() => {
    setDraftLatitude(latitude);
    setDraftLongitude(longitude);
    setDraftTimezone(timezone);
  }, [latitude, longitude, timezone]);

  /**
   * Submits the draft location to the parent component.
   * @param event Form submit event from the location card.
   * @returns Nothing.
   * @sideEffects Prevents default form submission and calls onApply.
   */
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>): void => {
    event.preventDefault();
    onApply({
      latitude: draftLatitude,
      longitude: draftLongitude,
      timezone: draftTimezone,
    });
  };

  const canApply = Number.isFinite(draftLatitude)
    && Number.isFinite(draftLongitude)
    && Number.isFinite(draftTimezone);

  return (
    <div className="configuration-container">
      <form onSubmit={handleSubmit}>
        <label>
          Latitude:
          <input
            type="number"
            step="any"
            value={draftLatitude}
            onChange={(event) => setDraftLatitude(Number(event.target.value))}
          />
        </label>
        <label>
          Longitude:
          <input
            type="number"
            step="any"
            value={draftLongitude}
            onChange={(event) => setDraftLongitude(Number(event.target.value))}
          />
        </label>
        <label>
          Timezone:
          <input
            type="number"
            step="any"
            value={draftTimezone}
            onChange={(event) => setDraftTimezone(Number(event.target.value))}
          />
        </label>
        <button type="submit" disabled={!canApply}>Apply</button>
      </form>
    </div>
  );
}

export default SidebarConfiguration;
