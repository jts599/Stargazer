import L from 'leaflet';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from 'react-leaflet';
import type { IStargazerLocation } from '../../core/interfaces';
import {
  getTimezoneIdForCoordinates,
  getTimezoneOffsetHours,
  isValidCoordinate,
  roundCoordinate,
} from '../../core/timezone';

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

type LocationStatus = 'applied-location' | 'browser-pending' | 'browser-success' | 'browser-denied' | 'browser-unavailable' | 'timezone-unavailable';

const DEFAULT_MAP_ZOOM = 8;
const BROWSER_LOCATION_ZOOM = 10;
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
  const [locationStatus, setLocationStatus] = useState<LocationStatus>(
    shouldUseBrowserLocationDefault ? 'browser-pending' : 'applied-location',
  );
  const userEditedLocation = useRef(false);

  /**
   * Updates coordinate and timezone drafts from a map or browser location.
   * @param coordinates Coordinate pair selected by the map or browser geolocation.
   * @returns Nothing.
   * @sideEffects Mutates local React state for draft coordinates and timezone fields.
   */
  const applyCoordinateDraft = useCallback((coordinates: Coordinates): void => {
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
      return;
    }

    setDraftTimezoneId(nextTimezoneId);
    setDraftTimezone(nextTimezone);
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

    if (!('geolocation' in navigator)) {
      setLocationStatus('browser-unavailable');
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocationStatus('browser-success');

        if (userEditedLocation.current) {
          return;
        }

        applyCoordinateDraft({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
      },
      () => setLocationStatus('browser-denied'),
      { enableHighAccuracy: false, maximumAge: 300000, timeout: 10000 },
    );
  }, [applyCoordinateDraft, shouldUseBrowserLocationDefault]);

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
    applyCoordinateDraft(coordinates);
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
        <p className="location-status">{getLocationStatusText(locationStatus, timezoneLabel)}</p>
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

  return `Timezone lookup unavailable. Adjust the UTC offset before applying.`;
}

export default SidebarConfiguration;
