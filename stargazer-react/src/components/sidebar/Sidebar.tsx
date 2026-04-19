import React, { useState } from 'react';
import { SidebarConfiguration } from './SidebarConfiguration';
import './sidebar.css';

interface SidebarProps {
  latitude: number;
  longitude: number;
  timezone: number;
  onUpdate: (year: number, latitude: number, longitude: number, timezone: number) => void;
}

/**
 * Renders location controls and submits the selected configuration.
 * @param props Initial location values and update callback.
 * @returns Sidebar containing location inputs and an update button.
 * @sideEffects Calls onUpdate when the user clicks Update.
 */
export function Sidebar(props: SidebarProps): React.ReactElement {
  const { latitude, longitude, timezone, onUpdate } = props;
  const currentYear = new Date().getFullYear();
  const [localLatitude, setLocalLatitude] = useState(latitude);
  const [localLongitude, setLocalLongitude] = useState(longitude);
  const [localTimezone, setLocalTimezone] = useState(timezone);
  
  return (
    <div className='__sidebarContent'>
      <h2>Stargazer</h2>
      <div className="__sidebarScrollArea">
        <SidebarConfiguration 
          latitude={localLatitude}
          longitude={localLongitude}
          timezone={localTimezone}
          onLatitudeChange={setLocalLatitude}
          onLongitudeChange={setLocalLongitude}
          onTimezoneChange={setLocalTimezone}
        />
      </div>
      <div className="__buttonFooter">
        <button 
          type="button"
          onClick={() => onUpdate(currentYear, localLatitude, localLongitude, localTimezone)} 
        >
          Update
        </button>
      </div>
    </div>
  );
}

export default Sidebar;
