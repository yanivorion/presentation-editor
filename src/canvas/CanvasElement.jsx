import React, { useRef, useEffect } from 'react';
import { GRID_SIZE } from './DotGrid.jsx';

const HANDLE_SIZE = 6;
const HANDLES = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];

function snap(val) {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

const handlePos = (h, w, ht, sc = 1) => {
  const sz = HANDLE_SIZE / sc;
  const half = sz / 2;
  const map = {
    nw: { left: -half, top: -half, cursor: 'nwse-resize' },
    n:  { left: w / 2 - half, top: -half, cursor: 'ns-resize' },
    ne: { left: w - half, top: -half, cursor: 'nesw-resize' },
    e:  { left: w - half, top: ht / 2 - half, cursor: 'ew-resize' },
    se: { left: w - half, top: ht - half, cursor: 'nwse-resize' },
    s:  { left: w / 2 - half, top: ht - half, cursor: 'ns-resize' },
    sw: { left: -half, top: ht - half, cursor: 'nesw-resize' },
    w:  { left: -half, top: ht / 2 - half, cursor: 'ew-resize' },
  };
  return { ...map[h], sz };
};

export default function CanvasElement({
  element,
  selected,
  scale,
  onSelect,
  onChange,
  onInteractionChange,
  selectedIds = [],
  onMultiDrag,
  onAltDrag,
  children,
}) {
  const interactionRef = useRef(null);
  const wrapperRef = useRef(null);
  const elementRef = useRef(element);
  const scaleRef = useRef(scale);
  const onChangeRef = useRef(onChange);
  const onSelectRef = useRef(onSelect);
  const onInteractionRef = useRef(onInteractionChange);
  const selectedIdsRef = useRef(selectedIds);
  const onMultiDragRef = useRef(onMultiDrag);
  const onAltDragRef = useRef(onAltDrag);
  const lastDragPos = useRef(null);

  useEffect(() => { elementRef.current = element; }, [element]);
  useEffect(() => { scaleRef.current = scale; }, [scale]);
  useEffect(() => { onChangeRef.current = onChange; }, [onChange]);
  useEffect(() => { onSelectRef.current = onSelect; }, [onSelect]);
  useEffect(() => { onInteractionRef.current = onInteractionChange; }, [onInteractionChange]);
  useEffect(() => { selectedIdsRef.current = selectedIds; }, [selectedIds]);
  useEffect(() => { onMultiDragRef.current = onMultiDrag; }, [onMultiDrag]);
  useEffect(() => { onAltDragRef.current = onAltDrag; }, [onAltDrag]);

  useEffect(() => {
    const el = wrapperRef.current;
    if (!el) return;

    const onDown = (e) => {
      const elem = elementRef.current;
      if (elem.locked) {
        onSelectRef.current(elem.id, e.shiftKey);
        return;
      }
      e.stopPropagation();
      e.preventDefault();

      // Alt+drag = duplicate then drag the copy
      if (e.altKey && onAltDragRef.current) {
        onAltDragRef.current(selectedIdsRef.current.includes(elem.id) ? selectedIdsRef.current : [elem.id]);
        return;
      }

      const isMulti = selectedIdsRef.current.length > 1 && selectedIdsRef.current.includes(elem.id);
      if (!isMulti) {
        onSelectRef.current(elem.id, e.shiftKey);
      }

      el.setPointerCapture(e.pointerId);

      const handleEl = e.target.closest?.('[data-resize-handle]');
      if (handleEl) {
        const handle = handleEl.dataset.handleDir || 'se';
        interactionRef.current = {
          type: 'resize',
          handle,
          startX: e.clientX,
          startY: e.clientY,
          origX: elem.x,
          origY: elem.y,
          origW: elem.w,
          origH: elem.h,
        };
      } else {
        interactionRef.current = {
          type: 'drag',
          startX: e.clientX,
          startY: e.clientY,
          origX: elem.x,
          origY: elem.y,
          isMulti: isMulti || (e.shiftKey && selectedIdsRef.current.includes(elem.id)),
        };
        lastDragPos.current = { x: elem.x, y: elem.y };
      }
      if (onInteractionRef.current) onInteractionRef.current(true);
    };

    const onMove = (e) => {
      const interaction = interactionRef.current;
      if (!interaction) return;
      const currentScale = scaleRef.current;
      const elem = elementRef.current;

      if (interaction.type === 'resize') {
        const dx = (e.clientX - interaction.startX) / currentScale;
        const dy = (e.clientY - interaction.startY) / currentScale;
        const handle = interaction.handle;
        let x = interaction.origX, y = interaction.origY;
        let w = interaction.origW, h = interaction.origH;

        if (handle.includes('e')) w = Math.max(20, interaction.origW + dx);
        if (handle.includes('w')) { w = Math.max(20, interaction.origW - dx); x = interaction.origX + (interaction.origW - w); }
        if (handle.includes('s')) h = Math.max(20, interaction.origH + dy);
        if (handle.includes('n')) { h = Math.max(20, interaction.origH - dy); y = interaction.origY + (interaction.origH - h); }

        if (e.shiftKey && handle.length === 2) {
          const ratio = interaction.origW / interaction.origH;
          if (Math.abs(dx) > Math.abs(dy)) {
            h = w / ratio;
            if (handle.includes('n')) y = interaction.origY + interaction.origH - h;
          } else {
            w = h * ratio;
            if (handle.includes('w')) x = interaction.origX + interaction.origW - w;
          }
        }

        if (!e.altKey) { w = snap(w) || GRID_SIZE; h = snap(h) || GRID_SIZE; x = snap(x); y = snap(y); }
        onChangeRef.current({ ...elem, x, y, w, h });
      } else {
        const dx = (e.clientX - interaction.startX) / currentScale;
        const dy = (e.clientY - interaction.startY) / currentScale;
        let newX = interaction.origX + dx;
        let newY = interaction.origY + dy;
        if (!e.altKey) { newX = snap(newX); newY = snap(newY); }

        if (interaction.isMulti && onMultiDragRef.current) {
          const deltaX = newX - lastDragPos.current.x;
          const deltaY = newY - lastDragPos.current.y;
          if (deltaX !== 0 || deltaY !== 0) {
            onMultiDragRef.current(deltaX, deltaY);
            lastDragPos.current = { x: newX, y: newY };
          }
        } else {
          onChangeRef.current({ ...elem, x: newX, y: newY });
        }
      }
    };

    const onUp = (e) => {
      if (!interactionRef.current) return;
      interactionRef.current = null;
      lastDragPos.current = null;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      if (onInteractionRef.current) onInteractionRef.current(false);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };
  }, []);


  if (element.visible === false) return null;

  const { x, y, w, h, rotation = 0, locked } = element;

  return (
    <div
      ref={wrapperRef}
      data-canvas-element="true"
      style={{
        position: 'absolute',
        left: x,
        top: y,
        width: w,
        height: h,
        transform: rotation ? `rotate(${rotation}deg)` : undefined,
        transformOrigin: 'center center',
        outline: selected ? '2px solid #4a90d9' : undefined,
        outlineOffset: 1,
        overflow: 'visible',
        cursor: locked ? 'default' : 'move',
        zIndex: element.zIndex || 0,
        opacity: element.style?.opacity ?? 1,
        userSelect: 'none',
        touchAction: 'none',
        pointerEvents: 'auto',
      }}
    >
      {children}

      {selected && !locked && HANDLES.map((hName) => {
        const pos = handlePos(hName, w, h, scale);
        return (
          <div
            key={hName}
            data-resize-handle="true"
            data-handle-dir={hName}
            style={{
              position: 'absolute',
              left: pos.left,
              top: pos.top,
              width: pos.sz,
              height: pos.sz,
              background: '#fff',
              border: '1.5px solid #4a90d9',
              borderRadius: 2,
              cursor: pos.cursor,
              zIndex: 10,
              touchAction: 'none',
            }}
          />
        );
      })}
    </div>
  );
}
