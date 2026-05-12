import React, { useRef, useEffect, useState } from 'react';
import { loadFont } from '../useFonts.js';

export default function TextElement({ element, onChange, selected }) {
  const ref = useRef(null);
  const style = element.style || {};
  const [editing, setEditing] = useState(false);

  useEffect(() => {
    if (style.fontFamily) loadFont(style.fontFamily);
  }, [style.fontFamily]);

  useEffect(() => {
    if (!selected) setEditing(false);
  }, [selected]);

  useEffect(() => {
    if (!ref.current) return;
    if (!editing) return;
    const next = element.content || '';
    if (ref.current.innerHTML !== next) ref.current.innerHTML = next;
  }, [element.content, editing]);

  const textStyle = {
    width: '100%',
    height: '100%',
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
    overflow: 'hidden',
    padding: 4,
    boxSizing: 'border-box',
    wordWrap: 'break-word',
    cursor: editing ? 'text' : 'inherit',
    pointerEvents: editing ? 'auto' : 'none',
  };

  if (!editing) {
    return (
      <div
        style={textStyle}
        onDoubleClick={(e) => {
          e.stopPropagation();
          setEditing(true);
        }}
        dangerouslySetInnerHTML={{ __html: element.content || '' }}
      />
    );
  }

  return (
    <div
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={(e) => {
        onChange({ ...element, content: e.currentTarget.innerHTML });
        setEditing(false);
      }}
      onPointerDown={(e) => {
        e.stopPropagation();
      }}
      style={textStyle}
    />
  );
}
