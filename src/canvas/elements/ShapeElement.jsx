import React from 'react';

const shapes = {
  circle: (w, h, fill, stroke, sw) => (
    <ellipse cx={w / 2} cy={h / 2} rx={w / 2 - sw} ry={h / 2 - sw} fill={fill} stroke={stroke} strokeWidth={sw} />
  ),
  rect: (w, h, fill, stroke, sw) => (
    <rect x={sw / 2} y={sw / 2} width={w - sw} height={h - sw} fill={fill} stroke={stroke} strokeWidth={sw} />
  ),
  triangle: (w, h, fill, stroke, sw) => (
    <polygon points={`${w / 2},${sw} ${w - sw},${h - sw} ${sw},${h - sw}`} fill={fill} stroke={stroke} strokeWidth={sw} />
  ),
  star: (w, h, fill, stroke, sw) => {
    const cx = w / 2, cy = h / 2;
    const outer = Math.min(w, h) / 2 - sw;
    const inner = outer * 0.4;
    const pts = [];
    for (let i = 0; i < 10; i++) {
      const r = i % 2 === 0 ? outer : inner;
      const angle = (Math.PI / 5) * i - Math.PI / 2;
      pts.push(`${cx + r * Math.cos(angle)},${cy + r * Math.sin(angle)}`);
    }
    return <polygon points={pts.join(' ')} fill={fill} stroke={stroke} strokeWidth={sw} />;
  },
  arrow: (w, h, fill, stroke, sw) => (
    <polygon
      points={`${sw},${h * 0.35} ${w * 0.6},${h * 0.35} ${w * 0.6},${sw} ${w - sw},${h / 2} ${w * 0.6},${h - sw} ${w * 0.6},${h * 0.65} ${sw},${h * 0.65}`}
      fill={fill} stroke={stroke} strokeWidth={sw}
    />
  ),
};

export default function ShapeElement({ element }) {
  const style = element.style || {};
  const shape = element.content || 'rect';
  const fill = style.fill || 'transparent';
  const stroke = style.stroke || '#1a1a1a';
  const strokeWidth = style.strokeWidth ?? 2;
  const { w, h } = element;

  const renderer = shapes[shape] || shapes.rect;

  return (
    <svg width={w} height={h} style={{ display: 'block', overflow: 'visible' }}>
      {renderer(w, h, fill, stroke, strokeWidth)}
    </svg>
  );
}
