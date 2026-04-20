import { useCallback, useEffect, useRef, useState } from 'react'
import './App.css'
import { MainPane } from './components/MainPane'
import { CollectCelestialData } from './core/NavyDataLoader'
import { CelestialBody, type ICelestialDay, type IStargazerLocation } from './core/interfaces'
import { Sidebar } from './components/sidebar/Sidebar'
// The following imports are commented out but the code is still available if needed
// import { MoonDemo } from './components/Moon/MoonDemo'
// import { SemiCircleDemo } from './components/Moon/SemiCircleDemo'

const DEFAULT_LATITUDE = 43.09;
const DEFAULT_LONGITUDE = -89.39;
const DEFAULT_TIMEZONE = -6;
const LOCATION_STORAGE_KEY = 'stargazer.location';

const DEFAULT_LOCATION: IStargazerLocation = {
  latitude: DEFAULT_LATITUDE,
  longitude: DEFAULT_LONGITUDE,
  timezone: DEFAULT_TIMEZONE,
};

/**
 * Confirms every location field can be used for data loading.
 * @param location Candidate location values.
 * @returns True when latitude, longitude, and timezone are finite numbers.
 * @sideEffects None.
 */
function isValidLocation(location: Partial<IStargazerLocation>): location is IStargazerLocation {
  return Number.isFinite(location.latitude)
    && Number.isFinite(location.longitude)
    && Number.isFinite(location.timezone);
}

/**
 * Reads the last applied location from session storage.
 * @returns Stored location when present and valid, otherwise the default location.
 * @throws Does not throw; malformed stored values fall back to defaults.
 * @sideEffects Reads browser sessionStorage when available.
 */
function readStoredLocation(): IStargazerLocation {
  if (typeof window === 'undefined') {
    return DEFAULT_LOCATION;
  }

  let storedLocation: string | null;

  try {
    storedLocation = window.sessionStorage.getItem(LOCATION_STORAGE_KEY);
  } catch {
    return DEFAULT_LOCATION;
  }

  if (storedLocation === null) {
    return DEFAULT_LOCATION;
  }

  try {
    const parsedLocation = JSON.parse(storedLocation) as Partial<IStargazerLocation>;

    if (isValidLocation(parsedLocation)) {
      return parsedLocation;
    }
  } catch {
    return DEFAULT_LOCATION;
  }

  return DEFAULT_LOCATION;
}

/**
 * Stores the last applied location for the current browser session.
 * @param location Location values that were applied to the data set.
 * @returns Nothing.
 * @throws Does not intentionally throw; storage failures are ignored.
 * @sideEffects Writes browser sessionStorage when available.
 */
function storeLocation(location: IStargazerLocation): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    window.sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(location));
  } catch {
    // Session storage can fail in private or constrained browser contexts.
  }
}

/**
 * Root application component that coordinates celestial data loading and layout.
 * @returns The Stargazer application shell once data has loaded, otherwise an empty placeholder.
 * @throws Rendering does not throw; data loading failures reject from loadCelestialData.
 * @sideEffects Starts the initial Navy data load and owns top-level React state.
 */
function App() {
  const currentYear = new Date().getFullYear();
  const hasLoadedInitialData = useRef(false);
  const [location, setLocation] = useState<IStargazerLocation>(readStoredLocation);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [year, setYear] = useState<number>(currentYear);
  const [celestialData, setCelestialData] = useState<ICelestialDay[] | null>(null);

  /**
   * Loads celestial data and updates both the selected year and displayed data.
   * @param targetYear Year to fetch from the Navy data source.
   * @param nextLocation Applied location used for the Navy data source.
   * @returns Promise that resolves after React state is queued.
   * @throws Propagates network, parsing, or scoring failures from CollectCelestialData.
   * @sideEffects Performs Navy API requests and mutates component state.
   */
  const loadCelestialData = useCallback(async (
    targetYear: number,
    nextLocation: IStargazerLocation,
  ): Promise<void> => {
    setYear(targetYear);
    const data = await CollectCelestialData(
      targetYear,
      nextLocation.latitude,
      nextLocation.longitude,
      CelestialBody.NauticalTwilight,
      nextLocation.timezone,
    );
    setCelestialData(data);
  }, []);

  useEffect(() => {
    if (hasLoadedInitialData.current) {
      return;
    }

    hasLoadedInitialData.current = true;
    loadCelestialData(currentYear, location);
  }, [currentYear, loadCelestialData, location]);

  /**
   * Applies a new location, persists it, and reloads data for the selected year.
   * @param nextLocation Location values to use for future data loads.
   * @returns Promise that resolves after data loading completes.
   * @throws Propagates data loading failures from loadCelestialData.
   * @sideEffects Writes sessionStorage and mutates application state.
   */
  const handleApplyLocation = async (nextLocation: IStargazerLocation): Promise<void> => {
    setLocation(nextLocation);
    storeLocation(nextLocation);
    await loadCelestialData(selectedDate.getFullYear(), nextLocation);
  };

  /**
   * Selects a calendar date and loads its year when necessary.
   * @param date Local calendar date selected by the user.
   * @returns Promise that resolves after any required data loading completes.
   * @throws Propagates data loading failures from loadCelestialData.
   * @sideEffects Mutates selected-date state and may request new celestial data.
   */
  const handleDateSelect = async (date: Date): Promise<void> => {
    const nextYear = date.getFullYear();

    setSelectedDate(date);

    if (nextYear !== year) {
      await loadCelestialData(nextYear, location);
    }
  };

  if (celestialData){
    return (
      <div className="App">
        <div className="app-shell">
          <Sidebar
            celestialData={celestialData}
            location={location}
            selectedDate={selectedDate}
            year={year}
            onApplyLocation={handleApplyLocation}
            onDateSelect={handleDateSelect}
          />
          
          <MainPane 
            celestialData={celestialData}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
          />
        </div>
      </div>
    );
  }

  return (<></>);
}

export interface IStargazerParams {
  year: number; // Keep this for the StargazerCalendar component
  latitude: number;
  longitude: number;
  timezone: number;
} 

// StargazerConfiguration has been refactored to SidebarConfiguration in components/sidebar/SidebarConfiguration.tsx

export default App
