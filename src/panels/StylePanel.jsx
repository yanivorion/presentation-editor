import React from 'react';
import { ALL_FONTS, loadFont } from '../canvas/useFonts.js';

const sysFont = "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

const WEIGHTS = [
  { v: 100, l: '100 Thin' }, { v: 200, l: '200 Extra Light' }, { v: 300, l: '300 Light' },
  { v: 400, l: '400 Regular' }, { v: 500, l: '500 Medium' }, { v: 600, l: '600 Semi Bold' },
  { v: 700, l: '700 Bold' }, { v: 800, l: '800 Extra Bold' }, { v: 900, l: '900 Black' },
];

const SHAPES = [
  { v: 'circle', l: 'Circle' }, { v: 'rect', l: 'Rectangle' },
  { v: 'triangle', l: 'Triangle' }, { v: 'star', l: 'Star' }, { v: 'arrow', l: 'Arrow' },
];

const LINE_VARIANTS = [
  { v: 'horizontal', l: 'Horizontal' }, { v: 'vertical', l: 'Vertical' }, { v: 'diagonal', l: 'Diagonal' },
];

const label = { fontSize: 10, fontWeight: 600, color: '#666', textTransform: 'uppercase', letterSpacing: '.08em', marginBottom: 4 };
const row = { display: 'flex', gap: 8, marginBottom: 10, alignItems: 'center' };
const input = { height: 28, border: '1px solid #ddd', borderRadius: 5, padding: '0 8px', fontSize: 12, width: '100%', boxSizing: 'border-box', fontFamily: sysFont };
const select = { ...input, appearance: 'auto' };

function ColorInput({ value, onChange }) {
  return (
    <div style={{ display: 'flex', gap: 4, alignItems: 'center', width: '100%' }}>
      <input type="color" value={value || '#000000'} onChange={(e) => onChange(e.target.value)}
        style={{ width: 28, height: 28, border: '1px solid #ddd', borderRadius: 4, padding: 0, cursor: 'pointer' }} />
      <input type="text" value={value || ''} onChange={(e) => onChange(e.target.value)}
        style={{ ...input, flex: 1 }} placeholder="#000000" />
    </div>
  );
}

export default function StylePanel({ element, onChange, fontFamilies = ALL_FONTS }) {
  if (!element) return null;

  const style = element.style || {};
  const updStyle = (k, v) => onChange({ ...element, style: { ...style, [k]: v } });
  const upd = (k, v) => onChange({ ...element, [k]: v });

  const isText = element.type === 'text' || element.type === 'title';
  const isShape = element.type === 'shape';
  const isLine = element.type === 'line';
  const isBox = element.type === 'box';
  const isImage = element.type === 'image';

  return (
    <div style={{ padding: 14, overflowY: 'auto', height: '100%', fontFamily: sysFont, fontSize: 12 }}>
      <div style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#999', marginBottom: 12 }}>
        Element Style — {element.type}
      </div>

      {/* Position & Size */}
      <div style={{ ...label }}>Position & Size</div>
      <div style={row}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#999' }}>X</div>
          <input type="number" value={Math.round(element.x)} onChange={(e) => upd('x', +e.target.value)} style={input} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#999' }}>Y</div>
          <input type="number" value={Math.round(element.y)} onChange={(e) => upd('y', +e.target.value)} style={input} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#999' }}>W</div>
          <input type="number" value={Math.round(element.w)} onChange={(e) => upd('w', Math.max(20, +e.target.value))} style={input} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#999' }}>H</div>
          <input type="number" value={Math.round(element.h)} onChange={(e) => upd('h', Math.max(20, +e.target.value))} style={input} />
        </div>
      </div>
      <div style={row}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#999' }}>Rotation</div>
          <input type="number" value={element.rotation || 0} onChange={(e) => upd('rotation', +e.target.value)} style={input} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 9, color: '#999' }}>Opacity</div>
          <input type="number" min={0} max={1} step={0.05} value={style.opacity ?? 1} onChange={(e) => updStyle('opacity', +e.target.value)} style={input} />
        </div>
      </div>

      {/* Typography */}
      {isText && (
        <>
          <div style={{ ...label, marginTop: 8 }}>Typography</div>
          <div style={row}>
            <select value={style.fontFamily || 'Inter'} onChange={(e) => { loadFont(e.target.value); updStyle('fontFamily', e.target.value); }} style={{ ...select, flex: 2 }}>
              {fontFamilies.map((f) => <option key={f} value={f}>{f}</option>)}
            </select>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Size</div>
              <input type="number" min={8} max={200} value={style.fontSize || 18} onChange={(e) => updStyle('fontSize', +e.target.value)} style={input} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Weight</div>
              <select value={style.fontWeight || 400} onChange={(e) => updStyle('fontWeight', +e.target.value)} style={select}>
                {WEIGHTS.map((w) => <option key={w.v} value={w.v}>{w.l}</option>)}
              </select>
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Style</div>
              <select value={style.fontStyle || 'normal'} onChange={(e) => updStyle('fontStyle', e.target.value)} style={select}>
                <option value="normal">Normal</option>
                <option value="italic">Italic</option>
              </select>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Decoration</div>
              <select value={style.textDecoration || 'none'} onChange={(e) => updStyle('textDecoration', e.target.value)} style={select}>
                <option value="none">None</option>
                <option value="underline">Underline</option>
                <option value="line-through">Strikethrough</option>
              </select>
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Letter Spacing</div>
              <input type="number" step={0.5} value={style.letterSpacing || 0} onChange={(e) => updStyle('letterSpacing', +e.target.value)} style={input} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Line Height</div>
              <input type="number" step={0.1} min={0.5} max={4} value={style.lineHeight || 1.4} onChange={(e) => updStyle('lineHeight', +e.target.value)} style={input} />
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Align</div>
              <div style={{ display: 'flex', gap: 2 }}>
                {['left', 'center', 'right', 'justify'].map((a) => (
                  <button key={a} onClick={() => updStyle('textAlign', a)}
                    style={{ flex: 1, height: 26, border: '1px solid #ddd', borderRadius: 4,
                      background: style.textAlign === a ? '#4a90d9' : '#fff',
                      color: style.textAlign === a ? '#fff' : '#333',
                      cursor: 'pointer', fontSize: 10, fontWeight: 600 }}>
                    {a[0].toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Text Color</div>
              <ColorInput value={style.color} onChange={(v) => updStyle('color', v)} />
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Background</div>
              <ColorInput value={style.backgroundColor} onChange={(v) => updStyle('backgroundColor', v)} />
            </div>
          </div>
        </>
      )}

      {/* Image */}
      {isImage && (
        <>
          <div style={{ ...label, marginTop: 8 }}>Image</div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>URL</div>
              <input type="text" value={element.content || ''} onChange={(e) => upd('content', e.target.value)} style={input} placeholder="https://..." />
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Border Radius</div>
              <input type="number" min={0} value={style.borderRadius || 0} onChange={(e) => updStyle('borderRadius', +e.target.value)} style={input} />
            </div>
          </div>
        </>
      )}

      {/* Shape */}
      {isShape && (
        <>
          <div style={{ ...label, marginTop: 8 }}>Shape</div>
          <div style={row}>
            <select value={element.content || 'rect'} onChange={(e) => upd('content', e.target.value)} style={select}>
              {SHAPES.map((s) => <option key={s.v} value={s.v}>{s.l}</option>)}
            </select>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Fill</div>
              <ColorInput value={style.fill} onChange={(v) => updStyle('fill', v)} />
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Stroke</div>
              <ColorInput value={style.stroke} onChange={(v) => updStyle('stroke', v)} />
            </div>
            <div style={{ width: 60 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Width</div>
              <input type="number" min={0} max={20} value={style.strokeWidth ?? 2} onChange={(e) => updStyle('strokeWidth', +e.target.value)} style={input} />
            </div>
          </div>
        </>
      )}

      {/* Line */}
      {isLine && (
        <>
          <div style={{ ...label, marginTop: 8 }}>Line</div>
          <div style={row}>
            <select value={element.content || 'horizontal'} onChange={(e) => upd('content', e.target.value)} style={select}>
              {LINE_VARIANTS.map((l) => <option key={l.v} value={l.v}>{l.l}</option>)}
            </select>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Stroke Color</div>
              <ColorInput value={style.stroke} onChange={(v) => updStyle('stroke', v)} />
            </div>
            <div style={{ width: 60 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Width</div>
              <input type="number" min={1} max={20} value={style.strokeWidth ?? 2} onChange={(e) => updStyle('strokeWidth', +e.target.value)} style={input} />
            </div>
          </div>
        </>
      )}

      {/* Box */}
      {isBox && (
        <>
          <div style={{ ...label, marginTop: 8 }}>Box</div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Fill</div>
              <ColorInput value={style.fill || style.backgroundColor} onChange={(v) => { updStyle('fill', v); updStyle('backgroundColor', v); }} />
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Border Color</div>
              <ColorInput value={style.stroke || style.borderColor} onChange={(v) => { updStyle('stroke', v); updStyle('borderColor', v); }} />
            </div>
            <div style={{ width: 60 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Width</div>
              <input type="number" min={0} max={20} value={style.strokeWidth ?? style.borderWidth ?? 2} onChange={(e) => { updStyle('strokeWidth', +e.target.value); updStyle('borderWidth', +e.target.value); }} style={input} />
            </div>
          </div>
          <div style={row}>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 9, color: '#999' }}>Border Radius</div>
              <input type="number" min={0} value={style.borderRadius || 0} onChange={(e) => updStyle('borderRadius', +e.target.value)} style={input} />
            </div>
          </div>
        </>
      )}

      {/* Lock / Visibility */}
      <div style={{ ...label, marginTop: 12 }}>Options</div>
      <div style={row}>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11 }}>
          <input type="checkbox" checked={element.locked || false} onChange={(e) => upd('locked', e.target.checked)} />
          Locked
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer', fontSize: 11 }}>
          <input type="checkbox" checked={element.visible !== false} onChange={(e) => upd('visible', e.target.checked)} />
          Visible
        </label>
      </div>
    </div>
  );
}
