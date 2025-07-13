import React from 'react';

export function RobotFace({ size = 32 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <rect x="4" y="8" width="16" height="10" rx="4" fill="#181a1b"/>
      <circle cx="8" cy="13" r="1.5" fill="#fff"/>
      <circle cx="16" cy="13" r="1.5" fill="#fff"/>
      <rect x="10" y="16" width="4" height="1" rx="0.5" fill="#fff"/>
    </svg>
  );
} 