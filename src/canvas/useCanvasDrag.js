import { useRef, useCallback } from 'react';
import { GRID_SIZE } from './DotGrid.jsx';

function snap(val, gridSize) {
  return Math.round(val / gridSize) * gridSize;
}

export default function useCanvasDrag({ scale, onMove, onEnd }) {
  const state = useRef(null);

  const onPointerDown = useCallback((e, element) => {
    if (element.locked) return;
    e.stopPropagation();
    e.currentTarget.setPointerCapture(e.pointerId);
    state.current = {
      startX: e.clientX,
      startY: e.clientY,
      origX: element.x,
      origY: element.y,
      moved: false,
    };
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!state.current) return;
    const s = state.current;
    const dx = (e.clientX - s.startX) / scale;
    const dy = (e.clientY - s.startY) / scale;

    let newX = s.origX + dx;
    let newY = s.origY + dy;

    if (!e.shiftKey) {
      newX = snap(newX, GRID_SIZE);
      newY = snap(newY, GRID_SIZE);
    }

    s.moved = true;
    onMove(newX, newY);
  }, [scale, onMove]);

  const onPointerUp = useCallback((e) => {
    if (!state.current) return;
    e.currentTarget.releasePointerCapture(e.pointerId);
    if (state.current.moved && onEnd) onEnd();
    state.current = null;
  }, [onEnd]);

  return { onPointerDown, onPointerMove, onPointerUp };
}
