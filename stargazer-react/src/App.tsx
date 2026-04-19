import { useCallback, useEffect, useState } from 'react'
import './App.css'
import { MainPane } from './components/MainPane'
import { CollectCelestialData } from './core/NavyDataLoader'
import { CelestialBody, type ICelestialDay } from './core/interfaces'
import { Sidebar } from './components/sidebar/Sidebar'
// The following imports are commented out but the code is still available if needed
// import { MoonDemo } from './components/Moon/MoonDemo'
// import { SemiCircleDemo } from './components/Moon/SemiCircleDemo'

const DEFAULT_LATITUDE = 43.09;
const DEFAULT_LONGITUDE = -89.39;
const DEFAULT_TIMEZONE = -6;

/**
 * Root application component that coordinates celestial data loading and layout.
 * @returns The Stargazer application shell once data has loaded, otherwise an empty placeholder.
 * @throws Rendering does not throw; data loading failures reject from loadCelestialData.
 * @sideEffects Starts the initial Navy data load and owns top-level React state.
 */
function App() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [celestialData, setCelestialData] = useState<ICelestialDay[] | null>(null);

  /**
   * Loads celestial data and updates both the selected year and displayed data.
   * @param targetYear Year to fetch from the Navy data source.
   * @param latitude Latitude in decimal degrees; positive values are north.
   * @param longitude Longitude in decimal degrees; positive values are east.
   * @param timezone Fixed UTC offset in hours for the requested location.
   * @returns Promise that resolves after React state is queued.
   * @throws Propagates network, parsing, or scoring failures from CollectCelestialData.
   * @sideEffects Performs Navy API requests and mutates component state.
   */
  const loadCelestialData = useCallback(async (
    targetYear: number,
    latitude: number,
    longitude: number,
    timezone: number,
  ): Promise<void> => {
    setYear(targetYear);
    const data = await CollectCelestialData(
      targetYear,
      latitude,
      longitude,
      CelestialBody.NauticalTwilight,
      timezone,
    );
    setCelestialData(data);
  }, []);

  useEffect(() => {
    loadCelestialData(currentYear, DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_TIMEZONE);
  }, [currentYear, loadCelestialData]);

  if (celestialData){
    return (
      <div className="App" style={{ height: '100vh', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
          <Sidebar
            latitude={DEFAULT_LATITUDE}
            longitude={DEFAULT_LONGITUDE}
            timezone={DEFAULT_TIMEZONE}
            onUpdate={loadCelestialData}
          />
          
          <MainPane 
            year={year} 
            celestialData={celestialData}
            onYearChange={(newYear: number) => {
              loadCelestialData(newYear, DEFAULT_LATITUDE, DEFAULT_LONGITUDE, DEFAULT_TIMEZONE);
            }}
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
