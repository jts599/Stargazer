import React, { useState } from 'react';
import { Moon } from './Moon';
import './Moon.css';

interface MoonDemoProps {
  initialIllumination?: number;
}

/**
 * Provides manual controls for exercising the Moon component.
 * @param props Optional initial illumination percentage.
 * @returns Interactive moon phase demo.
 * @sideEffects Mutates local React state as controls change.
 */
export const MoonDemo: React.FC<MoonDemoProps> = ({ initialIllumination = 50 }) => {
  const [illumination, setIllumination] = useState(initialIllumination);
  const [size, setSize] = useState(100);
  const [isWaxing, setIsWaxing] = useState(true);
  const [lightColor, setLightColor] = useState('#FFFDE7');
  const [darkColor, setDarkColor] = useState('#37474F');

  return (
    <div className="moon-demo">
      <h2>Moon Phase Visualization</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <Moon 
          illuminationPercentage={illumination} 
          size={size} 
          lightColor={lightColor}
          darkColor={darkColor}
          isWaxing={isWaxing}
          className="moon"
        />
        <div>
          <div><strong>{illumination}% Illuminated</strong></div>
          <div>{isWaxing ? 'Waxing' : 'Waning'} Phase</div>
        </div>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="illumination" style={{ display: 'block', marginBottom: '5px' }}>
          Illumination: {illumination}%
        </label>
        <input
          id="illumination"
          type="range"
          min="0"
          max="100"
          step="1"
          value={illumination}
          onChange={(e) => setIllumination(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="size" style={{ display: 'block', marginBottom: '5px' }}>
          Size: {size}px
        </label>
        <input
          id="size"
          type="range"
          min="20"
          max="200"
          step="1"
          value={size}
          onChange={(e) => setSize(Number(e.target.value))}
          style={{ width: '100%' }}
        />
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label>
          <input
            type="checkbox"
            checked={isWaxing}
            onChange={(e) => setIsWaxing(e.target.checked)}
          />
          {' '}Waxing (unchecked = waning)
        </label>
      </div>
      
      <div style={{ marginBottom: '20px', display: 'flex', gap: '20px' }}>
        <div>
          <label htmlFor="lightColor" style={{ display: 'block', marginBottom: '5px' }}>
            Light Color:
          </label>
          <input
            id="lightColor"
            type="color"
            value={lightColor}
            onChange={(e) => setLightColor(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="darkColor" style={{ display: 'block', marginBottom: '5px' }}>
            Dark Color:
          </label>
          <input
            id="darkColor"
            type="color"
            value={darkColor}
            onChange={(e) => setDarkColor(e.target.value)}
          />
        </div>
      </div>
      
      <h3>Preset Moon Phases</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        {[
          { name: 'New Moon', illumination: 0, isWaxing: true },
          { name: 'Waxing Crescent', illumination: 25, isWaxing: true },
          { name: 'First Quarter', illumination: 50, isWaxing: true },
          { name: 'Waxing Gibbous', illumination: 75, isWaxing: true },
          { name: 'Full Moon', illumination: 100, isWaxing: true },
          { name: 'Waning Gibbous', illumination: 75, isWaxing: false },
          { name: 'Last Quarter', illumination: 50, isWaxing: false },
          { name: 'Waning Crescent', illumination: 25, isWaxing: false }
        ].map((phase) => (
          <div key={phase.name} className="moon-container">
            <Moon 
              illuminationPercentage={phase.illumination}
              size={50}
              lightColor={lightColor}
              darkColor={darkColor}
              isWaxing={phase.isWaxing}
              className="moon"
            />
            <div className="moon-label">{phase.name}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MoonDemo;
