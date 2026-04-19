import React from 'react';

const MIN_ILLUMINATION = 0;
const HALF_ILLUMINATION = 50;
const MAX_ILLUMINATION = 100;

export interface IMoonProps {
  /**
   * Illumination percentage (0-100)
   * 0 = new moon (completely dark)
   * 50 = half moon (half illuminated)
   * 100 = full moon (completely illuminated)
   */
  illuminationPercentage: number;
  
  /** Size of the moon in pixels */
  size?: number;
  
  /** Color of the illuminated part */
  lightColor?: string;
  
  /** Color of the dark part */
  darkColor?: string;

  /** Optional CSS class name */
  className?: string;

  /** Whether to show the moon with waxing (true) or waning (false) phase */
  isWaxing?: boolean;
}

/**
 * Displays a moon with a customizable illumination percentage.
 * @param props Moon phase, sizing, color, and orientation settings.
 * @returns Layered SVG moon phase graphic.
 * @sideEffects None.
 */
export const Moon: React.FC<IMoonProps> = ({
  illuminationPercentage,
  size = 60,
  lightColor = '#FFFDE7',
  darkColor = '#37474F',
  className = '',
  isWaxing = true
}) => {
  const illumination = Math.max(MIN_ILLUMINATION, Math.min(MAX_ILLUMINATION, illuminationPercentage));
  let leftColor = lightColor;
  let rightColor = darkColor;

  if (!isWaxing) {
    leftColor = darkColor;
    rightColor = lightColor;
  }

  let elipseColor = illumination < HALF_ILLUMINATION ? darkColor : lightColor;
  const hideEllipse = illumination === HALF_ILLUMINATION;

  if (illumination === MAX_ILLUMINATION) {
    leftColor = lightColor;
    rightColor = lightColor;
    elipseColor = lightColor;
  }

  if (illumination === MIN_ILLUMINATION) {
    leftColor = darkColor;
    rightColor = darkColor;
    elipseColor = darkColor;
  }
  
  return (
    <div style={{ position: 'relative', width: size, height: size }} className={className}>
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <SemiCircle color={leftColor} size={size} />
      </div>
      <div style={{ position: 'absolute', top: 0, left: 0 }}>
        <SemiCircle color={rightColor} size={size} leftFacing/>
      </div>
      {!hideEllipse && 
        <div style={{ position: 'absolute', top: 0, left: 0 }}>
          <MiddleElipse percentage={illumination} size={size} color={elipseColor} />
        </div>
      }
    </div>
  );
};



export interface ISemiCircleProps {
  /** Whether the semi-circle faces left (true) or right (false) */
  leftFacing?: boolean;
  
  /** Size of the semi-circle in pixels */
  size: number;
  
  
  /** Color of the semi-circle */
  color: string;
  
  /** Optional CSS class name */
  className?: string;
}

/**
 * Displays a semi-circle with customizable orientation.
 * @param props Direction, size, color, and optional CSS class.
 * @returns SVG semi-circle path.
 * @sideEffects None.
 */
export const SemiCircle: React.FC<ISemiCircleProps> = ({
  leftFacing = false,
  size,
  color,
  className = ''
}) => {
  const center = size / 2;
  const direction = leftFacing ? 1 : 0;
  const pathData = `M ${center},0 A ${center},${center} 0 0,${direction} ${center},${size} Z`;



  return (
    <svg 
      width={size} 
      height={size} 
      viewBox={`0 0 ${size} ${size}`}
      className={className}
      aria-label={`Semi-circle facing ${leftFacing ? 'left' : 'right'}`}
    >
      <path
        d={pathData}
        fill={color}
        stroke="none"
      />
    </svg>
  );
};


interface IMiddleElipseProps {
  percentage: number;
  size: number;
  color: string;
}

/**
 * Draws the central ellipse that adjusts crescent and gibbous moon phases.
 * @param props Illumination percentage, pixel size, and fill color.
 * @returns SVG ellipse layer.
 * @sideEffects None.
 */
export const MiddleElipse: React.FC<IMiddleElipseProps> = ({ percentage, size, color }) => {
  const width = size * Math.abs(percentage - HALF_ILLUMINATION) / MAX_ILLUMINATION;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <ellipse
        cx={size / 2}
        cy={size / 2}
        rx={width}
        ry={size/2}
        fill={color}
        stroke="none"
      />
    </svg>
  );
};

export default Moon;
