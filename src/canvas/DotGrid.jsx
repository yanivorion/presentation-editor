import React from 'react';

const GRID_SIZE = 20;

export default function DotGrid({ width = 1280, height = 800, visible = false }) {
  return (
    <svg
      data-dot-grid
      width={width}
      height={height}
      style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        opacity: visible ? 0.4 : 0,
        transition: 'opacity 150ms ease',
        zIndex: 999,
      }}
    >
      <defs>
        <pattern id="freeformDotGrid" width={GRID_SIZE} height={GRID_SIZE} patternUnits="userSpaceOnUse">
          <circle cx={GRID_SIZE / 2} cy={GRID_SIZE / 2} r={1} fill="rgba(0,0,0,0.4)" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#freeformDotGrid)" />
    </svg>
  );
}

export { GRID_SIZE };
