import React from 'react';
import { Moon } from './Moon';
import './Moon.css';

interface MoonDisplayProps {
  /** Illumination percentage (0-100) */
  illuminationPercentage: number;
  
  /** Size of the moon in pixels */
  size?: number;
  
  /** Optional CSS class name */
  className?: string;
  
  /** Optional label to display alongside the moon */
  label?: string;
  
  /** Whether to show waxing or waning phase */
  isWaxing?: boolean;
}

/**
 * Simple wrapper for the Moon component that includes an optional label
 */
export const MoonDisplay: React.FC<MoonDisplayProps> = ({
  illuminationPercentage,
  size = 30,
  className = '',
  label,
  isWaxing = true
}) => {
  return (
    <div className={`moon-container ${className}`}>
      <Moon 
        illuminationPercentage={illuminationPercentage}
        size={size}
        isWaxing={isWaxing}
        className="moon"
      />
      {label && <span className="moon-label">{label}</span>}
    </div>
  );
};

export default MoonDisplay;
