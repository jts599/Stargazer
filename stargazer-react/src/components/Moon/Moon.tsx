import React from 'react';

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
 * SVG Moon component that displays a moon with a customizable illumination percentage
 */
export const Moon: React.FC<IMoonProps> = ({
  illuminationPercentage,
  size = 60,
  lightColor = '#FFFDE7',
  darkColor = '#37474F',
  className = '',
  isWaxing = true
}) => {
  // Ensure illumination is between 0 and 100
  const illumination = Math.max(0, Math.min(100, illuminationPercentage));
  let leftColor=lightColor;
  let rightColor=darkColor;

  if (!isWaxing) {
    leftColor = darkColor;
    rightColor = lightColor;
  }

  // Calculate the x position of the shadow ellipse based on illumination percentage
  // For new moon (0%), the shadow covers the entire moon
  // For full moon (100%), the shadow is completely off to the side
  
  // Normalize illumination to -1 to 1 range where:
  // -1 = shadow completely covers the moon (new moon)
  // 0 = shadow covers exactly half the moon (half moon)
  // 1 = shadow is completely off to the side (full moon)
  let normalizedIllumination = (illumination / 50) - 1;
  
  // Reverse the direction for waning phase
  if (!isWaxing) {
    normalizedIllumination = -normalizedIllumination;
  }

  let elipseColor = illumination < 50 ? darkColor : lightColor;
  let hideEllipse = illumination === 50;

  if (illumination === 100) {
    leftColor = lightColor;
    rightColor = lightColor;
    elipseColor = lightColor;
  }

  if (illumination === 0) {
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
 * SVG SemiCircle component that displays a semi-circle with customizable orientation
 */
export const SemiCircle: React.FC<ISemiCircleProps> = ({
  leftFacing = false,
  size,
  color,
  className = ''
}) => {
  // Calculate the center of the semi-circle
  const center = size / 2;
  
  // Create the path for the semi-circle
  // The semi-circle is drawn using an arc path command
  // For a semicircle, we need to draw a half circle
  // If leftFacing is true, the semi-circle opens to the left (faces right)
  // If leftFacing is false, the semi-circle opens to the right (faces left)
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

export const MiddleElipse: React.FC<IMiddleElipseProps> = ({ percentage, size, color }) => {
  // Calculate the radius based on the percentage
  const width = size * Math.abs(percentage - 50) / 100;

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
