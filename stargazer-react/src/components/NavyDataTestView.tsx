import React, { useEffect, useState } from 'react';
import { LoadNavyDataRaw, CelestialBody } from '../core/NavyDataLoader';

export function NavyDataTestView(): React.ReactElement {
  const [navyData, setNavyData] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
        if (navyData) return; // Prevent multiple fetches
        const loadedNavyData = await LoadNavyDataRaw(CelestialBody.Moon, 2025, 43.09, -89.39);
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
