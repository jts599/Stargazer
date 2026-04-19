import React from 'react';

interface SidebarConfigurationProps {
  latitude: number;
  longitude: number;
  timezone: number;
  onLatitudeChange: (value: number) => void;
  onLongitudeChange: (value: number) => void;
  onTimezoneChange: (value: number) => void;
}

/**
 * Renders controlled numeric inputs for Stargazer location settings.
 * @param props Current latitude, longitude, timezone, and change callbacks.
 * @returns Location configuration form.
 * @sideEffects Calls change callbacks as users edit input values.
 */
export function SidebarConfiguration(props: SidebarConfigurationProps): React.ReactElement {
  const { latitude, longitude, timezone, onLatitudeChange, onLongitudeChange, onTimezoneChange } = props;

  return (
    <div className="configuration-container">
      <form>
        <label>
          Latitude:
          <input
            type="number"
            value={latitude}
            onChange={(e) => onLatitudeChange(Number(e.target.value))}
          />
        </label>
        <label>
          Longitude:
          <input
            type="number"
            value={longitude}
            onChange={(e) => onLongitudeChange(Number(e.target.value))}
          />
        </label>
        <label>
          Timezone:
          <input
            type="number"
            value={timezone}
            onChange={(e) => onTimezoneChange(Number(e.target.value))}
          />
        </label>
      </form>
    </div>
  );
}

export default SidebarConfiguration;
