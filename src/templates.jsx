import React, { useEffect, useLayoutEffect, useRef, useState, useCallback, createContext, useContext } from 'react';
import { slideFont } from './ui.jsx';

export const SelectionContext = createContext([]);
export const SelectionSetContext = createContext(null);
export const HiddenTplContext = createContext([]);
export const TplGeometryContext = createContext({ geom: {}, setGeom: null });
export const MultiDragContext = createContext(null);

export function useMultiDragBus() {
  const listenersRef = useRef(new Set());
  const busRef = useRef({
    subscribe(cb) { listenersRef.current.add(cb); return () => listenersRef.current.delete(cb); },
    broadcast(sourceId, dx, dy) {
      listenersRef.current.forEach(cb => cb(sourceId, dx, dy));
    },
  });
  return busRef.current;
}

// Slide is rendered at native 1280×800 and scaled to fit by parent.
export const SLIDE_W = 1280;
export const SLIDE_H = 800;

// ─── Theme palettes ────────────────────────────────────────────────────────────
export const themePalette = (theme) => {
  switch (theme) {
    case 'yellow': return { bg:'#E8FF34', ink:'#0a0a0a', muted:'rgba(0,0,0,0.55)' };
    case 'black':  return { bg:'#0a0a0a', ink:'#ffffff', muted:'rgba(255,255,255,0.55)' };
    case 'gray':   return { bg:'#e9e9e9', ink:'#0a0a0a', muted:'#7a7a7a' };
    default:       return { bg:'#ffffff', ink:'#0a0a0a', muted:'#9a9a9a' };
  }
};

// ─── Editable text wrapper ────────────────────────────────────────────────────
// IMPORTANT: For the editable (contentEditable) variant we DO NOT use
// dangerouslySetInnerHTML in JSX — React's reconciler tends to skip re-setting
// innerHTML on contentEditable nodes once they've been interacted with, which
// breaks real-time updates when the user types in a Properties-panel input.
// Instead, we sync innerHTML via a useEffect that runs only when the incoming
// `value` actually differs from the DOM's current contents. This:
//   - Updates the canvas in real time when an external input changes the value.
//   - Does NOT clobber the DOM (or the cursor) while the user is typing
//     directly in this contentEditable, because the parent doesn't re-render
//     during in-place edits (we only commit on blur).
let _editableCounter = 0;
const HANDLE_SZ = 6;
const HANDLE_DIRS = ['nw', 'n', 'ne', 'e', 'se', 's', 'sw', 'w'];
const HANDLE_CURSOR = { nw:'nwse-resize', n:'ns-resize', ne:'nesw-resize', e:'ew-resize', se:'nwse-resize', s:'ns-resize', sw:'nesw-resize', w:'ew-resize' };

const Editable = ({ value, onChange, multiline, style, placeholder, editable = true, tag = 'div' }) => {
  const Tag = tag;
  const ref = useRef(null);
  const [editing, setEditing] = useState(false);
  const [localSelected, setLocalSelected] = useState(false);
  const externalSelectedIds = useContext(SelectionContext);
  const setExternalSelectedIds = useContext(SelectionSetContext);
  const hiddenTplIds = useContext(HiddenTplContext);
  const { geom: tplGeom, setGeom: setTplGeom } = useContext(TplGeometryContext);
  const multiDragBus = useContext(MultiDragContext);
  const wrapRef = useRef(null);
  const interactionRef = useRef(null);
  const idRef = useRef(null);
  if (idRef.current === null) idRef.current = `tpl_${++_editableCounter}`;
  const stableId = idRef.current;
  const saved = tplGeom?.[stableId];
  const geomRef = useRef(saved ? { x: saved.x || 0, y: saved.y || 0 } : { x: 0, y: 0 });
  const sizeOverrideRef = useRef(saved?.size || null);
  const [, forceUpdate] = useState(0);

  const selectedIdsRef = useRef(externalSelectedIds);
  selectedIdsRef.current = externalSelectedIds;

  // Multi-drag bus subscription
  const setTplGeomRef = useRef(setTplGeom);
  setTplGeomRef.current = setTplGeom;
  useEffect(() => {
    if (!multiDragBus) return;
    let pendingSave = null;
    const unsub = multiDragBus.subscribe((sourceId, dx, dy) => {
      if (sourceId === stableId) return;
      if (!selectedIdsRef.current.includes(stableId)) return;
      const el = wrapRef.current;
      if (!el) return;
      geomRef.current.x += dx;
      geomRef.current.y += dy;
      el.style.transform = `translate(${geomRef.current.x}px, ${geomRef.current.y}px)`;
      clearTimeout(pendingSave);
      pendingSave = setTimeout(() => {
        if (setTplGeomRef.current) setTplGeomRef.current(stableId, { x: geomRef.current.x, y: geomRef.current.y, size: sizeOverrideRef.current });
      }, 200);
    });
    return () => { unsub(); clearTimeout(pendingSave); };
  }, [multiDragBus, stableId]);

  // Sync contentEditable value
  useEffect(() => {
    if (!editable || !editing) return;
    const el = ref.current;
    if (!el) return;
    const next = value || '';
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value, editable, editing]);

  // ─── Imperatively apply saved geometry (transform + size) ───
  useLayoutEffect(() => {
    const el = wrapRef.current;
    if (!el) return;
    const g = geomRef.current;
    if (g.x !== 0 || g.y !== 0) {
      el.style.transform = `translate(${g.x}px, ${g.y}px)`;
    }
    const sov = sizeOverrideRef.current;
    if (sov) {
      el.style.position = 'absolute';
      el.style.left = sov.left + 'px';
      el.style.top = sov.top + 'px';
      el.style.width = sov.w + 'px';
      el.style.minHeight = sov.h + 'px';
    }
  });

  // ─── Unified pointer handler (same pattern as CanvasElement) ───
  useEffect(() => {
    if (!editable || editing) return;
    const el = wrapRef.current;
    if (!el) return;

    const onDown = (e) => {
      const handleEl = e.target.closest?.('[data-resize-handle]');
      e.stopPropagation();
      e.preventDefault();
      if (document.activeElement?.blur) document.activeElement.blur();
      setLocalSelected(true);
      if (setExternalSelectedIds) {
        if (e.shiftKey) {
          setExternalSelectedIds(prev => prev.includes(stableId) ? prev : [...prev, stableId]);
        } else {
          setExternalSelectedIds([stableId]);
        }
      }
      el.setPointerCapture(e.pointerId);

      const scaleEl = el.closest('[data-slide-scale]');
      const scale = scaleEl ? parseFloat(scaleEl.dataset.slideScale) || 1 : 1;

      if (handleEl) {
        const dir = handleEl.dataset.handleDir;
        const rect = el.getBoundingClientRect();
        const initLeft = el.offsetLeft;
        const initTop = el.offsetTop;
        if (!sizeOverrideRef.current) {
          sizeOverrideRef.current = { left: initLeft, top: initTop, w: rect.width / scale, h: rect.height / scale };
          el.style.position = 'absolute';
          el.style.left = initLeft + 'px';
          el.style.top = initTop + 'px';
        }
        interactionRef.current = {
          type: 'resize',
          handle: dir,
          startX: e.clientX,
          startY: e.clientY,
          scale,
          origW: sizeOverrideRef.current.w,
          origH: sizeOverrideRef.current.h,
          origLeft: sizeOverrideRef.current.left,
          origTop: sizeOverrideRef.current.top,
          origX: geomRef.current.x,
          origY: geomRef.current.y,
        };
        const grid = scaleEl?.querySelector('[data-dot-grid]');
        if (grid) grid.style.opacity = '0.4';
      } else {
        interactionRef.current = {
          type: 'drag',
          startX: e.clientX,
          startY: e.clientY,
          scale,
          origX: geomRef.current.x,
          origY: geomRef.current.y,
          moved: false,
        };
      }
    };

    const onMove = (e) => {
      const i = interactionRef.current;
      if (!i) return;

      if (i.type === 'resize') {
        const dx = (e.clientX - i.startX) / i.scale;
        const dy = (e.clientY - i.startY) / i.scale;
        let newW = i.origW, newH = i.origH;
        let newLeft = i.origLeft, newTop = i.origTop;

        if (i.handle.includes('e')) newW = Math.max(20, i.origW + dx);
        if (i.handle.includes('w')) { newW = Math.max(20, i.origW - dx); newLeft = i.origLeft + (i.origW - newW); }
        if (i.handle.includes('s')) newH = Math.max(20, i.origH + dy);
        if (i.handle.includes('n')) { newH = Math.max(20, i.origH - dy); newTop = i.origTop + (i.origH - newH); }

        const GRID = 20;
        newW = Math.round(newW / GRID) * GRID || GRID;
        newH = Math.round(newH / GRID) * GRID || GRID;

        sizeOverrideRef.current = { left: newLeft, top: newTop, w: newW, h: newH };
        el.style.left = newLeft + 'px';
        el.style.top = newTop + 'px';
        el.style.width = newW + 'px';
        el.style.minHeight = newH + 'px';
        el.style.height = '';
      } else {
        const dx = (e.clientX - i.startX) / i.scale;
        const dy = (e.clientY - i.startY) / i.scale;
        if (!i.moved && (Math.abs(dx) > 3 || Math.abs(dy) > 3)) {
          i.moved = true;
          const scaleEl = el.closest('[data-slide-scale]');
          const grid = scaleEl?.querySelector('[data-dot-grid]');
          if (grid) grid.style.opacity = '0.4';
        }
        if (i.moved) {
          const GRID = 20;
          const snapX = Math.round((i.origX + dx) / GRID) * GRID;
          const snapY = Math.round((i.origY + dy) / GRID) * GRID;
          const prevX = geomRef.current.x;
          const prevY = geomRef.current.y;
          geomRef.current.x = snapX;
          geomRef.current.y = snapY;
          el.style.transform = `translate(${snapX}px, ${snapY}px)`;
          if (multiDragBus && selectedIdsRef.current.length > 1 && selectedIdsRef.current.includes(stableId)) {
            const ddx = snapX - prevX;
            const ddy = snapY - prevY;
            if (ddx !== 0 || ddy !== 0) multiDragBus.broadcast(stableId, ddx, ddy);
          }
        }
      }
    };

    const onUp = (e) => {
      if (!interactionRef.current) return;
      const scaleEl = el.closest('[data-slide-scale]');
      const grid = scaleEl?.querySelector('[data-dot-grid]');
      if (grid) grid.style.opacity = '0';
      interactionRef.current = null;
      try { el.releasePointerCapture(e.pointerId); } catch {}
      if (setTplGeom) {
        setTplGeom(stableId, { x: geomRef.current.x, y: geomRef.current.y, size: sizeOverrideRef.current });
      }
      forceUpdate(n => n + 1);
    };

    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove);
    el.addEventListener('pointerup', onUp);
    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup', onUp);
    };
  }, [editable, editing, multiDragBus, stableId]);

  const handleDoubleClick = useCallback((e) => {
    if (!editable) return;
    e.stopPropagation();
    setEditing(true);
    setLocalSelected(false);
  }, [editable]);

  const externalSelected = externalSelectedIds.includes(stableId);
  const selected = localSelected || externalSelected;

  // Deselect on click outside
  useEffect(() => {
    if (!localSelected) return;
    const handler = (e) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setLocalSelected(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [localSelected]);

  const handles = selected && editable ? HANDLE_DIRS : [];

  if (hiddenTplIds && hiddenTplIds.includes(stableId)) return null;

  if (!editable) {
    return <Tag style={style} dangerouslySetInnerHTML={{ __html: value || '' }}/>;
  }

  const ox = geomRef.current.x;
  const oy = geomRef.current.y;
  const tx = (ox || oy) ? `translate(${ox}px, ${oy}px)` : undefined;

  if (editing) {
    return (
      <div ref={wrapRef} data-editable-wrap="true" data-editable-id={stableId}
        style={{ position:'relative', transform: tx, outline:'2px solid #4a90d9', outlineOffset:1, userSelect:'none' }}>
        <Tag
          ref={ref}
          contentEditable
          suppressContentEditableWarning
          onBlur={e => { onChange(multiline ? e.currentTarget.innerHTML : e.currentTarget.innerText); setEditing(false); }}
          onKeyDown={e => {
            if (!multiline && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
          }}
          data-placeholder={placeholder || ''}
          style={{ outline:'none', cursor:'text', ...style }}
        />
      </div>
    );
  }

  const wrapStyle = {
    position: 'relative',
    transform: tx,
    overflow: 'visible',
    userSelect: 'none',
    touchAction: 'none',
    cursor: 'move',
    boxShadow: selected ? '0 0 0 2px #4a90d9' : undefined,
    zIndex: selected ? 10 : undefined,
  };

  return (
    <div
      ref={wrapRef}
      data-editable-wrap="true"
      data-editable-id={stableId}
      style={wrapStyle}
      onDoubleClick={handleDoubleClick}
    >
      <Tag style={{ pointerEvents: 'none', ...style }} dangerouslySetInnerHTML={{ __html: value || '' }}/>

      {handles.map(h => {
        const el = wrapRef.current;
        const w = el ? el.offsetWidth : 100;
        const ht = el ? el.offsetHeight : 40;
        const scaleEl = el?.closest?.('[data-slide-scale]');
        const sc = scaleEl ? parseFloat(scaleEl.dataset.slideScale) || 1 : 1;
        const sz = HANDLE_SZ / sc;
        const half = sz / 2;
        const posMap = {
          nw: { left: -half, top: -half },
          n:  { left: w/2 - half, top: -half },
          ne: { left: w - half, top: -half },
          e:  { left: w - half, top: ht/2 - half },
          se: { left: w - half, top: ht - half },
          s:  { left: w/2 - half, top: ht - half },
          sw: { left: -half, top: ht - half },
          w:  { left: -half, top: ht/2 - half },
        };
        const p = posMap[h];
        return (
          <div key={h} data-resize-handle="true" data-handle-dir={h}
            style={{
              position: 'absolute', left: p.left, top: p.top,
              width: sz, height: sz,
              background: '#fff', border: '1.5px solid #4a90d9',
              borderRadius: 2, cursor: HANDLE_CURSOR[h],
              zIndex: 10, touchAction: 'none',
            }} />
        );
      })}
    </div>
  );
};

// ─── Global header strip ─────────────────────────────────────────────────────
const MetaField = ({ value, onChange, editable, style }) => {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && ref.current.innerText !== (value || '')) {
      ref.current.innerText = value || '';
    }
  }, [value]);
  if (!editable) return <span style={style}>{value}</span>;
  return (
    <span ref={ref} contentEditable suppressContentEditableWarning
      onBlur={e => { const t = e.currentTarget.innerText; if (t !== value) onChange(t); }}
      style={{ ...style, outline:'none', cursor:'text', minWidth:20 }}/>
  );
};

export const Meta = ({ slide, palette, idx, total, onChange, editable }) => {
  const upd = (k,v) => onChange({ ...slide, meta: { ...slide.meta, [k]:v } });
  const m = slide.meta || {};
  const headerFont = "'Neue Haas Grotesk Text Pro', 'Inter', sans-serif";
  return (
    <div style={{
      position:'absolute', top:0, left:0, right:0, height:36,
      display:'flex', alignItems:'center', justifyContent:'space-between',
      padding:'0 40px', pointerEvents:'auto', zIndex:50,
    }}>
      <MetaField value={m.brand || 'Editor Cluster'} onChange={v=>upd('brand',v)} editable={editable}
        style={{ fontSize:12, fontWeight:600, color:palette.ink, fontFamily:headerFont, letterSpacing:'0.01em' }}/>
      <MetaField value={m.tr || 'All Hands'} onChange={v=>upd('tr',v)} editable={editable}
        style={{ fontSize:12, fontWeight:500, color:palette.ink, fontFamily:headerFont, letterSpacing:'0.01em' }}/>
      <div style={{ display:'flex', alignItems:'center', gap:6 }}>
        <span style={{ width:8, height:8, background:palette.ink, display:'inline-block' }}/>
        <MetaField value={m.bl || 'May— 2026'} onChange={v=>upd('bl',v)} editable={editable}
          style={{ fontSize:12, fontWeight:500, color:palette.ink, fontFamily:headerFont, letterSpacing:'0.01em' }}/>
      </div>
    </div>
  );
};

// ─── Reusable inner blocks ────────────────────────────────────────────────────
const Eyebrow = ({ value, onChange, palette, editable }) => (
  <Editable value={value} onChange={onChange} editable={editable}
    style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:palette.muted }}/>
);

const NumLabel = ({ small, big, palette, onSmall, onBig, editable }) => (
  <div style={{ display:'inline-flex', alignItems:'flex-start', gap:18 }}>
    <Editable value={big} onChange={onBig} editable={editable}
      style={{ fontSize:64, fontWeight:500, letterSpacing:'-0.02em', lineHeight:.9, color:palette.ink }}/>
    <Editable value={small} onChange={onSmall} editable={editable}
      style={{ fontSize:12, fontWeight:700, letterSpacing:'0.16em', textTransform:'uppercase',
               color:palette.muted, marginTop:10 }}/>
  </div>
);

const Tag = ({ value, onChange, palette, editable, dark, accent }) => (
  <Editable value={value} onChange={onChange} editable={editable}
    style={{
      display:'inline-block', fontSize:11, fontWeight:700, letterSpacing:'0.18em', textTransform:'uppercase',
      padding:'6px 10px',
      border:`1px solid ${dark?'#fff':palette.ink}`, borderRadius:999,
      color:dark?'#fff':palette.ink,
      background: accent ? '#E8FF34' : 'transparent',
    }}/>
);

const BulletList = ({ items, onChange, palette, editable }) => {
  const upd = (i, v) => { const next = items.slice(); next[i] = v; onChange(next); };
  const add = () => onChange([...(items||[]), 'New item']);
  const rm = (i) => onChange(items.filter((_, k) => k !== i));
  return (
    <ul style={{ listStyle:'none', padding:0, margin:0, display:'flex', flexDirection:'column', gap:14, maxWidth:'64ch' }}>
      {(items || []).map((t, i) => (
        <li key={i} style={{ fontSize:18, lineHeight:1.5, color:palette.ink, paddingLeft:28, position:'relative' }}>
          <span style={{ position:'absolute', left:0, top:'0.7em', width:14, height:1, background:palette.ink }}/>
          <Editable value={t} onChange={v=>upd(i,v)} editable={editable} multiline
            style={{ display:'inline', color: palette.ink, opacity: palette.bg === '#0a0a0a' ? .85 : 1 }}/>
          {editable && (
            <button onClick={()=>rm(i)} title="Remove"
              style={{ position:'absolute', right:0, top:0, opacity:0.4, border:'none', background:'transparent',
                       cursor:'pointer', fontSize:11, color:palette.ink }}>×</button>
          )}
        </li>
      ))}
      {editable && (
        <li>
          <button onClick={add}
            style={{ fontSize:11, padding:'4px 8px', border:`1px dashed ${palette.muted}`, borderRadius:6,
                     background:'transparent', color:palette.muted, cursor:'pointer', letterSpacing:'.1em', textTransform:'uppercase' }}>+ add</button>
        </li>
      )}
    </ul>
  );
};

const NodesDiagram = ({ palette }) => {
  const node = (text, kind) => {
    const base = { border:`1.5px solid ${palette.ink}`, padding:'14px 22px', borderRadius:999,
                   fontSize:14, fontWeight:600, letterSpacing:'0.04em', background:'#fff', color:'#0a0a0a' };
    if (kind === 'rect')   return { ...base, borderRadius:8 };
    if (kind === 'then')   return { ...base, background:'#e9d5ff', borderColor:'#7c3aed', color:'#3b0764' };
    if (kind === 'else')   return { ...base, background:'#fde68a', borderColor:'#b45309', color:'#451a03' };
    return base;
  };
  const conn = <div style={{ width:1.5, height:22, background:palette.ink }}/>;
  const chip = { border:`1.5px solid ${palette.ink}`, padding:'8px 14px', borderRadius:999,
                 fontSize:12, fontWeight:600, letterSpacing:'0.04em', background:'#fff', color:'#0a0a0a' };
  return (
    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:18 }}>
      <div style={node('','plain')}>WHEN: Button</div>
      {conn}
      <div style={node('','rect')}>IN: Section</div>
      {conn}
      <div style={{ border:`1.5px dashed ${palette.ink}`, padding:14, display:'flex', gap:10,
                    alignItems:'center', borderRadius:14 }}>
        <span style={chip}>IF · Width 100%</span>
        <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.16em', color:palette.ink }}>AND</span>
        <span style={chip}>IF · H ≥ 120</span>
      </div>
      {conn}
      <div style={node('','then')}>THEN: Stretch</div>
      {conn}
      <div style={node('','else')}>ELSE: Center</div>
    </div>
  );
};

const SplitBeforeAfter = ({ data = {}, onChange, palette, editable }) => {
  const upd = (k, v) => onChange({ ...data, [k]: v });
  const updL = (i, v) => { const arr = (data.left||[]).slice(); arr[i]=v; upd('left',arr); };
  const updR = (i, v) => { const arr = (data.right||[]).slice(); arr[i]=v; upd('right',arr); };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', borderTop:`1px solid ${palette.ink}`,
                  borderBottom:`1px solid ${palette.ink}`, width:'100%' }}>
      <div style={{ padding:24, borderRight:`1px solid ${palette.ink}` }}>
        <Editable value={data.leftLabel || 'Before'} onChange={v=>upd('leftLabel',v)} editable={editable}
          tag="h4" style={{ margin:'0 0 10px', fontSize:14, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase' }}/>
        <BulletList items={data.left||[]} onChange={arr=>upd('left',arr)} palette={palette} editable={editable}/>
      </div>
      <div style={{ padding:24, background: data.rightAccent ? '#E8FF34' : 'transparent' }}>
        <Editable value={data.rightLabel || 'After'} onChange={v=>upd('rightLabel',v)} editable={editable}
          tag="h4" style={{ margin:'0 0 10px', fontSize:14, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase' }}/>
        <BulletList items={data.right||[]} onChange={arr=>upd('right',arr)} palette={palette} editable={editable}/>
      </div>
    </div>
  );
};

const MetricsRow = ({ data = [], onChange, palette, editable }) => {
  const upd = (i, k, v) => { const next = data.slice(); next[i] = { ...next[i], [k]:v }; onChange(next); };
  return (
    <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', borderTop:`1px solid ${palette.ink}` }}>
      {data.map((m, i) => (
        <div key={i} style={{ padding:'20px', borderRight: i<data.length-1 ? `1px solid ${palette.ink}` : 'none' }}>
          <Editable value={m.num} onChange={v=>upd(i,'num',v)} editable={editable}
            style={{ fontSize:54, fontWeight:500, letterSpacing:'-0.02em', lineHeight:1, color:palette.ink }}/>
          <Editable value={m.label} onChange={v=>upd(i,'label',v)} editable={editable}
            style={{ fontSize:12, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase',
                     color:palette.muted, marginTop:8 }}/>
          <Editable value={m.body} onChange={v=>upd(i,'body',v)} editable={editable} multiline
            style={{ fontSize:13, lineHeight:1.55, color:palette.ink, marginTop:10, opacity:.8 }}/>
        </div>
      ))}
    </div>
  );
};

const FlowSteps = ({ data = [], onChange, palette, editable }) => {
  const upd = (i, k, v) => { const next = data.slice(); next[i] = { ...next[i], [k]:v }; onChange(next); };
  return (
    <div style={{ display:'flex', flexDirection:'column', gap:14, width:'100%' }}>
      {data.map((s, i) => (
        <React.Fragment key={i}>
          <div style={{ display:'flex', alignItems:'center', gap:16 }}>
            <div style={{ flex:'0 0 auto', width:48, height:48, border:`1.5px solid ${palette.ink}`,
                          borderRadius:'50%', display:'flex', alignItems:'center', justifyContent:'center',
                          fontWeight:700, color:palette.ink, background: s.accent ? '#E8FF34' : 'transparent' }}>
              {i+1}
            </div>
            <div style={{ color:palette.ink, fontSize:16 }}>
              <Editable value={s.title} onChange={v=>upd(i,'title',v)} editable={editable}
                style={{ display:'inline', fontWeight:700 }}/>
              {' — '}
              <Editable value={s.body} onChange={v=>upd(i,'body',v)} editable={editable}
                style={{ display:'inline', fontWeight:400 }}/>
            </div>
          </div>
          {i < data.length-1 && <div style={{ marginLeft:23, width:1.5, height:20, background:palette.ink }}/>}
        </React.Fragment>
      ))}
    </div>
  );
};

const Mapping = ({ data = {}, onChange, palette, editable }) => {
  const upd = (k, v) => onChange({ ...data, [k]: v });
  const updArr = (k, i, v) => { const arr = (data[k]||[]).slice(); arr[i]=v; upd(k,arr); };
  return (
    <div style={{ display:'flex', gap:0, border:`1px solid ${palette.ink}`, width:'100%' }}>
      <div style={{ flex:1, padding:32, borderRight:`1px solid ${palette.ink}`, background:'#fafafa', color:'#0a0a0a' }}>
        <div style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:'#9a9a9a' }}>
          {data.leftEyebrow || 'Design side'}
        </div>
        <Editable value={data.leftTitle || 'Single template'} onChange={v=>upd('leftTitle',v)} editable={editable}
          style={{ fontSize:36, fontWeight:600, letterSpacing:'-0.02em', margin:'12px 0 16px' }}/>
        <BulletList items={data.left||[]} onChange={arr=>upd('left',arr)}
          palette={{ ink:'#0a0a0a', muted:'#9a9a9a', bg:'#fff' }} editable={editable}/>
      </div>
      <div style={{ flex:'0 0 80px', display:'flex', alignItems:'center', justifyContent:'center',
                    borderRight:`1px solid ${palette.ink}`, background:'#E8FF34', fontSize:32 }}>→</div>
      <div style={{ flex:1, padding:32, background:'#0a0a0a', color:'#fff' }}>
        <div style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase',
                      color:'rgba(255,255,255,0.6)' }}>
          {data.rightEyebrow || 'Dev side'}
        </div>
        <Editable value={data.rightTitle || 'Plugin breakdown'} onChange={v=>upd('rightTitle',v)} editable={editable}
          style={{ fontSize:36, fontWeight:600, letterSpacing:'-0.02em', margin:'12px 0 16px' }}/>
        <BulletList items={data.right||[]} onChange={arr=>upd('right',arr)}
          palette={{ ink:'#fff', muted:'rgba(255,255,255,0.6)', bg:'#0a0a0a' }} editable={editable}/>
      </div>
    </div>
  );
};

const AccentStatement = ({ data = {}, onChange, palette, editable }) => {
  const upd = (k, v) => onChange({ ...data, [k]: v });
  const tone = data.tone || 'yellow';
  const bg = tone === 'black' ? '#0a0a0a' : '#E8FF34';
  const fg = tone === 'black' ? '#fff' : '#0a0a0a';
  const muted = tone === 'black' ? 'rgba(255,255,255,0.6)' : 'rgba(0,0,0,0.6)';
  return (
    <div style={{ background:bg, color:fg, padding:40, width:'100%', height:'80%',
                  display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <Editable value={data.eyebrow || 'Outcome'} onChange={v=>upd('eyebrow',v)} editable={editable}
        style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase', color:muted }}/>
      <Editable value={data.statement || 'A short, opinionated statement.'} onChange={v=>upd('statement',v)} editable={editable} multiline
        style={{ fontSize:48, fontWeight:500, letterSpacing:'-0.02em', lineHeight:1.05, margin:0 }}/>
      <Editable value={data.tag || 'Goal'} onChange={v=>upd('tag',v)} editable={editable}
        style={{ display:'inline-block', alignSelf:'flex-start', fontSize:11, fontWeight:700,
                 letterSpacing:'.18em', textTransform:'uppercase', padding:'6px 10px',
                 border:`1px solid ${fg}`, borderRadius:999 }}/>
    </div>
  );
};

const VisionFlow = ({ data = {}, onChange, palette, editable }) => {
  const upd = (k, v) => onChange({ ...data, [k]: v });
  const updS = (i, v) => { const arr = (data.steps||[]).slice(); arr[i]=v; upd('steps',arr); };
  const steps = data.steps || ['Author — in the agreed format','Approve — inside the tool','Test — fast environment','Push — toward production'];
  return (
    <div style={{ background:'#0a0a0a', color:'#fff', padding:40, width:'100%', height:'80%',
                  display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <div style={{ fontSize:13, fontWeight:600, letterSpacing:'0.18em', textTransform:'uppercase',
                    color:'rgba(255,255,255,0.6)' }}>{data.eyebrow || 'Vision flow'}</div>
      <div style={{ display:'flex', flexDirection:'column', gap:14, fontSize:18 }}>
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <Editable value={s} onChange={v=>updS(i,v)} editable={editable}
              style={{ color: i === steps.length-1 ? '#E8FF34' : '#fff' }}/>
            {i < steps.length-1 && <div style={{ color:'#666' }}>↓</div>}
          </React.Fragment>
        ))}
      </div>
      <span style={{ display:'inline-block', alignSelf:'flex-start', fontSize:11, fontWeight:700,
                     letterSpacing:'.18em', textTransform:'uppercase', padding:'6px 10px',
                     border:`1px solid #fff`, borderRadius:999, color:'#fff' }}>
        {data.tag || 'Vision · Goal 05'}
      </span>
    </div>
  );
};

const OldDiagrams = ({ palette }) => {
  const node = { border:`1.5px solid ${palette.ink}`, padding:'10px 14px', borderRadius:999,
                 fontSize:11, fontWeight:600, letterSpacing:'.04em', background:'#fff', color:'#0a0a0a' };
  const rect = { ...node, borderRadius:8 };
  const conn = <div style={{ width:1.5, height:14, background:palette.ink }}/>;
  return (
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', border:`1px solid ${palette.ink}`, width:'100%' }}>
      <div style={{ padding:24, borderRight:`1px solid ${palette.ink}` }}>
        <h4 style={{ margin:'0 0 12px', fontSize:14, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase' }}>Old · v1</h4>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={node}>If button section</div>
          {conn}
          <div style={rect}>stretch full</div>
        </div>
      </div>
      <div style={{ padding:24 }}>
        <h4 style={{ margin:'0 0 12px', fontSize:14, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase' }}>Old · v2</h4>
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:8 }}>
          <div style={node}>Button @ section ≥120</div>
          {conn}
          <div style={{ ...node, background:'#e9d5ff', borderColor:'#7c3aed', color:'#3b0764' }}>→ width:100%</div>
        </div>
      </div>
    </div>
  );
};

const ImageBlock = ({ data = {}, onChange, palette, editable }) => {
  const upd = (k, v) => onChange({ ...data, [k]: v });
  const fit = data.fit || 'contain';   // 'contain' | 'cover'
  const bg  = data.bg || (palette.bg === '#0a0a0a' ? '#1a1a1a' : '#f4f4f5');
  const src = data.src || '';
  const cap = data.caption || '';
  const tag = data.tag || '';
  return (
    <div style={{ width:'100%', display:'flex', flexDirection:'column', gap:14 }}>
      <div style={{
        position:'relative', width:'100%', aspectRatio:'4 / 3',
        background:bg,
        border:`1px solid ${palette.ink}`,
        borderRadius:8, overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'center',
      }}>
        {src ? (
          <img src={src} alt={cap || 'slide image'}
            style={{ width:'100%', height:'100%', objectFit:fit, display:'block' }}/>
        ) : (
          <div style={{ fontSize:12, color:palette.muted, letterSpacing:'.14em',
                        textTransform:'uppercase', fontWeight:600 }}>
            No image — set src in properties
          </div>
        )}
        {tag && (
          <Editable value={tag} onChange={v=>upd('tag',v)} editable={editable}
            style={{
              position:'absolute', top:12, left:12,
              fontSize:10, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase',
              padding:'4px 8px', borderRadius:4,
              background:'rgba(255,255,255,0.85)', color:'#0a0a0a',
              backdropFilter:'blur(6px)',
            }}/>
        )}
      </div>
      {(cap || editable) && (
        <Editable value={cap} onChange={v=>upd('caption',v)} editable={editable} multiline
          placeholder="Caption…"
          style={{
            fontSize:12, lineHeight:1.5, fontWeight:500, color:palette.muted,
            letterSpacing:'.04em', fontStyle:'italic',
          }}/>
      )}
    </div>
  );
};

// ─── Block dispatcher ─────────────────────────────────────────────────────────
const Block = ({ kind, data, onChange, palette, editable }) => {
  switch (kind) {
    case 'bullets':     return <BulletList items={data || []} onChange={onChange} palette={palette} editable={editable}/>;
    case 'nodes':       return <NodesDiagram palette={palette}/>;
    case 'oldDiagrams': return <OldDiagrams palette={palette}/>;
    case 'split':       return <SplitBeforeAfter data={data || {}} onChange={onChange} palette={palette} editable={editable}/>;
    case 'metrics':     return <MetricsRow data={data || []} onChange={onChange} palette={palette} editable={editable}/>;
    case 'flow':        return <FlowSteps data={data || []} onChange={onChange} palette={palette} editable={editable}/>;
    case 'mapping':     return <Mapping data={data || {}} onChange={onChange} palette={palette} editable={editable}/>;
    case 'accent':      return <AccentStatement data={data || {}} onChange={onChange} palette={palette} editable={editable}/>;
    case 'vision':      return <VisionFlow data={data || {}} onChange={onChange} palette={palette} editable={editable}/>;
    case 'image':       return <ImageBlock data={data || {}} onChange={onChange} palette={palette} editable={editable}/>;
    default:            return null;
  }
};

// ─── Templates ───────────────────────────────────────────────────────────────
const TplCover = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  return (
    <div style={{ position:'absolute', inset:'72px 40px',
                  display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <Eyebrow value={f.eyebrow || ''} onChange={v=>upd('eyebrow',v)} palette={palette} editable={editable}/>
      <div>
        <Editable value={f.num || '00'} onChange={v=>upd('num',v)} editable={editable}
          style={{ fontSize:80, lineHeight:.9, fontWeight:500, letterSpacing:'-.02em', color:palette.ink }}/>
        <Editable value={f.title || 'Title.'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:120, lineHeight:.92, fontWeight:600, letterSpacing:'-.035em', color:palette.ink, marginTop:4 }}/>
      </div>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', gap:24 }}>
        <Editable value={f.blurb || ''} onChange={v=>upd('blurb',v)} editable={editable} multiline
          style={{ maxWidth:'46ch', fontSize:16, lineHeight:1.55, color:palette.ink, opacity:.85 }}/>
        <Tag value={f.tag || ''} onChange={v=>upd('tag',v)} palette={palette} editable={editable}/>
      </div>
    </div>
  );
};

const TplToc = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const items = f.items || [];
  const updItem = (i, k, v) => { const next = items.slice(); next[i] = { ...next[i], [k]:v }; upd('items', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px',
                  display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <NumLabel
        big={f.bigNum || '00'} onBig={v=>upd('bigNum',v)}
        small={f.label || 'Contents'} onSmall={v=>upd('label',v)}
        palette={palette} editable={editable}/>

      <div style={{ display:'flex', flexDirection:'column',
                    borderTop:`1px solid ${palette.muted}` }}>
        {items.map((it, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline',
                                 padding:'18px 0', borderBottom:`1px solid ${palette.muted}`, color:palette.ink }}>
            <Editable value={it.t} onChange={v=>updItem(i,'t',v)} editable={editable}
              style={{ fontSize:32, fontWeight:500, letterSpacing:'-0.01em' }}/>
            <Editable value={it.n} onChange={v=>updItem(i,'n',v)} editable={editable}
              style={{ fontSize:12, fontWeight:700, letterSpacing:'0.16em', color:palette.muted }}/>
          </div>
        ))}
      </div>

      <Editable value={f.footer || ''} onChange={v=>upd('footer',v)} editable={editable} multiline
        style={{ fontSize:16, lineHeight:1.55, color:palette.ink, opacity:.7, maxWidth:'64ch' }}/>
    </div>
  );
};

const TplSectionDivider = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  return (
    <div style={{ position:'absolute', inset:'72px 40px',
                  display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <Editable value={f.num || '01'} onChange={v=>upd('num',v)} editable={editable}
        style={{ fontSize:96, lineHeight:.9, fontWeight:500, letterSpacing:'-.02em', color:palette.ink }}/>
      <Editable value={f.title || 'Section title.'} onChange={v=>upd('title',v)} editable={editable} multiline
        style={{ fontSize:120, lineHeight:.92, fontWeight:500, letterSpacing:'-.035em', color:palette.ink, margin:0 }}/>
      <Editable value={f.body || ''} onChange={v=>upd('body',v)} editable={editable} multiline
        style={{ fontSize:16, lineHeight:1.6, color:palette.ink, opacity:.8, maxWidth:'48ch' }}/>
    </div>
  );
};

const TplTwoColumn = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const panel = f.panel || { kind:'bullets', data:[] };
  const setPanel = (p) => upd('panel', p);

  return (
    <>
      {f.smallNum && (
        <div style={{ position:'absolute', top:104, left:40 }}>
          <NumLabel
            big={f.smallNum || '01'} onBig={v=>upd('smallNum',v)}
            small={f.smallLabel || ''} onSmall={v=>upd('smallLabel',v)}
            palette={palette} editable={editable}/>
        </div>
      )}
      <div style={{ position:'absolute', inset:'72px 40px',
                    display:'grid', gridTemplateColumns:'1fr 1fr', gap:48, alignItems:'center' }}>
        {/* LEFT */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {f.eyebrow != null && (
            <Eyebrow value={f.eyebrow} onChange={v=>upd('eyebrow',v)} palette={palette} editable={editable}/>
          )}
          {f.bigNumeral != null && (
            <Editable value={f.bigNumeral} onChange={v=>upd('bigNumeral',v)} editable={editable}
              style={{ fontSize:200, lineHeight:.85, fontWeight:500, letterSpacing:'-.04em', color:palette.ink }}/>
          )}
          <Editable value={f.title || 'Title goes here.'} onChange={v=>upd('title',v)} editable={editable} multiline
            style={{ fontSize: f.titleSize || 48, lineHeight:1.04, fontWeight:600, letterSpacing:'-.02em',
                     color:palette.ink, margin:0 }}/>
          {f.lead && (
            <Editable value={f.lead} onChange={v=>upd('lead',v)} editable={editable} multiline
              style={{ fontSize:22, lineHeight:1.45, fontWeight:400, color:palette.ink, opacity:.8, maxWidth:'62ch' }}/>
          )}
          {f.body && (
            <Editable value={f.body} onChange={v=>upd('body',v)} editable={editable} multiline
              style={{ fontSize:16, lineHeight:1.6, fontWeight:400, color:palette.ink, opacity:.8, maxWidth:'62ch' }}/>
          )}
        </div>

        {/* RIGHT */}
        <div style={{ alignSelf:'stretch', display:'flex', alignItems:'center', justifyContent:'center' }}>
          <Block kind={panel.kind} data={panel.data} onChange={d=>setPanel({ ...panel, data:d })}
                 palette={palette} editable={editable}/>
        </div>
      </div>

      {f.bottomNote && (
        <Editable value={f.bottomNote} onChange={v=>upd('bottomNote',v)} editable={editable}
          style={{ position:'absolute', left:40, right:40, bottom:60, textAlign:'center',
                   fontSize:12, color:palette.muted, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase' }}/>
      )}
    </>
  );
};

const TplGoalsGrid = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const goals = f.goals || [];
  const updG = (i, k, v) => { const next = goals.slice(); next[i] = { ...next[i], [k]:v }; upd('goals', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px',
                  display:'flex', flexDirection:'column', gap:24, justifyContent:'space-between' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <NumLabel
          big={f.bigNum || '02'} onBig={v=>upd('bigNum',v)}
          small={f.label || 'Goals · 01–05'} onSmall={v=>upd('label',v)}
          palette={palette} editable={editable}/>
        <Editable value={f.note || ''} onChange={v=>upd('note',v)} editable={editable} multiline
          style={{ maxWidth:'48ch', textAlign:'right', fontSize:16, lineHeight:1.6, color:palette.ink, opacity:.8 }}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(5,1fr)',
                    borderTop:`1px solid ${palette.ink}`, borderBottom:`1px solid ${palette.ink}` }}>
        {goals.map((g, i) => (
          <div key={i} style={{
            padding:'24px 20px',
            borderRight: i < goals.length-1 ? `1px solid ${palette.ink}` : 'none',
            minHeight:280, display:'flex', flexDirection:'column', justifyContent:'space-between',
            background: g.vision ? '#E8FF34' : 'transparent',
          }}>
            <div>
              <Editable value={g.n} onChange={v=>updG(i,'n',v)} editable={editable}
                style={{ fontSize:42, fontWeight: g.vision ? 600 : 500, letterSpacing:'-0.02em', lineHeight:1, color:palette.ink }}/>
              <Editable value={g.t} onChange={v=>updG(i,'t',v)} editable={editable} multiline
                style={{ fontSize:16, fontWeight:600, lineHeight:1.25, marginTop:8, color:palette.ink }}/>
            </div>
            <Editable value={g.d} onChange={v=>updG(i,'d',v)} editable={editable} multiline
              style={{ fontSize:12, lineHeight:1.5, color:'#444', marginTop:'auto' }}/>
          </div>
        ))}
      </div>

      <Editable value={f.footnote || '01–04 are commitments · 05 is vision'} onChange={v=>upd('footnote',v)} editable={editable}
        style={{ fontSize:12, letterSpacing:'.14em', textTransform:'uppercase', fontWeight:600, color:palette.muted }}/>
    </div>
  );
};

const TplRoadmap = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const items = f.items || [];
  const updI = (i, k, v) => { const next = items.slice(); next[i] = { ...next[i], [k]:v }; upd('items', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px',
                  display:'flex', flexDirection:'column', gap:32 }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <NumLabel
          big={f.bigNum || '05'} onBig={v=>upd('bigNum',v)}
          small={f.label || 'Roadmap'} onSmall={v=>upd('label',v)}
          palette={palette} editable={editable}/>
        <Editable value={f.note || ''} onChange={v=>upd('note',v)} editable={editable} multiline
          style={{ maxWidth:'46ch', textAlign:'right', fontSize:16, lineHeight:1.6, color:palette.ink, opacity:.8 }}/>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'32px 1fr', gap:14, alignItems:'start' }}>
        {items.map((it, i) => (
          <React.Fragment key={i}>
            <div style={{ width:14, height:14, borderRadius:'50%',
                          background: it.accent ? '#E8FF34' : palette.ink,
                          border: it.accent ? `1.5px solid ${palette.ink}` : 'none',
                          marginTop:8, justifySelf:'center' }}/>
            <div style={{ paddingBottom:18, borderBottom: i < items.length-1 ? `1px solid rgba(0,0,0,0.1)` : 'none' }}>
              <Editable value={it.label || `Step ${String(i+1).padStart(2,'0')}`} onChange={v=>updI(i,'label',v)} editable={editable}
                style={{ display:'block', fontSize:11, letterSpacing:'.16em', textTransform:'uppercase', color:palette.muted, marginBottom:4, fontWeight:600 }}/>
              <Editable value={it.title} onChange={v=>updI(i,'title',v)} editable={editable} multiline
                style={{ display:'block', margin:0, fontSize:18, fontWeight:600, color:palette.ink }}/>
              <Editable value={it.body} onChange={v=>updI(i,'body',v)} editable={editable} multiline
                style={{ display:'block', margin:'6px 0 0', fontSize:14, lineHeight:1.55, color:palette.ink, opacity:.8 }}/>
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

const TplClosing = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  return (
    <div style={{ position:'absolute', inset:'72px 40px',
                  display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <Eyebrow value={f.eyebrow || 'In one line'} onChange={v=>upd('eyebrow',v)} palette={palette} editable={editable}/>
      <Editable value={f.quote || 'A closing thought.'} onChange={v=>upd('quote',v)} editable={editable} multiline
        style={{ fontSize:64, lineHeight:1.05, fontWeight:500, letterSpacing:'-0.025em',
                 maxWidth:'22ch', color:palette.ink }}/>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:6 }}>
          <Eyebrow value={f.footEyebrow || 'Next'} onChange={v=>upd('footEyebrow',v)} palette={palette} editable={editable}/>
          <Editable value={f.footLine || ''} onChange={v=>upd('footLine',v)} editable={editable} multiline
            style={{ fontSize:18, fontWeight:600, color:palette.ink }}/>
        </div>
        <Tag value={f.tag || ''} onChange={v=>upd('tag',v)} palette={palette} editable={editable}/>
      </div>
    </div>
  );
};

// ─── Table of Content (arrow bullets grouped by section) ─────────────────────
const TplTableOfContent = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const sections = f.sections || [];
  const updSec = (i, k, v) => { const next = sections.slice(); next[i] = { ...next[i], [k]:v }; upd('sections', next); };
  const updItem = (si, ii, v) => {
    const next = sections.slice();
    const items = (next[si].items || []).slice();
    items[ii] = v;
    next[si] = { ...next[si], items };
    upd('sections', next);
  };
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'grid', gridTemplateColumns:'280px 1fr', gap:48 }}>
      <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-start', paddingTop:24 }}>
        <Editable value={f.title || 'Table of<br/><strong>Content</strong>'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:64, lineHeight:1, fontWeight:300, letterSpacing:'-0.03em', color:palette.ink }}/>
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:0, overflowY:'auto' }}>
        {sections.map((sec, si) => (
          <div key={si} style={{ borderBottom:`1px solid ${palette.ink}`, paddingBottom:20, marginBottom:20 }}>
            <Editable value={sec.title || 'Section'} onChange={v=>updSec(si,'title',v)} editable={editable}
              style={{ fontSize:18, fontWeight:700, color:palette.ink, marginBottom:12 }}/>
            <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
              {(sec.items || []).map((item, ii) => (
                <div key={ii} style={{ display:'flex', alignItems:'center', gap:12, paddingLeft:8 }}>
                  <span style={{ fontSize:14, color:palette.ink }}>→</span>
                  <Editable value={item} onChange={v=>updItem(si,ii,v)} editable={editable}
                    style={{ fontSize:15, color:palette.ink, lineHeight:1.6 }}/>
                </div>
              ))}
            </div>
            {sec.note && (
              <Editable value={sec.note} onChange={v=>updSec(si,'note',v)} editable={editable}
                style={{ fontSize:13, fontStyle:'italic', fontWeight:600, color:palette.muted, marginTop:8, paddingLeft:8 }}/>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Four Cards (numbered cards with info) ───────────────────────────────────
const TplFourCards = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const cards = f.cards || [];
  const updCard = (i, k, v) => { const next = cards.slice(); next[i] = { ...next[i], [k]:v }; upd('cards', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <div>
        {f.eyebrow && <Eyebrow value={f.eyebrow} onChange={v=>upd('eyebrow',v)} palette={palette} editable={editable}/>}
        <Editable value={f.title || 'Title'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:56, fontWeight:800, letterSpacing:'-0.03em', lineHeight:1.05, color:palette.ink, marginTop:8 }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:16 }}>
        {cards.map((c, i) => (
          <div key={i} style={{ border:`1px solid ${palette.ink}`, padding:28, display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:320, background:palette.bg }}>
            <Editable value={c.num || String(i+1).padStart(2,'0')} onChange={v=>updCard(i,'num',v)} editable={editable}
              style={{ fontSize:48, fontWeight:400, letterSpacing:'-0.02em', color:palette.ink, opacity:0.3 }}/>
            <div>
              <Editable value={c.title || 'Card title'} onChange={v=>updCard(i,'title',v)} editable={editable} multiline
                style={{ fontSize:22, fontWeight:700, lineHeight:1.2, color:palette.ink, marginBottom:16 }}/>
              <div style={{ width:32, height:2, background:palette.ink, opacity:0.2, marginBottom:16 }}/>
              <Editable value={c.time || '10:00 - 11:00'} onChange={v=>updCard(i,'time',v)} editable={editable}
                style={{ fontSize:28, fontWeight:300, letterSpacing:'-0.01em', color:palette.ink, marginBottom:24 }}/>
            </div>
            <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
              {c.lead && <div style={{ fontSize:13, color:palette.ink }}><strong>Lead:</strong> <Editable value={c.lead} onChange={v=>updCard(i,'lead',v)} editable={editable} style={{ display:'inline', fontSize:13 }}/></div>}
              {c.mentor && <div style={{ fontSize:13, color:palette.ink }}><strong>Mentor:</strong> <Editable value={c.mentor} onChange={v=>updCard(i,'mentor',v)} editable={editable} style={{ display:'inline', fontSize:13 }}/></div>}
              {c.participants && <div style={{ fontSize:13, color:palette.ink }}><strong>Participants:</strong> <Editable value={c.participants} onChange={v=>updCard(i,'participants',v)} editable={editable} style={{ display:'inline', fontSize:13 }}/></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Team Grid (role cards with large abbreviations) ─────────────────────────
const TplTeamGrid = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const members = f.members || [];
  const updMember = (i, k, v) => { const next = members.slice(); next[i] = { ...next[i], [k]:v }; upd('members', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <div>
        <Editable value={f.title || 'Team support'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:42, fontWeight:400, letterSpacing:'-0.02em', color:palette.ink }}/>
        {f.description && (
          <div style={{ display:'grid', gridTemplateColumns:'auto 1fr auto 1fr', gap:24, marginTop:20, alignItems:'start' }}>
            {f.descCols && f.descCols.map((col, ci) => (
              <React.Fragment key={ci}>
                <Editable value={col.label} onChange={v=>{ const next = (f.descCols||[]).slice(); next[ci]={...next[ci],label:v}; upd('descCols',next); }} editable={editable}
                  style={{ fontSize:12, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:palette.muted }}/>
                <Editable value={col.text} onChange={v=>{ const next = (f.descCols||[]).slice(); next[ci]={...next[ci],text:v}; upd('descCols',next); }} editable={editable} multiline
                  style={{ fontSize:14, lineHeight:1.5, color:palette.ink, maxWidth:'34ch' }}/>
              </React.Fragment>
            ))}
          </div>
        )}
      </div>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(members.length,4)},1fr)`, gap:16 }}>
        {members.map((m, i) => (
          <div key={i} style={{ background:'#fff', borderRadius:16, padding:28, display:'flex', flexDirection:'column', justifyContent:'space-between', minHeight:260, boxShadow:'0 2px 12px rgba(0,0,0,0.04)' }}>
            <div>
              <Editable value={m.role || 'Role'} onChange={v=>updMember(i,'role',v)} editable={editable}
                style={{ fontSize:11, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:palette.muted, marginBottom:8 }}/>
              <Editable value={m.name || 'Name'} onChange={v=>updMember(i,'name',v)} editable={editable} multiline
                style={{ fontSize:32, fontWeight:400, letterSpacing:'-0.01em', lineHeight:1.15, color:palette.ink }}/>
            </div>
            <Editable value={m.abbr || 'XX'} onChange={v=>updMember(i,'abbr',v)} editable={editable}
              style={{ fontSize:96, fontWeight:900, letterSpacing:'-0.04em', lineHeight:0.85, color:palette.ink }}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Schedule Table (rows with time/session/lead/participants) ────────────────
const TplSchedule = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <Editable value={f.title || 'Training<br/><strong>Schedule</strong>'} onChange={v=>upd('title',v)} editable={editable} multiline
        style={{ fontSize:64, lineHeight:1, fontWeight:300, letterSpacing:'-0.03em', color:palette.ink }}/>
      <div style={{ display:'flex', flexDirection:'column' }}>
        {rows.map((r, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'200px 1fr 1fr 1fr', alignItems:'center',
            padding:'24px 0', borderTop:`1px solid ${palette.ink}`, borderBottom: i === rows.length-1 ? `1px solid ${palette.ink}` : 'none' }}>
            <Editable value={r.time || '10:00 - 11:00'} onChange={v=>updRow(i,'time',v)} editable={editable}
              style={{ fontSize:32, fontWeight:300, letterSpacing:'-0.01em', color:palette.ink }}/>
            <Editable value={r.session || 'Session name'} onChange={v=>updRow(i,'session',v)} editable={editable} multiline
              style={{ fontSize:16, fontWeight:700, color:palette.ink }}/>
            <div style={{ fontSize:14, color:palette.ink }}>
              <span>Led by </span>
              <Editable value={r.lead || 'Name'} onChange={v=>updRow(i,'lead',v)} editable={editable}
                style={{ display:'inline', fontWeight:700, fontSize:14 }}/>
              {r.mentor && <>
                <br/><span>Mentoring by </span>
                <Editable value={r.mentor} onChange={v=>updRow(i,'mentor',v)} editable={editable}
                  style={{ display:'inline', fontWeight:700, fontSize:14 }}/>
              </>}
            </div>
            <div style={{ fontSize:14, color:palette.ink }}>
              <span>Participants </span>
              <Editable value={r.participants || 'Team'} onChange={v=>updRow(i,'participants',v)} editable={editable}
                style={{ display:'inline', fontWeight:700, fontSize:14 }}/>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Task Steps (4 cards with orange active indicator) ───────────────────────
const TplTaskSteps = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const steps = f.steps || [];
  const activeIdx = f.activeStep != null ? f.activeStep : 0;
  const updStep = (i, k, v) => { const next = steps.slice(); next[i] = { ...next[i], [k]:v }; upd('steps', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <div>
        {f.eyebrow && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ width:12, height:12, background:'#e84e1b', borderRadius:2 }}/>
            <Editable value={f.eyebrow} onChange={v=>upd('eyebrow',v)} editable={editable}
              style={{ fontSize:13, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:palette.muted }}/>
          </div>
        )}
        <Editable value={f.title || 'The <strong>Task</strong>'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:72, lineHeight:1, fontWeight:300, letterSpacing:'-0.03em', color:palette.ink }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(4,1fr)', gap:12 }}>
        {steps.map((s, i) => {
          const isActive = i === activeIdx;
          return (
            <div key={i} onClick={editable ? ()=>upd('activeStep',i) : undefined}
              style={{ background:isActive ? '#fff' : '#f0f0f0', padding:28, display:'flex', flexDirection:'column',
                justifyContent:'space-between', minHeight:300, position:'relative', cursor: editable ? 'pointer' : 'default',
                borderTop: isActive ? '4px solid #e84e1b' : '4px solid transparent',
                opacity: isActive ? 1 : 0.5 }}>
              <Editable value={s.num || String(i+1).padStart(2,'0')} onChange={v=>updStep(i,'num',v)} editable={editable}
                style={{ fontSize:48, fontWeight:400, letterSpacing:'-0.02em', color:palette.ink }}/>
              <div>
                <Editable value={s.title || 'Step title'} onChange={v=>updStep(i,'title',v)} editable={editable} multiline
                  style={{ fontSize:17, fontWeight:700, lineHeight:1.3, color:palette.ink, marginBottom:12 }}/>
                <Editable value={s.body || 'Description'} onChange={v=>updStep(i,'body',v)} editable={editable} multiline
                  style={{ fontSize:14, lineHeight:1.5, color:palette.ink, opacity:0.8 }}/>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ─── Milestones (years/dates timeline) ───────────────────────────────────────
const TplMilestones = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const items = f.items || [];
  const updItem = (i, k, v) => { const next = items.slice(); next[i] = { ...next[i], [k]:v }; upd('items', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <div>
        {f.eyebrow && <Eyebrow value={f.eyebrow} onChange={v=>upd('eyebrow',v)} palette={palette} editable={editable}/>}
        <Editable value={f.title || 'Over the years'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:56, fontWeight:400, letterSpacing:'-0.025em', lineHeight:1.05, color:palette.ink, marginTop:8 }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(items.length,4)},1fr)`, gap:32 }}>
        {items.map((it, i) => (
          <div key={i} style={{ display:'flex', flexDirection:'column', gap:8 }}>
            <Editable value={it.year || '2024'} onChange={v=>updItem(i,'year',v)} editable={editable}
              style={{ fontSize:56, fontWeight:400, letterSpacing:'-0.02em', color:palette.ink }}/>
            <Editable value={it.label || 'Milestone'} onChange={v=>updItem(i,'label',v)} editable={editable}
              style={{ fontSize:13, fontWeight:700, letterSpacing:'.08em', textTransform:'uppercase', color:palette.ink, marginBottom:6 }}/>
            <Editable value={it.body || 'Description text goes here.'} onChange={v=>updItem(i,'body',v)} editable={editable} multiline
              style={{ fontSize:13, lineHeight:1.55, color:palette.muted }}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Horizontal Process (dots connected by line) ─────────────────────────────
const TplHorizontalProcess = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const steps = f.steps || [];
  const updStep = (i, k, v) => { const next = steps.slice(); next[i] = { ...next[i], [k]:v }; upd('steps', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <div>
        {f.eyebrow && (
          <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:8 }}>
            <span style={{ width:12, height:12, background:'#e84e1b', borderRadius:2 }}/>
            <Editable value={f.eyebrow} onChange={v=>upd('eyebrow',v)} editable={editable}
              style={{ fontSize:13, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:palette.muted }}/>
          </div>
        )}
        <Editable value={f.title || 'The <strong>Process</strong>'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:72, lineHeight:1, fontWeight:300, letterSpacing:'-0.03em', color:palette.ink }}/>
      </div>
      <div style={{ position:'relative', paddingTop:40 }}>
        {/* Connecting line */}
        <div style={{ position:'absolute', top:46, left:0, right:0, height:2, background:palette.ink }}/>
        {/* Dots and labels */}
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${steps.length},1fr)`, gap:0, position:'relative' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display:'flex', flexDirection:'column', alignItems:'flex-start', gap:16 }}>
              <div style={{ width:14, height:14, borderRadius:'50%', background:palette.ink }}/>
              <Editable value={s.label || `Step ${i+1}`} onChange={v=>updStep(i,'label',v)} editable={editable}
                style={{ fontSize:16, fontWeight:700, color:palette.ink }}/>
              <Editable value={s.body || 'Description'} onChange={v=>updStep(i,'body',v)} editable={editable} multiline
                style={{ fontSize:13, lineHeight:1.5, color:palette.muted, maxWidth:'90%' }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Four Column Process (numbered columns with header/body) ─────────────────
const TplFourColumnProcess = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const columns = f.columns || [];
  const updCol = (i, k, v) => { const next = columns.slice(); next[i] = { ...next[i], [k]:v }; upd('columns', next); };
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      <div>
        {f.eyebrow && <Eyebrow value={f.eyebrow} onChange={v=>upd('eyebrow',v)} palette={palette} editable={editable}/>}
        <Editable value={f.title || 'Process'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:56, fontWeight:400, letterSpacing:'-0.025em', lineHeight:1.1, color:palette.ink, marginTop:8 }}/>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(columns.length,4)},1fr)`, gap:0, borderTop:`1px solid ${palette.ink}` }}>
        {columns.map((c, i) => (
          <div key={i} style={{ padding:'24px 20px 24px 0', borderRight: i < columns.length-1 ? `1px solid ${palette.ink}` : 'none', paddingLeft: i>0 ? 20 : 0 }}>
            <Editable value={c.num || String(i+1).padStart(2,'0')} onChange={v=>updCol(i,'num',v)} editable={editable}
              style={{ fontSize:42, fontWeight:400, letterSpacing:'-0.02em', color:palette.ink, marginBottom:8 }}/>
            <div style={{ width:6, height:6, borderRadius:'50%', background:palette.ink, marginBottom:12 }}/>
            <Editable value={c.title || 'Step'} onChange={v=>updCol(i,'title',v)} editable={editable}
              style={{ fontSize:14, fontWeight:600, color:palette.ink, marginBottom:8 }}/>
            <Editable value={c.body || 'Description text here.'} onChange={v=>updCol(i,'body',v)} editable={editable} multiline
              style={{ fontSize:13, lineHeight:1.5, color:palette.muted }}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Profile Card (whois style) ──────────────────────────────────────────────
const TplProfileCard = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  const bgCol = palette.bg === '#0a0a0a' ? '#0a0a0a' : '#f5f5f0';
  return (
    <div style={{ position:'absolute', inset:0, background:bgCol, fontFamily:"'Courier New', Courier, monospace" }}>
      {/* Terminal command header */}
      <div style={{ padding:'28px 40px 0' }}>
        <Editable value={f.command || '$ whois speaker_name'} onChange={v=>upd('command',v)} editable={editable}
          style={{ fontSize:18, fontWeight:700, color:'#2d6b2d', fontFamily:'inherit' }}/>
      </div>
      <div style={{ position:'absolute', top:56, left:40, right:40, height:1, background:'#2d6b2d', opacity:0.4 }}/>

      <div style={{ position:'absolute', top:80, left:40, right:40, bottom:40, display:'grid', gridTemplateColumns:'180px 1fr', gap:32 }}>
        {/* Left: Photo */}
        <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
          <div style={{ width:160, height:180, background:'#ddd', border:'1px solid #999', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            {f.photoSrc ? (
              <img src={f.photoSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>
            ) : (
              <span style={{ fontSize:11, color:'#999', textTransform:'uppercase', letterSpacing:'.1em' }}>Photo</span>
            )}
          </div>
        </div>

        {/* Right: Quote + rows */}
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          {/* Quote */}
          <Editable value={f.quote || '"Quote goes here."'} onChange={v=>upd('quote',v)} editable={editable} multiline
            style={{ fontSize:18, fontStyle:'italic', fontWeight:400, lineHeight:1.4, color:'#1a1a1a', marginBottom:24, fontFamily:'inherit' }}/>

          {/* Data rows */}
          <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
            {rows.map((row, i) => (
              <div key={i} style={{ display:'grid', gridTemplateColumns:'120px 1fr', borderTop:'1px solid #ccc', padding:'12px 0', alignItems:'baseline' }}>
                <Editable value={row.label || 'LABEL'} onChange={v=>updRow(i,'label',v)} editable={editable}
                  style={{ fontSize:11, fontWeight:400, letterSpacing:'.12em', textTransform:'uppercase', color:'#888', fontFamily:'inherit' }}/>
                <div style={{ display:'flex', alignItems:'center', gap:12, flexWrap:'wrap' }}>
                  <Editable value={row.value || 'Value'} onChange={v=>updRow(i,'value',v)} editable={editable} multiline
                    style={{ fontSize:16, fontWeight: row.bold ? 700 : 400, color:'#1a1a1a', fontFamily:'inherit' }}/>
                  {row.badge && (
                    <span style={{ display:'inline-block', fontSize:10, fontWeight:700, letterSpacing:'.1em',
                      padding:'4px 10px', background:'#f5d023', color:'#1a1a1a', fontFamily:'inherit' }}>
                      {row.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ─── Level Grid (Smalltribe-style 3x2 numbered grid) ─────────────────────────
const TplLevelGrid = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const levels = f.levels || [];
  const updLevel = (i, k, v) => { const next = levels.slice(); next[i] = { ...next[i], [k]:v }; upd('levels', next); };
  const headingFont = "'Neue Haas Grotesk Display Pro', 'Inter', sans-serif";
  const bodyFont = "'Neue Haas Grotesk Text Pro', 'Inter', sans-serif";
  return (
    <div style={{ position:'absolute', inset:0, background:'#ffffff', fontFamily:bodyFont, display:'flex', flexDirection:'column' }}>
      {/* Black header band */}
      <div style={{ background:'#0a0a0a', padding:'48px 56px 48px', flexShrink:0 }}>
        <Editable value={f.title || 'Six levels of AI maturity, from theater to self-driving.'} onChange={v=>upd('title',v)} editable={editable} multiline
          style={{ fontSize:34, fontWeight:400, lineHeight:1.25, letterSpacing:'-0.02em', color:'#ffffff', fontFamily:headingFont, maxWidth:'70%' }}/>
      </div>

      {/* Nav strip */}
      <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'16px 56px', borderBottom:'1px solid #e5e5e5' }}>
        <div style={{ display:'flex', alignItems:'center', gap:10 }}>
          <span style={{ width:8, height:8, borderRadius:'50%', background:'#0a0a0a', display:'inline-block' }}/>
          <Editable value={f.navLeft || 'The Ladder'} onChange={v=>upd('navLeft',v)} editable={editable}
            style={{ fontSize:12, fontWeight:500, color:'#0a0a0a', fontFamily:bodyFont }}/>
        </div>
        <Editable value={f.navRight || 'L0 → L5'} onChange={v=>upd('navRight',v)} editable={editable}
          style={{ fontSize:12, fontWeight:500, color:'#0a0a0a', fontFamily:bodyFont, textDecoration:'underline', textUnderlineOffset:4 }}/>
      </div>

      {/* 3x2 grid of levels */}
      <div style={{ flex:1, display:'grid', gridTemplateColumns:'repeat(3,1fr)', gridTemplateRows:'1fr 1fr', padding:'0 56px' }}>
        {levels.slice(0, 6).map((lv, i) => (
          <div key={i} style={{
            padding:'28px 24px 28px 0',
            borderBottom: i < 3 ? '1px solid #e5e5e5' : 'none',
            borderRight: (i % 3 !== 2) ? '1px solid #e5e5e5' : 'none',
            display:'flex', flexDirection:'column', gap:12,
          }}>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <span style={{ fontSize:13, fontWeight:400, color:'#999', fontFamily:bodyFont }}>
                {String(i + 1).padStart(2, '0')}
              </span>
              {lv.badge && (
                <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.06em', padding:'2px 7px',
                  background:'#f5d023', color:'#0a0a0a', borderRadius:2, fontFamily:bodyFont }}>{lv.badge}</span>
              )}
            </div>
            <Editable value={lv.title || 'Level Title'} onChange={v=>updLevel(i,'title',v)} editable={editable}
              style={{ fontSize:15, fontWeight:700, color:'#0a0a0a', fontFamily:headingFont, lineHeight:1.25 }}/>
            <Editable value={lv.desc || 'Description text.'} onChange={v=>updLevel(i,'desc',v)} editable={editable} multiline
              style={{ fontSize:12, color:'#666', fontFamily:bodyFont, lineHeight:1.5 }}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Level Detail (portfolio list layout — large labels + horizontal rules) ──
const TplLevelDetail = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const leftRows = f.leftRows || [];
  const rightRows = f.rightRows || [];
  const updLeft = (i, k, v) => { const next = leftRows.slice(); next[i] = { ...next[i], [k]:v }; upd('leftRows', next); };
  const updRight = (i, k, v) => { const next = rightRows.slice(); next[i] = { ...next[i], [k]:v }; upd('rightRows', next); };
  const headingFont = "'Neue Haas Grotesk Display Pro', 'Inter', sans-serif";
  const bodyFont = "'Neue Haas Grotesk Text Pro', 'Inter', sans-serif";

  const levelId = leftRows[0]?.value || 'L0';
  const levelName = leftRows[1]?.value || 'Level Name';
  const signal = leftRows[2]?.value || '';
  const desc = leftRows[3]?.value || '';

  return (
    <div style={{ position:'absolute', inset:0, background:'#f8f8f6', fontFamily:bodyFont, display:'flex', flexDirection:'column' }}>
      {/* Large level name — like "AMAZON" in the portfolio */}
      <div style={{ padding:'40px 56px 0', borderBottom:'1px solid #ddd' }}>
        <Editable value={levelId} onChange={v=>updLeft(0,'value',v)} editable={editable}
          style={{ fontSize:80, fontWeight:900, letterSpacing:'-0.03em', lineHeight:0.9, color:'#0a0a0a', fontFamily:headingFont, textTransform:'uppercase' }}/>
        <div style={{ display:'flex', alignItems:'baseline', gap:24, padding:'12px 0 20px' }}>
          <Editable value={levelName} onChange={v=>updLeft(1,'value',v)} editable={editable}
            style={{ fontSize:18, fontWeight:700, color:'#0a0a0a', fontFamily:headingFont }}/>
          {leftRows[0]?.badge && (
            <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.06em', padding:'3px 8px',
              background:'#f5d023', color:'#0a0a0a', borderRadius:2, fontFamily:bodyFont }}>{leftRows[0].badge}</span>
          )}
        </div>
      </div>

      {/* Content rows as list with horizontal rules */}
      <div style={{ flex:1, padding:'0 56px', overflow:'hidden', display:'flex', flexDirection:'column' }}>
        {/* Signal row */}
        {signal && (
          <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', borderBottom:'1px solid #e5e5e5', padding:'16px 0' }}>
            <Editable value={leftRows[2]?.label || 'SIGNAL'} onChange={v=>updLeft(2,'label',v)} editable={editable}
              style={{ fontSize:10, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#999', fontFamily:bodyFont, paddingTop:3 }}/>
            <Editable value={signal} onChange={v=>updLeft(2,'value',v)} editable={editable} multiline
              style={{ fontSize:14, fontWeight:500, color:'#1a1a1a', fontFamily:bodyFont, lineHeight:1.5 }}/>
          </div>
        )}
        {/* Desc row */}
        {desc && (
          <div style={{ display:'grid', gridTemplateColumns:'140px 1fr', borderBottom:'1px solid #e5e5e5', padding:'16px 0' }}>
            <Editable value={leftRows[3]?.label || 'DESC'} onChange={v=>updLeft(3,'label',v)} editable={editable}
              style={{ fontSize:10, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#999', fontFamily:bodyFont, paddingTop:3 }}/>
            <Editable value={desc} onChange={v=>updLeft(3,'value',v)} editable={editable} multiline
              style={{ fontSize:14, fontWeight:400, color:'#444', fontFamily:bodyFont, lineHeight:1.6 }}/>
          </div>
        )}
        {/* Right rows (markers, the tell, the wall, etc.) */}
        {rightRows.map((row, i) => (
          <div key={i} style={{ display:'grid', gridTemplateColumns:'140px 1fr', borderBottom:'1px solid #e5e5e5', padding:'16px 0' }}>
            <Editable value={row.label || 'LABEL'} onChange={v=>updRight(i,'label',v)} editable={editable}
              style={{ fontSize:10, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase', color:'#999', fontFamily:bodyFont, paddingTop:3 }}/>
            <Editable value={row.value || 'Content'} onChange={v=>updRight(i,'value',v)} editable={editable} multiline
              style={{ fontSize:14, fontWeight:400, color:'#1a1a1a', fontFamily:bodyFont, lineHeight:1.6 }}/>
          </div>
        ))}
      </div>

      {/* Diagnostic — bottom strip */}
      {f.diagnostic && (
        <div style={{ flexShrink:0, background:'#0a0a0a', padding:'18px 56px', display:'flex', alignItems:'center', gap:20 }}>
          <span style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:'#f5d023', fontFamily:bodyFont, whiteSpace:'nowrap' }}>DIAGNOSTIC</span>
          <Editable value={f.diagnostic} onChange={v=>upd('diagnostic',v)} editable={editable} multiline
            style={{ fontSize:14, fontWeight:400, color:'#ccc', fontFamily:bodyFont, lineHeight:1.4, fontStyle:'italic' }}/>
        </div>
      )}
    </div>
  );
};

// ─── Profile: Magazine (large quote hero, sidebar bio) ───────────────────────
const TplProfileMagazine = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  return (
    <div style={{ position:'absolute', inset:0, display:'grid', gridTemplateColumns:'1fr 380px' }}>
      {/* Left: big quote */}
      <div style={{ padding:'72px 56px', display:'flex', flexDirection:'column', justifyContent:'center', background:palette.bg }}>
        <Editable value={f.quote || '"Quote"'} onChange={v=>upd('quote',v)} editable={editable} multiline
          style={{ fontSize:42, fontWeight:300, fontStyle:'italic', lineHeight:1.25, letterSpacing:'-0.02em', color:palette.ink, marginBottom:32 }}/>
        <div style={{ width:60, height:3, background:'#f5d023', marginBottom:24 }}/>
        <Editable value={(rows[0]?.value) || 'Name'} onChange={v=>updRow(0,'value',v)} editable={editable}
          style={{ fontSize:28, fontWeight:700, letterSpacing:'-0.01em', color:palette.ink, marginBottom:4 }}/>
        <Editable value={(rows[1]?.value) || 'Role'} onChange={v=>updRow(1,'value',v)} editable={editable}
          style={{ fontSize:15, fontWeight:400, color:palette.muted }}/>
      </div>
      {/* Right: details sidebar */}
      <div style={{ background: palette.bg === '#0a0a0a' ? '#111' : '#f0efe8', padding:'72px 32px', display:'flex', flexDirection:'column', justifyContent:'center', gap:0 }}>
        <div style={{ width:120, height:140, background:'#ddd', borderRadius:4, marginBottom:28, overflow:'hidden', flexShrink:0 }}>
          {f.photoSrc && <img src={f.photoSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
        </div>
        {rows.slice(2).map((row, i) => (
          <div key={i} style={{ borderTop:'1px solid rgba(128,128,128,0.2)', padding:'14px 0' }}>
            <Editable value={row.label || 'LABEL'} onChange={v=>updRow(i+2,'label',v)} editable={editable}
              style={{ fontSize:10, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:palette.muted, marginBottom:4 }}/>
            <Editable value={row.value || ''} onChange={v=>updRow(i+2,'value',v)} editable={editable}
              style={{ fontSize:14, fontWeight: row.bold ? 700 : 400, lineHeight:1.4, color:palette.ink }}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Profile: Centered (centered hero, minimal) ─────────────────────────────
const TplProfileCentered = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', textAlign:'center', padding:'60px 80px' }}>
      <div style={{ width:90, height:90, borderRadius:'50%', background:'#ddd', marginBottom:24, overflow:'hidden', flexShrink:0 }}>
        {f.photoSrc && <img src={f.photoSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
      </div>
      <Editable value={(rows[0]?.value) || 'Name'} onChange={v=>updRow(0,'value',v)} editable={editable}
        style={{ fontSize:48, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1, color:palette.ink, marginBottom:8 }}/>
      <Editable value={(rows[1]?.value) || 'Role'} onChange={v=>updRow(1,'value',v)} editable={editable}
        style={{ fontSize:16, fontWeight:500, color:palette.muted, marginBottom:32, maxWidth:'50ch' }}/>
      <Editable value={f.quote || '"Quote"'} onChange={v=>upd('quote',v)} editable={editable} multiline
        style={{ fontSize:26, fontWeight:300, fontStyle:'italic', lineHeight:1.4, color:palette.ink, maxWidth:'60ch', marginBottom:32 }}/>
      <div style={{ display:'flex', flexWrap:'wrap', gap:24, justifyContent:'center' }}>
        {rows.slice(2).map((row, i) => (
          <div key={i} style={{ textAlign:'center' }}>
            <Editable value={row.label || 'LABEL'} onChange={v=>updRow(i+2,'label',v)} editable={editable}
              style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:palette.muted, marginBottom:4 }}/>
            <Editable value={row.value || ''} onChange={v=>updRow(i+2,'value',v)} editable={editable}
              style={{ fontSize:13, fontWeight:400, color:palette.ink, maxWidth:'18ch' }}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Profile: Horizontal Cards (facts as card row) ──────────────────────────
const TplProfileCards = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  const cardBg = palette.bg === '#0a0a0a' ? '#161616' : '#fff';
  const borderCol = palette.bg === '#0a0a0a' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  return (
    <div style={{ position:'absolute', inset:0, padding:'56px 48px', display:'flex', flexDirection:'column' }}>
      {/* Top header */}
      <div style={{ display:'flex', alignItems:'flex-start', gap:24, marginBottom:20 }}>
        <div style={{ width:80, height:80, borderRadius:8, background:'#ddd', overflow:'hidden', flexShrink:0 }}>
          {f.photoSrc && <img src={f.photoSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/>}
        </div>
        <div>
          <Editable value={(rows[0]?.value) || 'Name'} onChange={v=>updRow(0,'value',v)} editable={editable}
            style={{ fontSize:36, fontWeight:700, letterSpacing:'-0.02em', lineHeight:1.1, color:palette.ink }}/>
          <Editable value={(rows[1]?.value) || 'Role'} onChange={v=>updRow(1,'value',v)} editable={editable}
            style={{ fontSize:15, fontWeight:400, color:palette.muted, marginTop:4 }}/>
        </div>
      </div>
      {/* Quote strip */}
      <div style={{ background: palette.bg === '#0a0a0a' ? '#1a1a1a' : '#f8f7f2', borderRadius:8, padding:'20px 28px', marginBottom:24 }}>
        <Editable value={f.quote || '"Quote"'} onChange={v=>upd('quote',v)} editable={editable} multiline
          style={{ fontSize:20, fontWeight:400, fontStyle:'italic', lineHeight:1.4, color:palette.ink }}/>
      </div>
      {/* Cards grid */}
      <div style={{ display:'grid', gridTemplateColumns:`repeat(${Math.min(rows.length - 2, 4)}, 1fr)`, gap:12, flex:1 }}>
        {rows.slice(2).map((row, i) => (
          <div key={i} style={{ background:cardBg, border:`1px solid ${borderCol}`, borderRadius:8, padding:'18px 16px', display:'flex', flexDirection:'column', gap:6 }}>
            <Editable value={row.label || 'LABEL'} onChange={v=>updRow(i+2,'label',v)} editable={editable}
              style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:palette.muted }}/>
            <Editable value={row.value || ''} onChange={v=>updRow(i+2,'value',v)} editable={editable} multiline
              style={{ fontSize:14, fontWeight: row.bold ? 600 : 400, lineHeight:1.4, color:palette.ink }}/>
            {row.badge && <span style={{ display:'inline-block', alignSelf:'flex-start', fontSize:9, fontWeight:700, letterSpacing:'.08em',
              padding:'3px 8px', background:'#f5d023', color:'#1a1a1a', borderRadius:3, marginTop:4 }}>{row.badge}</span>}
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Profile: Bold Split (full-bleed name, right details) ───────────────────
const TplProfileBoldSplit = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  return (
    <div style={{ position:'absolute', inset:0, display:'grid', gridTemplateColumns:'1fr 1fr' }}>
      {/* Left: oversized name */}
      <div style={{ background:'#0a0a0a', padding:'56px 48px', display:'flex', flexDirection:'column', justifyContent:'flex-end' }}>
        <Editable value={(rows[0]?.value) || 'Name'} onChange={v=>updRow(0,'value',v)} editable={editable}
          style={{ fontSize:72, fontWeight:800, letterSpacing:'-0.04em', lineHeight:0.95, color:'#fff', marginBottom:16 }}/>
        <Editable value={(rows[1]?.value) || 'Role'} onChange={v=>updRow(1,'value',v)} editable={editable}
          style={{ fontSize:16, fontWeight:400, color:'rgba(255,255,255,0.5)' }}/>
      </div>
      {/* Right: quote + rows */}
      <div style={{ padding:'56px 40px', display:'flex', flexDirection:'column', justifyContent:'center', gap:0 }}>
        <Editable value={f.quote || '"Quote"'} onChange={v=>upd('quote',v)} editable={editable} multiline
          style={{ fontSize:22, fontWeight:300, fontStyle:'italic', lineHeight:1.35, color:palette.ink, marginBottom:32, paddingBottom:24, borderBottom:`1px solid ${palette.bg === '#0a0a0a' ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)'}` }}/>
        {rows.slice(2).map((row, i) => (
          <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'baseline', padding:'12px 0', borderBottom:`1px solid ${palette.bg === '#0a0a0a' ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}` }}>
            <Editable value={row.label || 'LABEL'} onChange={v=>updRow(i+2,'label',v)} editable={editable}
              style={{ fontSize:10, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase', color:palette.muted, flexShrink:0, width:100 }}/>
            <div style={{ display:'flex', alignItems:'center', gap:10 }}>
              <Editable value={row.value || ''} onChange={v=>updRow(i+2,'value',v)} editable={editable}
                style={{ fontSize:14, fontWeight: row.bold ? 700 : 400, color:palette.ink, textAlign:'right' }}/>
              {row.badge && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.08em', padding:'3px 8px', background:'#f5d023', color:'#1a1a1a' }}>{row.badge}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Profile: Dossier (classified-file aesthetic) ────────────────────────────
const TplProfileDossier = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  return (
    <div style={{ position:'absolute', inset:0, background:'#faf9f4', fontFamily:"'Courier New', monospace" }}>
      {/* Top classification bar */}
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'20px 40px', borderBottom:'2px solid #1a1a1a' }}>
        <span style={{ fontSize:11, fontWeight:700, letterSpacing:'.2em', color:'#c00' }}>CLASSIFIED</span>
        <Editable value={f.command || '$ whois ann_miura-ko'} onChange={v=>upd('command',v)} editable={editable}
          style={{ fontSize:13, fontWeight:400, color:'#666', fontFamily:'inherit' }}/>
      </div>
      <div style={{ padding:'32px 40px', display:'grid', gridTemplateColumns:'160px 1fr', gap:40 }}>
        {/* Photo */}
        <div>
          <div style={{ width:160, height:200, background:'#e8e6de', border:'1px solid #999', display:'flex', alignItems:'center', justifyContent:'center', overflow:'hidden' }}>
            {f.photoSrc ? <img src={f.photoSrc} alt="" style={{ width:'100%', height:'100%', objectFit:'cover' }}/> :
              <span style={{ fontSize:10, color:'#999', letterSpacing:'.1em' }}>PHOTO</span>}
          </div>
          <div style={{ marginTop:12, fontSize:10, color:'#999', letterSpacing:'.1em', textAlign:'center' }}>FILE PHOTO</div>
        </div>
        {/* Content */}
        <div style={{ display:'flex', flexDirection:'column', gap:0 }}>
          <Editable value={(rows[0]?.value) || 'Name'} onChange={v=>updRow(0,'value',v)} editable={editable}
            style={{ fontSize:32, fontWeight:700, color:'#1a1a1a', fontFamily:'inherit', marginBottom:4, letterSpacing:'-0.01em' }}/>
          <Editable value={(rows[1]?.value) || 'Role'} onChange={v=>updRow(1,'value',v)} editable={editable}
            style={{ fontSize:14, fontWeight:400, color:'#666', fontFamily:'inherit', marginBottom:20 }}/>
          <div style={{ padding:'16px 20px', background:'#f0efe8', border:'1px solid #ddd', marginBottom:20 }}>
            <Editable value={f.quote || '"Quote"'} onChange={v=>upd('quote',v)} editable={editable} multiline
              style={{ fontSize:16, fontStyle:'italic', lineHeight:1.4, color:'#1a1a1a', fontFamily:'inherit' }}/>
          </div>
          {rows.slice(2).map((row, i) => (
            <div key={i} style={{ display:'grid', gridTemplateColumns:'110px 1fr', padding:'10px 0', borderTop:'1px dotted #ccc' }}>
              <Editable value={row.label || 'LABEL'} onChange={v=>updRow(i+2,'label',v)} editable={editable}
                style={{ fontSize:10, fontWeight:400, letterSpacing:'.12em', textTransform:'uppercase', color:'#999', fontFamily:'inherit' }}/>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Editable value={row.value || ''} onChange={v=>updRow(i+2,'value',v)} editable={editable}
                  style={{ fontSize:14, fontWeight: row.bold ? 700 : 400, color:'#1a1a1a', fontFamily:'inherit' }}/>
                {row.badge && <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.08em', padding:'2px 8px', background:'#f5d023', color:'#1a1a1a', fontFamily:'sans-serif' }}>{row.badge}</span>}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Profile: Minimal (stark, large quote, bottom details) ──────────────────
const TplProfileMinimal = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  const insightRow = rows.find(r => r.badge);
  return (
    <div style={{ position:'absolute', inset:0, padding:'72px 56px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      {/* Top: name + role */}
      <div>
        <Editable value={(rows[0]?.value) || 'Name'} onChange={v=>updRow(0,'value',v)} editable={editable}
          style={{ fontSize:14, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:palette.muted }}/>
        <Editable value={(rows[1]?.value) || 'Role'} onChange={v=>updRow(1,'value',v)} editable={editable}
          style={{ fontSize:14, fontWeight:400, color:palette.muted, marginTop:4 }}/>
      </div>
      {/* Center: hero quote */}
      <Editable value={f.quote || '"Quote"'} onChange={v=>upd('quote',v)} editable={editable} multiline
        style={{ fontSize:52, fontWeight:300, fontStyle:'italic', lineHeight:1.15, letterSpacing:'-0.03em', color:palette.ink, maxWidth:'85%' }}/>
      {/* Bottom: key insight + metadata row */}
      <div>
        {insightRow && (
          <div style={{ borderLeft:'4px solid #f5d023', paddingLeft:16, marginBottom:20 }}>
            <Editable value={insightRow.value || ''} onChange={v=>updRow(rows.indexOf(insightRow),'value',v)} editable={editable} multiline
              style={{ fontSize:16, fontWeight:500, lineHeight:1.45, color:palette.ink }}/>
          </div>
        )}
        <div style={{ display:'flex', gap:32, borderTop:`1px solid ${palette.bg === '#0a0a0a' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.1)'}`, paddingTop:16 }}>
          {rows.filter(r => !r.badge && r !== rows[0] && r !== rows[1]).map((row, i) => (
            <div key={i}>
              <Editable value={row.label || 'LABEL'} onChange={v=>updRow(rows.indexOf(row),'label',v)} editable={editable}
                style={{ fontSize:9, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:palette.muted, marginBottom:4 }}/>
              <Editable value={row.value || ''} onChange={v=>updRow(rows.indexOf(row),'value',v)} editable={editable}
                style={{ fontSize:13, fontWeight:400, color:palette.ink }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Profile Modern (clean typography, no terminal) ──────────────────────────
const TplProfileModern = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const tags = f.tags || [];
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'space-between' }}>
      {/* Top: role eyebrow + name */}
      <div>
        <Editable value={f.role || 'Role & Company'} onChange={v=>upd('role',v)} editable={editable}
          style={{ fontSize:14, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:palette.muted, marginBottom:12 }}/>
        <Editable value={f.name || 'Speaker Name'} onChange={v=>upd('name',v)} editable={editable}
          style={{ fontSize:64, fontWeight:700, letterSpacing:'-0.03em', lineHeight:1, color:palette.ink }}/>
      </div>

      {/* Middle: hero quote */}
      <Editable value={f.quote || '"A compelling quote goes here."'} onChange={v=>upd('quote',v)} editable={editable} multiline
        style={{ fontSize:36, fontWeight:400, fontStyle:'italic', lineHeight:1.3, color:palette.ink, maxWidth:'80%' }}/>

      {/* Bottom: key insight callout + credential tags */}
      <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
        {f.insight && (
          <div style={{ borderLeft:'4px solid #f5d023', paddingLeft:20 }}>
            <Editable value={f.insight} onChange={v=>upd('insight',v)} editable={editable} multiline
              style={{ fontSize:18, fontWeight:600, lineHeight:1.4, color:palette.ink }}/>
          </div>
        )}
        <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
          {tags.map((tag, i) => (
            <Editable key={i} value={tag} onChange={v=>{ const next = tags.slice(); next[i]=v; upd('tags',next); }} editable={editable}
              style={{ display:'inline-block', fontSize:11, fontWeight:600, letterSpacing:'.08em', textTransform:'uppercase',
                padding:'6px 12px', border:`1px solid ${palette.ink}`, borderRadius:999, color:palette.ink }}/>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Level Intro (big number + name, section opener) ─────────────────────────
const TplLevelIntro = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  return (
    <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'center', alignItems:'flex-start' }}>
      <div style={{ display:'flex', alignItems:'center', gap:16, marginBottom:16 }}>
        <Editable value={f.levelId || 'L0'} onChange={v=>upd('levelId',v)} editable={editable}
          style={{ fontSize:180, fontWeight:500, letterSpacing:'-0.04em', lineHeight:0.85, color:palette.ink }}/>
        {f.badge && (
          <span style={{ fontSize:12, fontWeight:700, letterSpacing:'.1em', padding:'6px 14px',
            background:'#f5d023', color:'#1a1a1a' }}>{f.badge}</span>
        )}
      </div>
      <Editable value={f.name || 'Level Name'} onChange={v=>upd('name',v)} editable={editable}
        style={{ fontSize:56, fontWeight:700, letterSpacing:'-0.025em', lineHeight:1.1, color:palette.ink, marginBottom:20 }}/>
      <Editable value={f.signal || 'One-line signal description.'} onChange={v=>upd('signal',v)} editable={editable}
        style={{ fontSize:22, fontWeight:400, lineHeight:1.4, color:palette.muted, maxWidth:'60ch' }}/>
    </div>
  );
};

// ─── Level Section (modern, one section per slide) ───────────────────────────
const TplLevelSection = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const isDiagnostic = f.variant === 'diagnostic';
  const bg = isDiagnostic ? '#f5d023' : palette.bg;
  const ink = isDiagnostic ? '#1a1a1a' : palette.ink;
  const muted = isDiagnostic ? 'rgba(0,0,0,0.5)' : palette.muted;
  return (
    <div style={{ position:'absolute', inset:0, background:bg, display:'flex', flexDirection:'column' }}>
      {/* Level badge in top-right */}
      <div style={{ position:'absolute', top:32, right:40, fontSize:13, fontWeight:700, letterSpacing:'.1em', color:muted }}>
        {f.levelId || 'L0'}
      </div>

      <div style={{ position:'absolute', inset:'72px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        {/* Section label */}
        <Editable value={f.sectionLabel || 'SECTION'} onChange={v=>upd('sectionLabel',v)} editable={editable}
          style={{ fontSize:13, fontWeight:700, letterSpacing:'.16em', textTransform:'uppercase', color:muted, marginBottom:24 }}/>

        {/* Main content */}
        <Editable value={f.body || 'Content goes here.'} onChange={v=>upd('body',v)} editable={editable} multiline
          style={{ fontSize: isDiagnostic ? 42 : 28, fontWeight: isDiagnostic ? 500 : 400,
            fontStyle: isDiagnostic ? 'italic' : 'normal',
            lineHeight:1.35, color:ink, maxWidth:'70ch' }}/>
      </div>
    </div>
  );
};

// ─── Level Section Terminal (monospace, one section per slide) ────────────────
const TplLevelSectionTerminal = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const isDiagnostic = f.variant === 'diagnostic';
  const bgCol = '#f5f5f0';
  return (
    <div style={{ position:'absolute', inset:0, background: isDiagnostic ? '#f5d023' : bgCol, fontFamily:"'Courier New', Courier, monospace" }}>
      {/* Terminal command header */}
      <div style={{ padding:'28px 40px 0' }}>
        <Editable value={f.command || '$ describe --level 0 --section markers'} onChange={v=>upd('command',v)} editable={editable}
          style={{ fontSize:16, fontWeight:700, color: isDiagnostic ? '#1a1a1a' : '#2d6b2d', fontFamily:'inherit' }}/>
      </div>
      <div style={{ position:'absolute', top:56, left:40, right:40, height:1, background: isDiagnostic ? '#1a1a1a' : '#2d6b2d', opacity:0.3 }}/>

      {/* Level badge */}
      <div style={{ position:'absolute', top:28, right:40, fontSize:14, fontWeight:700, color: isDiagnostic ? '#1a1a1a' : '#888', fontFamily:'inherit' }}>
        {f.levelId || 'L0'}
      </div>

      {/* Content */}
      <div style={{ position:'absolute', inset:'90px 40px 40px', display:'flex', flexDirection:'column', justifyContent:'center' }}>
        <Editable value={f.sectionLabel || 'SECTION'} onChange={v=>upd('sectionLabel',v)} editable={editable}
          style={{ fontSize:12, letterSpacing:'.14em', textTransform:'uppercase', color: isDiagnostic ? 'rgba(0,0,0,0.5)' : '#888', marginBottom:20, fontFamily:'inherit' }}/>

        <Editable value={f.body || 'Content goes here.'} onChange={v=>upd('body',v)} editable={editable} multiline
          style={{ fontSize: isDiagnostic ? 32 : 22, fontWeight:400,
            fontStyle: isDiagnostic ? 'italic' : 'normal',
            lineHeight:1.5, color:'#1a1a1a', fontFamily:'inherit', maxWidth:'70ch' }}/>
      </div>
    </div>
  );
};

// ─── Team Initiatives Table ──────────────────────────────────────────────────
const TplTeamInitiatives = ({ slide, onChange, palette, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]:v }; upd('rows', next); };
  const cols = f.columns || ['Initiative', 'Description', 'Status'];
  const colWidths = f.colWidths || ['16%', '66%', '18%'];

  const hdrBg = palette.bg === '#0a0a0a' ? '#1a237e' : '#1a237e';
  const hdrColor = '#fff';
  const rowBg = (i) => i % 2 === 0
    ? (palette.bg === '#0a0a0a' ? 'rgba(255,255,255,0.04)' : 'rgba(200,210,240,0.2)')
    : 'transparent';
  const borderColor = palette.bg === '#0a0a0a' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.08)';

  return (
    <div style={{ position:'absolute', inset:0, display:'flex', flexDirection:'column',
      background: 'linear-gradient(180deg, rgba(180,200,240,0.25) 0%, rgba(200,210,240,0.12) 100%)',
      padding:'28px 36px 36px',
    }}>
      {/* Team name */}
      <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:18 }}>
        <Editable value={f.teamName || 'Team'} onChange={v=>upd('teamName',v)} editable={editable}
          style={{ fontSize:36, fontWeight:700, letterSpacing:'-0.01em', color:palette.ink }}/>
        {f.icon && <span style={{ fontSize:28 }}>{f.icon}</span>}
      </div>

      {/* Table */}
      <div style={{ flex:1, display:'flex', flexDirection:'column', border:`1px solid ${borderColor}`, borderRadius:6, overflow:'hidden' }}>
        {/* Header row */}
        <div style={{ display:'flex', background:hdrBg, flexShrink:0 }}>
          {cols.map((col, ci) => (
            <div key={ci} style={{ width:colWidths[ci], padding:'10px 16px', fontWeight:700, fontSize:14,
              letterSpacing:'.02em', color:hdrColor,
              borderRight: ci < cols.length - 1 ? '1px solid rgba(255,255,255,0.15)' : 'none' }}>
              <Editable value={col} onChange={v=>{ const nc = cols.slice(); nc[ci]=v; upd('columns',nc); }}
                editable={editable} style={{ color:hdrColor, fontWeight:700, fontSize:14 }}/>
            </div>
          ))}
        </div>

        {/* Data rows */}
        <div style={{ flex:1, overflowY:'auto' }}>
          {rows.map((row, ri) => (
            <div key={ri} style={{ display:'flex', borderBottom:`1px solid ${borderColor}`, background:rowBg(ri) }}>
              <div style={{ width:colWidths[0], padding:'10px 16px', borderRight:`1px solid ${borderColor}` }}>
                <Editable value={row.initiative || ''} onChange={v=>updRow(ri,'initiative',v)} editable={editable}
                  style={{ fontSize:13, fontWeight:700, color:palette.ink, lineHeight:1.4 }}/>
              </div>
              <div style={{ width:colWidths[1], padding:'10px 16px', borderRight:`1px solid ${borderColor}` }}>
                <Editable value={row.description || ''} onChange={v=>updRow(ri,'description',v)} editable={editable} multiline
                  style={{ fontSize:13, fontWeight:400, color:palette.ink, lineHeight:1.5, opacity:0.85 }}/>
              </div>
              <div style={{ width:colWidths[2], padding:'10px 16px' }}>
                <Editable value={row.status || ''} onChange={v=>updRow(ri,'status',v)} editable={editable}
                  style={{ fontSize:13, fontWeight:600, color: row.statusColor || palette.ink, lineHeight:1.4 }}/>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Sticky Mobile / Spectrum deck style (PDF design system) ─────────────────
const SPECTRUM_ORANGE = '#FF4500';
const SPECTRUM_RED = '#FF003C';
const SPECTRUM_BG = '#F5F5F5';
const SPECTRUM_HEADING = "'Neue Haas Grotesk Display Pro', 'Inter', sans-serif";
const SPECTRUM_BODY = "'Neue Haas Grotesk Text Pro', 'Inter', sans-serif";

const SpectrumMark = () => (
  <span style={{ color: SPECTRUM_ORANGE, fontSize: 10, marginRight: 6 }}>■</span>
);

const formatSpectrumLevel = (id) => {
  const n = String(id || '0').replace(/\D/g, '');
  return `LEVEL ${n.padStart(2, '0')}`;
};

const renderHighlightedQuote = (quote, highlights, editable, onChange) => {
  const terms = (highlights || '').split(/[,|]/).map(s => s.trim()).filter(Boolean);
  if (!terms.length) {
    return (
      <Editable value={quote || ''} onChange={onChange} editable={editable} multiline
        style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}/>
    );
  }
  if (!editable) {
    const parts = [];
    let rest = quote || '';
    terms.forEach((term, i) => {
      const idx = rest.toLowerCase().indexOf(term.toLowerCase());
      if (idx === -1) return;
      if (idx > 0) parts.push(<span key={`pre-${i}`}>{rest.slice(0, idx)}</span>);
      parts.push(
        <span key={`hi-${i}`} style={{ color: SPECTRUM_ORANGE, textDecoration: 'underline', textDecorationThickness: 3, textUnderlineOffset: 4 }}>
          {rest.slice(idx, idx + term.length)}
        </span>
      );
      rest = rest.slice(idx + term.length);
    });
    if (rest) parts.push(<span key="tail">{rest}</span>);
    return <div style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}>{parts}</div>;
  }
  return (
    <Editable value={quote || ''} onChange={onChange} editable={editable} multiline
      style={{ fontSize: 52, fontWeight: 700, lineHeight: 1.12, letterSpacing: '-0.03em', color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}/>
  );
};

const TplStickyMobileCover = ({ slide, onChange, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]: v } });
  const titlePrimary = f.titlePrimary || 'Mobile Algo';
  const titleSecondary = f.titleSecondary || 'Sticky Expressions';
  return (
    <div style={{ position: 'absolute', inset: 0, background: SPECTRUM_RED, color: '#fff', fontFamily: SPECTRUM_BODY, padding: '40px 48px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', alignItems: 'start', fontSize: 11, fontWeight: 600, letterSpacing: '.14em', textTransform: 'uppercase' }}>
        <div>
          <Editable value={f.editorLabel || 'Editor'} onChange={v => upd('editorLabel', v)} editable={editable}
            style={{ display: 'block', color: '#fff', fontFamily: 'inherit' }}/>
          <Editable value={f.designersLabel || 'Designers'} onChange={v => upd('designersLabel', v)} editable={editable}
            style={{ display: 'block', marginTop: 8, color: '#fff', fontFamily: 'inherit' }}/>
        </div>
        <Editable value={f.centerTitle || 'Sticky on Mobile'} onChange={v => upd('centerTitle', v)} editable={editable}
          style={{ textAlign: 'center', color: '#fff', fontFamily: 'inherit' }}/>
        <div style={{ textAlign: 'right' }}>
          <Editable value={f.dateLabel || 'Date'} onChange={v => upd('dateLabel', v)} editable={editable}
            style={{ display: 'block', color: '#fff', fontFamily: 'inherit' }}/>
          <Editable value={f.date || 'May 2026'} onChange={v => upd('date', v)} editable={editable}
            style={{ display: 'block', marginTop: 8, color: '#fff', fontFamily: 'inherit', textTransform: 'none', letterSpacing: '.04em' }}/>
        </div>
      </div>
      <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', paddingBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'baseline', flexWrap: 'wrap', gap: '0 16px', lineHeight: 0.95 }}>
          <Editable value={titlePrimary} onChange={v => upd('titlePrimary', v)} editable={editable}
            style={{ fontSize: 120, fontWeight: 700, letterSpacing: '-0.04em', color: '#fff', fontFamily: SPECTRUM_HEADING }}/>
          <span style={{ fontSize: 72, fontWeight: 300, color: '#fff', opacity: 0.9 }}>/</span>
          <Editable value={titleSecondary} onChange={v => upd('titleSecondary', v)} editable={editable}
            style={{ fontSize: 56, fontWeight: 700, letterSpacing: '-0.02em', color: '#fff', fontFamily: SPECTRUM_HEADING }}/>
        </div>
      </div>
    </div>
  );
};

const TplSpectrumProfile = ({ slide, onChange, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]: v } });
  const rows = f.rows || [];
  const updRow = (i, k, v) => { const next = rows.slice(); next[i] = { ...next[i], [k]: v }; upd('rows', next); };
  return (
    <div style={{ position: 'absolute', inset: '36px 0 0', background: '#fff', fontFamily: SPECTRUM_BODY, display: 'flex', flexDirection: 'column' }}>
      <div style={{ padding: '48px 56px 32px', borderBottom: '1px solid #e8e8e8' }}>
        {renderHighlightedQuote(f.quote, f.highlightWords, editable, v => upd('quote', v))}
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '280px 1fr', gap: 48, padding: '40px 56px' }}>
        <div>
          <div style={{ width: 160, height: 160, borderRadius: '50%', overflow: 'hidden', background: '#f0e0d8', marginBottom: 20 }}>
            {f.photoSrc && <img src={f.photoSrc} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }}/>}
          </div>
          <Editable value={f.name || 'Name'} onChange={v => upd('name', v)} editable={editable}
            style={{ fontSize: 22, fontWeight: 700, color: SPECTRUM_ORANGE, marginBottom: 8, fontFamily: SPECTRUM_HEADING }}/>
          <Editable value={f.role || 'Role'} onChange={v => upd('role', v)} editable={editable} multiline
            style={{ fontSize: 14, fontWeight: 400, color: '#666', lineHeight: 1.5 }}/>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '32px 48px' }}>
          {rows.slice(0, 4).map((row, i) => (
            <div key={i}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <Editable value={row.label || 'LABEL'} onChange={v => updRow(i, 'label', v)} editable={editable}
                  style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: SPECTRUM_ORANGE }}/>
                {row.badge && (
                  <span style={{ fontSize: 9, fontWeight: 700, letterSpacing: '.08em', padding: '3px 8px', background: SPECTRUM_ORANGE, color: '#fff', textTransform: 'uppercase' }}>
                    {row.badge}
                  </span>
                )}
              </div>
              <Editable value={row.value || ''} onChange={v => updRow(i, 'value', v)} editable={editable} multiline
                style={{ fontSize: 15, fontWeight: 400, color: '#333', lineHeight: 1.55 }}/>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const TplSpectrumLevel = ({ slide, onChange, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]: v } });
  const levelLabel = f.levelLabel || formatSpectrumLevel(f.levelId || 'L0');
  const colLabel = (label, value, onLabel, onValue) => (
    <div style={{ padding: '24px 28px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 12, minHeight: 0 }}>
      <Editable value={label} onChange={onLabel} editable={editable}
        style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: SPECTRUM_ORANGE, fontFamily: SPECTRUM_BODY }}/>
      <Editable value={value} onChange={onValue} editable={editable} multiline
        style={{ fontSize: 14, fontWeight: 400, color: '#333', lineHeight: 1.55, fontFamily: SPECTRUM_BODY }}/>
    </div>
  );
  return (
    <div style={{ position: 'absolute', inset: '36px 0 0', background: SPECTRUM_BG, fontFamily: SPECTRUM_BODY, display: 'flex', flexDirection: 'column' }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 1fr 1.4fr', borderBottom: '1px solid #e0e0e0', minHeight: 280 }}>
        <div style={{ padding: '28px 32px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {f.badge && (
            <span style={{ alignSelf: 'flex-start', fontSize: 9, fontWeight: 700, letterSpacing: '.08em', padding: '4px 10px', background: SPECTRUM_ORANGE, color: '#fff', textTransform: 'uppercase' }}>
              {f.badge}
            </span>
          )}
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: SPECTRUM_ORANGE }}>
            <SpectrumMark/>
            <Editable value={levelLabel} onChange={v => upd('levelLabel', v)} editable={editable}
              style={{ display: 'inline', color: SPECTRUM_ORANGE, fontFamily: 'inherit' }}/>
          </div>
          <Editable value={f.levelName || 'Level Name'} onChange={v => upd('levelName', v)} editable={editable}
            style={{ fontSize: 36, fontWeight: 700, lineHeight: 1.1, letterSpacing: '-0.02em', color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}/>
        </div>
        <div style={{ padding: '28px 32px', borderRight: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: SPECTRUM_ORANGE }}>
            <SpectrumMark/>SIGNAL
          </div>
          <Editable value={f.signal || ''} onChange={v => upd('signal', v)} editable={editable} multiline
            style={{ fontSize: 28, fontWeight: 700, lineHeight: 1.2, color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}/>
        </div>
        <div style={{ padding: '28px 32px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.12em', textTransform: 'uppercase', color: SPECTRUM_ORANGE }}>
            <SpectrumMark/>DESC
          </div>
          <Editable value={f.desc || ''} onChange={v => upd('desc', v)} editable={editable} multiline
            style={{ fontSize: 16, fontWeight: 400, lineHeight: 1.55, color: '#333' }}/>
        </div>
      </div>
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1.15fr', minHeight: 0 }}>
        {colLabel(f.markersLabel || 'MARKERS', f.markers || '', v => upd('markersLabel', v), v => upd('markers', v))}
        {colLabel(f.tellLabel || 'THE TELL', f.tell || '', v => upd('tellLabel', v), v => upd('tell', v))}
        {colLabel(f.thirdLabel || 'THE WALL', f.thirdValue || '', v => upd('thirdLabel', v), v => upd('thirdValue', v))}
        <div style={{ background: SPECTRUM_ORANGE, padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 16, justifyContent: 'center' }}>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '.14em', textTransform: 'uppercase', color: '#fff' }}>DIAGNOSTIC</span>
          <Editable value={f.diagnostic || ''} onChange={v => upd('diagnostic', v)} editable={editable} multiline
            style={{ fontSize: 22, fontWeight: 700, lineHeight: 1.35, color: '#fff', fontFamily: SPECTRUM_HEADING }}/>
        </div>
      </div>
    </div>
  );
};

const TplClusterExamples = ({ slide, onChange, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]: v } });
  const cards = f.cards || [];
  const updCard = (i, k, v) => { const next = cards.slice(); next[i] = { ...next[i], [k]: v }; upd('cards', next); };
  const titleBefore = f.titleBefore || 'Examples from the';
  const titleAccent = f.titleAccent || 'Cluster';
  return (
    <div style={{ position: 'absolute', inset: '36px 0 0', background: SPECTRUM_BG, fontFamily: SPECTRUM_BODY, padding: '40px 56px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 32 }}>
        <span style={{ fontSize: 48, fontWeight: 700, color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}>{titleBefore} </span>
        <Editable value={titleAccent} onChange={v => upd('titleAccent', v)} editable={editable}
          style={{ fontSize: 48, fontWeight: 700, color: SPECTRUM_ORANGE, fontFamily: SPECTRUM_HEADING }}/>
      </div>
      <div style={{ position: 'relative', flex: 1, minHeight: 380 }}>
        {cards.slice(0, 4).map((card, i) => (
          <div key={i} style={{
            position: 'absolute',
            top: i * 36,
            left: i * 48,
            right: Math.max(0, (3 - i) * 48),
            background: '#e8eaf6',
            borderTop: '5px solid #1a237e',
            boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
            padding: '20px 24px',
            display: 'grid',
            gridTemplateColumns: '160px 1fr 120px',
            gap: 20,
            alignItems: 'start',
            zIndex: i + 1,
          }}>
            <Editable value={card.title || 'Initiative'} onChange={v => updCard(i, 'title', v)} editable={editable}
              style={{ fontSize: 16, fontWeight: 700, color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}/>
            <Editable value={card.description || ''} onChange={v => updCard(i, 'description', v)} editable={editable} multiline
              style={{ fontSize: 13, color: '#333', lineHeight: 1.5 }}/>
            {card.status != null && (
              <Editable value={card.status || ''} onChange={v => updCard(i, 'status', v)} editable={editable}
                style={{ fontSize: 13, color: '#555', textAlign: 'right' }}/>
            )}
          </div>
        ))}
      </div>
      <Editable value={f.linkText || 'Link to full presentation'} onChange={v => upd('linkText', v)} editable={editable}
        style={{ marginTop: 16, fontSize: 14, fontWeight: 700, color: SPECTRUM_ORANGE, textDecoration: 'underline', textUnderlineOffset: 4 }}/>
    </div>
  );
};

const TplSpectrumLevelList = ({ slide, onChange, editable }) => {
  const f = slide.fields || {};
  const upd = (k, v) => onChange({ ...slide, fields: { ...f, [k]: v } });
  const items = f.items || [];
  const updItem = (i, k, v) => { const next = items.slice(); next[i] = { ...next[i], [k]: v }; upd('items', next); };
  return (
    <div style={{ position: 'absolute', inset: '36px 0 0', background: SPECTRUM_BG, fontFamily: SPECTRUM_BODY, padding: '40px 56px', display: 'flex', flexDirection: 'column' }}>
      <div style={{ marginBottom: 32 }}>
        <Editable value={f.titleBefore || 'All'} onChange={v => upd('titleBefore', v)} editable={editable}
          style={{ fontSize: 52, fontWeight: 700, color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}/>
        <Editable value={f.titleAccent || 'Levels'} onChange={v => upd('titleAccent', v)} editable={editable}
          style={{ fontSize: 52, fontWeight: 700, color: SPECTRUM_ORANGE, fontFamily: SPECTRUM_HEADING }}/>
      </div>
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {items.slice(0, 6).map((item, i) => (
          <div key={i} style={{
            display: 'grid',
            gridTemplateColumns: '120px 280px 1fr',
            gap: 24,
            alignItems: 'baseline',
            padding: '22px 0',
            borderTop: i === 0 ? '1px solid #e0e0e0' : 'none',
            borderBottom: '1px solid #e0e0e0',
          }}>
            <Editable value={item.level || formatSpectrumLevel(i)} onChange={v => updItem(i, 'level', v)} editable={editable}
              style={{ fontSize: 12, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', color: SPECTRUM_ORANGE }}/>
            <Editable value={item.name || 'Level name'} onChange={v => updItem(i, 'name', v)} editable={editable}
              style={{ fontSize: 28, fontWeight: 700, color: '#0a0a0a', fontFamily: SPECTRUM_HEADING }}/>
            <Editable value={item.comment || '// Description'} onChange={v => updItem(i, 'comment', v)} editable={editable}
              style={{ fontSize: 16, color: '#888', lineHeight: 1.45 }}/>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── Slide renderer ──────────────────────────────────────────────────────────
export const TEMPLATES = {
  cover:              TplCover,
  toc:                TplToc,
  sectionDivider:     TplSectionDivider,
  twoColumn:          TplTwoColumn,
  goalsGrid:          TplGoalsGrid,
  roadmap:            TplRoadmap,
  closing:            TplClosing,
  tableOfContent:     TplTableOfContent,
  fourCards:          TplFourCards,
  teamGrid:           TplTeamGrid,
  schedule:           TplSchedule,
  taskSteps:          TplTaskSteps,
  milestones:         TplMilestones,
  horizontalProcess:  TplHorizontalProcess,
  fourColumnProcess:  TplFourColumnProcess,
  profileCard:        TplProfileCard,
  profileMagazine:    TplProfileMagazine,
  profileCentered:    TplProfileCentered,
  profileCards:       TplProfileCards,
  profileBoldSplit:   TplProfileBoldSplit,
  profileDossier:     TplProfileDossier,
  profileMinimal:     TplProfileMinimal,
  levelGrid:          TplLevelGrid,
  levelDetail:        TplLevelDetail,
  profileModern:      TplProfileModern,
  levelIntro:         TplLevelIntro,
  levelSection:       TplLevelSection,
  levelSectionTerminal: TplLevelSectionTerminal,
  teamInitiatives: TplTeamInitiatives,
  stickyMobileCover: TplStickyMobileCover,
  spectrumProfile: TplSpectrumProfile,
  spectrumLevel: TplSpectrumLevel,
  clusterExamples: TplClusterExamples,
  spectrumLevelList: TplSpectrumLevelList,
};

export const SlideView = ({ slide, idx, total, onChange, editable = true, showMeta = true, externalMeta = false, scale = 1 }) => {
  _editableCounter = 0;
  const palette = themePalette(slide.theme);
  const Tpl = TEMPLATES[slide.template] || TplTwoColumn;
  return (
    <div data-slide-scale={scale} style={{
      position:'relative', width:SLIDE_W, height:SLIDE_H, overflow:'hidden',
      background:palette.bg, color:palette.ink, fontFamily:slideFont,
    }}>
      {/* Dot grid - hidden by default, shown during drag */}
      {editable && (
        <svg data-dot-grid width={SLIDE_W} height={SLIDE_H} style={{
          position:'absolute', inset:0, pointerEvents:'none', opacity:0, transition:'opacity 150ms ease', zIndex:1000,
        }}>
          <defs>
            <pattern id="tplDotGrid" width="20" height="20" patternUnits="userSpaceOnUse">
              <circle cx="10" cy="10" r="1" fill={palette.bg === '#0a0a0a' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.3)'} />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#tplDotGrid)" />
        </svg>
      )}
      <Tpl slide={slide} onChange={onChange} palette={palette} editable={editable}/>
      {showMeta && !externalMeta && slide.template !== 'stickyMobileCover' && (
        <Meta slide={slide} palette={palette} idx={idx} total={total} onChange={onChange} editable={editable}/>
      )}
    </div>
  );
};
