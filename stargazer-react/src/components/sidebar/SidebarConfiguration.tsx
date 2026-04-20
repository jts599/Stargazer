import L from 'leaflet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import { searchLocation } from '../../core/geocoding';
import type { IStargazerLocation } from '../../core/interfaces';
import {
  getTimezoneIdForCoordinates,
  getTimezoneOffsetHours,
  isValidCoordinate,
  roundCoordinate,
} from '../../core/timezone';
import locationIcon from '../../resources/icons/location.svg';
import searchIcon from '../../resources/icons/search.svg';

interface SidebarConfigurationProps {
  latitude: number;
  longitude: number;
  selectedDate: Date;
  shouldUseBrowserLocationDefault: boolean;
  timezone: number;
  timezoneId?: string;
  onApply: (location: IStargazerLocation) => void;
}

interface Coordinates {
  latitude: number;
  longitude: number;
}

type LocationStatus = 'applied-location'
  | 'browser-pending'
  | 'browser-success'
  | 'browser-denied'
  | 'browser-unavailable'
  | 'search-pending'
  | 'search-success'
  | 'search-empty'
  | 'search-failed'
  | 'timezone-unavailable';

const DEFAULT_MAP_ZOOM = 8;
const BROWSER_LOCATION_ZOOM = 10;
const GEOLOCATION_OPTIONS: PositionOptions = {
  enableHighAccuracy: false,
  maximumAge: 300000,
  timeout: 10000,
};
const MAP_TILE_URL = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
const MAP_ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/**
 * Renders draft map and numeric inputs for Stargazer location settings.
 * @param props Applied location values, selected date for offset lookup, and apply callback.
 * @returns Location configuration form with map selection and an explicit Apply action.
 * @sideEffects Requests browser geolocation, updates local draft state, and calls onApply.
 */
export function SidebarConfiguration(props: SidebarConfigurationProps): React.ReactElement {
  const {
    latitude,
    longitude,
    selectedDate,
    shouldUseBrowserLocationDefault,
    timezone,
    timezoneId,
    onApply,
  } = props;
  const [draftLatitude, setDraftLatitude] = useState(latitude);
  const [draftLongitude, setDraftLongitude] = useState(longitude);
  const [draftTimezone, setDraftTimezone] = useState(timezone);
  const [draftTimezoneId, setDraftTimezoneId] = useState<string | undefined>(timezoneId);
  const [locationSearch, setLocationSearch] = useState('');
  const [lastSearchResultName, setLastSearchResultName] = useState<string | undefined>();
  const [isSearchingLocation, setIsSearchingLocation] = useState(false);
  const [isLocatingBrowser, setIsLocatingBrowser] = useState(shouldUseBrowserLocationDefault);
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(
    shouldUseBrowserLocationDefault ? 'browser-pending' : 'applied-location',
  );
  const userEditedLocation = useRef(false);

  /**
   * Updates coordinate and timezone drafts from a map or browser location.
   * @param coordinates Coordinate pair selected by the map or browser geolocation.
   * @returns True when coordinates and timezone are usable; otherwise false.
   * @sideEffects Mutates local React state for draft coordinates and timezone fields.
   */
  const applyCoordinateDraft = useCallback((coordinates: Coordinates): boolean => {
    const nextLatitude = roundCoordinate(coordinates.latitude);
    const nextLongitude = roundCoordinate(coordinates.longitude);
    const nextTimezoneId = getTimezoneIdForCoordinates(nextLatitude, nextLongitude);
    const nextTimezone = nextTimezoneId === undefined
      ? undefined
      : getTimezoneOffsetHours(nextTimezoneId, selectedDate);

    setDraftLatitude(nextLatitude);
    setDraftLongitude(nextLongitude);

    if (nextTimezoneId === undefined || nextTimezone === undefined) {
      setLocationStatus('timezone-unavailable');
      return false;
    }

    setDraftTimezoneId(nextTimezoneId);
    setDraftTimezone(nextTimezone);
    return true;
  }, [selectedDate]);

  useEffect(() => {
    setDraftLatitude(latitude);
    setDraftLongitude(longitude);
    setDraftTimezone(timezone);
    setDraftTimezoneId(timezoneId);
  }, [latitude, longitude, timezone, timezoneId]);

  useEffect(() => {
    if (!shouldUseBrowserLocationDefault) {
      setLocationStatus('applied-location');
      return;
    }

    setLocationStatus('browser-pending');
    setIsLocatingBrowser(true);

    if (!('geolocation' in navigator)) {
      setLocationStatus('browser-unavailable');
      setIsLocatingBrowser(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingBrowser(false);

        if (userEditedLocation.current) {
          setLocationStatus('browser-success');
          return;
        }

        const appliedDraft = applyCoordinateDraft({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (appliedDraft) {
          setLocationStatus('browser-success');
        }
      },
      () => {
        setIsLocatingBrowser(false);
        setLocationStatus('browser-denied');
      },
      GEOLOCATION_OPTIONS,
    );
  }, [applyCoordinateDraft, shouldUseBrowserLocationDefault]);

  /**
   * Searches for the typed location and updates only the local draft marker.
   * @returns Promise that resolves after search state is updated.
   * @throws Does not throw; request failures are converted to status text.
   * @sideEffects Performs one geocoding request and mutates draft location state.
   */
  const handleLocationSearch = async (): Promise<void> => {
    const trimmedSearch = locationSearch.trim();

    if (trimmedSearch.length === 0) {
      setLocationStatus('search-empty');
      return;
    }

    userEditedLocation.current = true;
    setIsSearchingLocation(true);
    setLocationStatus('search-pending');
    setLastSearchResultName(undefined);

    try {
      const result = await searchLocation(trimmedSearch);

      if (result === undefined) {
        setLocationStatus('search-empty');
        return;
      }

      const appliedDraft = applyCoordinateDraft(result);

      setLastSearchResultName(result.displayName);

      if (appliedDraft) {
        setLocationStatus('search-success');
      }
    } catch {
      setLocationStatus('search-failed');
    } finally {
      setIsSearchingLocation(false);
    }
  };

  /**
   * Requests the browser's current position and updates only the draft marker.
   * @returns Nothing.
   * @throws Does not throw; browser failures are converted to status text.
   * @sideEffects Requests browser geolocation and mutates draft location state.
   */
  const handleCurrentLocation = (): void => {
    userEditedLocation.current = true;

    if (!('geolocation' in navigator)) {
      setLocationStatus('browser-unavailable');
      return;
    }

    setIsLocatingBrowser(true);
    setLocationStatus('browser-pending');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setIsLocatingBrowser(false);
        setLastSearchResultName(undefined);

        const appliedDraft = applyCoordinateDraft({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });

        if (appliedDraft) {
          setLocationStatus('browser-success');
        }
      },
      () => {
        setIsLocatingBrowser(false);
        setLocationStatus('browser-denied');
      },
      GEOLOCATION_OPTIONS,
    );
  };

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
      timezoneId: draftTimezoneId,
    });
  };

  /**
   * Applies user-selected coordinates and protects the draft from late geolocation results.
   * @param coordinates Coordinate pair selected by a direct user interaction.
   * @returns Nothing.
   * @sideEffects Marks the draft as user-edited and updates coordinate state.
   */
  const applyUserCoordinateDraft = (coordinates: Coordinates): void => {
    userEditedLocation.current = true;
    setLastSearchResultName(undefined);
    applyCoordinateDraft(coordinates);
  };

  /**
   * Runs location search when Enter is pressed inside the search field.
   * @param event Keyboard event from the search input.
   * @returns Nothing.
   * @sideEffects Prevents form submission and starts geocoding on Enter.
   */
  const handleSearchKeyDown = (event: React.KeyboardEvent<HTMLInputElement>): void => {
    if (event.key !== 'Enter') {
      return;
    }

    event.preventDefault();
    void handleLocationSearch();
  };

  const markerIcon = useMemo(createLocationMarkerIcon, []);
  const coordinates = useMemo<Coordinates>(() => ({
    latitude: draftLatitude,
    longitude: draftLongitude,
  }), [draftLatitude, draftLongitude]);
  const canApply = isValidCoordinate(draftLatitude, draftLongitude) && Number.isFinite(draftTimezone);
  const timezoneLabel = draftTimezoneId ?? 'Timezone lookup unavailable';

  return (
    <div className="configuration-container">
      <form className="location-form" onSubmit={handleSubmit}>
        <div className="location-search-controls">
          <label className="location-search-label">
            Search location
            <input
              type="search"
              value={locationSearch}
              onChange={(event) => setLocationSearch(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="City, park, or address"
            />
          </label>
          <div className="location-search-actions">
            <button
              type="button"
              aria-label={isSearchingLocation ? 'Searching location' : 'Search location'}
              className="location-icon-action"
              disabled={isSearchingLocation}
              title={isSearchingLocation ? 'Searching location' : 'Search location'}
              onClick={() => void handleLocationSearch()}
            >
              <img className="location-action-icon" src={searchIcon} alt="" aria-hidden="true" />
            </button>
            <button
              type="button"
              aria-label={isLocatingBrowser ? 'Locating current position' : 'Use current location'}
              className="location-icon-action"
              disabled={isLocatingBrowser}
              title={isLocatingBrowser ? 'Locating current position' : 'Use current location'}
              onClick={handleCurrentLocation}
            >
              <img className="location-action-icon" src={locationIcon} alt="" aria-hidden="true" />
            </button>
          </div>
        </div>
        <div className="location-map-panel">
          <MapContainer
            center={[latitude, longitude]}
            className="location-map"
            scrollWheelZoom
            zoom={DEFAULT_MAP_ZOOM}
          >
            <TileLayer attribution={MAP_ATTRIBUTION} url={MAP_TILE_URL} />
            <LocationMapSync coordinates={coordinates} />
            <LocationMapEvents onSelectLocation={applyUserCoordinateDraft} />
            {isValidCoordinate(draftLatitude, draftLongitude) && (
              <Marker
                draggable
                eventHandlers={{
                  dragend: (event) => {
                    const marker = event.target as L.Marker;
                    const nextPosition = marker.getLatLng();

                    applyUserCoordinateDraft({
                      latitude: nextPosition.lat,
                      longitude: nextPosition.lng,
                    });
                  },
                }}
                icon={markerIcon}
                position={[draftLatitude, draftLongitude]}
              />
            )}
          </MapContainer>
        </div>
        {shouldShowLocationStatus(locationStatus) && (
          <p className="location-status">{getLocationStatusText(locationStatus, timezoneLabel)}</p>
        )}
        {lastSearchResultName !== undefined && (
          <p className="location-result-name">{lastSearchResultName}</p>
        )}
        <div className="location-readout-grid" aria-label="Selected location details">
          <ReadOnlyLocationValue label="Latitude" value={formatCoordinate(draftLatitude)} />
          <ReadOnlyLocationValue label="Longitude" value={formatCoordinate(draftLongitude)} />
          <ReadOnlyLocationValue label="Timezone" value={timezoneLabel} />
        </div>
        <p className="timezone-helptext">
          Due to daylight saving time, moonrise, moonset, sunrise, and sunset can be an hour off during parts of the year. This does not impact score calculation; the visualization may only be shifted by an hour.
        </p>
        <label>
          UTC Offset:
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

interface ReadOnlyLocationValueProps {
  label: string;
  value: string;
}

/**
 * Displays a non-editable location value without exposing a form input.
 * @param props Label and value text for a selected location detail.
 * @returns Compact read-only label/value row.
 * @throws Does not throw.
 * @sideEffects None.
 */
function ReadOnlyLocationValue(props: ReadOnlyLocationValueProps): React.ReactElement {
  const { label, value } = props;

  return (
    <div className="location-readout">
      <span className="location-readout-label">{label}</span>
      <span className="location-readout-value">{value}</span>
    </div>
  );
}

interface LocationMapEventsProps {
  onSelectLocation: (coordinates: Coordinates) => void;
}

/**
 * Connects Leaflet map clicks to the location draft.
 * @param props Callback that receives clicked map coordinates.
 * @returns Null because this component only subscribes to map events.
 * @sideEffects Registers a Leaflet click handler through React Leaflet.
 */
function LocationMapEvents(props: LocationMapEventsProps): null {
  const { onSelectLocation } = props;

  useMapEvents({
    click: (event) => onSelectLocation({
      latitude: event.latlng.lat,
      longitude: event.latlng.lng,
    }),
  });

  return null;
}

interface LocationMapSyncProps {
  coordinates: Coordinates;
}

/**
 * Keeps the Leaflet view centered on the current draft coordinates.
 * @param props Current draft coordinate pair.
 * @returns Null because this component only updates the map instance.
 * @sideEffects Calls Leaflet setView when the draft coordinate changes.
 */
function LocationMapSync(props: LocationMapSyncProps): null {
  const { coordinates } = props;
  const map = useMap();

  useEffect(() => {
    if (!isValidCoordinate(coordinates.latitude, coordinates.longitude)) {
      return;
    }

    map.setView([coordinates.latitude, coordinates.longitude], BROWSER_LOCATION_ZOOM);
  }, [coordinates.latitude, coordinates.longitude, map]);

  return null;
}

/**
 * Creates a CSS-backed Leaflet marker icon that works without image asset rewrites.
 * @returns Div icon used for the draggable observing-location marker.
 * @throws Does not throw.
 * @sideEffects None.
 */
function createLocationMarkerIcon(): L.DivIcon {
  return L.divIcon({
    className: 'location-marker',
    html: '<span class="location-marker-dot"></span>',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

/**
 * Formats a coordinate for compact read-only display.
 * @param coordinate Decimal-degree coordinate value from the draft map marker.
 * @returns Six-decimal coordinate text, or "Unavailable" when invalid.
 * @throws Does not throw.
 * @sideEffects None.
 */
function formatCoordinate(coordinate: number): string {
  if (!Number.isFinite(coordinate)) {
    return 'Unavailable';
  }

  return coordinate.toFixed(6);
}

/**
 * Converts browser and timezone lookup state into concise user-facing text.
 * @param status Current browser geolocation or timezone lookup state.
 * @param timezoneLabel Timezone text derived from the draft location.
 * @returns Status text for the location card.
 * @throws Does not throw.
 * @sideEffects None.
 */
function getLocationStatusText(status: LocationStatus, timezoneLabel: string): string {
  if (status === 'applied-location') {
    return `Timezone: ${timezoneLabel}. Applied location loaded.`;
  }

  if (status === 'browser-pending') {
    return `Timezone: ${timezoneLabel}. Waiting for browser location.`;
  }

  if (status === 'browser-success') {
    return `Timezone: ${timezoneLabel}. Browser location loaded.`;
  }

  if (status === 'browser-denied') {
    return `Timezone: ${timezoneLabel}. Browser location unavailable.`;
  }

  if (status === 'browser-unavailable') {
    return `Timezone: ${timezoneLabel}. Browser location is not supported.`;
  }

  if (status === 'search-pending') {
    return `Timezone: ${timezoneLabel}. Searching for that location.`;
  }

  if (status === 'search-success') {
    return `Timezone: ${timezoneLabel}. Search result loaded.`;
  }

  if (status === 'search-empty') {
    return `Timezone: ${timezoneLabel}. No matching location found.`;
  }

  if (status === 'search-failed') {
    return `Timezone: ${timezoneLabel}. Location search failed.`;
  }

  return `Timezone lookup unavailable. Adjust the UTC offset before applying.`;
}

/**
 * Decides whether the location card needs a transient status message.
 * @param status Current location lookup state.
 * @returns True for geocoding search or coordinate error states that need feedback.
 * @throws Does not throw.
 * @sideEffects None.
 */
function shouldShowLocationStatus(status: LocationStatus): boolean {
  return status === 'search-pending'
    || status === 'search-empty'
    || status === 'search-failed'
    || status === 'timezone-unavailable';
}

export default SidebarConfiguration;
