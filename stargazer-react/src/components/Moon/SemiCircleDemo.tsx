import React, { useState } from 'react';
import { SemiCircle } from './Moon';
import './Moon.css';

/**
 * Demo component to showcase the SemiCircle component
 */
export const SemiCircleDemo: React.FC = () => {
  const [size, setSize] = useState(100);
  const [leftFacing, setLeftFacing] = useState(true);
  const [color, setColor] = useState('#3B82F6');

  return (
    <div className="semicircle-demo">
      <h2>SemiCircle Visualization</h2>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '20px' }}>
        <SemiCircle 
          leftFacing={leftFacing} 
          size={size} 
          color={color} 
          className="semicircle"
        />
        <div>
          <div><strong>Orientation: {leftFacing ? 'Left' : 'Right'} Facing</strong></div>
          <div>Size: {size}px</div>
        </div>
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
            checked={leftFacing}
            onChange={(e) => setLeftFacing(e.target.checked)}
          />
          {' '}Left Facing (unchecked = right facing)
        </label>
      </div>
      
      <div style={{ marginBottom: '20px' }}>
        <label htmlFor="color" style={{ display: 'block', marginBottom: '5px' }}>
          Color:
        </label>
        <input
          id="color"
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
      
      <h3>Sample Orientation Examples</h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px' }}>
        <div className="semicircle-container">
          <SemiCircle 
            leftFacing={true}
            size={50}
            color="#3B82F6"
            className="semicircle"
          />
          <div className="semicircle-label">Left Facing</div>
        </div>
        <div className="semicircle-container">
          <SemiCircle 
            leftFacing={false}
            size={50}
            color="#3B82F6"
            className="semicircle"
          />
          <div className="semicircle-label">Right Facing</div>
        </div>
      </div>
    </div>
  );
};

export default SemiCircleDemo;
