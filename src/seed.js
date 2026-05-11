const slide = (overrides) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : `s_${Math.random().toString(36).slice(2)}`,
  theme: 'white',
  template: 'twoColumn',
  fields: {},
  meta: { brand: 'Brand' },
  ...overrides,
});

export const SEED_DECK = {
  id: 'deck_layouts_v1',
  title: 'Layout Templates',
  slides: [
    // 01 COVER
    slide({
      theme:'yellow', template:'cover',
      fields:{
        eyebrow:'Subtitle goes here',
        num:'01',
        title:'Presentation<br/>Title.',
        blurb:'A short description of the presentation purpose and context goes in this area.',
        tag:'Category · Tag',
      },
      meta:{ brand:'Brand', tr:'Subtitle · v1', bl:'Month 2025', br:'Team · Department' },
    }),

    // 02 TABLE OF CONTENTS (list style)
    slide({
      theme:'black', template:'toc',
      fields:{
        bigNum:'00', label:'Contents',
        items:[
          { t:'Introduction', n:'01' },
          { t:'Overview', n:'02' },
          { t:'Details', n:'03' },
          { t:'Timeline', n:'04' },
          { t:'Summary', n:'05' },
        ],
        footer:'A brief description of what this presentation covers and the key topics to be discussed.',
      },
      meta:{ tr:'Index', bl:'00 — Contents' },
    }),

    // 03 TABLE OF CONTENT (sections with arrow bullets)
    slide({
      theme:'gray', template:'tableOfContent',
      fields:{
        title:'Table of<br/><strong>Content</strong>',
        sections:[
          { title:'Section One', items:['Topic A','Topic B','Topic C','Topic D'] },
          { title:'Section Two', items:['Item Alpha','Item Beta','Item Gamma','Item Delta','Item Epsilon'], note:'(Related to Section Three)' },
          { title:'Section Three', items:['Point 1','Point 2','Point 3','Point 4','Point 5'], note:'(Related to Section Two)' },
        ],
      },
      meta:{ brand:'Brand', tr:'Team Name ■ 01 — 2025', bl:'Presentation Title' },
    }),

    // 04 SECTION DIVIDER
    slide({
      theme:'yellow', template:'sectionDivider',
      fields:{ num:'01', title:'Section<br/>Title<br/>Goes Here.', body:'A brief description of what this section covers and why it matters.' },
      meta:{ tr:'01 · Section', bl:'Context line' },
    }),

    // 05 TWO COLUMN (bullets)
    slide({
      template:'twoColumn',
      fields:{
        smallNum:'01.1', smallLabel:'Subsection label',
        title:'Two column layout<br/>with bullet points.',
        lead:'A lead paragraph that introduces the main content of this slide.',
        panel:{ kind:'bullets', data:[
          '<strong>First point.</strong> Supporting description text that elaborates on this item.',
          '<strong>Second point.</strong> Another description with additional context and details.',
          '<strong>Third point.</strong> Further explanation that helps convey the message clearly.',
          '<strong>Fourth point.</strong> Final supporting detail that wraps up the content.',
        ]},
      },
      meta:{ tr:'01.1 · Topic', bl:'Section name' },
    }),

    // 06 TWO COLUMN (image)
    slide({
      template:'twoColumn',
      fields:{
        smallNum:'01.2', smallLabel:'Visual example',
        title:'Two column layout<br/>with image panel.',
        lead:'Supporting text that describes what the image shows.',
        body:'Additional body text that provides more context about the visual content shown on the right side.',
        panel:{ kind:'image', data:{
          src:'',
          fit:'contain',
          bg:'#f4f4f5',
          tag:'Label',
          caption:'Image caption describing what is shown in the visual above.',
        }},
        bottomNote:'Footnote text goes here',
      },
      meta:{ tr:'01.2 · Topic', bl:'Section name' },
    }),

    // 07 TWO COLUMN (split before/after)
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Category Label',
        bigNumeral:'02',
        title:'Before and after<br/>comparison layout.',
        titleSize:56,
        body:'Body text explaining the transformation or comparison being shown in the right panel.',
        panel:{ kind:'split', data:{
          leftLabel:'Before',
          left:['Previous state item one','Previous state item two','Previous state item three','Previous state item four'],
          rightLabel:'After', rightAccent:true,
          right:['New state item one','New state item two','New state item three','New state item four'],
        }},
      },
      meta:{ tr:'02 · Comparison', bl:'Section name' },
    }),

    // 08 TWO COLUMN (accent statement)
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Category · Label',
        bigNumeral:'03',
        title:'Accent statement<br/>layout example.',
        titleSize:56,
        body:'Body text that provides context for the statement displayed in the accent panel on the right.',
        panel:{ kind:'accent', data:{
          tone:'yellow',
          eyebrow:'Outcome',
          statement:'A bold statement that captures the key message.',
          tag:'Tag Label',
        }},
      },
      meta:{ tr:'03 · Statement', bl:'Section name' },
    }),

    // 09 TWO COLUMN (metrics)
    slide({
      template:'twoColumn',
      fields:{
        smallNum:'04.1', smallLabel:'Key metrics',
        title:'Metrics display<br/>layout example.',
        titleSize:48,
        panel:{ kind:'metrics', data:[
          { num:'120', label:'Metric label one', body:'Brief description of what this metric represents.' },
          { num:'45%', label:'Metric label two', body:'Brief description of what this percentage means.' },
          { num:'3.2k', label:'Metric label three', body:'Brief description of the third key metric.' },
        ]},
      },
      meta:{ tr:'04.1 · Metrics', bl:'Section name' },
    }),

    // 10 TWO COLUMN (flow steps)
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Process · Flow',
        bigNumeral:'04',
        title:'Flow steps<br/>layout example.',
        titleSize:56,
        body:'Description of the process shown as numbered steps in the right panel.',
        panel:{ kind:'flow', data:[
          { title:'Step One', body:'Description of the first action in the process.' },
          { title:'Step Two', body:'Description of the second action in the process.' },
          { title:'Step Three', body:'Description of the final action.', accent:true },
        ]},
      },
      meta:{ tr:'04 · Flow', bl:'Process steps' },
    }),

    // 11 TWO COLUMN (mapping)
    slide({
      template:'twoColumn',
      fields:{
        smallNum:'05.1', smallLabel:'Mapping',
        title:'Side by side<br/>mapping layout.',
        body:'Description of how the left side maps to the right side.',
        panel:{ kind:'mapping', data:{
          leftEyebrow:'Side A', leftTitle:'Category One',
          left:['Item from side A','Second item from A','Third item from A','Fourth item from A'],
          rightEyebrow:'Side B', rightTitle:'Category Two',
          right:['Corresponding item B','Second item from B','Third item from B','Fourth item from B'],
        }},
        bottomNote:'Mapping relationship description',
      },
      meta:{ tr:'05.1 · Mapping', bl:'Section name' },
    }),

    // 12 TWO COLUMN (vision flow)
    slide({
      theme:'yellow', template:'twoColumn',
      fields:{
        eyebrow:'Vision · Future',
        bigNumeral:'05',
        title:'Vision flow<br/>layout example.',
        titleSize:56,
        body:'Description of the long-term vision shown as sequential steps in the dark panel.',
        panel:{ kind:'vision', data:{
          eyebrow:'Vision flow',
          steps:['Step one — description of action','Step two — description of next','Step three — continues here','Step four — final destination'],
          tag:'Vision · Label',
        }},
      },
      meta:{ tr:'05 · Vision', bl:'Long-term plan' },
    }),

    // 13 FOUR CARDS
    slide({
      template:'fourCards',
      fields:{
        eyebrow:'Phase 01 - Category',
        title:'Four Cards Layout',
        cards:[
          { num:'01', title:'First Card Title', time:'09:00 - 10:00', lead:'Person A', mentor:'Person B', participants:'Team Alpha' },
          { num:'02', title:'Second Card Title', time:'10:00 - 12:00', lead:'Person C', mentor:'Person D', participants:'Team Beta' },
          { num:'03', title:'Third Card Title', time:'10:00 - 12:00', lead:'Person E', mentor:'Person F', participants:'Team Gamma' },
          { num:'04', title:'Fourth Card Title', time:'10:00 - 12:00', lead:'Person G', mentor:'Person H', participants:'Team Delta' },
        ],
      },
      meta:{ brand:'Brand', tr:'Team Name ■ 01 — 2025', bl:'Presentation Title' },
    }),

    // 14 TEAM GRID
    slide({
      theme:'gray', template:'teamGrid',
      fields:{
        title:'Team Support',
        description: true,
        descCols:[
          { label:'Role Group A', text:'Description of what this role group does and how they support the team.' },
          { label:'Role Group B', text:'Description of what this second role group does and their responsibilities.' },
        ],
        members:[
          { role:'Role title one', name:'First\nLastname', abbr:'R1' },
          { role:'Role title two', name:'Second\nLastname', abbr:'R2' },
          { role:'Role title three', name:'Third\nLastname', abbr:'R3' },
          { role:'Role title four', name:'Fourth\nLastname', abbr:'R4' },
        ],
      },
      meta:{ brand:'Brand', tr:'Team Name ■ 01 — 2025', bl:'Department' },
    }),

    // 15 SCHEDULE TABLE
    slide({
      theme:'gray', template:'schedule',
      fields:{
        title:'Event<br/><strong>Schedule</strong>',
        rows:[
          { time:'09:00 - 09:30', session:'Opening Session', lead:'Leader Name', participants:'All Attendees' },
          { time:'09:30 - 12:00', session:'Workshop A', lead:'Facilitator A', mentor:'Mentor A', participants:'Group One' },
          { time:'09:30 - 12:00', session:'Workshop B', lead:'Facilitator B', mentor:'Mentor B', participants:'Group Two' },
          { time:'09:30 - 12:00', session:'Workshop C', lead:'Facilitator C', mentor:'Mentor C', participants:'Group Three' },
        ],
      },
      meta:{ brand:'Brand', tr:'Team Name ■ 01 — 2025', bl:'Presentation Title' },
    }),

    // 16 TASK STEPS
    slide({
      theme:'gray', template:'taskSteps',
      fields:{
        eyebrow:'Category Label',
        title:'The <strong>Task</strong>',
        activeStep:0,
        steps:[
          { num:'01', title:'First Step Title', body:'Description of the first task step with details about what needs to be accomplished.' },
          { num:'02', title:'Second Step Title', body:'Description of the second task step with instructions and guidelines.' },
          { num:'03', title:'Third Step Title', body:'Description of the third task step explaining the process in detail.' },
          { num:'04', title:'Fourth Step Title', body:'Description of the final task step with completion criteria.' },
        ],
      },
      meta:{ brand:'Brand', tr:'Team Name ■ 01 — 2025', bl:'Presentation Title' },
    }),

    // 17 GOALS GRID
    slide({
      template:'goalsGrid',
      fields:{
        bigNum:'02', label:'Goals · 01–05',
        note:'Priority decreases left to right. Goal 05 is the long-term vision.',
        goals:[
          { n:'01', t:'First goal title', d:'Description of the first goal and what it aims to achieve.' },
          { n:'02', t:'Second goal title', d:'Description of the second goal with expected outcomes.' },
          { n:'03', t:'Third goal title', d:'Description of the third goal and its importance.' },
          { n:'04', t:'Fourth goal title', d:'Description of the fourth goal and success criteria.' },
          { n:'05', t:'Fifth goal (vision)', vision:true, d:'Long-term vision goal that represents the future state.' },
        ],
        footnote:'01–04 are commitments · 05 is vision',
      },
      meta:{ tr:'02 · Goals', bl:'Goals overview' },
    }),

    // 18 ROADMAP
    slide({
      template:'roadmap',
      fields:{
        bigNum:'05', label:'Roadmap',
        note:'Key milestones and next steps in priority order.',
        items:[
          { label:'Step 01 · Now', title:'Immediate action item.', body:'Description of what needs to happen right now and why it is the top priority.' },
          { label:'Step 02 · Next', title:'Follow-up action item.', body:'Description of the next step that builds on the first and moves toward the goal.' },
          { label:'Step 03 · Later', title:'Future action item.', accent:true, body:'Description of the longer-term step that completes the roadmap.' },
        ],
      },
      meta:{ tr:'05 · Roadmap', bl:'Next steps' },
    }),

    // 19 MILESTONES
    slide({
      template:'milestones',
      fields:{
        eyebrow:'(Timeline)',
        title:'Company Over the Years',
        items:[
          { year:'2010', label:'Founded', body:'Description of the founding story and initial vision for the organization.' },
          { year:'2015', label:'First Milestone', body:'Description of the first major achievement and its impact on growth.' },
          { year:'2020', label:'Major Growth', body:'Description of a significant expansion period and what drove it.' },
          { year:'2025', label:'Current Phase', body:'Description of where things stand today and the current focus areas.' },
        ],
      },
      meta:{ tr:'Timeline', bl:'History' },
    }),

    // 20 HORIZONTAL PROCESS
    slide({
      theme:'gray', template:'horizontalProcess',
      fields:{
        eyebrow:'Category Label',
        title:'The <strong>Process</strong>',
        steps:[
          { label:'Discovery', body:'Research and gather requirements from stakeholders' },
          { label:'Planning', body:'Define scope, timeline, and resource allocation' },
          { label:'Execution', body:'Build and implement according to the plan' },
          { label:'Review', body:'Test, validate, and gather feedback' },
          { label:'Delivery', body:'Ship and hand off to the appropriate team' },
        ],
      },
      meta:{ brand:'Brand', tr:'Team Name ■ 01 — 2025', bl:'Presentation Title' },
    }),

    // 21 FOUR COLUMN PROCESS
    slide({
      template:'fourColumnProcess',
      fields:{
        eyebrow:'The Process',
        title:'Step by step<br/>breakdown',
        columns:[
          { num:'01', title:'First Phase', body:'Description of the first phase including key activities and deliverables.' },
          { num:'02', title:'Second Phase', body:'Description of the second phase with dependencies and milestones.' },
          { num:'03', title:'Third Phase', body:'Description of the third phase covering implementation details.' },
          { num:'04', title:'Fourth Phase', body:'Description of the final phase with completion criteria and handoff.' },
        ],
      },
      meta:{ tr:'Process', bl:'Overview' },
    }),

    // 22 CLOSING
    slide({
      template:'closing',
      fields:{
        eyebrow:'In summary',
        quote:'A closing statement that captures the key message of this presentation.',
        footEyebrow:'Next steps',
        footLine:'Action item one → action item two → final outcome.',
        tag:'Brand · 2025',
      },
      meta:{ tr:'End.', bl:'Thank you' },
    }),
  ],
};
