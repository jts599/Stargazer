import React, { useEffect, useState } from 'react';
import { CollectCelestialData } from '../core/NavyDataLoader';

/**
 * Demo view for manually checking that Navy data can be fetched and parsed.
 * @returns React element with the first parsed sun rise time, or a loading state.
 * @throws Rendering itself does not throw; fetch failures are surfaced through the rejected effect promise.
 * @sideEffects Performs a Navy API request on mount and updates component state.
 */
export function NavyDataTestView(): React.ReactElement {
  const [navyData, setNavyData] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    /**
     * Loads a representative day from the Navy data pipeline.
     * @returns Promise that resolves after state is updated when the component is still mounted.
     * @throws Propagates CollectCelestialData failures to the console via the promise chain.
     * @sideEffects Performs network requests and may mutate local component state.
     */
    async function fetchData() {
        const celestialData = await CollectCelestialData(2025, 43.09, -89.39);
        const loadedNavyData = celestialData[0].sun?.rise?.toString() ?? 'No data available';
        if (isMounted) {
          setNavyData(loadedNavyData);
        }
    }
    fetchData();

    return () => {
      isMounted = false;
    };
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
