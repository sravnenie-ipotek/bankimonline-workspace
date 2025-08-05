/**
 * BankIM Logo Component
 * SVG logo based on Figma design specifications
 */

import React from 'react';

interface BankIMLogoProps {
  className?: string;
  width?: number;
  height?: number;
}

export const BankIMLogo: React.FC<BankIMLogoProps> = ({ 
  className, 
  width = 96, 
  height = 43 
}) => {
  return (
    <svg 
      className={className} 
      width={width} 
      height={height} 
      viewBox="0 0 96 43" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Yellow background for text area */}
      <rect width="96" height="27" fill="#FBE54D"/>
      
      {/* BankIM text */}
      <text 
        x="48" 
        y="19" 
        fontFamily="Arimo, sans-serif" 
        fontSize="18" 
        fontWeight="600" 
        fill="#111928" 
        textAnchor="middle"
      >
        BankIM
      </text>
      
      {/* Bottom decorative bars - Yellow section */}
      <rect x="0" y="33.2" width="6.7" height="9.4" fill="#FBE54D"/>
      <rect x="7.7" y="33.3" width="8.3" height="9.3" fill="#FBE54D"/>
      <rect x="17.4" y="33.3" width="7.5" height="9.3" fill="#FBE54D"/>
      <rect x="27" y="33.3" width="7.2" height="9.3" fill="#FBE54D"/>
      <rect x="35.5" y="33.4" width="1.4" height="9.2" fill="#FBE54D"/>
      <rect x="38.9" y="33.4" width="9.5" height="9.2" fill="#FBE54D"/>
      
      {/* Bottom decorative bars - White section */}
      <rect x="50.1" y="33.2" width="8.3" height="9.4" fill="#FFFFFF"/>
      <rect x="60.3" y="33.5" width="7.5" height="9.1" fill="#FFFFFF"/>
      <rect x="69.8" y="33.5" width="5.5" height="9.1" fill="#FFFFFF"/>
      <rect x="77.1" y="33.6" width="1.4" height="9" fill="#FFFFFF"/>
      <rect x="80.5" y="33.6" width="7.5" height="9" fill="#FFFFFF"/>
      <rect x="90.1" y="33.6" width="5.9" height="9" fill="#FFFFFF"/>
    </svg>
  );
};