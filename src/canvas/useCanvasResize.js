import { useRef, useCallback } from 'react';
import { GRID_SIZE } from './DotGrid.jsx';

function snap(val) {
  return Math.round(val / GRID_SIZE) * GRID_SIZE;
}

const MIN_SIZE = 20;

export default function useCanvasResize({ scale, onResize, onEnd }) {
  const state = useRef(null);

  const onPointerDown = useCallback((e, handle, element) => {
    e.stopPropagation();
    e.preventDefault();
    e.currentTarget.setPointerCapture(e.pointerId);
    state.current = {
      handle,
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      origW: element.w,
      origH: element.h,
    };
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!state.current) return;
    const s = state.current;
    const dx = (e.clientX - s.startX) / scale;
    const dy = (e.clientY - s.startY) / scale;
    const keepRatio = e.shiftKey;
    const ratio = s.origW / s.origH;

    let { origX: x, origY: y, origW: w, origH: h } = s;
    const handle = s.handle;

    // Horizontal
    if (handle.includes('e')) { w = Math.max(MIN_SIZE, s.origW + dx); }
    if (handle.includes('w')) { w = Math.max(MIN_SIZE, s.origW - dx); x = s.origX + (s.origW - w); }
    // Vertical
    if (handle.includes('s')) { h = Math.max(MIN_SIZE, s.origH + dy); }
    if (handle.includes('n')) { h = Math.max(MIN_SIZE, s.origH - dy); y = s.origY + (s.origH - h); }

    if (keepRatio && (handle.length === 2)) {
      if (Math.abs(dx) > Math.abs(dy)) {
        h = w / ratio;
        if (handle.includes('n')) y = s.origY + s.origH - h;
      } else {
        w = h * ratio;
        if (handle.includes('w')) x = s.origX + s.origW - w;
      }
    }

    if (!e.altKey) {
      w = snap(w) || GRID_SIZE;
      h = snap(h) || GRID_SIZE;
      x = snap(x);
      y = snap(y);
    }

    onResize({ x, y, w, h });
  }, [scale, onResize]);

  const onPointerUp = useCallback((e) => {
    if (!state.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    state.current = null;
    if (onEnd) onEnd();
  }, [onEnd]);

  return { onPointerDown, onPointerMove, onPointerUp };
}
