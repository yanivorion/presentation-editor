import React from 'react';
import { Type, Heading, Image, Circle, Minus, Square } from 'lucide-react';

const uid = () => `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

const TOOLS = [
  { type: 'text', icon: Type, title: 'Text', defaults: { w: 300, h: 60, content: 'Text', style: { fontSize: 18, fontWeight: 400 } } },
  { type: 'title', icon: Heading, title: 'Title', defaults: { w: 500, h: 80, content: 'Title', style: { fontSize: 48, fontWeight: 700 } } },
  { type: 'image', icon: Image, title: 'Image', defaults: { w: 300, h: 200, content: '' } },
  { type: 'shape', icon: Circle, title: 'Shape', defaults: { w: 120, h: 120, content: 'circle', style: { fill: 'transparent', stroke: '#1a1a1a', strokeWidth: 2 } } },
  { type: 'line', icon: Minus, title: 'Line', defaults: { w: 200, h: 4, content: 'horizontal', style: { stroke: '#1a1a1a', strokeWidth: 2 } } },
  { type: 'box', icon: Square, title: 'Box', defaults: { w: 200, h: 140, content: '', style: { fill: 'transparent', stroke: '#1a1a1a', strokeWidth: 2, borderRadius: 0 } } },
];

const btnStyle = {
  width: 32,
  height: 32,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  border: '1px solid rgba(0,0,0,0.12)',
  borderRadius: 6,
  background: '#fff',
  cursor: 'pointer',
  fontSize: 14,
  fontWeight: 600,
  transition: 'all 150ms ease',
  color: '#333',
};

export default function ElementToolbar({ onAdd }) {
  const addElement = (tool) => {
    const el = {
      id: uid(),
      type: tool.type,
      x: 640 - (tool.defaults.w / 2),
      y: 400 - (tool.defaults.h / 2),
      w: tool.defaults.w,
      h: tool.defaults.h,
      rotation: 0,
      zIndex: Date.now(),
      locked: false,
      visible: true,
      style: {
        fontFamily: 'Inter',
        fontSize: 18,
        fontWeight: 400,
        fontStyle: 'normal',
        textDecoration: 'none',
        letterSpacing: 0,
        lineHeight: 1.4,
        textAlign: 'left',
        color: '#1a1a1a',
        backgroundColor: 'transparent',
        borderColor: '#1a1a1a',
        borderWidth: 0,
        borderRadius: 0,
        opacity: 1,
        fill: 'transparent',
        stroke: '#1a1a1a',
        strokeWidth: 2,
        ...tool.defaults.style,
      },
      content: tool.defaults.content,
    };
    onAdd(el);
  };

  return (
    <div style={{
      display: 'flex',
      gap: 4,
      padding: '6px 10px',
      background: 'rgba(255,255,255,0.85)',
      backdropFilter: 'blur(12px)',
      borderRadius: 8,
      border: '1px solid rgba(0,0,0,0.08)',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    }}>
      {TOOLS.map((tool) => {
        const Icon = tool.icon;
        return (
          <button
            key={tool.type}
            title={tool.title}
            onClick={() => addElement(tool)}
            style={btnStyle}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#f0f0f0'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; }}
          >
            <Icon size={16} strokeWidth={1.8} />
          </button>
        );
      })}
    </div>
  );
}
