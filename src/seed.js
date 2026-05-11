const slide = (overrides) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : `s_${Math.random().toString(36).slice(2)}`,
  theme: 'white',
  template: 'twoColumn',
  fields: {},
  meta: { brand: 'Editor Cluster' },
  ...overrides,
});

// ─── Shared slide data (reused across directions) ────────────────────────────

const SLIDE_PROFILE = slide({
  template:'profileCard',
  fields:{
    command:'$ whois ann_miura-ko',
    quote:'"AI-native is currently used as a binary when it should be a spectrum."',
    rows:[
      { label:'NAME', value:'Ann Miura-Ko', bold:true },
      { label:'ROLE', value:'Co-founding Partner, Floodgate — pre-seed & seed VC', bold:false },
      { label:'PORTFOLIO', value:'Lyft, Okta, Twitch, Outreach, Treasured' },
      { label:'PRESS', value:'"Most powerful woman in startups" — Forbes', bold:false },
      { label:'ACADEMIC', value:'Stanford PhD — technology & market dynamics' },
      { label:'KEY INSIGHT', value:'A company where employees use ChatGPT to summarize meetings is not the same as one where AI agents query systems of record and take bounded action', badge:'CORE THESIS' },
    ],
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_LEVEL_GRID = slide({
  template:'levelGrid',
  fields:{
    command:'$ list --levels --all',
    levels:[
      { id:'L0', title:'AI as Theater', desc:'Tools exist. Nothing changes. No process completed end-to-end.' },
      { id:'L1', badge:'MOST ORGS', title:'Personal Productivity', desc:'Individuals use AI. No org integration. No shared tooling.' },
      { id:'L2', title:'Team Workflow', desc:"Shared AI within teams. Workflows don't cross boundaries." },
      { id:'L3', badge:'INFLECTION', title:'Org Infrastructure', desc:'AI acts across functions. Org chart changes. Non-engineers build workflows.' },
      { id:'L4', title:'Compounding OS', desc:'AI learns from past runs. Non-engineers ship prod tools. Hierarchy flattens.' },
      { id:'L5', title:'Self-Driving', desc:'Autonomous operating loops. Humans govern strategy & exceptions.' },
    ],
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_L0 = slide({
  template:'levelDetail',
  fields:{
    command:'$ describe --level 0',
    leftRows:[
      { label:'LEVEL', value:'L0', bold:true },
      { label:'NAME', value:'AI as Theater', bold:true },
      { label:'SIGNAL', value:'Tools exist. Nothing changes.' },
      { label:'DESC', value:"AI tools are present but don't complete any business process end-to-end. Adoption is performative — announcements, pilots, demos — but no workflow has actually changed." },
    ],
    rightRows:[
      { label:'MARKERS', value:'AI in strategy decks but absent from daily work. Pilots never graduate to production.' },
      { label:'THE TELL', value:'No process removed or replaced. Headcount unchanged. AI is a line item, not an operating change.' },
      { label:"WHO'S HERE", value:'Most large enterprises that announced "AI strategies" in 2023-2024 but haven\'t changed how any team works.' },
    ],
    diagnostic:'"If we turned off every AI tool tomorrow, would anyone\'s job change?"',
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_L1 = slide({
  template:'levelDetail',
  fields:{
    command:'$ describe --level 1',
    leftRows:[
      { label:'LEVEL', value:'L1', bold:true, badge:'MOST ORGS' },
      { label:'NAME', value:'Personal Productivity', bold:true },
      { label:'SIGNAL', value:"Individuals use AI. The org doesn't." },
      { label:'DESC', value:"Individuals adopt AI independently — drafting, summarizing, coding. Gains are real but isolated. No shared tooling, no process change. Each person's AI usage is invisible to the system." },
    ],
    rightRows:[
      { label:'MARKERS', value:'Engineers use Copilot. PMs use ChatGPT. Designers use Midjourney. None of it coordinated or measured.' },
      { label:'THE TELL', value:'If one person leaves, their AI workflows leave with them. Nothing documented, shared, or institutionalized.' },
      { label:'THE TRAP', value:'This is where most companies claiming "AI-forward" sit. Individual tool use masquerades as transformation.' },
    ],
    diagnostic:'"Is AI usage an individual habit or an organizational capability?"',
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_L2 = slide({
  template:'levelDetail',
  fields:{
    command:'$ describe --level 2',
    leftRows:[
      { label:'LEVEL', value:'L2', bold:true },
      { label:'NAME', value:'Team Workflow', bold:true },
      { label:'SIGNAL', value:'Teams share AI processes — within their walls.' },
      { label:'DESC', value:"Teams have shared AI tools and processes within functional boundaries. Engineering has its pipeline, marketing has its workflow. Real gains — but workflows don't cross teams." },
    ],
    rightRows:[
      { label:'MARKERS', value:'Standardized AI toolchains within teams. Shared prompts, templates, pipelines. Team-level metrics improve.' },
      { label:'THE TELL', value:'Cross-team handoffs are still manual. Data flows through meetings, tickets, docs — not integrated AI systems.' },
      { label:'THE WALL', value:'L2→L3 is the hardest jump. Requires shared data models, integrated systems of record, cross-team trust in AI actions.' },
    ],
    diagnostic:'"Can an AI workflow in one team trigger or feed a workflow in another?"',
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_L3 = slide({
  template:'levelDetail',
  fields:{
    command:'$ describe --level 3',
    leftRows:[
      { label:'LEVEL', value:'L3', bold:true, badge:'INFLECTION' },
      { label:'NAME', value:'Organizational Infrastructure', bold:true },
      { label:'SIGNAL', value:'AI acts across functions. The org chart changes.' },
      { label:'DESC', value:'AI agents act across integrated systems and functions. Non-engineers create shareable workflows. Layers compress, roles merge, new functions emerge. The org chart visibly changes.' },
    ],
    rightRows:[
      { label:'MARKERS', value:'Fewer management layers. AI agents query systems of record and take bounded action. Non-engineers build workflows.' },
      { label:'THE TELL', value:'Roles that coordinated between teams replaced by AI-powered systems. Builder-to-manager ratio shifts dramatically.' },
      { label:'INFLECTION', value:'AI stops being a tool and starts being infrastructure. The organization is structurally different than before.' },
    ],
    diagnostic:'"Has your org chart changed because of AI — not just your tool stack?"',
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_L4 = slide({
  template:'levelDetail',
  fields:{
    command:'$ describe --level 4',
    leftRows:[
      { label:'LEVEL', value:'L4', bold:true },
      { label:'NAME', value:'Compounding OS', bold:true },
      { label:'SIGNAL', value:'AI learns from past runs. The system improves itself.' },
      { label:'DESC', value:'AI workflows learn from their own execution history. Non-engineers ship production tools. Hierarchy flattens because coordination is automated. Each run makes the next run better.' },
    ],
    rightRows:[
      { label:'MARKERS', value:'Self-improving pipelines. Internal tools built by non-engineers go to production. Feedback loops are automated.' },
      { label:'THE TELL', value:'The system gets better without anyone explicitly improving it. Past outputs become training data for future runs.' },
      { label:'REQUIREMENT', value:'Robust observability, automated evaluation, trust in AI-generated improvements. Cultural comfort with machine-driven iteration.' },
    ],
    diagnostic:'"Does our AI get better at its job without us manually improving it?"',
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_L5 = slide({
  template:'levelDetail',
  fields:{
    command:'$ describe --level 5',
    leftRows:[
      { label:'LEVEL', value:'L5', bold:true },
      { label:'NAME', value:'Self-Driving', bold:true },
      { label:'SIGNAL', value:'Autonomous operating loops. Humans govern strategy.' },
      { label:'DESC', value:'AI systems run autonomous operating loops end-to-end. Humans set strategy, define constraints, handle exceptions. The organization operates more like a fleet than a factory.' },
    ],
    rightRows:[
      { label:'MARKERS', value:'Entire business processes run autonomously. Human intervention is exception-based, not routine. Strategy is the primary human function.' },
      { label:'THE TELL', value:'Removing a person doesn\'t break a process — it removes a strategic voice. Operations continue autonomously within defined bounds.' },
      { label:'REQUIREMENT', value:'Extreme trust, robust guardrails, cultural maturity. Very few orgs will reach this in the near term.' },
    ],
    diagnostic:'"If leadership took a month off, would operations degrade or continue?"',
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_GRUNT_WORK = slide({
  template:'twoColumn',
  fields:{
    title:'No more<br/>"grunt work"',
    lead:'(עבודות שחורות)',
    body:'<strong>Definition</strong><br/>• Repetitive<br/>• Time consuming<br/>• Unchallenging to the mind<br/><br/><strong>Example</strong><br/>• Washing dishes<br/>• Finding bad commit',
    panel:{ kind:'accent', data:{
      tone:'yellow',
      eyebrow:'The principle',
      statement:'AI should handle the grunt work so humans focus on judgment, creativity, and strategy.',
      tag:'L3+ thinking',
    }},
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_BA_REFLECTION = slide({
  template:'twoColumn',
  fields:{
    title:'BA on call -<br/>reflection',
    lead:'Great solution within the team',
    body:'<strong>Issues</strong><br/>• Not crossing organization boundaries<br/>&nbsp;&nbsp;→ <em>Submit directly to other teams\' AI</em><br/>• Not entirely automating, AI becoming the grunt worker..<br/>&nbsp;&nbsp;→ <em>Let AI write code instead</em>',
    panel:{ kind:'accent', data:{
      tone:'black',
      eyebrow:'The gap',
      statement:'Team-level AI that stops at boundaries is L2. Crossing boundaries is L3.',
      tag:'L2 → L3',
    }},
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_SELF_IMPROVING = slide({
  template:'twoColumn',
  fields:{
    title:"Yuval/Tom's<br/>self-improving<br/>tool",
    lead:'A real example of L4 thinking',
    body:'<strong>Background</strong><br/>• Business manager skills lacking (quality and scope)<br/>• Working with wix-platform MCP<br/>• High error rate<br/>• Slow response time<br/><br/><strong>Fix</strong><br/>• Scheduled task (every 15 minutes)<br/>• Analyze failures<br/>• Retry in a more friendly environment<br/>• Create new tools for Aria<br/>• Improve success rate and performance',
    panel:{ kind:'flow', data:[
      { title:'Detect', body:'Monitor failures automatically' },
      { title:'Analyze', body:'Identify root cause patterns' },
      { title:'Improve', body:'Generate fixes and deploy', accent:true },
    ]},
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_PEOPLE = slide({
  template:'twoColumn',
  fields:{
    title:'People dynamics<br/>in this environment',
    body:'<strong>People that don\'t get stuck</strong><br/><em>ask, convince, create - break barriers</em><br/><br/><strong>People that can\'t accept barriers</strong><br/><em>people, process or tech that holds them back</em><br/><br/><strong>AI is a multiplier for people, but not the same factor for everyone…</strong><br/><em>One person can grow from x → 10x, another from 0.8x → 2x</em><br/><br/>These type of people like to work with people like them..',
    panel:{ kind:'accent', data:{
      tone:'yellow',
      eyebrow:'Culture',
      statement:'The people who thrive in L3+ orgs are the ones who refuse to accept boundaries as permanent.',
      tag:'Hiring signal',
    }},
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

const SLIDE_CLUSTER = slide({
  template:'twoColumn',
  fields:{
    title:'(Some of the) examples<br/>of what we have<br/>in the cluster',
    lead:'Seeds of L3 thinking already present in our org',
    body:'Studio · DM · Editor Harmony · Platform · AI SC — multiple teams building AI-powered tools independently. The question: can these cross-pollinate?',
    panel:{ kind:'image', data:{
      src:'',
      fit:'contain',
      bg:'#3344aa',
      tag:'Internal',
      caption:'Cluster tools overview — Studio, DM, Editor Harmony, Platform, AI SC initiatives',
    }},
  },
  meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026' },
});

// ─── DIRECTION A: "The Ladder" ───────────────────────────────────────────────
export const DIRECTION_A = {
  id: 'deck_direction_a',
  title: 'Direction A — The Ladder',
  slides: [
    // 1. Cover
    slide({
      theme:'black', template:'cover',
      fields:{
        eyebrow:'Editor Cluster · All-Hands · May 2026',
        num:'',
        title:'AI Maturity:<br/>From Theater<br/>to Self-Driving.',
        blurb:'A framework for understanding where we are, where we\'re going, and what the jump to the next level actually requires.',
        tag:'Internal · All-Hands',
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'Direction A: The Ladder' },
    }),

    // 2. Profile
    SLIDE_PROFILE,

    // 3. Level Grid
    SLIDE_LEVEL_GRID,

    // 4-6. L0, L1, L2
    SLIDE_L0,
    SLIDE_L1,
    SLIDE_L2,

    // 7. Section divider: The Wall
    slide({
      theme:'yellow', template:'sectionDivider',
      fields:{
        num:'!!',
        title:'The Wall.<br/>L2 → L3.',
        body:'This is the hardest jump. It requires shared data models, integrated systems of record, and cross-team trust in AI actions. Most organizations stall here.',
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'The inflection point' },
    }),

    // 8-10. L3, L4, L5
    SLIDE_L3,
    SLIDE_L4,
    SLIDE_L5,

    // 11. Where are we today?
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Self-assessment',
        bigNumeral:'L2',
        title:'Where are<br/>we today?',
        titleSize:56,
        body:'We have strong team-level AI workflows. BA on call, self-improving tools, cluster initiatives. But our workflows don\'t cross team boundaries yet. Data flows through meetings and tickets, not integrated AI systems.',
        panel:{ kind:'accent', data:{
          tone:'yellow',
          eyebrow:'Our position',
          statement:'Solid L2 with seeds of L3. The jump is available — but not automatic.',
          tag:'Current state',
        }},
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'Where we stand' },
    }),

    // 12. Evidence
    SLIDE_CLUSTER,

    // 13. Grunt work
    SLIDE_GRUNT_WORK,

    // 14. People dynamics
    SLIDE_PEOPLE,

    // 15. BA on call
    SLIDE_BA_REFLECTION,

    // 16. Closing / Next steps
    slide({
      template:'closing',
      fields:{
        eyebrow:'The ask',
        quote:'We need to stop optimizing within team boundaries and start building AI that crosses them.',
        footEyebrow:'Next steps',
        footLine:'Identify one cross-team AI workflow → pilot it → prove L3 is possible here.',
        tag:'Editor Cluster · 2026',
      },
      meta:{ brand:'Editor Cluster', tr:'End.', bl:'All-Hands · 05-2026' },
    }),
  ],
};

// ─── DIRECTION B: "Mirror, then Model" ──────────────────────────────────────
export const DIRECTION_B = {
  id: 'deck_direction_b',
  title: 'Direction B — Mirror, then Model',
  slides: [
    // 1. Cover (provocative)
    slide({
      theme:'black', template:'cover',
      fields:{
        eyebrow:'Editor Cluster · All-Hands · May 2026',
        num:'',
        title:'Are we<br/>AI-forward,<br/>or AI-decorated?',
        blurb:'We use AI every day. But has it actually changed how we work — or just how we feel about work?',
        tag:'Internal · All-Hands',
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'Direction B: Mirror, then Model' },
    }),

    // 2. Grunt work
    SLIDE_GRUNT_WORK,

    // 3. BA on call
    SLIDE_BA_REFLECTION,

    // 4. Self-improving tool
    SLIDE_SELF_IMPROVING,

    // 5. The honest question
    slide({
      theme:'black', template:'sectionDivider',
      fields:{
        num:'?',
        title:'These are great.<br/>But would turning off<br/>our AI tools change<br/>anyone\'s actual job?',
        body:'If the answer is "not really" — we\'re performing AI adoption, not living it. Let\'s be honest about where we actually sit.',
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'The honest question' },
    }),

    // 6. Ann Miura-Ko
    SLIDE_PROFILE,

    // 7. Level Grid
    SLIDE_LEVEL_GRID,

    // 8. L1 (where most orgs sit)
    SLIDE_L1,

    // 9. L2 (where we are)
    SLIDE_L2,

    // 10. The wall
    slide({
      theme:'yellow', template:'sectionDivider',
      fields:{
        num:'→',
        title:'The Wall.<br/>L2 to L3<br/>is the hardest jump.',
        body:'It requires shared data models, integrated systems of record, and cross-team trust in AI actions. This is where transformation gets real — or stalls permanently.',
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'The inflection' },
    }),

    // 11. L3 detail
    SLIDE_L3,

    // 12. L4-L5 sketch
    slide({
      theme:'yellow', template:'twoColumn',
      fields:{
        eyebrow:'The endgame',
        bigNumeral:'L5',
        title:'Where this<br/>all leads.',
        titleSize:56,
        body:'L4: AI learns from past runs. Non-engineers ship prod tools. Hierarchy flattens.<br/><br/>L5: Autonomous operating loops. Humans govern strategy & exceptions. The org runs more like a fleet than a factory.',
        panel:{ kind:'vision', data:{
          eyebrow:'The progression',
          steps:['L2 — Team workflows (us today)','L3 — Org infrastructure (the jump)','L4 — Compounding OS (self-improving)','L5 — Self-driving (autonomous)'],
          tag:'Vision',
        }},
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'L4-L5' },
    }),

    // 13. People dynamics
    SLIDE_PEOPLE,

    // 14. Cluster examples
    SLIDE_CLUSTER,

    // 15. Closing
    slide({
      template:'closing',
      fields:{
        eyebrow:'The conversation we need',
        quote:'We have the seeds of L3. The question is whether we\'ll let them cross-pollinate — or keep them in team-shaped pots.',
        footEyebrow:'One move',
        footLine:'Pick one workflow that crosses team boundaries → build it with AI → prove L3 is possible.',
        tag:'Editor Cluster · 2026',
      },
      meta:{ brand:'Editor Cluster', tr:'End.', bl:'All-Hands · 05-2026' },
    }),
  ],
};

// ─── DIRECTION C: "The Diagnostic" ──────────────────────────────────────────
export const DIRECTION_C = {
  id: 'deck_direction_c',
  title: 'Direction C — The Diagnostic',
  slides: [
    // 1. Cover
    slide({
      theme:'black', template:'cover',
      fields:{
        eyebrow:'Editor Cluster · All-Hands · May 2026',
        num:'',
        title:'How AI-native<br/>are we, really?',
        blurb:'A diagnostic. Five levels. Four questions. One honest answer about where we stand — and what it takes to move.',
        tag:'Internal · Diagnostic',
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'Direction C: The Diagnostic' },
    }),

    // 2. Profile
    SLIDE_PROFILE,

    // 3. Level grid
    SLIDE_LEVEL_GRID,

    // 4. Diagnostic #1
    slide({
      theme:'black', template:'sectionDivider',
      fields:{
        num:'Q1',
        title:'"If we turned off<br/>every AI tool tomorrow,<br/>would anyone\'s<br/>job change?"',
        body:'',
      },
      meta:{ brand:'Editor Cluster', tr:'Diagnostic', bl:'Question 01' },
    }),

    // 5. L0
    SLIDE_L0,

    // 6. Diagnostic #2
    slide({
      theme:'black', template:'sectionDivider',
      fields:{
        num:'Q2',
        title:'"Is AI usage<br/>an individual habit<br/>or an organizational<br/>capability?"',
        body:'',
      },
      meta:{ brand:'Editor Cluster', tr:'Diagnostic', bl:'Question 02' },
    }),

    // 7. L1
    SLIDE_L1,

    // 8. Diagnostic #3
    slide({
      theme:'black', template:'sectionDivider',
      fields:{
        num:'Q3',
        title:'"Can an AI workflow<br/>in one team trigger<br/>or feed a workflow<br/>in another?"',
        body:'',
      },
      meta:{ brand:'Editor Cluster', tr:'Diagnostic', bl:'Question 03' },
    }),

    // 9. L2
    SLIDE_L2,

    // 10. Our evidence at L2
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Our evidence',
        title:'What L2 looks like<br/>for us today.',
        titleSize:48,
        body:'• BA on call — great within the team, stops at boundaries<br/>• Self-improving tool — learns from failures, but scoped to one system<br/>• Cluster tools — Studio, DM, Editor Harmony, Platform, AI SC — all building independently',
        panel:{ kind:'accent', data:{
          tone:'yellow',
          eyebrow:'Honest assessment',
          statement:'Strong L2. Real gains. But nothing crosses team walls yet.',
          tag:'Current state',
        }},
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'Evidence' },
    }),

    // 11. Diagnostic #4
    slide({
      theme:'black', template:'sectionDivider',
      fields:{
        num:'Q4',
        title:'"Has your org chart<br/>changed because of AI —<br/>not just your<br/>tool stack?"',
        body:'',
      },
      meta:{ brand:'Editor Cluster', tr:'Diagnostic', bl:'Question 04' },
    }),

    // 12. L3
    SLIDE_L3,

    // 13. What L3 looks like for us
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'What L3 would mean',
        title:'Concretely,<br/>for our cluster.',
        titleSize:48,
        body:'• AI workflows that span Studio → Platform → Editor Harmony<br/>• Non-engineers shipping production tools (already starting)<br/>• Cross-team data models that AI agents can query and act on<br/>• The org chart reflecting AI-native coordination, not just tool adoption',
        panel:{ kind:'flow', data:[
          { title:'Connect', body:'Shared data models across teams' },
          { title:'Automate', body:'AI workflows that cross boundaries' },
          { title:'Restructure', body:'Org shape follows AI capability', accent:true },
        ]},
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'L3 for us' },
    }),

    // 14. L4-L5 endgame
    slide({
      theme:'yellow', template:'twoColumn',
      fields:{
        eyebrow:'The endgame',
        bigNumeral:'L5',
        title:'Compounding OS<br/>→ Self-Driving.',
        titleSize:56,
        body:'L4: The system improves itself. Past outputs become training data.<br/><br/>L5: Autonomous operating loops. Humans govern strategy and exceptions.',
        panel:{ kind:'vision', data:{
          eyebrow:'Beyond L3',
          steps:['L3 — Infrastructure (the jump we need)','L4 — Compounding (self-improving)','L5 — Self-driving (autonomous)'],
          tag:'Future state',
        }},
      },
      meta:{ brand:'Editor Cluster', tr:'All-Hands · 05-2026', bl:'L4-L5' },
    }),

    // 15. Grunt work
    SLIDE_GRUNT_WORK,

    // 16. People dynamics
    SLIDE_PEOPLE,

    // 17. Closing
    slide({
      template:'closing',
      fields:{
        eyebrow:'Our next move',
        quote:'We answered the diagnostic. We\'re at L2. The wall to L3 is real — but so are the seeds we\'ve already planted.',
        footEyebrow:'The move',
        footLine:'One cross-team AI workflow → pilot → prove → expand.',
        tag:'Editor Cluster · 2026',
      },
      meta:{ brand:'Editor Cluster', tr:'End.', bl:'All-Hands · 05-2026' },
    }),
  ],
};

// Default export for backwards compatibility
export const SEED_DECK = DIRECTION_A;

export const ALL_DIRECTIONS = [
  { key:'directionA', label:'A — The Ladder', deck:DIRECTION_A },
  { key:'directionB', label:'B — Mirror, then Model', deck:DIRECTION_B },
  { key:'directionC', label:'C — The Diagnostic', deck:DIRECTION_C },
];
