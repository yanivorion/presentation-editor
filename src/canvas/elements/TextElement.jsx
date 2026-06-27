import React, { useRef, useEffect, useCallback } from 'react';
import { loadFont } from '../useFonts.js';

export default function TextElement({ element, onChange, selected, contentEditing, onExitEditing }) {
  const ref = useRef(null);
  const style = element.style || {};

  useEffect(() => {
    if (style.fontFamily) loadFont(style.fontFamily);
  }, [style.fontFamily]);

  useEffect(() => {
    if (!selected && contentEditing && onExitEditing) {
      onExitEditing();
    }
  }, [selected]);

  useEffect(() => {
    if (!contentEditing || !ref.current) return;
    const next = element.content || '';
    if (ref.current.innerHTML !== next) ref.current.innerHTML = next;
    ref.current.focus();
    const sel = window.getSelection();
    sel.selectAllChildren(ref.current);
    sel.collapseToEnd();
  }, [contentEditing]);

  const commitEdit = useCallback(() => {
    if (!ref.current) return;
    onChange({ ...element, content: ref.current.innerHTML });
    if (onExitEditing) onExitEditing();
  }, [element, onChange, onExitEditing]);

  const textStyle = {
    width: '100%',
    minHeight: '100%',
    fontFamily: style.fontFamily || 'Inter',
    fontSize: style.fontSize || (element.type === 'title' ? 48 : 18),
    fontWeight: style.fontWeight || (element.type === 'title' ? 700 : 400),
    fontStyle: style.fontStyle || 'normal',
    textDecoration: style.textDecoration || 'none',
    letterSpacing: style.letterSpacing ? `${style.letterSpacing}px` : undefined,
    lineHeight: style.lineHeight || 1.4,
    textAlign: style.textAlign || 'left',
    color: style.color || '#1a1a1a',
    backgroundColor: style.backgroundColor || 'transparent',
    border: 'none',
    outline: 'none',
    overflow: 'visible',
    padding: 4,
    boxSizing: 'border-box',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
  };

  if (!contentEditing) {
    return (
      <div
        style={{ ...textStyle, cursor: 'inherit', pointerEvents: 'none', userSelect: 'none' }}
        dangerouslySetInnerHTML={{ __html: element.content || '' }}
      />
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={commitEdit}
      onKeyDown={(e) => {
        if (e.key === 'Escape') {
          e.preventDefault();
          ref.current?.blur();
          return;
        }
        e.stopPropagation();
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      style={{ ...textStyle, cursor: 'text', pointerEvents: 'auto', userSelect: 'text' }}
    />
  );
}
