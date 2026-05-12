import React from 'react';

export default function ImageElement({ element }) {
  const style = element.style || {};
  const src = element.content || '';

  if (!src) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#f0f0f0',
        border: '1px dashed #ccc',
        borderRadius: style.borderRadius || 0,
        fontSize: 12,
        color: '#999',
        fontFamily: 'Inter, sans-serif',
      }}>
        No image — paste URL in style panel
      </div>
    );
  }

  return (
    <img
      src={src}
      alt=""
      draggable={false}
      style={{
        width: '100%',
        height: '100%',
        objectFit: 'cover',
        borderRadius: style.borderRadius || 0,
        opacity: style.opacity ?? 1,
      }}
    />
  );
}
