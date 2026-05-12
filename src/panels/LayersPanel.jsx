import React, { useRef } from 'react';
import { Type, Heading, Image, Circle, Minus, Square } from 'lucide-react';

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const TYPE_ICONS = {
  text: Type,
  title: Heading,
  image: Image,
  shape: Circle,
  line: Minus,
  box: Square,
};

export default function LayersPanel({
  elements = [],
  selectedIds = [],
  onSelect,
  onChange,
  globalHeaderEnabled,
  globalFooterEnabled,
  onToggleHeader,
  onToggleFooter,
}) {
  const dragRef = useRef({ from: null });

  const sorted = [...elements].sort((a, b) => (b.zIndex || 0) - (a.zIndex || 0));

  const toggleVisibility = (id) => {
    const next = elements.map((el) => el.id === id ? { ...el, visible: !el.visible } : el);
    onChange(next);
  };

  const toggleLock = (id) => {
    const next = elements.map((el) => el.id === id ? { ...el, locked: !el.locked } : el);
    onChange(next);
  };

  const reorder = (fromIdx, toIdx) => {
    const reordered = sorted.slice();
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const withZ = reordered.map((el, i) => ({ ...el, zIndex: reordered.length - i }));
    onChange(withZ);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: sysFont }}>
      <div style={{ padding: '10px 12px', borderBottom: '1px solid rgba(0,0,0,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#999' }}>
          Layers · {elements.length}
        </span>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 0' }}>
        {sorted.map((el, idx) => (
          <div
            key={el.id}
            draggable
            onDragStart={() => { dragRef.current.from = idx; }}
            onDragOver={(e) => e.preventDefault()}
            onDrop={() => {
              if (dragRef.current.from != null && dragRef.current.from !== idx) {
                reorder(dragRef.current.from, idx);
              }
              dragRef.current.from = null;
            }}
            onClick={(e) => onSelect(e.shiftKey ? (selectedIds.includes(el.id) ? selectedIds.filter(id => id !== el.id) : [...selectedIds, el.id]) : [el.id])}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              padding: '5px 12px',
              cursor: 'pointer',
              background: selectedIds.includes(el.id) ? 'rgba(74,144,217,0.1)' : 'transparent',
              borderLeft: selectedIds.includes(el.id) ? '3px solid #4a90d9' : '3px solid transparent',
              fontSize: 11,
              fontWeight: 500,
              color: el.visible ? '#333' : '#bbb',
              transition: 'background 100ms',
            }}
          >
            <span style={{ width: 18, display:'inline-flex', alignItems:'center', justifyContent:'center', flexShrink: 0 }}>
              {(() => { const Icon = TYPE_ICONS[el.type]; return Icon ? <Icon size={13} strokeWidth={1.8} /> : '?'; })()}
            </span>
            <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {el.type === 'text' || el.type === 'title'
                ? (el.content || '').replace(/<[^>]+>/g, '').slice(0, 24) || el.type
                : el.type}
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); toggleVisibility(el.id); }}
              title={el.visible ? 'Hide' : 'Show'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, opacity: 0.6, padding: '0 2px' }}
            >
              {el.visible !== false ? '👁' : '👁‍🗨'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); toggleLock(el.id); }}
              title={el.locked ? 'Unlock' : 'Lock'}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 11, opacity: 0.6, padding: '0 2px' }}
            >
              {el.locked ? '🔒' : '🔓'}
            </button>
          </div>
        ))}

        {elements.length === 0 && (
          <div style={{ padding: '20px 12px', color: '#bbb', fontSize: 11, textAlign: 'center' }}>
            No elements yet. Use the toolbar to add.
          </div>
        )}
      </div>

      {/* Global Header/Footer toggles */}
      <div style={{ borderTop: '1px solid rgba(0,0,0,0.08)', padding: '10px 12px' }}>
        <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#999', marginBottom: 8 }}>
          Globals
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer', marginBottom: 4 }}>
          <input type="checkbox" checked={globalHeaderEnabled} onChange={onToggleHeader} />
          Header on this slide
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 11, cursor: 'pointer' }}>
          <input type="checkbox" checked={globalFooterEnabled} onChange={onToggleFooter} />
          Footer on this slide
        </label>
      </div>
    </div>
  );
}
