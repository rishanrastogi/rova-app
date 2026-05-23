import React from 'react';
import Svg, { Circle, Line, Path } from 'react-native-svg';

export default function CyclistIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="16 6 46 68">
      {/* Helmet */}
      <Path
        d="M 44 20 Q 44 8 51 8 Q 61 8 61 18 L 59 21 Q 55 15 46 19 Z"
        fill={color}
      />
      {/* Head */}
      <Circle cx="51" cy="21" r="6" fill={color} />
      {/* Body - leaning forward */}
      <Line x1="49" y1="27" x2="38" y2="48" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      {/* Upper arm */}
      <Line x1="46" y1="33" x2="28" y2="39" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Forearm */}
      <Line x1="28" y1="39" x2="22" y2="47" stroke={color} strokeWidth="2.5" strokeLinecap="round" />
      {/* Front leg - knee up */}
      <Line x1="38" y1="48" x2="27" y2="40" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <Line x1="27" y1="40" x2="20" y2="50" stroke={color} strokeWidth="3" strokeLinecap="round" />
      {/* Back leg - knee down */}
      <Line x1="38" y1="48" x2="48" y2="60" stroke={color} strokeWidth="3.5" strokeLinecap="round" />
      <Line x1="48" y1="60" x2="56" y2="70" stroke={color} strokeWidth="3" strokeLinecap="round" />
    </Svg>
  );
}
