import React from 'react';

export default function DecoElement({ element }) {
  const style = element.style || {};
  const type = element.type;
  const stroke = style.stroke || style.borderColor || '#1a1a1a';
  const strokeWidth = style.strokeWidth ?? style.borderWidth ?? 2;
  const fill = style.fill || style.backgroundColor || 'transparent';
  const borderRadius = style.borderRadius || 0;
  const { w, h } = element;

  if (type === 'line') {
    const variant = element.content || 'horizontal';
    let x1 = 0, y1 = 0, x2 = w, y2 = 0;
    if (variant === 'vertical') { x1 = w / 2; y1 = 0; x2 = w / 2; y2 = h; }
    else if (variant === 'diagonal') { x1 = 0; y1 = 0; x2 = w; y2 = h; }
    else { x1 = 0; y1 = h / 2; x2 = w; y2 = h / 2; }

    return (
      <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={stroke} strokeWidth={strokeWidth} strokeLinecap="round" />
      </svg>
    );
  }

  // Box
  return (
    <div style={{
      width: '100%',
      height: '100%',
      backgroundColor: fill,
      border: `${strokeWidth}px solid ${stroke}`,
      borderRadius,
      boxSizing: 'border-box',
    }} />
  );
}
