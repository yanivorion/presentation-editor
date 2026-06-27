import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { T, EASE, sysFont, glassPanel, glassBar, ctrlBase, Lbl, Field, Row, Sep,
         NumIn, TxtIn, TxtArea, Sel, Sw, TRow, TBtn, Acc, O } from './ui.jsx';
import { SlideView, SLIDE_W, SLIDE_H, themePalette, Meta, SelectionContext, SelectionSetContext, HiddenTplContext, TplGeometryContext, MultiDragContext, useMultiDragBus } from './templates.jsx';
import { SEED_DECK, ALL_DIRECTIONS } from './seed.js';
import ElementsCanvas from './canvas/ElementsCanvas.jsx';
import ElementToolbar from './panels/ElementToolbar.jsx';
import StylePanel from './panels/StylePanel.jsx';
import LayersPanel from './panels/LayersPanel.jsx';
import useFonts from './canvas/useFonts.js';
import { Copy, X, ChevronLeft, ChevronRight, Undo2, Redo2, Upload, Download, RotateCcw, Play, Plus, ZoomIn, ZoomOut, Maximize, FileJson, FileImage, FileText, ChevronDown } from 'lucide-react';
import { exportPptx, exportJson as exportJsonFile, importJson as importJsonFile } from './exportUtils.js';

import { loadDeck as loadFromSupabase, saveDeck as saveToSupabase } from './supabase.js';

const LS_PREFIX = 'deck_editor_';
const loadDeckLocal = (id) => { try { const r = localStorage.getItem(LS_PREFIX + id); if (r) return JSON.parse(r); } catch {} return null; };
const saveDeckLocal = (id, d) => { try { localStorage.setItem(LS_PREFIX + id, JSON.stringify(d)); } catch {} };

function newDeckData(title = 'Untitled Presentation') {
  return {
    title,
    slides: [{
      id: `s_${Date.now()}`,
      theme: 'white',
      template: 'twoColumn',
      fields: { title: 'Welcome', body: 'Start editing this presentation.', panel: { kind: 'bullets', data: ['Point one', 'Point two'] } },
      meta: { brand: title },
      elements: [],
      globalHeader: true,
      globalFooter: true,
    }],
    globalHeader: { elements: [] },
    globalFooter: { elements: [] },
    headerEnabled: true,
    footerEnabled: true,
  };
}

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
                     background:'rgba(255,255,255,.9)', display:'flex', alignItems:'center', justifyContent:'center' }}><Copy size={11} /></button>
          <button onClick={(e)=>{ e.stopPropagation(); onDelete(); }} title="Delete"
            style={{ width:20, height:20, border:'none', borderRadius:4, cursor:'pointer',
                     background:'rgba(255,255,255,.9)', display:'flex', alignItems:'center', justifyContent:'center', color:'#dc2626' }}><X size={12} /></button>
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

      {/* Profile Modern */}
      {slide.template === 'profileModern' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="profilemod" num="03" title="Profile">
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit name, role, quote, insight, and tags directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Level Intro */}
      {slide.template === 'levelIntro' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="lvlintro" num="03" title="Level Intro">
          <Row><Field label="Badge (optional)"><TxtIn val={f.badge || ''} onChange={v=>updField('badge',v)}/></Field></Row>
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit level ID, name, and signal directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Level Section (modern + terminal) */}
      {(slide.template === 'levelSection' || slide.template === 'levelSectionTerminal') && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="lvlsec" num="03" title="Level Section">
          <Row><Field label="Level ID"><TxtIn val={f.levelId || ''} onChange={v=>updField('levelId',v)}/></Field></Row>
          <Row><Field label="Variant">
            <Sel val={f.variant || 'normal'} onChange={v=>updField('variant',v)} opts={[{v:'normal',l:'Normal'},{v:'diagnostic',l:'Diagnostic (yellow)'}]}/>
          </Field></Row>
          {slide.template === 'levelSectionTerminal' && (
            <Row><Field label="Terminal command"><TxtIn val={f.command || ''} onChange={v=>updField('command',v)}/></Field></Row>
          )}
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit section label and body directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Spectrum Level (PDF grid layout) */}
      {slide.template === 'spectrumLevel' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="spectrumLevel" num="03" title="Level grid">
          <Row><Field label="Level ID"><TxtIn val={f.levelId || 'L0'} onChange={v=>updField('levelId',v)}/></Field></Row>
          <Row><Field label="Level label"><TxtIn val={f.levelLabel || ''} onChange={v=>updField('levelLabel',v)}/></Field></Row>
          <Row><Field label="Level name"><TxtIn val={f.levelName || ''} onChange={v=>updField('levelName',v)}/></Field></Row>
          <Row><Field label="Badge (optional)"><TxtIn val={f.badge || ''} onChange={v=>updField('badge',v)}/></Field></Row>
          <Row><Field label="Signal"><TxtArea val={f.signal || ''} onChange={v=>updField('signal',v)} rows={2}/></Field></Row>
          <Row><Field label="Description"><TxtArea val={f.desc || ''} onChange={v=>updField('desc',v)} rows={4}/></Field></Row>
          <Row><Field label="Markers"><TxtArea val={f.markers || ''} onChange={v=>updField('markers',v)} rows={3}/></Field></Row>
          <Row><Field label="The tell"><TxtArea val={f.tell || ''} onChange={v=>updField('tell',v)} rows={3}/></Field></Row>
          <Row>
            <Field label="3rd col label"><TxtIn val={f.thirdLabel || 'THE WALL'} onChange={v=>updField('thirdLabel',v)}/></Field>
            <Field label="3rd col value"><TxtArea val={f.thirdValue || ''} onChange={v=>updField('thirdValue',v)} rows={3}/></Field>
          </Row>
          <Row><Field label="Diagnostic"><TxtArea val={f.diagnostic || ''} onChange={v=>updField('diagnostic',v)} rows={2}/></Field></Row>
        </Section>
      )}

      {/* Spectrum Profile */}
      {slide.template === 'spectrumProfile' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="spectrumProfile" num="03" title="Profile">
          <Row><Field label="Quote"><TxtArea val={f.quote || ''} onChange={v=>updField('quote',v)} rows={3}/></Field></Row>
          <Row><Field label="Highlight words (comma)"><TxtIn val={f.highlightWords || ''} onChange={v=>updField('highlightWords',v)}/></Field></Row>
          <Row><Field label="Name"><TxtIn val={f.name || ''} onChange={v=>updField('name',v)}/></Field></Row>
          <Row><Field label="Role"><TxtArea val={f.role || ''} onChange={v=>updField('role',v)} rows={2}/></Field></Row>
          <Row><Field label="Photo URL"><TxtIn val={f.photoSrc || ''} onChange={v=>updField('photoSrc',v)}/></Field></Row>
          <Row><Field>
            <div style={{ fontSize:11, color:T.text3, lineHeight:1.5 }}>
              Edit grid cells (Portfolio, Press, etc.) directly on the slide canvas.
            </div>
          </Field></Row>
        </Section>
      )}

      {/* Sticky Mobile Cover */}
      {slide.template === 'stickyMobileCover' && (
        <Section openSection={openSection} setOpenSection={setOpenSection} id="stickyCover" num="03" title="Cover">
          <Row><Field label="Center title"><TxtIn val={f.centerTitle || ''} onChange={v=>updField('centerTitle',v)}/></Field></Row>
          <Row><Field label="Date"><TxtIn val={f.date || ''} onChange={v=>updField('date',v)}/></Field></Row>
          <Row>
            <Field label="Title primary"><TxtIn val={f.titlePrimary || ''} onChange={v=>updField('titlePrimary',v)}/></Field>
            <Field label="Title secondary"><TxtIn val={f.titleSecondary || ''} onChange={v=>updField('titleSecondary',v)}/></Field>
          </Row>
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

// ─── Undo/Redo hook ──────────────────────────────────────────────────────────
function useUndoable(initial) {
  const [state, setState] = useState(initial);
  const historyRef = useRef(null);
  const pointerRef = useRef(0);
  const skipRef = useRef(false);
  if (historyRef.current === null) { historyRef.current = [state]; }

  const set = useCallback((updater) => {
    setState(prev => {
      const next = typeof updater === 'function' ? updater(prev) : updater;
      if (!skipRef.current) {
        const h = historyRef.current;
        historyRef.current = h.slice(0, pointerRef.current + 1);
        historyRef.current.push(next);
        if (historyRef.current.length > 80) historyRef.current = historyRef.current.slice(-80);
        pointerRef.current = historyRef.current.length - 1;
      }
      skipRef.current = false;
      return next;
    });
  }, []);

  const undo = useCallback(() => {
    if (pointerRef.current <= 0) return;
    pointerRef.current--;
    skipRef.current = true;
    setState(historyRef.current[pointerRef.current]);
  }, []);

  const redo = useCallback(() => {
    if (pointerRef.current >= historyRef.current.length - 1) return;
    pointerRef.current++;
    skipRef.current = true;
    setState(historyRef.current[pointerRef.current]);
  }, []);

  const canUndo = pointerRef.current > 0;
  const canRedo = pointerRef.current < historyRef.current.length - 1;

  return [state, set, { undo, redo, canUndo, canRedo }];
}

// ─── Main editor ─────────────────────────────────────────────────────────────
export default function DeckEditor({ presentationId, onTitleChange }) {
  const [deck, setDeck, { undo, redo, canUndo, canRedo }] = useUndoable(() => loadDeckLocal(presentationId) || newDeckData());

  // Hydrate from Supabase only if no local data exists
  useEffect(() => {
    if (!loadDeckLocal(presentationId)) {
      loadFromSupabase(presentationId).then(remote => { if (remote) setDeck(remote); });
    }
  }, [presentationId]);
  const [active, setActive] = useState(0);
  const [present, setPresent] = useState(false);
  const [presentIdx, setPresentIdx] = useState(0);
  const canvasWrapRef = useRef(null);
  const slideContainerRef = useRef(null);
  const [scale, setScale] = useState(0.6);
  const [selectedIds, setSelectedIds] = useState([]);
  const [leftTab, setLeftTab] = useState('slides'); // 'slides' | 'layers'
  const [editingGlobal, setEditingGlobal] = useState(null); // null | 'header' | 'footer'
  const [marquee, setMarquee] = useState(null);
  const marqueeRef = useRef(null);
  const multiDragBus = useMultiDragBus();
  useFonts();

  // Clipboard for elements
  const clipboardRef = useRef([]);
  const lastActionRef = useRef(null);

  // Keyboard shortcuts — use refs to avoid stale closures
  const selectedIdsRef = useRef(selectedIds);
  selectedIdsRef.current = selectedIds;
  const activeIdxRef = useRef(active);
  activeIdxRef.current = active;
  const deckRef2 = useRef(deck);
  deckRef2.current = deck;

  useEffect(() => {
    const isEditing = () => {
      const ae = document.activeElement;
      if (!ae) return false;
      if (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA') return true;
      if (ae.isContentEditable) return true;
      return false;
    };

    const pasteElements = (elements) => {
      const pasted = elements.map(el => ({
        ...el,
        id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        x: el.x + 20,
        y: el.y + 20,
      }));
      setDeck(d => {
        const ss = d.slides.slice();
        const slide = ss[activeIdxRef.current];
        ss[activeIdxRef.current] = { ...slide, elements: [...(slide.elements || []), ...pasted] };
        return { ...d, slides: ss };
      });
      setSelectedIds(pasted.map(el => el.id));
      lastActionRef.current = { type: 'paste', data: elements };
    };

    const handler = (e) => {
      const mod = e.metaKey || e.ctrlKey;

      // Undo/Redo always work regardless of focus
      if (mod && e.key === 'z' && !e.shiftKey) { e.preventDefault(); undo(); return; }
      if (mod && e.key === 'z' && e.shiftKey) { e.preventDefault(); redo(); return; }
      if (mod && e.key === 'y') { e.preventDefault(); redo(); return; }

      // All other shortcuts require NOT being in a text-editing context
      if (isEditing()) return;

      if (mod && e.key === 'c') {
        if (selectedIdsRef.current.length === 0) return;
        e.preventDefault();
        const canvasIds = selectedIdsRef.current.filter(id => !id.startsWith('tpl_'));
        const tplIds = selectedIdsRef.current.filter(id => id.startsWith('tpl_'));
        const curEls = deckRef2.current.slides[activeIdxRef.current]?.elements || [];
        const copied = curEls.filter(el => canvasIds.includes(el.id));
        if (copied.length > 0) {
          clipboardRef.current = copied;
        } else if (tplIds.length > 0) {
          const tplEls = tplIds.map(id => {
            const node = document.querySelector(`[data-editable-id="${id}"]`);
            if (!node) return null;
            const inner = node.querySelector('div, h4, span') || node.firstElementChild || node;
            const text = inner.innerHTML || inner.innerText || '';
            const cs = getComputedStyle(inner);
            const rect = node.getBoundingClientRect();
            const container = node.closest('[data-slide-scale]');
            const cRect = container?.getBoundingClientRect();
            const scale = container ? parseFloat(container.dataset.slideScale) || 1 : 1;
            const x = cRect ? (rect.left - cRect.left) / scale : 0;
            const y = cRect ? (rect.top - cRect.top) / scale : 0;
            return {
              id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              type: 'text', content: text, x, y,
              w: rect.width / scale, h: rect.height / scale,
              style: {
                fontFamily: cs.fontFamily?.split(',')[0]?.replace(/['"]/g, '') || 'Inter',
                fontSize: parseFloat(cs.fontSize) || 18,
                fontWeight: parseInt(cs.fontWeight) || 400,
                fontStyle: cs.fontStyle !== 'normal' ? cs.fontStyle : undefined,
                color: cs.color || '#1a1a1a',
                letterSpacing: parseFloat(cs.letterSpacing) || undefined,
                lineHeight: parseFloat(cs.lineHeight) / parseFloat(cs.fontSize) || 1.4,
                textAlign: cs.textAlign || 'left',
              },
            };
          }).filter(Boolean);
          if (tplEls.length > 0) clipboardRef.current = tplEls;
        }
        return;
      }

      if (mod && e.key === 'v') {
        e.preventDefault();
        const localElements = clipboardRef.current;
        if (localElements && localElements.length > 0) {
          pasteElements(localElements);
        }
        return;
      }

      if (mod && e.key === 'd') {
        e.preventDefault();
        if (selectedIdsRef.current.length === 0) return;
        const canvasIds = selectedIdsRef.current.filter(id => !id.startsWith('tpl_'));
        if (canvasIds.length === 0) return;
        const curEls = deckRef2.current.slides[activeIdxRef.current]?.elements || [];
        const toDup = curEls.filter(el => canvasIds.includes(el.id));
        const duped = toDup.map(el => ({
          ...el,
          id: `el_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
          x: el.x + 20,
          y: el.y + 20,
        }));
        setDeck(d => {
          const ss = d.slides.slice();
          const slide = ss[activeIdxRef.current];
          ss[activeIdxRef.current] = { ...slide, elements: [...(slide.elements || []), ...duped] };
          return { ...d, slides: ss };
        });
        setSelectedIds(duped.map(el => el.id));
        lastActionRef.current = { type: 'duplicate', data: toDup };
        return;
      }

      if ((e.key === 'Delete' || e.key === 'Backspace') && !mod) {
        if (selectedIdsRef.current.length === 0) return;
        e.preventDefault();
        const canvasIds = selectedIdsRef.current.filter(id => !id.startsWith('tpl_'));
        const tplIds = selectedIdsRef.current.filter(id => id.startsWith('tpl_'));
        setDeck(d => {
          const ss = d.slides.slice();
          const slide = { ...ss[activeIdxRef.current] };
          if (canvasIds.length > 0) {
            slide.elements = (slide.elements || []).filter(el => !canvasIds.includes(el.id));
          }
          if (tplIds.length > 0) {
            slide.hiddenTplIds = [...(slide.hiddenTplIds || []), ...tplIds];
          }
          ss[activeIdxRef.current] = slide;
          return { ...d, slides: ss };
        });
        setSelectedIds([]);
        return;
      }
    };

    window.addEventListener('keydown', handler, true);
    return () => window.removeEventListener('keydown', handler, true);
  }, [undo, redo, setDeck, setSelectedIds]);

  // Cmd+scroll (pinch) to zoom
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const handler = (e) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = -e.deltaY * 0.001;
        setScale(s => Math.min(2, Math.max(0.1, s + delta)));
      }
    };
    el.addEventListener('wheel', handler, { passive: false });
    return () => el.removeEventListener('wheel', handler);
  }, []);

  // Persist to localStorage + Supabase
  const saveTimerRef = useRef(null);
  const deckRef3 = useRef(deck);
  deckRef3.current = deck;
  const presIdRef = useRef(presentationId);
  presIdRef.current = presentationId;
  useEffect(() => {
    saveDeckLocal(presentationId, deck);
    if (onTitleChange && deck.title) onTitleChange(deck.title);
    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => { saveToSupabase(presentationId, deck); }, 1500);
  }, [deck, presentationId]);

  // Force save on page unload + visibility change
  useEffect(() => {
    const forceSave = () => {
      if (document.activeElement?.blur) document.activeElement.blur();
      saveDeckLocal(presIdRef.current, deckRef3.current);
    };
    const onVisChange = () => { if (document.hidden) forceSave(); };
    window.addEventListener('beforeunload', forceSave);
    document.addEventListener('visibilitychange', onVisChange);
    return () => {
      window.removeEventListener('beforeunload', forceSave);
      document.removeEventListener('visibilitychange', onVisChange);
    };
  }, []);

  // Marquee selection — native events on canvasWrapRef, window move/up for cross-boundary drag
  const scaleRef = useRef(scale);
  scaleRef.current = scale;
  const activeRef = useRef(active);
  activeRef.current = active;
  const deckRef = useRef(deck);
  deckRef.current = deck;
  const marqueeRafRef = useRef(null);

  useEffect(() => {
    const wrap = canvasWrapRef.current;
    if (!wrap) return;

    const clientToSlide = (clientX, clientY) => {
      const container = slideContainerRef.current;
      if (!container) return { x: 0, y: 0 };
      const rect = container.getBoundingClientRect();
      return {
        x: (clientX - rect.left) / scaleRef.current,
        y: (clientY - rect.top) / scaleRef.current,
      };
    };

    const rectsIntersect = (a, b) => !(a.right < b.left || a.left > b.right || a.bottom < b.top || a.top > b.bottom);

    let moveHandler = null;
    let upHandler = null;

    const onDown = (e) => {
      if (e.button !== 0) return;
      const el = e.target;
      if (el.closest('[data-editable-wrap]') || el.closest('[data-canvas-element]') || el.closest('button') || el.closest('[contenteditable]') || el.closest('input') || el.closest('select') || el.closest('textarea')) return;
      if (document.activeElement?.blur) document.activeElement.blur();
      if (!e.shiftKey) setSelectedIds([]);
      const pt = clientToSlide(e.clientX, e.clientY);
      marqueeRef.current = { startX: pt.x, startY: pt.y };
      setMarquee({ x: pt.x, y: pt.y, w: 0, h: 0 });

      moveHandler = (ev) => {
        if (!marqueeRef.current) return;
        if (marqueeRafRef.current) return;
        marqueeRafRef.current = requestAnimationFrame(() => {
          marqueeRafRef.current = null;
          if (!marqueeRef.current) return;
          const p = clientToSlide(ev.clientX, ev.clientY);
          const m = marqueeRef.current;
          setMarquee({
            x: Math.min(m.startX, p.x), y: Math.min(m.startY, p.y),
            w: Math.abs(p.x - m.startX), h: Math.abs(p.y - m.startY),
          });
        });
      };

      upHandler = (ev) => {
        if (!marqueeRef.current) { cleanup(); return; }
        const p = clientToSlide(ev.clientX, ev.clientY);
        const m = marqueeRef.current;
        const left = Math.min(m.startX, p.x);
        const top = Math.min(m.startY, p.y);
        const w = Math.abs(p.x - m.startX);
        const h = Math.abs(p.y - m.startY);

        if (w > 5 || h > 5) {
          const selRect = { left, top, right: left + w, bottom: top + h };

          const curEls = deckRef.current.slides[activeRef.current]?.elements || [];
          const freeformHits = curEls.filter(el2 => {
            if (el2.visible === false || el2.locked) return false;
            return rectsIntersect(selRect, { left: el2.x, top: el2.y, right: el2.x + el2.w, bottom: el2.y + el2.h });
          }).map(el2 => el2.id);

          const container = slideContainerRef.current;
          const tplHits = [];
          if (container) {
            container.querySelectorAll('[data-editable-wrap]').forEach(node => {
              const nodeRect = node.getBoundingClientRect();
              const cRect = container.getBoundingClientRect();
              const s = scaleRef.current;
              const elRect = {
                left: (nodeRect.left - cRect.left) / s,
                top: (nodeRect.top - cRect.top) / s,
                right: (nodeRect.right - cRect.left) / s,
                bottom: (nodeRect.bottom - cRect.top) / s,
              };
              if (rectsIntersect(selRect, elRect)) {
                const id = node.dataset.editableId;
                if (id) tplHits.push(id);
              }
            });
          }

          setSelectedIds([...freeformHits, ...tplHits]);
        }
        marqueeRef.current = null;
        setMarquee(null);
        cleanup();
      };

      const cleanup = () => {
        if (moveHandler) window.removeEventListener('pointermove', moveHandler);
        if (upHandler) window.removeEventListener('pointerup', upHandler);
        moveHandler = null;
        upHandler = null;
      };

      window.addEventListener('pointermove', moveHandler);
      window.addEventListener('pointerup', upHandler);
    };

    wrap.addEventListener('pointerdown', onDown);
    return () => {
      wrap.removeEventListener('pointerdown', onDown);
      if (moveHandler) window.removeEventListener('pointermove', moveHandler);
      if (upHandler) window.removeEventListener('pointerup', upHandler);
    };
  }, []);

  const slides = deck?.slides || [];
  const cur = slides[active];

  // Compute initial scale to fit canvas area
  useEffect(() => {
    const el = canvasWrapRef.current;
    if (!el) return;
    const w = el.clientWidth - 64;
    const h = el.clientHeight - 64;
    const s = Math.min(w / SLIDE_W, h / SLIDE_H, 1);
    setScale(Math.max(s, 0.2));
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
                   meta:{ brand:'Heuristics Tool', tr:'New', bl:'' },
                   elements:[], globalHeader:true, globalFooter:true };
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
  const [exportDropdown, setExportDropdown] = useState(false);
  const exportDropdownRef = useRef(null);

  useEffect(() => {
    if (!exportDropdown) return;
    const handler = (e) => {
      if (exportDropdownRef.current && !exportDropdownRef.current.contains(e.target)) setExportDropdown(false);
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [exportDropdown]);

  const handleExportJson = () => { exportJsonFile(deck); setExportDropdown(false); };
  const handleExportPptx = async () => { setExportDropdown(false); await exportPptx(deck); };
  const handleExportPng = () => {
    setExportDropdown(false);
    const container = slideContainerRef.current;
    if (!container) return;
    import('html2canvas').then(({ default: html2canvas }) => {
      const slideEl = container.querySelector('[data-slide-scale]');
      if (!slideEl) return;
      html2canvas(slideEl, { scale: 2, useCORS: true, width: SLIDE_W, height: SLIDE_H }).then(canvas => {
        const a = document.createElement('a');
        a.href = canvas.toDataURL('image/png');
        a.download = `slide-${String(active + 1).padStart(2, '0')}.png`;
        a.click();
      });
    }).catch(() => alert('Failed to export PNG'));
  };

  const handleImport = () => {
    importJsonFile((imported) => {
      setDeck(imported);
      setActive(0);
    });
  };

  // Element mutations
  const curElements = cur?.elements || [];
  const selectedElement = selectedIds.length === 1 ? curElements.find(el => el.id === selectedIds[0]) || null : null;

  // Template geometry persistence
  const tplGeomCtx = useMemo(() => ({
    geom: cur?.tplGeometry || {},
    setGeom: (id, data) => {
      setDeck(d => {
        const ss = d.slides.slice();
        const slide = ss[active];
        ss[active] = { ...slide, tplGeometry: { ...(slide.tplGeometry || {}), [id]: data } };
        return { ...d, slides: ss };
      });
    },
  }), [cur?.tplGeometry, active]);

  const setElements = useCallback((newElements) => {
    setDeck(d => {
      const ss = d.slides.slice();
      ss[active] = { ...ss[active], elements: newElements };
      return { ...d, slides: ss };
    });
  }, [active]);

  const addElement = useCallback((el) => {
    setDeck(d => {
      const ss = d.slides.slice();
      const slide = ss[active];
      ss[active] = { ...slide, elements: [...(slide.elements || []), el] };
      return { ...d, slides: ss };
    });
    setSelectedIds([el.id]);
  }, [active]);

  const updateElement = useCallback((updatedEl) => {
    setDeck(d => {
      const ss = d.slides.slice();
      const slide = ss[active];
      ss[active] = { ...slide, elements: (slide.elements || []).map(el => el.id === updatedEl.id ? updatedEl : el) };
      return { ...d, slides: ss };
    });
  }, [active]);

  // Global header/footer element helpers
  const globalHeaderElements = deck.globalHeader?.elements || [];
  const globalFooterElements = deck.globalFooter?.elements || [];

  const setGlobalElements = useCallback((which, newElements) => {
    setDeck(d => ({
      ...d,
      [which === 'header' ? 'globalHeader' : 'globalFooter']: {
        ...(d[which === 'header' ? 'globalHeader' : 'globalFooter'] || {}),
        elements: newElements,
      },
    }));
  }, []);

  const addGlobalElement = useCallback((el) => {
    if (!editingGlobal) return;
    setDeck(d => {
      const key = editingGlobal === 'header' ? 'globalHeader' : 'globalFooter';
      const current = d[key]?.elements || [];
      return { ...d, [key]: { ...d[key], elements: [...current, el] } };
    });
    setSelectedIds([el.id]);
  }, [editingGlobal]);

  const updateGlobalElement = useCallback((updatedEl) => {
    if (!editingGlobal) return;
    setDeck(d => {
      const key = editingGlobal === 'header' ? 'globalHeader' : 'globalFooter';
      const current = d[key]?.elements || [];
      return { ...d, [key]: { ...d[key], elements: current.map(el => el.id === updatedEl.id ? updatedEl : el) } };
    });
  }, [editingGlobal]);

  const globalEditElements = editingGlobal === 'header' ? globalHeaderElements : editingGlobal === 'footer' ? globalFooterElements : [];
  const globalSelectedElement = editingGlobal && selectedIds.length === 1 ? globalEditElements.find(el => el.id === selectedIds[0]) : null;

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

  // Present mode scale — track viewport, recompute on resize. Computing inline
  // from window.innerWidth at render time was unreliable on the first paint
  // (resolved to 0 → invisible slide until you navigated).
  const [presentScale, setPresentScale] = useState(() =>
    typeof window !== 'undefined'
      ? Math.min(window.innerWidth / SLIDE_W, window.innerHeight / SLIDE_H) || 1
      : 1
  );
  useEffect(() => {
    if (!present) return;
    const recompute = () => {
      const s = Math.min(window.innerWidth / SLIDE_W, window.innerHeight / SLIDE_H);
      if (s > 0 && Number.isFinite(s)) setPresentScale(s);
    };
    recompute();
    window.addEventListener('resize', recompute);
    return () => window.removeEventListener('resize', recompute);
  }, [present]);

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
            transform: `scale(${presentScale})`,
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
                     width:28, height:28, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronLeft size={16} /></button>
          <span>{String(presentIdx+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}</span>
          <button onClick={()=>setPresentIdx(Math.min(slides.length-1, presentIdx+1))}
            style={{ background:'transparent', border:`1px solid rgba(255,255,255,.3)`, color:'#fff',
                     width:28, height:28, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronRight size={16} /></button>
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
        padding:'0 16px 0 48px', gap:12,
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

        <TBtn onClick={()=>{ setEditingGlobal(editingGlobal === 'header' ? null : 'header'); setSelectedIds([]); }}>
          {editingGlobal === 'header' ? '✓ Done Header' : 'Edit Header'}
        </TBtn>
        <TBtn onClick={()=>{ setEditingGlobal(editingGlobal === 'footer' ? null : 'footer'); setSelectedIds([]); }}>
          {editingGlobal === 'footer' ? '✓ Done Footer' : 'Edit Footer'}
        </TBtn>
        <TBtn onClick={()=>setDeck(d=>({ ...d, headerEnabled: !d.headerEnabled }))}>
          {deck.headerEnabled ? 'Header: ON' : 'Header: OFF'}
        </TBtn>
        <TBtn onClick={()=>setDeck(d=>({ ...d, footerEnabled: !d.footerEnabled }))}>
          {deck.footerEnabled ? 'Footer: ON' : 'Footer: OFF'}
        </TBtn>
        <TBtn onClick={undo} style={{ opacity: canUndo ? 1 : 0.35 }}><Undo2 size={13} /> Undo</TBtn>
        <TBtn onClick={redo} style={{ opacity: canRedo ? 1 : 0.35 }}><Redo2 size={13} /> Redo</TBtn>
        <TBtn onClick={handleImport}><Upload size={13} /> Import</TBtn>
        <div ref={exportDropdownRef} style={{ position:'relative' }}>
          <TBtn onClick={() => setExportDropdown(v => !v)}><Download size={13} /> Export <ChevronDown size={10} /></TBtn>
          {exportDropdown && (
            <div style={{
              position:'absolute', top:'100%', right:0, marginTop:4,
              background:'#fff', borderRadius:8, boxShadow:'0 8px 32px rgba(0,0,0,0.18)',
              border:'1px solid rgba(0,0,0,0.08)', overflow:'hidden', zIndex:100, minWidth:180,
            }}>
              <button onClick={handleExportJson} style={{
                display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px',
                border:'none', background:'none', cursor:'pointer', fontSize:12, fontWeight:500,
                color:'#1a1a1a', fontFamily:'inherit',
              }} onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'} onMouseLeave={e => e.currentTarget.style.background='none'}>
                <FileJson size={15} /> Export as JSON
              </button>
              <button onClick={handleExportPptx} style={{
                display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px',
                border:'none', background:'none', cursor:'pointer', fontSize:12, fontWeight:500,
                color:'#1a1a1a', fontFamily:'inherit',
              }} onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'} onMouseLeave={e => e.currentTarget.style.background='none'}>
                <FileText size={15} /> Export as PPTX
              </button>
              <button onClick={handleExportPng} style={{
                display:'flex', alignItems:'center', gap:8, width:'100%', padding:'10px 14px',
                border:'none', background:'none', cursor:'pointer', fontSize:12, fontWeight:500,
                color:'#1a1a1a', fontFamily:'inherit',
              }} onMouseEnter={e => e.currentTarget.style.background='#f5f5f5'} onMouseLeave={e => e.currentTarget.style.background='none'}>
                <FileImage size={15} /> Export current slide as PNG
              </button>
            </div>
          )}
        </div>
        <TBtn onClick={resetDeck}><RotateCcw size={13} /> Reset</TBtn>
        <TBtn onClick={()=>{ setPresentIdx(active); setPresent(true); }} dark><Play size={13} /> Present</TBtn>
      </div>

      {/* LEFT: SLIDE LIST / LAYERS */}
      <div style={{
        gridArea:'left', borderRight:`1px solid ${T.border}`,
        background:'rgba(255,255,255,0.4)', backdropFilter:T.blur,
        display:'flex', flexDirection:'column', overflow:'hidden',
      }}>
        {/* Tab toggle */}
        <div style={{ display:'flex', borderBottom:`1px solid ${T.border}` }}>
          <button onClick={()=>setLeftTab('slides')}
            style={{ flex:1, padding:'8px 0', fontSize:9, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase',
              background: leftTab==='slides' ? 'rgba(74,144,217,0.08)' : 'transparent',
              color: leftTab==='slides' ? '#4a90d9' : T.text4,
              border:'none', borderBottom: leftTab==='slides' ? '2px solid #4a90d9' : '2px solid transparent',
              cursor:'pointer' }}>Slides</button>
          <button onClick={()=>setLeftTab('layers')}
            style={{ flex:1, padding:'8px 0', fontSize:9, fontWeight:700, letterSpacing:'.12em', textTransform:'uppercase',
              background: leftTab==='layers' ? 'rgba(74,144,217,0.08)' : 'transparent',
              color: leftTab==='layers' ? '#4a90d9' : T.text4,
              border:'none', borderBottom: leftTab==='layers' ? '2px solid #4a90d9' : '2px solid transparent',
              cursor:'pointer' }}>Layers</button>
        </div>

        {leftTab === 'slides' && (
          <>
            <div style={{ padding:'10px 12px', borderBottom:`1px solid ${T.border}`,
                           display:'flex', alignItems:'center', justifyContent:'space-between' }}>
              <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.14em', textTransform:'uppercase', color:T.text4 }}>
                Slides · {slides.length}
              </span>
              <button onClick={addSlide} title="Add slide"
                style={{ width:22, height:22, border:`1px solid ${T.ctrlBorder}`, background:T.ctrl,
                         borderRadius:5, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', color:T.text2 }}><Plus size={14} /></button>
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
                    active={i===active} onClick={()=>{ setActive(i); setSelectedIds([]); }}
                    onDelete={delSlide} onDuplicate={dupSlide}/>
                </div>
              ))}
            </div>
          </>
        )}

        {leftTab === 'layers' && (
          <LayersPanel
            elements={curElements}
            selectedIds={selectedIds}
            onSelect={setSelectedIds}
            onChange={setElements}
            globalHeaderEnabled={cur?.globalHeader !== false}
            globalFooterEnabled={cur?.globalFooter !== false}
            onToggleHeader={() => setSlide(active, { ...cur, globalHeader: !(cur?.globalHeader !== false) })}
            onToggleFooter={() => setSlide(active, { ...cur, globalFooter: !(cur?.globalFooter !== false) })}
          />
        )}
      </div>

      {/* CENTER: CANVAS */}
      <div ref={canvasWrapRef} style={{
        gridArea:'center', position:'relative', overflow:'hidden',
        display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
        padding:32,
      }}>
        {/* Element Toolbar */}
        <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', zIndex:20 }}>
          <ElementToolbar onAdd={editingGlobal ? addGlobalElement : addElement} />
        </div>
        {editingGlobal && (
          <div style={{ position:'absolute', top:10, left:18, zIndex:20, fontSize:10, fontWeight:700,
            letterSpacing:'.1em', textTransform:'uppercase', color:'#4a90d9',
            background:'rgba(255,255,255,0.9)', padding:'6px 10px', borderRadius:6 }}>
            Editing Global {editingGlobal}
          </div>
        )}

        <div ref={slideContainerRef} style={{
          position:'relative',
          width: SLIDE_W, height: SLIDE_H,
          transform: `scale(${scale})`, transformOrigin:'center center',
          boxShadow:'0 30px 80px rgba(0,0,0,0.18), 0 4px 12px rgba(0,0,0,0.06)',
          background:'#fff',
        }}>
          <SelectionContext.Provider value={selectedIds}>
          <SelectionSetContext.Provider value={setSelectedIds}>
          <HiddenTplContext.Provider value={cur?.hiddenTplIds || []}>
          <TplGeometryContext.Provider value={tplGeomCtx}>
          <MultiDragContext.Provider value={multiDragBus}>
            <SlideView slide={cur} idx={active} total={slides.length}
              onChange={(s)=>setSlide(active, s)} editable={!editingGlobal} externalMeta={!editingGlobal} scale={scale}/>
          </MultiDragContext.Provider>
          </TplGeometryContext.Provider>
          </HiddenTplContext.Provider>
          </SelectionSetContext.Provider>
          </SelectionContext.Provider>

          {/* Global header elements (readonly when not editing header) */}
          {deck.headerEnabled && cur?.globalHeader !== false && !editingGlobal && globalHeaderElements.length > 0 && (
            <div style={{ position:'absolute', top:0, left:0, right:0, height:80, pointerEvents:'none' }}>
              {globalHeaderElements.filter(el=>el.visible!==false).map(el => (
                <div key={el.id} style={{ position:'absolute', left:el.x, top:el.y, width:el.w, height:el.h, opacity:el.style?.opacity??1 }} />
              ))}
            </div>
          )}

          {/* Global footer elements (readonly when not editing footer) */}
          {deck.footerEnabled && cur?.globalFooter !== false && !editingGlobal && globalFooterElements.length > 0 && (
            <div style={{ position:'absolute', bottom:0, left:0, right:0, height:80, pointerEvents:'none' }}>
              {globalFooterElements.filter(el=>el.visible!==false).map(el => (
                <div key={el.id} style={{ position:'absolute', left:el.x, top:el.y, width:el.w, height:el.h, opacity:el.style?.opacity??1 }} />
              ))}
            </div>
          )}

          {/* Slide elements canvas (normal mode) */}
          {!editingGlobal && (
            <ElementsCanvas
              elements={curElements}
              selectedIds={selectedIds}
              scale={scale}
              onSelect={setSelectedIds}
              onChange={setElements}
              multiDragBus={multiDragBus}
            />
          )}

          {/* Meta header/footer rendered on top of everything including dot grid */}
          {!editingGlobal && (
            <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:2000 }}>
              <Meta slide={cur} palette={themePalette(cur.theme)} idx={active} total={slides.length}
                onChange={(s)=>setSlide(active, s)} editable={true}/>
            </div>
          )}

          {/* Global header/footer editing canvas */}
          {editingGlobal && (
            <>
              <div style={{ position:'absolute', inset:0, background:'rgba(0,0,0,0.3)', pointerEvents:'none', zIndex:5 }} />
              <div style={{
                position:'absolute',
                top: editingGlobal === 'header' ? 0 : undefined,
                bottom: editingGlobal === 'footer' ? 0 : undefined,
                left:0, right:0, height:80,
                background:'rgba(255,255,255,0.95)',
                border: '2px dashed #4a90d9',
                zIndex:6,
              }}>
                <ElementsCanvas
                  elements={globalEditElements}
                  selectedIds={selectedIds}
                  scale={scale}
                  onSelect={setSelectedIds}
                  onChange={(els) => setGlobalElements(editingGlobal, els)}
                  multiDragBus={multiDragBus}
                />
              </div>
            </>
          )}

          {/* Marquee visual overlay (rendered in slide coordinate space) */}
          {marquee && marquee.w > 2 && marquee.h > 2 && (
            <div style={{
              position:'absolute',
              left: marquee.x, top: marquee.y,
              width: marquee.w, height: marquee.h,
              border:'1.5px dashed #4a90d9',
              background:'rgba(74, 144, 217, 0.08)',
              pointerEvents:'none', zIndex:9999,
            }} />
          )}
        </div>
        <div style={{ position:'absolute', top:10, right:14, display:'flex', alignItems:'center', gap:4 }}>
          <button onClick={() => setScale(s => Math.max(0.1, s - 0.1))}
            style={{ ...ctrlBase, width:26, height:26, borderRadius:4, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ZoomOut size={14} /></button>
          <span style={{ fontSize:10, fontWeight:600, letterSpacing:'.1em', color:T.text4, minWidth:38, textAlign:'center' }}>
            {Math.round(scale*100)}%
          </span>
          <button onClick={() => setScale(s => Math.min(2, s + 0.1))}
            style={{ ...ctrlBase, width:26, height:26, borderRadius:4, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ZoomIn size={14} /></button>
          <button onClick={() => {
            const el = canvasWrapRef.current;
            if (!el) return;
            const w = el.clientWidth - 64;
            const h = el.clientHeight - 64;
            setScale(Math.min(w / SLIDE_W, h / SLIDE_H, 1));
          }}
            style={{ ...ctrlBase, height:26, padding:'0 8px', borderRadius:4, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center', gap:4 }}><Maximize size={12} /> <span style={{ fontSize:9, fontWeight:700, letterSpacing:'.08em' }}>FIT</span></button>
        </div>
      </div>

      {/* RIGHT: PROPERTIES / STYLE */}
      <div style={{
        gridArea:'right', borderLeft:`1px solid ${T.border}`,
        background:'rgba(255,255,255,0.55)', backdropFilter:T.blur,
        overflow:'hidden', display:'flex', flexDirection:'column',
      }}>
        {(selectedElement || globalSelectedElement) ? (
          <StylePanel
            element={globalSelectedElement || selectedElement}
            onChange={editingGlobal ? updateGlobalElement : updateElement}
          />
        ) : (
          <PropertiesPanel slide={cur} idx={active} total={slides.length}
            onChange={(s)=>setSlide(active, s)}/>
        )}
      </div>

      {/* BOTTOM BAR */}
      <div style={{
        gridArea:'bottom', ...glassBar, borderTop:`1px solid ${T.border}`, borderBottom:'none',
        display:'flex', alignItems:'center', padding:'0 16px', gap:12,
      }}>
        <button onClick={()=>setActive(Math.max(0, active-1))}
          style={{ ...ctrlBase, width:34, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronLeft size={16} /></button>
        <span style={{ fontSize:11, fontWeight:600, color:T.text2, minWidth:80, textAlign:'center' }}>
          {String(active+1).padStart(2,'0')} / {String(slides.length).padStart(2,'0')}
        </span>
        <button onClick={()=>setActive(Math.min(slides.length-1, active+1))}
          style={{ ...ctrlBase, width:34, height:28, cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><ChevronRight size={16} /></button>

        <div style={{ flex:1 }}/>

        <span style={{ fontSize:10, fontWeight:600, letterSpacing:'.14em', textTransform:'uppercase', color:T.text4 }}>
          Click on slide to edit text · ⌘Z undoes per-field
        </span>
      </div>
    </div>
  );
}
