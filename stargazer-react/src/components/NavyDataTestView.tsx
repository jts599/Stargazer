import React, { useEffect, useState } from 'react';
import { LoadNavyDataRaw, CollectCelestialData } from '../core/NavyDataLoader';

export function NavyDataTestView(): React.ReactElement {
  const [navyData, setNavyData] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
        if (navyData) return; // Prevent multiple fetches

        const celestialData = await CollectCelestialData(2025, 43.09, -89.39);
        const loadedNavyData = celestialData[0].sun?.rise?.toString() ?? 'No data available';
        setNavyData(loadedNavyData);
    }
    fetchData();
  }, []);

  if (!navyData) return <div>Loading...</div>;

  return (
    <div>
        <pre>
            {navyData}
        </pre>
    </div>
  );
}
