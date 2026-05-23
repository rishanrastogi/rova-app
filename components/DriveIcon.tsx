import React from 'react';
import Svg, { Rect, Circle, Line, G } from 'react-native-svg';

export default function DriveIcon({ color, size = 24 }: { color: string; size?: number }) {
  return (
    <Svg width={size} height={size} viewBox="14 36 98 56">
      {/* Motor housing */}
      <Rect x="16" y="46" width="40" height="36" rx="8" fill={color} />
      {/* Motor windings */}
      <Rect x="22" y="54" width="6" height="20" rx="3" fill={color} opacity={0.4} />
      <Rect x="32" y="54" width="6" height="20" rx="3" fill={color} opacity={0.4} />
      {/* Shaft connector */}
      <Rect x="50" y="59" width="18" height="10" rx="3" fill={color} />
      {/* Outer wheel ring */}
      <Circle cx="84" cy="64" r="26" fill="none" stroke={color} strokeWidth="4" />
      {/* Inner wheel ring */}
      <Circle cx="84" cy="64" r="20" fill="none" stroke={color} strokeWidth="3" />
      {/* Spokes */}
      <G stroke={color} strokeWidth="2.5">
        <Line x1="84" y1="44" x2="84" y2="84" />
        <Line x1="64" y1="64" x2="104" y2="64" />
        <Line x1="70" y1="50" x2="98" y2="78" />
        <Line x1="70" y1="78" x2="98" y2="50" />
      </G>
      {/* Hub */}
      <Circle cx="84" cy="64" r="5" fill={color} />
    </Svg>
  );
}
