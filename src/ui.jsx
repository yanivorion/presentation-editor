import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';

// ─── Design Tokens (carried over from Text Combination) ───────────────────────
export const T = {
  glass:       'rgba(255,255,255,0.52)',
  glassBorder: 'rgba(255,255,255,0.48)',
  glassStrong: 'rgba(255,255,255,0.70)',
  blur:        'blur(24px) saturate(180%)',
  shadow:      '0 4px 24px rgba(0,0,0,0.045), 0 1px 3px rgba(0,0,0,0.02)',
  shadowHover: '0 8px 32px rgba(0,0,0,0.07), 0 2px 6px rgba(0,0,0,0.03)',
  inner:       'inset 0 1px 0 rgba(255,255,255,0.55)',
  text1:       '#0f172a',
  text2:       '#334155',
  text3:       '#94a3b8',
  text4:       '#64748b',
  border:      'rgba(0,0,0,0.05)',
  border2:     'rgba(0,0,0,0.09)',
  accent:      '#3b82f6',
  accentSoft:  'rgba(59,130,246,0.08)',
  accentGlow:  '0 0 0 3px rgba(59,130,246,0.14)',
  ctrl:        'rgba(255,255,255,0.60)',
  ctrlBorder:  'rgba(0,0,0,0.07)',
  ctrlHover:   'rgba(255,255,255,0.85)',
  // Deck-specific
  deckBg:      'linear-gradient(145deg, #eef2f7 0%, #e8edf5 50%, #f0f3f8 100%)',
  yellow:      '#E8FF34',
  black:       '#0a0a0a',
};

export const EASE = {
  out:    'cubic-bezier(0.22, 1, 0.36, 1)',
  spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
};

export const sysFont = "-apple-system, BlinkMacSystemFont, 'SF Pro Text', 'Segoe UI', system-ui, sans-serif";
export const slideFont = "'Inter', -apple-system, BlinkMacSystemFont, system-ui, sans-serif";

export const ctrlBase = {
  height:28, background:T.ctrl, border:`1px solid ${T.ctrlBorder}`,
  borderRadius:7, color:T.text1, fontSize:11, padding:'0 8px',
  width:'100%', outline:'none', fontFamily:'inherit', appearance:'none',
  boxSizing:'border-box', transition:`all 300ms ${EASE.out}`,
};

export const glassPanel = {
  background:T.glass, backdropFilter:T.blur, WebkitBackdropFilter:T.blur,
  border:`1px solid ${T.glassBorder}`, boxShadow:`${T.shadow}, ${T.inner}`, borderRadius:14,
};
export const glassBar = {
  background:T.glassStrong, backdropFilter:T.blur, WebkitBackdropFilter:T.blur,
  borderBottom:`1px solid ${T.glassBorder}`, boxShadow:'0 1px 3px rgba(0,0,0,0.02)',
};

// ─── Primitives ────────────────────────────────────────────────────────────────
export const Lbl = ({ children }) => (
  <span style={{
    fontSize:9, fontWeight:600, letterSpacing:'0.1em', textTransform:'uppercase',
    color:T.text4, display:'block', marginBottom:4,
  }}>{children}</span>
);

export const Field = ({ label, children, w }) => (
  <div style={{ display:'flex', flexDirection:'column', flex: w ? `0 0 ${w}px` : 1, minWidth:0 }}>
    {label && <Lbl>{label}</Lbl>}
    {children}
  </div>
);

export const Row = ({ children, gap = 7 }) => (
  <div style={{ display:'flex', gap, marginBottom:8, alignItems:'flex-end' }}>{children}</div>
);

export const Sep = () => <div style={{ height:1, background:T.border, margin:'10px 0' }}/>;

export const NumIn = ({ val, onChange, min=-9999, max=9999, step=1 }) => (
  <input type="number" value={val} min={min} max={max} step={step}
    onChange={e=>onChange(+e.target.value)}
    style={{ ...ctrlBase, MozAppearance:'textfield' }}
  />
);

export const TxtIn = ({ val, onChange, placeholder }) => (
  <input type="text" value={val ?? ''} onChange={e=>onChange(e.target.value)} placeholder={placeholder} style={ctrlBase}/>
);

export const TxtArea = ({ val, onChange, rows = 3 }) => (
  <textarea value={val ?? ''} onChange={e=>onChange(e.target.value)} rows={rows}
    style={{ ...ctrlBase, height:'auto', minHeight:28, padding:'6px 8px', resize:'vertical', lineHeight:1.45 }}
  />
);

export const ColorField = ({ val, onChange }) => (
  <div style={{ display:'flex', gap:5 }}>
    <input type="color" value={/^#[0-9a-fA-F]{6}$/.test(val||'')?val:'#000000'} onChange={e=>onChange(e.target.value)}
      style={{ width:28, height:28, border:`1px solid ${T.ctrlBorder}`, borderRadius:7, padding:2,
               cursor:'pointer', background:T.ctrl, flexShrink:0, boxSizing:'border-box',
               transition:`all 300ms ${EASE.out}` }}
    />
    <input type="text" value={val||''} onChange={e=>onChange(e.target.value)}
      style={{ ...ctrlBase, fontFamily:"'SF Mono','Fira Code',monospace", fontSize:10 }}
    />
  </div>
);

export const Sw = ({ val, onChange }) => (
  <button onClick={()=>onChange(!val)} style={{
    position:'relative', width:36, height:20, cursor:'pointer', flexShrink:0,
    background:'none', border:'none', padding:0,
  }}>
    <div style={{
      position:'absolute', inset:0,
      background: val ? T.accent : '#cbd5e1',
      borderRadius:99,
      transition:`background 400ms ${EASE.out}, box-shadow 500ms ${EASE.spring}`,
      boxShadow: val ? '0 2px 10px rgba(59,130,246,0.35), inset 0 1px 1px rgba(255,255,255,0.15)'
                     : 'inset 0 1px 2px rgba(0,0,0,0.06)',
    }}/>
    <div style={{
      position:'absolute', top:2, left:2,
      width:16, height:16, background:'#fff', borderRadius:'50%',
      transform: `translateX(${val ? 16 : 0}px) scale(${val ? 1 : 0.92})`,
      transition:`transform 450ms ${EASE.spring}, box-shadow 400ms ${EASE.out}`,
      boxShadow: val ? '0 1px 4px rgba(0,0,0,0.15), 0 0 0 0.5px rgba(0,0,0,0.04)'
                     : '0 1px 3px rgba(0,0,0,0.2), 0 0 0 0.5px rgba(0,0,0,0.06)',
    }}/>
  </button>
);

export const TRow = ({ label, val, onChange }) => (
  <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', height:28, marginBottom:2 }}>
    <span style={{ fontSize:11, color:T.text2 }}>{label}</span>
    <Sw val={val} onChange={onChange}/>
  </div>
);

export const Sel = ({ val, onChange, opts, fontPreview }) => {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [rect, setRect] = useState(null);
  const trigRef = useRef(null);
  const menuRef = useRef(null);

  useEffect(() => {
    if (open) setMounted(true);
    else { const t = setTimeout(() => setMounted(false), 200); return () => clearTimeout(t); }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onDown = (e) => {
      if (trigRef.current?.contains(e.target) || menuRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onScroll = (e) => { if (menuRef.current?.contains(e.target)) return; setOpen(false); };
    document.addEventListener('mousedown', onDown);
    window.addEventListener('scroll', onScroll, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('scroll', onScroll, true);
    };
  }, [open]);

  const toggle = () => {
    if (open) { setOpen(false); return; }
    if (!trigRef.current) return;
    setRect(trigRef.current.getBoundingClientRect());
    setOpen(true);
  };

  const pick = (v) => { onChange(v); setOpen(false); };

  const label = (() => {
    for (const o of opts) {
      if (o.g) { const f = o.items.find(i => String(i.v) === String(val)); if (f) return f.l; }
      else if (String(o.v) === String(val)) return o.l;
    }
    return val;
  })();

  const chevron = (
    <svg width={8} height={5} viewBox="0 0 8 5" fill="none" style={{
      flexShrink:0, marginLeft:4,
      transition:`transform 300ms ${EASE.out}`,
      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
    }}>
      <path d="M0.5 0.5L4 4.5L7.5 0.5" stroke={T.text3} strokeWidth={1.2} strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );

  const optBtn = (item, isActive) => (
    <button key={item.v} onClick={() => pick(item.v)} style={{
      width:'100%', padding:'6px 10px', textAlign:'left',
      background: isActive ? T.accentSoft : 'transparent',
      border:'none', borderRadius:6, cursor:'pointer',
      color: isActive ? T.accent : T.text1,
      fontWeight: isActive ? 500 : 400,
      fontSize:11, fontFamily: fontPreview ? `'${item.v}', ${sysFont}` : 'inherit',
      transition:`all 300ms ${EASE.out}`, display:'block',
    }}
      onMouseEnter={e=>{ if(!isActive) e.currentTarget.style.background='rgba(0,0,0,0.03)'; }}
      onMouseLeave={e=>{ if(!isActive) e.currentTarget.style.background='transparent'; }}
    >{item.l}</button>
  );

  const spaceBelow = rect ? window.innerHeight - rect.bottom - 8 : 300;
  const openUp = spaceBelow < 180 && (rect?.top || 0) > spaceBelow;

  return (
    <div style={{ position:'relative', width:'100%' }}>
      <button ref={trigRef} onClick={toggle} style={{
        ...ctrlBase, display:'flex', alignItems:'center', justifyContent:'space-between',
        cursor:'pointer', textAlign:'left', padding:'0 8px',
        borderColor: open ? T.accent : T.ctrlBorder,
        boxShadow: open ? T.accentGlow : 'none',
      }}>
        <span style={{ overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap', flex:1 }}>{label}</span>
        {chevron}
      </button>
      {mounted && createPortal(
        <div ref={menuRef} style={{
          position:'fixed',
          left: rect?.left || 0,
          width: rect?.width || 0,
          ...(openUp
            ? { bottom: rect ? window.innerHeight - rect.top + 4 : 0 }
            : { top: rect ? rect.bottom + 4 : 0 }),
          background:'rgba(255,255,255,0.94)',
          backdropFilter:'blur(20px) saturate(160%)',
          WebkitBackdropFilter:'blur(20px) saturate(160%)',
          border:`1px solid ${T.glassBorder}`,
          borderRadius:10,
          boxShadow:'0 8px 40px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.04)',
          zIndex:9999,
          maxHeight: Math.min(openUp ? (rect?.top || 300) - 12 : spaceBelow, 260),
          overflowY:'auto', padding:4,
          opacity: open ? 1 : 0,
          transform: open ? 'none' : `translateY(${openUp ? '4px' : '-4px'})`,
          pointerEvents: open ? 'auto' : 'none',
          transition:`opacity 300ms ${EASE.out}, transform 300ms ${EASE.out}`,
          fontFamily: sysFont, fontSize:11,
        }}>
          {opts.map((o, oi) => o.g ? (
            <div key={oi}>
              <div style={{ fontSize:9, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase',
                            color:T.text4, padding:'7px 10px 3px' }}>{o.g}</div>
              {o.items.map(item => optBtn(item, String(val) === String(item.v)))}
            </div>
          ) : optBtn(o, String(val) === String(o.v)))}
        </div>,
        document.body
      )}
    </div>
  );
};

export const Acc = ({ open, onToggle, num, title, children }) => (
  <div style={{ borderBottom:`1px solid ${T.border}` }}>
    <button onClick={onToggle}
      style={{
        display:'flex', alignItems:'center', padding:'0 14px', height:38,
        cursor:'pointer', userSelect:'none', width:'100%', textAlign:'left',
        background:'none', border:'none', fontFamily:'inherit',
        transition:`background 350ms ${EASE.out}`,
      }}
      onMouseEnter={e=>e.currentTarget.style.background=T.accentSoft}
      onMouseLeave={e=>e.currentTarget.style.background='transparent'}
    >
      <span style={{
        fontSize:9, fontWeight:700, letterSpacing:'0.06em',
        color:open?T.accent:T.text4, width:18, marginRight:8,
        transition:`color 400ms ${EASE.out}`,
      }}>{num}</span>
      <span style={{
        fontSize:10, fontWeight:600, letterSpacing:'0.08em', textTransform:'uppercase',
        color:open?T.text1:T.text3, flex:1,
        transition:`color 400ms ${EASE.out}`,
      }}>{title}</span>
      <svg width={10} height={6} viewBox="0 0 10 6" fill="none" stroke={open?T.accent:T.text4} strokeWidth={1.5}
        style={{
          transition:`transform 500ms ${EASE.spring}, stroke 400ms ${EASE.out}`,
          transform:open?'rotate(0deg)':'rotate(-90deg)', flexShrink:0,
        }}>
        <path d="M1 1l4 4 4-4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
    <div style={{
      display:'grid',
      gridTemplateRows:open?'1fr':'0fr',
      transition:`grid-template-rows 450ms ${EASE.out}`,
    }}>
      <div style={{ overflow:'hidden' }}>
        <div style={{
          padding:'10px 14px 14px',
          opacity:open?1:0,
          transform:open?'translateY(0)':'translateY(-6px)',
          transition:`opacity 350ms ${EASE.out} ${open?'80ms':'0ms'}, transform 450ms ${EASE.spring} ${open?'40ms':'0ms'}`,
        }}>{children}</div>
      </div>
    </div>
  </div>
);

export const TBtn = ({ onClick, dark, icon, children, title }) => (
  <button onClick={onClick} title={title} style={{
    display:'flex', alignItems:'center', gap:5, height:28, padding:'0 12px',
    background: dark ? T.accent : 'rgba(255,255,255,0.50)',
    border: dark ? 'none' : `1px solid ${T.ctrlBorder}`,
    borderRadius:8, color:dark?'#fff':T.text2,
    fontSize:11, fontWeight:500, cursor:'pointer', fontFamily:'inherit',
    letterSpacing:'0.01em', whiteSpace:'nowrap',
    transition:`all 300ms ${EASE.out}`,
    boxShadow: dark ? '0 2px 10px rgba(59,130,246,0.3)' : 'none',
  }}
    onMouseEnter={e=>{
      e.currentTarget.style.transform = 'translateY(-1px)';
      e.currentTarget.style.boxShadow = dark ? '0 4px 16px rgba(59,130,246,0.4)' : '0 2px 10px rgba(0,0,0,0.06)';
      if (!dark) e.currentTarget.style.background = T.ctrlHover;
    }}
    onMouseLeave={e=>{
      e.currentTarget.style.transform = 'none';
      e.currentTarget.style.boxShadow = dark ? '0 2px 10px rgba(59,130,246,0.3)' : 'none';
      if (!dark) e.currentTarget.style.background = 'rgba(255,255,255,0.50)';
    }}
  >{icon}{children}</button>
);

// ─── Common option arrays for selects ────────────────────────────────────────
export const O = {
  theme: [
    { v:'white',  l:'White' },
    { v:'yellow', l:'Yellow' },
    { v:'black',  l:'Black' },
    { v:'gray',   l:'Light Gray' },
  ],
  template: [
    { v:'cover',              l:'Cover' },
    { v:'toc',                l:'Table of Contents' },
    { v:'tableOfContent',     l:'Table of Content (sections)' },
    { v:'sectionDivider',     l:'Section Divider' },
    { v:'twoColumn',          l:'Two Column' },
    { v:'fourCards',           l:'Four Cards' },
    { v:'teamGrid',            l:'Team Grid' },
    { v:'schedule',            l:'Schedule Table' },
    { v:'taskSteps',           l:'Task Steps (active)' },
    { v:'milestones',          l:'Milestones Timeline' },
    { v:'horizontalProcess',   l:'Horizontal Process' },
    { v:'fourColumnProcess',   l:'Four Column Process' },
    { v:'goalsGrid',          l:'Goals Grid (5-up)' },
    { v:'roadmap',            l:'Roadmap' },
    { v:'closing',            l:'Closing Quote' },
    { v:'profileCard',         l:'Profile Card (whois)' },
    { v:'levelGrid',           l:'Level Grid (3x2)' },
    { v:'levelDetail',         l:'Level Detail (terminal)' },
    { v:'profileModern',       l:'Profile Modern' },
    { v:'levelIntro',          l:'Level Intro' },
    { v:'levelSection',        l:'Level Section (modern)' },
    { v:'levelSectionTerminal', l:'Level Section (terminal)' },
  ],
  panelKind: [
    { v:'none',     l:'None' },
    { v:'bullets',  l:'Bullet list' },
    { v:'image',    l:'Image' },
    { v:'nodes',    l:'Heuristic diagram' },
    { v:'split',    l:'Before / After split' },
    { v:'metrics',  l:'Metrics 3-up' },
    { v:'flow',     l:'Numbered steps' },
    { v:'mapping',  l:'Design ↔ Dev mapping' },
    { v:'accent',   l:'Accent statement' },
    { v:'vision',   l:'Vision flow (Goal 5)' },
    { v:'oldDiagrams', l:'Two old diagrams (3.1)' },
  ],
  imageFit: [
    { v:'contain', l:'Fit (contain)' },
    { v:'cover',   l:'Fill (cover)' },
  ],
};
