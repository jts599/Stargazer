import { useEffect, useState } from 'react'
import './App.css'
import { NavyDataTestView } from './components/NavyDataTestView'
import { StargazerCalendar } from './components/StargazerCalendar'
import { CollectCelestialData } from './core/NavyDataLoader'
import type { ICelestialDay } from './core/interfaces'

function App() {
  const [activeTab, setActiveTab] = useState<'calendar' | 'navy'>('calendar')
  const [activeDate, setActiveDate] = useState<Date>(new Date());
  const [celestialData, setCelestialData] = useState<ICelestialDay[] | null>(null);
  
  useEffect(() => {
      async function fetchData() {
          if (celestialData) return; // Prevent multiple fetches
  
          setCelestialData(await CollectCelestialData(2025, 43.09, -89.39));
      }
      fetchData();
    }, []);
  

  if (celestialData){
    return (
      <>
      <StargazerCalendar year={2025}  />
      </>
    );
  }

  return (<></>);
}

export default App
