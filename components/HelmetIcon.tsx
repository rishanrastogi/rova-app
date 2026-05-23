import React from 'react';
import Svg, { Path, Line } from 'react-native-svg';

export default function HelmetIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {/* Aerodynamic cycling helmet shell */}
      <Path
        d="M 6 9 Q 7 3 13 3 Q 19 3 21 9 Q 22 13 20 16 L 7 16 Q 4 15 5 12 Z"
        fill={color}
      />
      {/* Visor at front */}
      <Path
        d="M 5 13 L 2 14 L 7 16 L 7 14 Z"
        fill={color}
      />
      {/* Vent grooves */}
      <Line x1="10" y1="5" x2="9" y2="11" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="13" y1="4" x2="12" y2="10" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" />
      <Line x1="16" y1="4.5" x2="15" y2="10" stroke="rgba(0,0,0,0.25)" strokeWidth="1.5" strokeLinecap="round" />
    </Svg>
  );
}
