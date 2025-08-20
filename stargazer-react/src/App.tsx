import { useEffect, useState } from 'react'
import './App.css'
import { StargazerCalendar } from './components/StargazerCalendar'
import { CollectCelestialData } from './core/NavyDataLoader'
import { CelestialBody, type ICelestialDay } from './core/interfaces'
import { Sidebar } from './components/sidebar/Sidebar'
// The following imports are commented out but the code is still available if needed
// import { MoonDemo } from './components/Moon/MoonDemo'
// import { SemiCircleDemo } from './components/Moon/SemiCircleDemo'

function App() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [celestialData, setCelestialData] = useState<ICelestialDay[] | null>(null);
  
  useEffect(() => {
      async function fetchData() {
          if (celestialData) return; // Prevent multiple fetches
  
          setCelestialData(await CollectCelestialData(year, 43.09, -89.39, CelestialBody.NauticalTwilight,-6));
      }
      fetchData();
    }, []);
  

  if (celestialData){
    return (
      <div className="App" style={{ height: '100vh', width: '100%' }}>
        <div style={{ display: 'flex', flexDirection: 'row', height: '100%', width: '100%' }}>
          <Sidebar
            latitude={43.09} 
            longitude={-89.39} 
            timezone={-6} 
            onUpdate={(year, latitude, longitude, timezone) => {
              setYear(year); // Update the year state
              CollectCelestialData(year, latitude, longitude, CelestialBody.NauticalTwilight, timezone).then(setCelestialData);
            }}
          />
          
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
              <StargazerCalendar 
                year={year} 
                celestialData={celestialData}
                onYearChange={(newYear) => {
                  setYear(newYear);
                  CollectCelestialData(newYear, 43.09, -89.39, CelestialBody.NauticalTwilight, -6).then(setCelestialData);
                }}
              />
            </div>
          </div>
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
