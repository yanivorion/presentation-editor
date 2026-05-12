import React, { useCallback, useState, useRef, useEffect } from 'react';
import DotGrid from './DotGrid.jsx';
import CanvasElement from './CanvasElement.jsx';
import TextElement from './elements/TextElement.jsx';
import ImageElement from './elements/ImageElement.jsx';
import ShapeElement from './elements/ShapeElement.jsx';
import DecoElement from './elements/DecoElement.jsx';

const SLIDE_W = 1280;
const SLIDE_H = 800;

function renderElementContent(element, onChange, selected) {
  switch (element.type) {
    case 'text':
    case 'title':
      return <TextElement element={element} onChange={onChange} selected={selected} />;
    case 'image':
      return <ImageElement element={element} />;
    case 'shape':
      return <ShapeElement element={element} />;
    case 'line':
    case 'box':
      return <DecoElement element={element} />;
    default:
      return null;
  }
}

export default function ElementsCanvas({
  elements = [],
  selectedIds = [],
  scale,
  onSelect,
  onChange,
  multiDragBus,
}) {
  const [interacting, setInteracting] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (selectedIds.length > 0 && containerRef.current) {
      containerRef.current.focus({ preventScroll: true });
    }
  }, [selectedIds]);

  const handleElementChange = useCallback((updatedEl) => {
    const next = elements.map((el) => el.id === updatedEl.id ? updatedEl : el);
    onChange(next);
  }, [elements, onChange]);

  const handleMultiDrag = useCallback((dx, dy) => {
    const next = elements.map(el => {
      if (selectedIds.includes(el.id) && !el.locked && el.visible !== false) {
        return { ...el, x: el.x + dx, y: el.y + dy };
      }
      return el;
    });
    onChange(next);
    if (multiDragBus) multiDragBus.broadcast('__freeform__', dx, dy);
  }, [elements, selectedIds, onChange, multiDragBus]);

  const handleSelect = useCallback((id, additive) => {
    if (id === null) {
      onSelect([]);
    } else if (additive) {
      if (selectedIds.includes(id)) {
        onSelect(selectedIds.filter(sid => sid !== id));
      } else {
        onSelect([...selectedIds, id]);
      }
    } else {
      onSelect([id]);
    }
  }, [onSelect, selectedIds]);

  const handleAltDrag = useCallback((ids) => {
    const toDup = elements.filter(el => ids.includes(el.id));
    const duped = toDup.map(el => ({
      ...el,
      id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      x: el.x + 20,
      y: el.y + 20,
    }));
    onChange([...elements, ...duped]);
    onSelect(duped.map(el => el.id));
  }, [elements, onChange, onSelect]);

  const handleKeyDown = useCallback((e) => {
    if (selectedIds.length === 0) return;

    if (e.key === 'Delete' || e.key === 'Backspace') {
      if (document.activeElement?.contentEditable === 'true') return;
      e.preventDefault();
      onChange(elements.filter(el => !selectedIds.includes(el.id)));
      onSelect([]);
      return;
    }

    const step = e.shiftKey ? 20 : 1;
    let dx = 0, dy = 0;
    if (e.key === 'ArrowLeft') dx = -step;
    else if (e.key === 'ArrowRight') dx = step;
    else if (e.key === 'ArrowUp') dy = -step;
    else if (e.key === 'ArrowDown') dy = step;
    else return;

    e.preventDefault();
    handleMultiDrag(dx, dy);
  }, [selectedIds, elements, handleMultiDrag, onChange, onSelect]);

  const sorted = [...elements].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));

  return (
    <div
      ref={containerRef}
      tabIndex={0}
      onKeyDown={handleKeyDown}
      style={{
        position: 'absolute',
        inset: 0,
        width: SLIDE_W,
        height: SLIDE_H,
        outline: 'none',
        pointerEvents: 'none',
      }}
    >
      <DotGrid width={SLIDE_W} height={SLIDE_H} visible={interacting} />

      {sorted.map((el) => (
        <CanvasElement
          key={el.id}
          element={el}
          selected={selectedIds.includes(el.id)}
          scale={scale}
          onSelect={handleSelect}
          onChange={handleElementChange}
          onInteractionChange={setInteracting}
          selectedIds={selectedIds}
          onMultiDrag={handleMultiDrag}
          onAltDrag={handleAltDrag}
        >
          {renderElementContent(el, handleElementChange, selectedIds.includes(el.id))}
        </CanvasElement>
      ))}

    </div>
  );
}
