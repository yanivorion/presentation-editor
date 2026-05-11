import React, { useEffect, useRef } from 'react';
import { slideFont } from './ui.jsx';

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
const Editable = ({ value, onChange, multiline, style, placeholder, editable = true, tag = 'div' }) => {
  const Tag = tag;
  const ref = useRef(null);

  useEffect(() => {
    if (!editable) return;
    const el = ref.current;
    if (!el) return;
    const next = value || '';
    if (el.innerHTML !== next) el.innerHTML = next;
  }, [value, editable]);

  if (!editable) {
    return <Tag style={style} dangerouslySetInnerHTML={{ __html: value || '' }}/>;
  }
  return (
    <Tag
      ref={ref}
      contentEditable
      suppressContentEditableWarning
      onBlur={e => onChange(multiline ? e.currentTarget.innerHTML : e.currentTarget.innerText)}
      onKeyDown={e => {
        if (!multiline && e.key === 'Enter') { e.preventDefault(); e.currentTarget.blur(); }
      }}
      data-placeholder={placeholder || ''}
      style={{
        outline:'none', cursor:'text',
        ...style,
      }}
    />
  );
};

// ─── Corner meta strip ────────────────────────────────────────────────────────
const Meta = ({ slide, palette, idx, total, onChange, editable }) => {
  const baseSty = {
    fontSize:11, fontWeight:600, letterSpacing:'0.14em', textTransform:'uppercase',
    color: palette.muted, position:'absolute', pointerEvents:'auto',
  };
  const upd = (k,v) => onChange({ ...slide, meta: { ...slide.meta, [k]:v } });
  const m = slide.meta || {};
  return (
    <>
      <div style={{ ...baseSty, top:32, left:40, display:'flex', alignItems:'center', gap:8 }}>
        <span style={{
          width:18,height:18,border:`2px solid ${palette.ink}`,borderRadius:'50%',
          display:'inline-flex',alignItems:'center',justifyContent:'center',
          fontSize:10,fontWeight:900,color:palette.ink,
        }}>H</span>
        <Editable value={m.brand || 'Heuristics Tool'} onChange={v=>upd('brand',v)} editable={editable}
          style={{ color:palette.ink, fontWeight:700, letterSpacing:'0.02em' }}/>
      </div>
      <Editable value={m.tr || ''} onChange={v=>upd('tr',v)} editable={editable}
        style={{ ...baseSty, top:32, right:40, textAlign:'right' }}/>
      <Editable value={m.bl || ''} onChange={v=>upd('bl',v)} editable={editable}
        style={{ ...baseSty, bottom:32, left:40 }}/>
      <div style={{ ...baseSty, bottom:32, right:40, textAlign:'right' }}>
        {String(idx+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
      </div>
    </>
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
};

export const SlideView = ({ slide, idx, total, onChange, editable = true, showMeta = true }) => {
  const palette = themePalette(slide.theme);
  const Tpl = TEMPLATES[slide.template] || TplTwoColumn;
  return (
    <div style={{
      position:'relative', width:SLIDE_W, height:SLIDE_H, overflow:'hidden',
      background:palette.bg, color:palette.ink, fontFamily:slideFont,
    }}>
      <Tpl slide={slide} onChange={onChange} palette={palette} editable={editable}/>
      {showMeta && <Meta slide={slide} palette={palette} idx={idx} total={total} onChange={onChange} editable={editable}/>}
    </div>
  );
};
