import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, EASE, sysFont, glassPanel, glassBar, ctrlBase, Lbl, Field, Row, Sep,
         NumIn, TxtIn, TxtArea, Sel, Sw, TRow, TBtn, Acc, O } from './ui.jsx';
import { SlideView, SLIDE_W, SLIDE_H, themePalette } from './templates.jsx';
import { SEED_DECK, ALL_DIRECTIONS } from './seed.js';

const LS_KEY = 'deck_editor_v3';
const loadDeck = () => { try { const r = localStorage.getItem(LS_KEY); if (r) return JSON.parse(r); } catch {} return null; };
const saveDeck = (d) => { try { localStorage.setItem(LS_KEY, JSON.stringify(d)); } catch {} };

// ─── Slide thumbnail in left rail ─────────────────────────────────────────────
const Thumbnail = ({ slide, idx, total, active, onClick, onDelete, onDuplicate, scale = 0.15 }) => {
  const palette = themePalette(slide.theme);
  const w = SLIDE_W * scale;
  const h = SLIDE_H * scale;
  return (
    <div onClick={onClick} style={{
      position:'relative', cursor:'pointer', userSelect:'none',
      borderRadius:8, overflow:'hidden',
      border: active ? `2px solid ${T.accent}` : `1px solid ${T.border}`,
      boxShadow: active ? `0 0 0 3px ${T.accentSoft}` : T.shadow,
      transition:`all 250ms ${EASE.out}`,
      width: w, height: h, flexShrink:0,
      background: palette.bg,
    }}>
      <div style={{
        width: SLIDE_W, height: SLIDE_H,
        transform:`scale(${scale})`, transformOrigin:'top left',
        pointerEvents:'none',
      }}>
        <SlideView slide={slide} idx={idx} total={total} onChange={()=>{}} editable={false}/>
      </div>
      <div style={{
        position:'absolute', top:4, left:6,
        fontSize:9, fontWeight:700, letterSpacing:'.08em',
        color: palette.bg === '#0a0a0a' ? '#fff' : '#0a0a0a',
        background: palette.bg === '#0a0a0a' ? 'rgba(0,0,0,0.5)' : 'rgba(255,255,255,0.7)',
        backdropFilter:'blur(6px)', padding:'2px 5px', borderRadius:3,
      }}>{String(idx+1).padStart(2,'0')}</div>

      {active && (
        <div style={{ position:'absolute', top:4, right:4, display:'flex', gap:3 }}>
          <button onClick={(e)=>{ e.stopPropagation(); onDuplicate(); }} title="Duplicate"
            style={{ width:20, height:20, border:'none', borderRadius:4, cursor:'pointer',
                     background:'rgba(255,255,255,.9)', fontSize:11, lineHeight:1 }}>⎘</button>
          <button onClick={(e)=>{ e.stopPropagation(); onDelete(); }} title="Delete"
            style={{ width:20, height:20, border:'none', borderRadius:4, cursor:'pointer',
                     background:'rgba(255,255,255,.9)', fontSize:13, lineHeight:1, color:'#dc2626' }}>×</button>
        </div>
      )}
    </div>
  );
};

// ─── Properties panel ────────────────────────────────────────────────────────
// IMPORTANT: Section must be defined at module scope, otherwise it's a new
// component reference on every PropertiesPanel render (every keystroke causes
// re-render via onChange) and React unmounts/remounts the inputs — eating focus.
const Section = ({ openSection, setOpenSection, id, num, title, children }) => (
  <Acc open={openSection===id} onToggle={()=>setOpenSection(openSection===id?null:id)} num={num} title={title}>
    {children}
  </Acc>
);

const PropertiesPanel = ({ slide, idx, total, onChange }) => {
  const [openSection, setOpenSection] = useState('layout');
  if (!slide) return null;

  const f = slide.fields || {};
  const updField = (k, v) => onChange({ ...slide, fields: { ...f, [k]:v } });
  const updMeta  = (k, v) => onChange({ ...slide, meta:   { ...slide.meta, [k]:v } });

  const panel = f.panel || {};

  return (
    <div style={{ overflowY:'auto', height:'100%', fontFamily:sysFont }}>
      <div style={{ padding:'14px 16px', borderBottom:`1px solid ${T.border}` }}>
        <div style={{ fontSize:9, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:T.text4 }}>
          Slide {String(idx+1).padStart(2,'0')} / {String(total).padStart(2,'0')}
        </div>
        <div style={{ fontSize:13, fontWeight:600, color:T.text1, marginTop:4 }}>
          {(slide.template === 'cover' && (f.title || '').replace(/<[^>]+>/g,' ')) ||
           (slide.fields?.title || '').replace(/<[^>]+>/g,' ').slice(0,42) || '—'}
        </div>
      </div>

      <Section openSection={openSection} setOpenSection={setOpenSection} id="layout" num="01" title="Layout">
        <Row><Field label="Template"><Sel val={slide.template} onChange={v=>onChange({ ...slide, template:v })} opts={O.template}/></Field></Row>
        <Row><Field label="Theme"><Sel val={slide.theme} onChange={v=>onChange({ ...slide, theme:v })} opts={O.theme}/></Field></Row>
      </Section>

      <Section openSection={openSection} setOpenSection={setOpenSection} id="content" num="02" title="Content">
        {/* ID-style numeral fields */}
        {f.smallNum != null && (
          <Row>
            <Field label="Small num"><TxtIn val={f.smallNum} onChange={v=>updField('smallNum',v)}/></Field>
            <Field label="Small label"><TxtIn val={f.smallLabel} onChange={v=>updField('smallLabel',v)}/></Field>
          </Row>
        )}
        {f.bigNum != null && (
          <Row>
            <Field label="Big num"><TxtIn val={f.bigNum} onChange={v=>updField('bigNum',v)}/></Field>
            <Field label="Label"><TxtIn val={f.label} onChange={v=>updField('label',v)}/></Field>
          </Row>
        )}
        {f.bigNumeral != null && (
          <Row>
            <Field label="Numeral"><TxtIn val={f.bigNumeral} onChange={v=>updField('bigNumeral',v)}/></Field>
            <Field label="Title size" w={70}><NumIn val={f.titleSize || 48} onChange={v=>updField('titleSize',v)} min={20} max={200}/></Field>
          </Row>
        )}
        {f.num != null && slide.template === 'sectionDivider' && (
          <Row><Field label="Section number"><TxtIn val={f.num} onChange={v=>updField('num',v)}/></Field></Row>
        )}

        {f.eyebrow != null && (
          <Row><Field label="Eyebrow"><TxtIn val={f.eyebrow} onChange={v=>updField('eyebrow',v)}/></Field></Row>
        )}
        {f.title != null && (
          <Row><Field label="Title (HTML allowed: <br/> <em> <strong>)"><TxtArea val={f.title} onChange={v=>updField('title',v)} rows={2}/></Field></Row>
        )}
        {f.lead != null && (
          <Row><Field label="Lead"><TxtArea val={f.lead} onChange={v=>updField('lead',v)} rows={3}/></Field></Row>
        )}
        {f.body != null && (
          <Row><Field label="Body"><TxtArea val={f.body} onChange={v=>updField('body',v)} rows={5}/></Field></Row>
        )}
        {f.blurb != null && (
          <Row><Field label="Blurb"><TxtArea val={f.blurb} onChange={v=>updField('blurb',v)} rows={3}/></Field></Row>
        )}
        {f.tag != null && (
          <Row><Field label="Tag"><TxtIn val={f.tag} onChange={v=>updField('tag',v)}/></Field></Row>
        )}
        {f.note != null && (
          <Row><Field label="Header note"><TxtArea val={f.note} onChange={v=>updField('note',v)} rows={2}/></Field></Row>
        )}
        {f.bottomNote != null && (
          <Row><Field label="Bottom note"><TxtIn val={f.bottomNote} onChange={v=>updField('bottomNote',v)}/></Field></Row>
        )}
        {f.footnote != null && (
          <Row><Field label="Footnote"><TxtIn val={f.footnote} onChange={v=>updField('footnote',v)}/></Field></Row>
        )}
        {f.footer != null && (
          <Row><Field label="Footer text"><TxtArea val={f.footer} onChange={v=>updField('footer',v)} rows={3}/></Field></Row>
        )}
        {f.quote != null && (
          <Row><Field label="Quote (use <em> to highlight)"><TxtArea val={f.quote} onChange={v=>updField('quote',v)} rows={4}/></Field></Row>
        )}
        {f.footEyebrow != null && (
          <Row>
            <Field label="Foot eyebrow"><TxtIn val={f.footEyebrow} onChange={v=>updField('footEyebrow',v)}/></Field>
            <Field label="Foot line"><TxtIn val={f.footLine} onChange={v=>updField('footLine',v)}/></Field>
          </Row>
        )}
      </Section>

      {/* Right-panel content for two-column slides */}
      {slide.template === 'twoColumn' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="panel" num="03" title="Right panel">
          <Row><Field label="Panel kind"><Sel val={panel.kind || 'none'} onChange={v=>updField('panel', { ...panel, kind:v })} opts={O.panelKind}/></Field></Row>

          {panel.kind === 'bullets' && (
            <Row><Field label="Bullets (one per line)">
              <TxtArea val={(panel.data||[]).join('\n')} rows={6}
                onChange={v=>updField('panel', { ...panel, data:v.split('\n').filter(x=>x.length) })}/>
            </Field></Row>
          )}

          {panel.kind === 'image' && (
            <>
              <Row><Field label="Image src (URL or /file.png in public/)">
                <TxtIn val={panel.data?.src} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), src:v }})}/>
              </Field></Row>
              <Row>
                <Field label="Fit">
                  <Sel val={panel.data?.fit || 'contain'} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), fit:v }})} opts={O.imageFit}/>
                </Field>
                <Field label="Background"><TxtIn val={panel.data?.bg} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), bg:v }})}/></Field>
              </Row>
              <Row><Field label="Tag (badge top-left)"><TxtIn val={panel.data?.tag} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), tag:v }})}/></Field></Row>
              <Row><Field label="Caption (below image)"><TxtArea rows={2} val={panel.data?.caption} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), caption:v }})}/></Field></Row>
              <Row><Field>
                <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
                  Tip: drop files into <code>presentation-editor/public/</code> and reference them as <code>/filename.png</code>.
                </div>
              </Field></Row>
            </>
          )}

          {panel.kind === 'split' && (
            <>
              <Row>
                <Field label="Left label"><TxtIn val={panel.data?.leftLabel} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), leftLabel:v }})}/></Field>
                <Field label="Right label"><TxtIn val={panel.data?.rightLabel} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), rightLabel:v }})}/></Field>
              </Row>
              <Row>
                <Field label="Left bullets (one per line)">
                  <TxtArea rows={4} val={(panel.data?.left||[]).join('\n')}
                    onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), left:v.split('\n').filter(x=>x.length) }})}/>
                </Field>
              </Row>
              <Row>
                <Field label="Right bullets (one per line)">
                  <TxtArea rows={4} val={(panel.data?.right||[]).join('\n')}
                    onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), right:v.split('\n').filter(x=>x.length) }})}/>
                </Field>
              </Row>
              <TRow label="Highlight right side (yellow)" val={!!panel.data?.rightAccent}
                onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), rightAccent:v }})}/>
            </>
          )}

          {panel.kind === 'metrics' && (
            <Row><Field label="Tip">
              <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
                Edit metrics by clicking directly on the slide canvas.
              </div>
            </Field></Row>
          )}

          {panel.kind === 'flow' && (
            <Row><Field label="Tip">
              <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
                Edit flow steps by clicking directly on the slide canvas.
              </div>
            </Field></Row>
          )}

          {panel.kind === 'accent' && (
            <>
              <Row><Field label="Tone">
                <Sel val={panel.data?.tone || 'yellow'} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), tone:v }})}
                  opts={[{ v:'yellow', l:'Yellow' }, { v:'black', l:'Black' }]}/>
              </Field></Row>
              <Row><Field label="Eyebrow"><TxtIn val={panel.data?.eyebrow} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), eyebrow:v }})}/></Field></Row>
              <Row><Field label="Statement"><TxtArea rows={3} val={panel.data?.statement} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), statement:v }})}/></Field></Row>
              <Row><Field label="Tag"><TxtIn val={panel.data?.tag} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), tag:v }})}/></Field></Row>
            </>
          )}

          {panel.kind === 'vision' && (
            <>
              <Row><Field label="Eyebrow"><TxtIn val={panel.data?.eyebrow} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), eyebrow:v }})}/></Field></Row>
              <Row><Field label="Tag"><TxtIn val={panel.data?.tag} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), tag:v }})}/></Field></Row>
              <Row><Field label="Steps (one per line, last is highlighted)">
                <TxtArea rows={5} val={(panel.data?.steps||[]).join('\n')}
                  onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), steps:v.split('\n').filter(x=>x.length) }})}/>
              </Field></Row>
            </>
          )}

          {panel.kind === 'mapping' && (
            <>
              <Row>
                <Field label="Left title"><TxtIn val={panel.data?.leftTitle} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), leftTitle:v }})}/></Field>
                <Field label="Right title"><TxtIn val={panel.data?.rightTitle} onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), rightTitle:v }})}/></Field>
              </Row>
              <Row><Field label="Left bullets (one per line)">
                <TxtArea rows={4} val={(panel.data?.left||[]).join('\n')}
                  onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), left:v.split('\n').filter(x=>x.length) }})}/>
              </Field></Row>
              <Row><Field label="Right bullets (one per line)">
                <TxtArea rows={4} val={(panel.data?.right||[]).join('\n')}
                  onChange={v=>updField('panel', { ...panel, data:{ ...(panel.data||{}), right:v.split('\n').filter(x=>x.length) }})}/>
              </Field></Row>
            </>
          )}

          {(panel.kind === 'nodes' || panel.kind === 'oldDiagrams') && (
            <Row><Field>
              <div style={{ fontSize:11, color:T.text3, lineHeight:1.5, padding:'6px 0' }}>
                This is a fixed visual element. Edit the surrounding text on the slide.
              </div>
            </Field></Row>
          )}
        </Section>
      )}

      {/* Goals grid props */}
      {slide.template === 'goalsGrid' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="goals" num="03" title="Goals (5)">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Click any goal cell on the slide to edit its number, title and description directly. Toggle the vision flag below.
            </div>
          </Field></Row>
          {(f.goals||[]).map((g, i) => (
            <TRow key={i} label={`Goal ${i+1} · vision (yellow)`} val={!!g.vision}
              onChange={v=>{ const next = (f.goals||[]).slice(); next[i] = { ...next[i], vision:v }; updField('goals', next); }}/>
          ))}
        </Section>
      )}

      {/* Roadmap props */}
      {slide.template === 'roadmap' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="steps" num="03" title="Roadmap steps">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Click any step on the slide to edit it directly. Toggle accent (yellow dot) below.
            </div>
          </Field></Row>
          {(f.items||[]).map((s, i) => (
            <TRow key={i} label={`Step ${i+1} · accent (yellow dot)`} val={!!s.accent}
              onChange={v=>{ const next = (f.items||[]).slice(); next[i] = { ...next[i], accent:v }; updField('items', next); }}/>
          ))}
        </Section>
      )}

      {/* Table of Content sections */}
      {slide.template === 'tableOfContent' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="sections" num="03" title="Sections">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit section titles and items directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Four Cards */}
      {slide.template === 'fourCards' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="cards" num="03" title="Cards">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit cards directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Team Grid */}
      {slide.template === 'teamGrid' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="members" num="03" title="Team Members">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit member names, roles, and abbreviations directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Schedule Table */}
      {slide.template === 'schedule' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="rows" num="03" title="Schedule Rows">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit schedule rows directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Task Steps */}
      {slide.template === 'taskSteps' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="tasksteps" num="03" title="Task Steps">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Click a step card on the slide to set it as active (shows orange bar). Edit text directly.
            </div>
          </Field></Row>
          <Row><Field label="Active step (0-based)">
            <NumIn val={f.activeStep || 0} onChange={v=>updField('activeStep',v)} min={0} max={(f.steps||[]).length-1}/>
          </Field></Row>
        </Section>
      )}

      {/* Milestones */}
      {slide.template === 'milestones' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="milestones" num="03" title="Milestones">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit years, labels, and descriptions directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Horizontal Process */}
      {slide.template === 'horizontalProcess' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="hprocess" num="03" title="Process Steps">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit step labels and descriptions directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Four Column Process */}
      {slide.template === 'fourColumnProcess' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="fcolproc" num="03" title="Process Columns">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit column numbers, titles, and descriptions directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Profile Card */}
      {slide.template === 'profileCard' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="profile" num="03" title="Profile">
          <Row><Field label="Terminal command"><TxtIn val={f.command || ''} onChange={v=>updField('command',v)}/></Field></Row>
          <Row><Field label="Photo URL"><TxtIn val={f.photoSrc || ''} onChange={v=>updField('photoSrc',v)}/></Field></Row>
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit quote and data rows directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Level Grid */}
      {slide.template === 'levelGrid' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="levelgrid" num="03" title="Level Grid">
          <Row><Field label="Terminal command"><TxtIn val={f.command || ''} onChange={v=>updField('command',v)}/></Field></Row>
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit level titles, badges, and descriptions directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Level Detail */}
      {slide.template === 'levelDetail' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="leveldetail" num="03" title="Level Detail">
          <Row><Field label="Terminal command"><TxtIn val={f.command || ''} onChange={v=>updField('command',v)}/></Field></Row>
          <Row><Field label="Diagnostic question"><TxtArea val={f.diagnostic || ''} onChange={v=>updField('diagnostic',v)} rows={3}/></Field></Row>
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit left/right row labels and values directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      <Section openSection={openSection} setOpenSection={setOpenSection} id="meta" num="04" title="Corner meta">
        <Row><Field label="Brand (top-left)"><TxtIn val={slide.meta?.brand || ''} onChange={v=>updMeta('brand',v)}/></Field></Row>
        <Row><Field label="Top-right"><TxtIn val={slide.meta?.tr || ''} onChange={v=>updMeta('tr',v)}/></Field></Row>
        <Row><Field label="Bottom-left"><TxtIn val={slide.meta?.bl || ''} onChange={v=>updMeta('bl',v)}/></Field></Row>
        <Row><Field label="Bottom-right (auto = page)"><TxtIn val={slide.meta?.br || ''} onChange={v=>updMeta('br',v)}/></Field></Row>
      </Section>
    </div>
  );
};

// ─── Main editor ─────────────────────────────────────────────────────────────
export default function DeckEditor() {
  const [deck, setDeck] = useState(() => loadDeck() || { title: SEED_DECK.title, slides: SEED_DECK.slides });
  const [active, setActive] = useState(0);
  const [present, setPresent] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);
  const canvasWrapRef = useRef(null);
  const [scale, setScale] = useState(0.6);

  // Persist to localStorage
  useEffect(() => { saveDeck(deck); }, [deck]);

  const slides = deck?.slides || [];
  const cur = slides[active];

  // Compute scale to fit canvas area
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      const w = el.clientWidth - 64;
      const h = el.clientHeight - 64;
      const s = Math.min(w / SLIDE_W, h / SLIDE_H, 1);
      setScale(Math.max(s, 0.2));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // Mutations
  const setSlide = useCallback((idx, next) => {
    setDeck(d => {
      const ss = d.slides.slice();
      ss[idx] = next;
      return { ...d, slides:ss };
    });
  }, []);

  const addSlide = () => {
    setDeck(d => {
      const ns = { id:`s_${Date.now()}`, theme:'white', template:'twoColumn',
                   fields:{ title:'New slide', body:'Body text…', panel:{ kind:'bullets', data:['Point one','Point two'] }},
                   meta:{ brand:'Heuristics Tool', tr:'New', bl:'' } };
      const ss = d.slides.slice();
      ss.splice(active+1, 0, ns);
      setActive(active+1);
      return { ...d, slides:ss };
    });
  };
  const dupSlide = () => {
    setDeck(d => {
      const ss = d.slides.slice();
      const copy = JSON.parse(JSON.stringify(ss[active]));
      copy.id = `s_${Date.now()}`;
      ss.splice(active+1, 0, copy);
      setActive(active+1);
      return { ...d, slides:ss };
    });
  };
  const delSlide = () => {
    setDeck(d => {
      if (d.slides.length <= 1) return d;
      const ss = d.slides.slice();
      ss.splice(active, 1);
      setActive(Math.max(0, active-1));
      return { ...d, slides:ss };
    });
  };
  const moveSlide = (from, to) => {
    setDeck(d => {
      const ss = d.slides.slice();
      const [it] = ss.splice(from, 1);
      ss.splice(to, 0, it);
      setActive(to);
      return { ...d, slides:ss };
    });
  };
  const resetDeck = () => {
    if (!confirm('Reset deck to seed (your edits will be lost)?')) return;
    setDeck({ title: SEED_DECK.title, slides: SEED_DECK.slides });
    setActive(0);
  };
  const exportJson = () => {
    const blob = new Blob([JSON.stringify(deck, null, 2)], { type:'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `${deck.title.replace(/\s+/g,'-')}.json`;
    a.click(); URL.revokeObjectURL(url);
  };
  const importJson = () => {
    const inp = document.createElement('input');
    inp.type='file'; inp.accept='application/json';
    inp.onchange = (e) => {
      const f = e.target.files?.[0]; if (!f) return;
      const reader = new FileReader();
      reader.onload = () => {
        try {
          const imported = JSON.parse(reader.result);
          setDeck({ title: imported.title || 'Imported Deck', slides: imported.slides || [] });
          setActive(0);
        } catch {
          alert('Invalid JSON');
        }
      };
      reader.readAsText(f);
    };
    inp.click();
  };

  // Present mode keyboard
  useEffect(() => {
    if (!present) return;
    const onKey = (e) => {
      if (['ArrowRight',' ','PageDown'].includes(e.key)) { e.preventDefault(); setPresentIdx(i=>Math.min(slides.length-1, i+1)); }
      else if (['ArrowLeft','PageUp'].includes(e.key)) { e.preventDefault(); setPresentIdx(i=>Math.max(0, i-1)); }
      else if (e.key==='Escape') setPresent(false);
      else if (e.key==='Home') setPresentIdx(0);
      else if (e.key==='End') setPresentIdx(slides.length-1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [present, slides.length]);

  // Drag-to-reorder thumbnails
  const dragRef = useRef({ from:null });

  // ── Render ──
  if (present) {
    const ps = slides[presentIdx];
    return (
      <div style={{
        position:'fixed', inset:0, background:'#000',
        display:'flex', alignItems:'center', justifyContent:'center', zIndex:9999,
      }}>
        <div style={{
          width: '100vw', height: '100vh',
          display:'flex', alignItems:'center', justifyContent:'center',
        }}>
          <div style={{
            transform: `scale(${Math.min(window.innerWidth/SLIDE_W, window.innerHeight/SLIDE_H)})`,
            transformOrigin: 'center center',
          }}>
            <SlideView slide={ps} idx={presentIdx} total={slides.length} onChange={()=>{}} editable={false}/>
          </div>
        </div>
        <div style={{
          position:'fixed', bottom:18, left:'50%', transform:'translateX(-50%)',
          background:'rgba(0,0,0,.7)', color:'#fff', padding:'8px 14px',
          borderRadius:999, fontSize:11, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase',
          display:'flex', alignItems:'center', gap:14, fontFamily:sysFont,
        }}>
          <button onClick={()=>setPresentIdx(Math.max(0, presentIdx-1))}
            style={{ background:'transparent', border:`1px solid rgba(255,255,255,.3)`, color:'#fff',
                     width:28, height:28, borderRadius:'50%', cursor:'pointer' }}>‹</button>
          <span>{String(presentIdx+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span>
          <button onClick={()=>setPresentIdx(Math.min(slides.length-1, presentIdx+1))}
            style={{ background:'transparent', border:`1px solid rgba(255,255,255,.3)`, color:'#fff',
                     width:28, height:28, borderRadius:'50%', cursor:'pointer' }}>›</button>
          <button onClick={()=>setPresent(false)}
            style={{ background:'transparent', border:`1px solid rgba(255,255,255,.3)`, color:'#fff',
                     padding:'0 10px', height:28, borderRadius:6, cursor:'pointer', fontSize:10, letterSpacing:'.14em' }}>EXIT</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{
      display:'grid', gridTemplateColumns:'220px 1fr 320px', gridTemplateRows:'48px 1fr 44px',
      gridTemplateAreas: `"top top top" "left center right" "bottom bottom bottom"`,
      width:'100vw', height:'100vh', overflow:'hidden',
      background: T.deckBg, color:T.text1, fontFamily:sysFont,
    }}>
      {/* TOP BAR */}
      <div style={{
        gridArea:'top', ...glassBar, display:'flex', alignItems:'center',
        padding:'0 16px', gap:12,
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:8 }}>
          <span style={{
            width:22, height:22, border:`2px solid ${T.text1}`, borderRadius:'50%',
            display:'inline-flex', alignItems:'center', justifyContent:'center',
            fontSize:11, fontWeight:900,
          }}>H</span>
          <input value={deck.title} onChange={e=>setDeck(d=>({ ...d, title:e.target.value }))}
            style={{ ...ctrlBase, height:28, width:240, fontSize:13, fontWeight:600 }}/>
        </div>

        {/* Direction switcher */}
        <div style={{ display:'flex', gap:4, marginLeft:8 }}>
          {ALL_DIRECTIONS.map(dir => (
            <button key={dir.key}
              onClick={() => {
                if (confirm(`Load "${dir.label}"? Current edits will be lost.`)) {
                  setDeck({ title: dir.deck.title, slides: JSON.parse(JSON.stringify(dir.deck.slides)) });
                  setActive(0);
                }
              }}
              style={{
                ...ctrlBase, width:'auto', height:26, padding:'0 10px',
                fontSize:10, fontWeight:600, letterSpacing:'.04em', cursor:'pointer',
                background: deck.title === dir.deck.title ? T.accent : T.ctrl,
                color: deck.title === dir.deck.title ? '#fff' : T.text2,
                border: deck.title === dir.deck.title ? `1px solid ${T.accent}` : `1px solid ${T.ctrlBorder}`,
              }}>
              {dir.label}
            </button>
          ))}
        </div>

        <div style={{ flex:1 }}/>

        <TBtn onClick={importJson}>Import</TBtn>
        <TBtn onClick={exportJson}>Export JSON</TBtn>
        <TBtn onClick={resetDeck}>Reset</TBtn>
        <TBtn onClick={()=>{ setPresentIdx(active); setPresent(true); }} dark>▶ Present</TBtn>
      </div>

      {/* LEFT: SLIDE LIST */}
      <div style={{
        gridArea:'left', borderRight:`1px solid ${T.border}`,
        background:'rgba(255,255,255,0.4)', backdropFilter:T.blur,
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        <div style={{ padding:'10px 12px', borderBottom:`1px solid ${T.border}`,
                       display:'flex', alignItems:'center', justifyContent:'space-between' }}>
          <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:T.text4 }}>
            Slides · {slides.length}
          </span>
          <button onClick={addSlide} title="Add slide"
            style={{ width:22, height:22, border:`1px solid ${T.ctrlBorder}`, background:T.ctrl,
                     borderRadius:5, cursor:'pointer', fontSize:13, color:T.text2 }}>+</button>
        </div>
        <div style={{ flex:1, overflowY:'auto', padding:'10px 12px',
                       display:'flex', flexDirection:'column', gap:10 }}>
          {slides.map((s, i) => (
            <div key={s.id || i}
              draggable
              onDragStart={()=>{ dragRef.current.from = i; }}
              onDragOver={(e)=>e.preventDefault()}
              onDrop={()=>{ if (dragRef.current.from!=null && dragRef.current.from!==i) moveSlide(dragRef.current.from, i); dragRef.current.from=null; }}
            >
              <Thumbnail slide={s} idx={i} total={slides.length}
                active={i===active} onClick={()=>setActive(i)}
                onDelete={delSlide} onDuplicate={dupSlide}/>
            </div>
          ))}
        </div>
      </div>

      {/* CENTER: CANVAS */}
      <div ref={canvasWrapRef} style={{
        gridArea:'center', position:'relative', overflow:'hidden',
        display:'flex', alignItems:'center', justifyContent:'center',
        padding:32,
      }}>
        <div style={{
          width: SLIDE_W, height: SLIDE_H,
          transform: `scale(${scale})`, transformOrigin:'center center',
          boxShadow:'0 30px 80px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.06)',
          background:'#fff',
        }}>
          <SlideView slide={cur} idx={active} total={slides.length}
            onChange={(s)=>setSlide(active, s)} editable={true}/>
        </div>
        <div style={{ position:'absolute', top:14, right:18,
                       fontSize:10, fontWeight:600, letterSpacing:'.12em', textTransform:'uppercase',
                       color:T.text4 }}>
          {Math.round(scale*100)}% · 1280×800
        </div>
      </div>

      {/* RIGHT: PROPERTIES */}
      <div style={{
        gridArea:'right', borderLeft:`1px solid ${T.border}`,
        background:'rgba(255,255,255,0.55)', backdropFilter:T.blur,
        overflow:'hidden', display:'flex', flexDirection:'column',
      }}>
        <PropertiesPanel slide={cur} idx={active} total={slides.length}
          onChange={(s)=>setSlide(active, s)}/>
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        gridArea:'bottom', ...glassBar, borderTop:`1px solid ${T.border}`, borderBottom:'none',
        display:'flex', alignItems:'center', padding:'0 16px', gap:12,
      }}>
        <button onClick={()=>setActive(Math.max(0, active-1))}
          style={{ ...ctrlBase, width:34, height:28, cursor:'pointer' }}>‹</button>
        <span style={{ fontSize:11, fontWeight:600, color:T.text2, minWidth:80, textAlign:'center' }}>
          {String(active+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}
        </span>
        <button onClick={()=>setActive(Math.min(slides.length-1, active+1))}
          style={{ ...ctrlBase, width:34, height:28, cursor:'pointer' }}>›</button>

        <div style={{ flex:1 }}/>

        <span style={{ fontSize:10, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:T.text4 }}>
          Click on slide to edit text · ⌘Z undoes per-field
        </span>
      </div>
    </div>
  );
}
