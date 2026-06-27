const slide = (overrides) => ({
  id: crypto.randomUUID ? crypto.randomUUID() : `s_${Math.random().toString(36).slice(2)}`,
  theme: 'white',
  template: 'twoColumn',
  fields: {},
  meta: { brand: 'Editor Cluster' },
  elements: [],
  globalHeader: true,
  globalFooter: true,
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Direction A: The Ladder' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'The inflection point' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Where we stand' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Direction B: Mirror, then Model' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'The honest question' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'The inflection' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'L4-L5' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Direction C: The Diagnostic' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Evidence' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'L3 for us' },
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
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'L4-L5' },
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

// ─── Shared: Modern Profile slide ────────────────────────────────────────────
const SLIDE_PROFILE_MODERN = slide({
  template:'profileModern',
  fields:{
    role:'Co-founding Partner, Floodgate — pre-seed & seed VC',
    name:'Ann Miura-Ko',
    quote:'"AI-native is currently used as a binary when it should be a spectrum."',
    insight:'A company where employees use ChatGPT to summarize meetings is not the same as one where AI agents query systems of record and take bounded action.',
    tags:['Stanford PhD','Forbes "Most Powerful"','Lyft · Okta · Twitch','Floodgate'],
  },
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
});

// ─── Helper: generate terminal-style level split slides ──────────────────────
const terminalLevelSlides = (levelId, name, signal, desc, markers, tell, thirdLabel, thirdValue, diagnostic, badge) => [
  slide({
    template:'levelSectionTerminal',
    fields:{
      command:`$ describe --level ${levelId.replace('L','')}`,
      levelId, sectionLabel:'OVERVIEW',
      body:`${name}\n\n${signal}\n\n${desc}`,
      variant: badge ? undefined : undefined,
    },
    meta:{ brand:'Editor Cluster', tr:`Level ${levelId}` },
  }),
  slide({
    template:'levelSectionTerminal',
    fields:{
      command:`$ describe --level ${levelId.replace('L','')} --section markers`,
      levelId, sectionLabel:'MARKERS', body:markers,
    },
    meta:{ brand:'Editor Cluster', tr:`${levelId} · Markers` },
  }),
  slide({
    template:'levelSectionTerminal',
    fields:{
      command:`$ describe --level ${levelId.replace('L','')} --section tell`,
      levelId, sectionLabel:'THE TELL', body:tell,
    },
    meta:{ brand:'Editor Cluster', tr:`${levelId} · The Tell` },
  }),
  slide({
    template:'levelSectionTerminal',
    fields:{
      command:`$ describe --level ${levelId.replace('L','')} --section ${thirdLabel.toLowerCase().replace(/\s/g,'-')}`,
      levelId, sectionLabel:thirdLabel, body:thirdValue,
    },
    meta:{ brand:'Editor Cluster', tr:`${levelId} · ${thirdLabel}` },
  }),
  slide({
    template:'levelSectionTerminal',
    fields:{
      command:`$ diagnose --level ${levelId.replace('L','')}`,
      levelId, sectionLabel:'DIAGNOSTIC', body:diagnostic, variant:'diagnostic',
    },
    meta:{ brand:'Editor Cluster', tr:`${levelId} · Diagnostic` },
  }),
];

// ─── Helper: generate modern-style level split slides ────────────────────────
const modernLevelSlides = (levelId, name, signal, markers, tell, thirdLabel, thirdValue, diagnostic, badge) => [
  slide({
    template:'levelIntro',
    fields:{ levelId, name, signal, badge: badge || undefined },
    meta:{ brand:'Editor Cluster', tr:`Level ${levelId}` },
  }),
  slide({
    theme:'gray', template:'levelSection',
    fields:{ levelId, sectionLabel:'MARKERS', body:markers },
    meta:{ brand:'Editor Cluster', tr:`${levelId} · Markers` },
  }),
  slide({
    template:'levelSection',
    fields:{ levelId, sectionLabel:'THE TELL', body:tell },
    meta:{ brand:'Editor Cluster', tr:`${levelId} · The Tell` },
  }),
  slide({
    theme:'gray', template:'levelSection',
    fields:{ levelId, sectionLabel:thirdLabel, body:thirdValue },
    meta:{ brand:'Editor Cluster', tr:`${levelId} · ${thirdLabel}` },
  }),
  slide({
    template:'levelSection',
    fields:{ levelId, sectionLabel:'DIAGNOSTIC', body:diagnostic, variant:'diagnostic' },
    meta:{ brand:'Editor Cluster', tr:`${levelId} · Diagnostic` },
  }),
];

// Level data
const LEVELS_DATA = [
  {
    id:'L0', name:'AI as Theater', badge:null,
    signal:'Tools exist. Nothing changes.',
    desc:'AI tools are present but don\'t complete any business process end-to-end. Adoption is performative — announcements, pilots, demos — but no workflow has actually changed.',
    markers:'AI in strategy decks but absent from daily work. Pilots never graduate to production.',
    tell:'No process removed or replaced. Headcount unchanged. AI is a line item, not an operating change.',
    thirdLabel:"WHO'S HERE", thirdValue:'Most large enterprises that announced "AI strategies" in 2023-2024 but haven\'t changed how any team works.',
    diagnostic:'"If we turned off every AI tool tomorrow, would anyone\'s job change?"',
  },
  {
    id:'L1', name:'Personal Productivity', badge:'MOST ORGS',
    signal:"Individuals use AI. The org doesn't.",
    desc:"Individuals adopt AI independently — drafting, summarizing, coding. Gains are real but isolated. No shared tooling, no process change. Each person's AI usage is invisible to the system.",
    markers:'Engineers use Copilot. PMs use ChatGPT. Designers use Midjourney. None of it coordinated or measured.',
    tell:'If one person leaves, their AI workflows leave with them. Nothing documented, shared, or institutionalized.',
    thirdLabel:'THE TRAP', thirdValue:'This is where most companies claiming "AI-forward" sit. Individual tool use masquerades as transformation.',
    diagnostic:'"Is AI usage an individual habit or an organizational capability?"',
  },
  {
    id:'L2', name:'Team Workflow', badge:null,
    signal:'Teams share AI processes — within their walls.',
    desc:"Teams have shared AI tools and processes within functional boundaries. Engineering has its pipeline, marketing has its workflow. Real gains — but workflows don't cross teams.",
    markers:'Standardized AI toolchains within teams. Shared prompts, templates, pipelines. Team-level metrics improve.',
    tell:'Cross-team handoffs are still manual. Data flows through meetings, tickets, docs — not integrated AI systems.',
    thirdLabel:'THE WALL', thirdValue:'L2→L3 is the hardest jump. Requires shared data models, integrated systems of record, cross-team trust in AI actions.',
    diagnostic:'"Can an AI workflow in one team trigger or feed a workflow in another?"',
  },
  {
    id:'L3', name:'Organizational Infrastructure', badge:'INFLECTION',
    signal:'AI acts across functions. The org chart changes.',
    desc:'AI agents act across integrated systems and functions. Non-engineers create shareable workflows. Layers compress, roles merge, new functions emerge. The org chart visibly changes.',
    markers:'Fewer management layers. AI agents query systems of record and take bounded action. Non-engineers build workflows.',
    tell:'Roles that coordinated between teams replaced by AI-powered systems. Builder-to-manager ratio shifts dramatically.',
    thirdLabel:'INFLECTION', thirdValue:'AI stops being a tool and starts being infrastructure. The organization is structurally different than before.',
    diagnostic:'"Has your org chart changed because of AI — not just your tool stack?"',
  },
  {
    id:'L4', name:'Compounding OS', badge:null,
    signal:'AI learns from past runs. The system improves itself.',
    desc:'AI workflows learn from their own execution history. Non-engineers ship production tools. Hierarchy flattens because coordination is automated.',
    markers:'Self-improving pipelines. Internal tools built by non-engineers go to production. Feedback loops are automated.',
    tell:'The system gets better without anyone explicitly improving it. Past outputs become training data for future runs.',
    thirdLabel:'REQUIREMENT', thirdValue:'Robust observability, automated evaluation, trust in AI-generated improvements. Cultural comfort with machine-driven iteration.',
    diagnostic:'"Does our AI get better at its job without us manually improving it?"',
  },
  {
    id:'L5', name:'Self-Driving', badge:null,
    signal:'Autonomous operating loops. Humans govern strategy.',
    desc:'AI systems run autonomous operating loops end-to-end. Humans set strategy, define constraints, handle exceptions. The organization operates more like a fleet than a factory.',
    markers:'Entire business processes run autonomously. Human intervention is exception-based, not routine.',
    tell:'Removing a person doesn\'t break a process — it removes a strategic voice. Operations continue autonomously.',
    thirdLabel:'REQUIREMENT', thirdValue:'Extreme trust, robust guardrails, cultural maturity. Very few orgs will reach this in the near term.',
    diagnostic:'"If leadership took a month off, would operations degrade or continue?"',
  },
];

// ─── DIRECTION D: Terminal style, split per section ──────────────────────────
export const DIRECTION_D = {
  id: 'deck_direction_d',
  title: 'Direction D — Terminal Split',
  slides: [
    // Cover
    slide({
      theme:'black', template:'cover',
      fields:{
        eyebrow:'Editor Cluster · All-Hands · May 2026',
        num:'',
        title:'AI Maturity<br/>Levels.',
        blurb:'L0 through L5. Each level broken down: signal, markers, tell, and diagnostic. Terminal style.',
        tag:'Internal · Deep Dive',
      },
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Direction D: Terminal Split' },
    }),

    // Profile (modern)
    SLIDE_PROFILE_MODERN,

    // Level Grid overview
    SLIDE_LEVEL_GRID,

    // L0 (5 slides)
    ...terminalLevelSlides('L0', 'AI as Theater', LEVELS_DATA[0].signal, LEVELS_DATA[0].desc, LEVELS_DATA[0].markers, LEVELS_DATA[0].tell, LEVELS_DATA[0].thirdLabel, LEVELS_DATA[0].thirdValue, LEVELS_DATA[0].diagnostic),

    // L1 (5 slides)
    ...terminalLevelSlides('L1', 'Personal Productivity', LEVELS_DATA[1].signal, LEVELS_DATA[1].desc, LEVELS_DATA[1].markers, LEVELS_DATA[1].tell, LEVELS_DATA[1].thirdLabel, LEVELS_DATA[1].thirdValue, LEVELS_DATA[1].diagnostic),

    // L2 (5 slides)
    ...terminalLevelSlides('L2', 'Team Workflow', LEVELS_DATA[2].signal, LEVELS_DATA[2].desc, LEVELS_DATA[2].markers, LEVELS_DATA[2].tell, LEVELS_DATA[2].thirdLabel, LEVELS_DATA[2].thirdValue, LEVELS_DATA[2].diagnostic),

    // Wall divider
    slide({
      theme:'yellow', template:'sectionDivider',
      fields:{ num:'!!', title:'The Wall.<br/>L2 → L3.', body:'This is the hardest jump. Most organizations stall here permanently.' },
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Inflection point' },
    }),

    // L3 (5 slides)
    ...terminalLevelSlides('L3', 'Organizational Infrastructure', LEVELS_DATA[3].signal, LEVELS_DATA[3].desc, LEVELS_DATA[3].markers, LEVELS_DATA[3].tell, LEVELS_DATA[3].thirdLabel, LEVELS_DATA[3].thirdValue, LEVELS_DATA[3].diagnostic),

    // L4 (5 slides)
    ...terminalLevelSlides('L4', 'Compounding OS', LEVELS_DATA[4].signal, LEVELS_DATA[4].desc, LEVELS_DATA[4].markers, LEVELS_DATA[4].tell, LEVELS_DATA[4].thirdLabel, LEVELS_DATA[4].thirdValue, LEVELS_DATA[4].diagnostic),

    // L5 (5 slides)
    ...terminalLevelSlides('L5', 'Self-Driving', LEVELS_DATA[5].signal, LEVELS_DATA[5].desc, LEVELS_DATA[5].markers, LEVELS_DATA[5].tell, LEVELS_DATA[5].thirdLabel, LEVELS_DATA[5].thirdValue, LEVELS_DATA[5].diagnostic),

    // Where we are
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Self-assessment',
        bigNumeral:'L2',
        title:'Where are<br/>we today?',
        titleSize:56,
        body:'Solid L2 with seeds of L3. Team-level AI that works — but stops at team walls. The jump is available but not automatic.',
        panel:{ kind:'accent', data:{ tone:'yellow', eyebrow:'Position', statement:'L2 → L3 is our next move.', tag:'Current' }},
      },
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
    }),

    // Closing
    slide({
      template:'closing',
      fields:{
        eyebrow:'The move',
        quote:'One cross-team AI workflow. Pilot it. Prove L3 is possible here.',
        footEyebrow:'Next',
        footLine:'Identify → pilot → prove → expand.',
        tag:'Editor Cluster · 2026',
      },
      meta:{ brand:'Editor Cluster', tr:'End.', bl:'All-Hands · 05-2026' },
    }),
  ],
};

// ─── DIRECTION E: Modern clean, split per section ────────────────────────────
export const DIRECTION_E = {
  id: 'deck_direction_e',
  title: 'Direction E — Modern Split',
  slides: [
    // Cover
    slide({
      theme:'black', template:'cover',
      fields:{
        eyebrow:'Editor Cluster · All-Hands · May 2026',
        num:'',
        title:'AI Maturity<br/>Levels.',
        blurb:'From theater to self-driving. Each level explored one dimension at a time. Clean, focused, one idea per slide.',
        tag:'Internal · Deep Dive',
      },
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Direction E: Modern Split' },
    }),

    // Profile (modern)
    SLIDE_PROFILE_MODERN,

    // Level Grid overview
    SLIDE_LEVEL_GRID,

    // L0 (5 slides)
    ...modernLevelSlides('L0', 'AI as Theater', LEVELS_DATA[0].signal, LEVELS_DATA[0].markers, LEVELS_DATA[0].tell, LEVELS_DATA[0].thirdLabel, LEVELS_DATA[0].thirdValue, LEVELS_DATA[0].diagnostic),

    // L1 (5 slides)
    ...modernLevelSlides('L1', 'Personal Productivity', LEVELS_DATA[1].signal, LEVELS_DATA[1].markers, LEVELS_DATA[1].tell, LEVELS_DATA[1].thirdLabel, LEVELS_DATA[1].thirdValue, LEVELS_DATA[1].diagnostic, LEVELS_DATA[1].badge),

    // L2 (5 slides)
    ...modernLevelSlides('L2', 'Team Workflow', LEVELS_DATA[2].signal, LEVELS_DATA[2].markers, LEVELS_DATA[2].tell, LEVELS_DATA[2].thirdLabel, LEVELS_DATA[2].thirdValue, LEVELS_DATA[2].diagnostic),

    // Wall divider
    slide({
      theme:'yellow', template:'sectionDivider',
      fields:{ num:'→', title:'The Wall.<br/>L2 to L3.', body:'The hardest jump. Requires shared data models, integrated systems of record, and cross-team trust in AI actions.' },
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'Inflection' },
    }),

    // L3 (5 slides)
    ...modernLevelSlides('L3', 'Organizational Infrastructure', LEVELS_DATA[3].signal, LEVELS_DATA[3].markers, LEVELS_DATA[3].tell, LEVELS_DATA[3].thirdLabel, LEVELS_DATA[3].thirdValue, LEVELS_DATA[3].diagnostic, LEVELS_DATA[3].badge),

    // L4 (5 slides)
    ...modernLevelSlides('L4', 'Compounding OS', LEVELS_DATA[4].signal, LEVELS_DATA[4].markers, LEVELS_DATA[4].tell, LEVELS_DATA[4].thirdLabel, LEVELS_DATA[4].thirdValue, LEVELS_DATA[4].diagnostic),

    // L5 (5 slides)
    ...modernLevelSlides('L5', 'Self-Driving', LEVELS_DATA[5].signal, LEVELS_DATA[5].markers, LEVELS_DATA[5].tell, LEVELS_DATA[5].thirdLabel, LEVELS_DATA[5].thirdValue, LEVELS_DATA[5].diagnostic),

    // Where we are
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Self-assessment',
        bigNumeral:'L2',
        title:'Where are<br/>we today?',
        titleSize:56,
        body:'Solid L2 with seeds of L3. Team-level AI that works — but stops at team walls.',
        panel:{ kind:'accent', data:{ tone:'yellow', eyebrow:'Position', statement:'The jump to L3 is our next move.', tag:'Current state' }},
      },
      meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
    }),

    // Evidence
    SLIDE_CLUSTER,

    // People
    SLIDE_PEOPLE,

    // Closing
    slide({
      template:'closing',
      fields:{
        eyebrow:'One move',
        quote:'Pick one workflow that crosses team boundaries. Build it with AI. Prove L3 is possible here.',
        footEyebrow:'Action',
        footLine:'Identify → pilot → prove → expand.',
        tag:'Editor Cluster · 2026',
      },
      meta:{ brand:'Editor Cluster', tr:'End.', bl:'All-Hands · 05-2026' },
    }),
  ],
};

// ─── Team Initiative Slides ───────────────────────────────────────────────────

const SLIDE_INITIATIVES_VIEWER = slide({
  template:'teamInitiatives',
  fields:{
    teamName:'Viewer',
    rows:[
      { initiative:'Prybar', description:'A thin authenticated wrapper around playwright-cli. It gives you a logged-in Wix browser session and a local TB dev environment in both live-sites and editor.', status:'Active' },
      { initiative:'Heavy Migrations', description:'Finished running a Sled2 -> Sled3 migration.\nNow running a "Remove Carmi" Effort spearheaded by AI.', status:'Active / POC' },
      { initiative:'Integrate Wix AI Solutions', description:"We started evaluating / testing Wix given tools: Automatic Code Reviews (participating in beta stage, we're not happy with it), remote dev machines for SLA fixes / Skipped tests.", status:'POC' },
      { initiative:'Dev Buddy', description:'A personal assistant that implements a spec-driven SW development flow. Will be the entry point to any new development endeavour.', status:'Future' },
      { initiative:'Repo AI Readiness', description:'- D2D QOL - dedicated skills and tools (merge-exp, deploy-previews,).\n- Domain Mastery - Knowledge base of past & current design decisions for each feature.\n- PR Context Enrichment - Add a hidden summarized context of sessions into a PRs.', status:'Active / Future' },
      { initiative:'AI Awareness', description:'- A dedicated 2 day workshop on AI mastery.\n- Weekly AI Council - share ideas and decide on company-wide standards.', status:'Future' },
    ],
  },
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
});

const SLIDE_INITIATIVES_PLATFORM = slide({
  template:'teamInitiatives',
  fields:{
    teamName:'Platform',
    rows:[
      { initiative:'Knowledge Skills (/ask-ep, /ask-builder, /ask-wix)', description:'On-demand platform knowledge for UX designers, PMs, developers, and vertical teams. Answers from curated knowledge base + live Slack/GitHub/Docs — reduces dependency on specific people for platform understanding', status:'Active' },
      { initiative:'Product/UX: NotebookLM - product knowledge curation', description:'Per-feature knowledge notebooks aggregating docs, specs, and designs into one queryable source for product and UX workflows', status:'Active' },
      { initiative:'Product/UX: Prototyping tools and repo (/prototype-composition)', description:'Generate interactive HTML prototypes from descriptions. Enables faster alignment between UX, product, and developers — shared artifact instead of verbal handoffs, explain complex topics with editor+wds shards for consistency', status:'Active' },
      { initiative:'Integration: Migration Skills (/extract-contexts, /create-context-provider, /create-site-widget)', description:"For vertical teams migrating to Builder. Analyzes legacy controllers, proposes Context Provider decomposition, scaffolds required files — codifies patterns so each team doesn't start from scratch", status:'Active' },
      { initiative:'Dev: AI-Native Repo Setup', description:'AGENTS.md + xai comments + .ai/ templates - internal patterns. Implements according to Wix and EP conventions.', status:'Active' },
      { initiative:'Dev: Sled 3 Test Migration', description:'AI-assisted migration of EP test files from sled 2 to Playwright', status:'In Progress' },
    ],
  },
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
});

const SLIDE_INITIATIVES_HARMONY = slide({
  template:'teamInitiatives',
  fields:{
    teamName:'Editor Harmony',
    rows:[
      { initiative:'The Brain', description:'Knowledge base for features in progress, Harmony-level knowledge and Harmony-specific skills from all disciplines.', status:'POC (Demo)' },
      { initiative:'Automatic tester', description:'Performs testing activities in the browser using playwright mcp according to the provided scenarios. In comparison with Argus testing tool released by Mobile team.', status:'POC (Demo)' },
      { initiative:'Playwright test writer', description:'Transforms written scenario into playwright test. Later will be re-used in various scenarios like: bugs validation, additional regression testing.', status:'POC' },
      { initiative:'User Action Analysis', description:'Replaces tedious and overwhelming user actions identification using event snitch to quick and effective analysis with trino mcp. Solution is handed over to CCQA', status:'Active' },
      { initiative:'BA On Call', description:'"What\'s on fire?" morning report — it scans 9 production tables, detects statistical anomalies across Harmony\'s key health signals, and delivers a prioritized list of what needs attention today. Pinpoints exact time of regression and identifies which AB or GA rollout caused it.', status:'Active (Demo)' },
    ],
  },
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
});

const SLIDE_INITIATIVES_STUDIO = slide({
  template:'teamInitiatives',
  fields:{
    teamName:'Studio',
    columns:['Title', 'Description', 'Status'],
    rows:[
      { initiative:'Domain intelligence', description:'Curated knowledge base of design principles, architecture, and invariants, distilled from years of internal docs and presentations. Makes implicit rules explicit and machine-readable.', status:'Demoable, in trials' },
      { initiative:'AI Code Review', description:'Code review skill that enforces our specific principles, architectural invariants, forbidden patterns, design boundaries. Not generic feedback. Checks what actually breaks things in this codebase, including bigger-picture fit.', status:'Demoable, in trials' },
      { initiative:'Full AI Development Method', description:'Spec-first protocol where AI produces a spec, architecture, and test plan before writing code, each gated on evidence, not plausibility. Defines what a quality spec looks like and what "done" means. Makes AI output reviewable, not just convincing.', status:'POC' },
      { initiative:'AI Driven Migrations', description:'AI as primary executor on large-scale mechanical migrations. Progress tracked across sessions. E.g. - Redux to signals, sled2->3, design system migration, etc', status:'Active' },
      { initiative:'Reusable AI Workflows (skills)', description:"Slash-command skills for repeating tasks: create a store, clean an experiment, audit a public API, verify a migration. Encodes institutional knowledge so it's applied consistently", status:'Active' },
    ],
  },
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
});

const SLIDE_INITIATIVES_AISC = slide({
  template:'teamInitiatives',
  fields:{
    teamName:'AI SC',
    rows:[
      { initiative:'Project Standardization', description:'Ensure all our project adhere to the same structure, so we can re-use coding skills easily (docs/architecture/glossary/etc)', status:'Done' },
      { initiative:'Domain Knowledge', description:'Make sure all our projects contain needed docs and references needed for agents, focus on knowledge not encoded in code', status:'Ongoing' },
      { initiative:'Coding workflow skills', description:'Leverage the standard project structure to create standard coding workflows (e.g. add new EML capabilities)', status:'Ongoing' },
      { initiative:'Knowledge Graph for Other projects', description:'A lot of our features rely on knowledge from other teams, we want to make sure agents know how to get to it when they need to', status:'Future' },
      { initiative:'EML debug skill', description:'Easily debug/investigate/analyze specific EML generation data, queries all logs/conversation history and analyzes it', status:'Active - Demo' },
      { initiative:'Oncall skill', description:'Investigate alerts using our own playbook', status:'Active - Demo' },
      { initiative:'Bug Investigation skill', description:'Triage jira tickets to determine the relevant team', status:'POC' },
      { initiative:'AICM plugin', description:"Bundle our shared skills using Wix's AICM system", status:'Future' },
    ],
  },
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
});

const SLIDE_INITIATIVES_DM = slide({
  template:'teamInitiatives',
  fields:{
    teamName:'DM',
    columns:['Initiative (Title)', 'Description (Purpose, AI, Integrations …etc)', 'Status'],
    rows:[
      { initiative:'Schema Explorer + builder extension [Tools]', description:'A vibe coded tool to debug dev/prod issues with manifests, schemas and their cache status: https://bo.wix.com/schema-explorer-app', status:'Active' },
      { initiative:'Optimus logs analyzer [Tool]', description:'A vibe coded tool to analyze optimus migration logs (running a migration can output very heavy reports, hard to read. The tool is extracting relevant information and warnings): https://bo.wix.com/optimus-results', status:'Active' },
      { initiative:'Task-to-pr [Workflow]', description:'A workflow to open an initial PR from a given task', status:'Working POC' },
      { initiative:'Experiments rollout [Workflow]', description:'A workflow to automate management of experiments rollout', status:'Active' },
      { initiative:'Merge-experiment [Workflow]', description:'A workflow to merge an experiment without handling the all the overhead of branch creation, prompting etc', status:'Working POC' },
      { initiative:'Bug pre-investigation [Workflow]', description:'A flow where a bug can have pre-investigation results, possibly even a fix, before the developer opens the ticket', status:'Future' },
      { initiative:'On call helper [Tool]', description:'A bot that will investigate oncall tags and give a pre answer, with knowledge of the codebase, opened issues and oncall history', status:'Future' },
    ],
  },
  meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' },
});

const PROFILE_FIELDS = {
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
};

const DIRECTION_PROFILES = {
  title:'Profile Alternatives',
  slides:[
    slide({ template:'profileCard',      fields:{ ...PROFILE_FIELDS }, meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' } }),
    slide({ template:'profileMagazine',   fields:{ ...PROFILE_FIELDS }, meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' } }),
    slide({ template:'profileCentered',   fields:{ ...PROFILE_FIELDS }, meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' } }),
    slide({ template:'profileCards',      fields:{ ...PROFILE_FIELDS }, meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' } }),
    slide({ template:'profileBoldSplit',  fields:{ ...PROFILE_FIELDS }, meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' } }),
    slide({ template:'profileDossier',    fields:{ ...PROFILE_FIELDS }, meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' } }),
    slide({ template:'profileMinimal',    fields:{ ...PROFILE_FIELDS }, meta:{ brand:'Editor Cluster', tr:'All Hands', bl:'May— 2026' } }),
  ],
};

const DIRECTION_TEAMS = {
  title:'Team AI Initiatives',
  slides:[
    SLIDE_INITIATIVES_VIEWER,
    SLIDE_INITIATIVES_PLATFORM,
    SLIDE_INITIATIVES_HARMONY,
    SLIDE_INITIATIVES_STUDIO,
    SLIDE_INITIATIVES_AISC,
    SLIDE_INITIATIVES_DM,
  ],
};

// ─── DIRECTION STICKY: Sticky on Mobile — the alternatives ──────────────────
//
// Working-group deck. Neutral comparison of the 4 options, recommendation at
// the end. Backed by scanner evidence from 354 Wix templates and screenshots
// of 6 representative templates (see /public/sticky-shots/).
//
// Numbers used throughout:
//   • 310 / 354 templates have sticky outside <header>/<footer> on DESKTOP   (87.6%)
//   • 333 / 354 on MOBILE                                                    (94.1%)
//   • 168 / 354 use the wixui-box container "designer-composed sticky" pattern on desktop
//   • 100 / 354 on mobile
//   • 1,203 sticky element instances desktop · 1,051 mobile (total across all templates)
//
const stickyOption = (n, name, oneLiner, desc, prosLabel, prosValue, consLabel, consValue, thirdLabel, thirdValue, diagnostic, badge) => slide({
  template:'levelDetail',
  fields:{
    command:`$ evaluate --option ${n}`,
    leftRows:[
      { label:'OPT', value:`OPT ${n}`, bold:true, ...(badge ? { badge } : {}) },
      { label:'NAME', value:name, bold:true },
      { label:'IN ONE LINE', value:oneLiner },
      { label:'WHAT IT IS', value:desc },
    ],
    rightRows:[
      { label:prosLabel, value:prosValue },
      { label:consLabel, value:consValue },
      { label:thirdLabel, value:thirdValue },
    ],
    diagnostic,
  },
  meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:`Option ${n}` },
});

export const DIRECTION_STICKY = {
  id: 'deck_direction_sticky',
  title: 'Sticky on Mobile — Alternatives',
  slides: [

    // ─── 1. Cover ──────────────────────────────────────────────────────────
    slide({
      theme:'black', template:'cover',
      fields:{
        eyebrow:'Editor · Mobile · Working group · 2026',
        num:'',
        title:'Sticky on mobile.<br/>What do we do?',
        blurb:'Four alternatives for how the mobile algorithm should treat <code>position: sticky</code>. Evidence from 354 Wix templates. A recommendation at the end.',
        tag:'Decision · Internal',
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Working group · 2026' },
    }),

    // ─── 2. Where sticky lives today (scanner stats) ───────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Baseline',
        title:'Sticky is<br/>everywhere.',
        titleSize:56,
        body:'We scanned all 354 Wix templates at desktop (1280) and mobile (390), counting <strong>position: sticky</strong> elements outside <code>&lt;header&gt;</code> / <code>&lt;footer&gt;</code>. Sticky shows up in nearly every template, on both viewports. Whatever we decide affects almost the entire catalog.',
        panel:{ kind:'metrics', data:[
          { num:'87.6%', label:'Templates · desktop', body:'310 / 354 have a sticky element outside header/footer.' },
          { num:'94.1%', label:'Templates · mobile',  body:'333 / 354 — sticky is even more common on the mobile breakpoint.' },
          { num:'1,203', label:'Total instances',      body:'Sticky elements counted across all desktop renders. 1,051 on mobile.' },
        ]},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Scanner data' },
    }),

    // ─── 3. Sticky isn't a component — it's a composition ──────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'The hard part',
        title:'Sticky isn\'t a<br/>component.<br/>It\'s a composition.',
        titleSize:48,
        body:'There is no "Sticky Section" widget we can special-case. Any element can get <code>position: sticky</code> — a button, a line, a text block, a container, an image. Designers compose sticky behavior from <em>combinations</em> of elements, offsets, parents, and scroll contexts.<br/><br/>That means heuristics can\'t pattern-match on a known shape. There is no known shape.',
        panel:{ kind:'image', data:{
          src:'/sticky-shots/3534-d.png',
          fit:'cover', bg:'#0a0a0a',
          tag:'Template 3534 · desktop',
          caption:'7 sticky elements outside header/footer on desktop, 8 on mobile. All composed from ordinary elements — no single sticky "widget" anywhere.',
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Framing' },
    }),

    // ─── 4. Why mobile is the harder case ──────────────────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Why mobile',
        title:'Mobile isn\'t a<br/>smaller desktop.',
        titleSize:48,
        body:'Mobile compositions are <strong>more minimalistic</strong>, <strong>more vertical</strong>, and live in a <strong>much narrower viewport</strong>. Sticky behavior that reads as "elegant pinned navigation" at 1280px reads as "screen-eating obstruction" at 390px. The two viewports have different compositional grammars — a sticky element rarely works in both untouched.',
        panel:{ kind:'split', data:{
          leftLabel:'Desktop · 1280px',
          left:[
            'Wide horizontal canvas',
            'Sticky elements share the viewport with content',
            'Pinned sidebars, nav bars, side panels feel natural',
            'Offset choices have lots of slack',
          ],
          rightLabel:'Mobile · 390px',
          rightAccent:true,
          right:[
            'Narrow vertical canvas',
            'A sticky element eats a meaningful % of the screen',
            'Sidebars don\'t translate; nav becomes a hamburger',
            'A 40px offset on desktop becomes 10% of mobile viewport',
          ],
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Why mobile' },
    }),

    // ─── 5. Section divider: Part 1 — the dependency ───────────────────────
    slide({
      theme:'yellow', template:'sectionDivider',
      fields:{
        num:'01',
        title:'Part 1.<br/>The dependency:<br/>mobile algorithm.',
        body:'Before we choose how to handle sticky on mobile, we need to be clear about which mobile-algorithm world we\'re in. The right answer for sticky changes depending on it.',
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Part 1 of 2' },
    }),

    // ─── 6. Current state ──────────────────────────────────────────────────
    slide({
      template:'levelDetail',
      fields:{
        command:'$ describe --mobile-algo current',
        leftRows:[
          { label:'STATE', value:'NOW', bold:true, badge:'TODAY' },
          { label:'NAME', value:'Grouping-triggered recalculation', bold:true },
          { label:'TRIGGER', value:'User drops a single element on the stage → the section\'s grouping model is recomputed → the mobile algorithm reruns → designer\'s tailored mobile layout is overridden by generic heuristics.' },
          { label:'SCOPE', value:'The algorithm runs per <strong>section</strong>, not per page. One section\'s damage doesn\'t cascade — but any section the user touches loses its hand-tuned mobile layout.' },
        ],
        rightRows:[
          { label:'CONSEQUENCE', value:'Template designers cannot build sophisticated mobile compositions, because the moment a user edits, the work evaporates. The result is that designers self-censor — they build mobile layouts close enough to the heuristic output that the "before/after" gap is small.' },
          { label:'IMPLICATION FOR STICKY', value:'In this world, even if we let designers craft a beautiful mobile sticky experience in the template, dropping a button blows it away. So heuristics become the de facto answer — and the answers are bad (see Part 2).' },
        ],
        diagnostic:'"If the user touches a section, does the designer\'s mobile work survive?" Today: no.',
      },
      meta:{ brand:'Editor · Mobile', tr:'Mobile algorithm', bl:'Current state' },
    }),

    // ─── 7. New state (in test) ────────────────────────────────────────────
    slide({
      template:'levelDetail',
      fields:{
        command:'$ describe --mobile-algo new',
        leftRows:[
          { label:'STATE', value:'NEW', bold:true, badge:'IN TEST' },
          { label:'NAME', value:'Locked sections, no recalculation', bold:true },
          { label:'TRIGGER', value:'Designer-authored sections can be marked <strong>locked</strong>. User drops an element → grouping changes → mobile algorithm does NOT rerun on locked sections. Designer\'s mobile layout is preserved.' },
          { label:'SCOPE', value:'Still per-section. The user\'s edits behave normally; only the designer\'s pre-tailored composition is protected from being clobbered.' },
        ],
        rightRows:[
          { label:'CONSEQUENCE', value:'Template designers can finally build sophisticated mobile compositions — including sticky — and trust they\'ll survive end-user editing. The "designer\'s mobile" becomes a real, durable artifact, not a starting point that gets overwritten.' },
          { label:'IMPLICATION FOR STICKY', value:'This unlocks a real answer for the template path: we can just <strong>play back what the designer built</strong>. No heuristics needed on template-derived sites.' },
        ],
        diagnostic:'"Does the designer\'s mobile work survive editing?" In this world: yes — for locked sections.',
      },
      meta:{ brand:'Editor · Mobile', tr:'Mobile algorithm', bl:'New (in test)' },
    }),

    // ─── 8. Why Part 1 gates everything ────────────────────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Why this matters first',
        title:'Part 1 decides<br/>what Part 2<br/>can even mean.',
        titleSize:44,
        body:'If we stay in the <strong>current</strong> world, "defer to the designer" isn\'t a viable Part 2 answer — the designer\'s work doesn\'t survive. We\'d be forced into heuristics, and heuristics on sticky lose (more on that in Part 2).<br/><br/>If we ship the <strong>new</strong> world, "defer to the designer" becomes the cleanest answer for the entire template path — which is most of our catalog (310 / 354 templates have sticky).',
        panel:{ kind:'accent', data:{
          tone:'yellow',
          eyebrow:'Pre-requisite',
          statement:'The locked-section world is the foundation. Without it, every option in Part 2 is worse.',
          tag:'Part 1 → Part 2',
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Gate' },
    }),

    // ─── 9. Section divider: Part 2 ────────────────────────────────────────
    slide({
      theme:'yellow', template:'sectionDivider',
      fields:{
        num:'02',
        title:'Part 2.<br/>How do we handle<br/>sticky on mobile?',
        body:'Two user paths. For each, what should the editor do when the mobile breakpoint is rendered?',
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Part 2 of 2' },
    }),

    // ─── 10. Two user paths ────────────────────────────────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'The split',
        title:'Two paths.<br/>Different answers.',
        titleSize:48,
        body:'A user editing a Wix site comes from one of two starting points. The right sticky-on-mobile behavior is different for each. Conflating them is how we end up with mediocre answers that satisfy neither.',
        panel:{ kind:'mapping', data:{
          leftEyebrow:'Template path',
          leftTitle:'Designer-crafted',
          left:[
            'Started from a template',
            'Designer already tailored the mobile breakpoint',
            'Sticky behavior is intentional',
            'Editor should preserve it',
          ],
          rightEyebrow:'Blank-site path',
          rightTitle:'User-built',
          right:[
            'Started from blank',
            'Designed for desktop, no mobile attention',
            'Sticky behavior is incidental',
            'Editor has to decide what to do',
          ],
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Two paths' },
    }),

    // ─── 11. Template path ─────────────────────────────────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Template path',
        title:'Defer to<br/>the designer.',
        titleSize:48,
        body:'For template-derived sites: <strong>play back the designer\'s mobile composition as authored.</strong> No heuristics, no "smart" overrides. The designer already made the calls — which stickies stay, which ones get disabled, what the offsets are.<br/><br/>This requires the <strong>new</strong> mobile-algorithm world (Part 1). In the current world, we can\'t honor this because user edits would erase the designer\'s work.',
        panel:{ kind:'image', data:{
          src:'/sticky-shots/3724-d.png',
          fit:'cover', bg:'#0a0a0a',
          tag:'Template 3724 · designer-tailored',
          caption:'4 sticky elements on desktop, 4 on mobile — the designer kept them all, deliberately. Honoring this is easy if we don\'t overwrite it.',
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Template path' },
    }),

    // ─── 12. Blank-site: four options at a glance ──────────────────────────
    slide({
      template:'levelGrid',
      fields:{
        title:'Blank-site path. Four options on the table.',
        navLeft:'Sticky · Mobile',
        navRight:'OPT 1 → OPT 4',
        levels:[
          { id:'OPT1', badge:'SIMPLEST', title:'Turn it off on mobile', desc:'Strip sticky on the mobile breakpoint. No sticky behavior at all.' },
          { id:'OPT2', title:'Keep desktop values as-is', desc:'Same sticky configuration on mobile as desktop. No translation.' },
          { id:'OPT3', title:'Bypass — offsets to zero', desc:'Sticky stays on, but all offsets become 0. A compromise translation.' },
          { id:'OPT4', badge:'AMBITIOUS', title:'Generic heuristics', desc:'Try to "be smart" — re-derive sticky on mobile from scratch.' },
          { id:'—', title:'(no fifth option)', desc:'These are the four credible answers. Combinations collapse into one of these.' },
          { id:'?', title:'Which one?', desc:'Recommendation at the end of this deck.' },
        ],
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Options at a glance' },
    }),

    // ─── 13. Option 1: Turn off ─────────────────────────────────────────────
    stickyOption(
      1, 'Turn sticky off on mobile',
      'When rendering the mobile breakpoint, strip <code>position: sticky</code> from every non-header/footer element.',
      'The mobile renderer ignores sticky entirely. Elements that were sticky on desktop become normal-flow elements on mobile. No re-layout, no offset translation, no special casing.',
      'PROS',
      '• Zero ambiguity — behavior is fully predictable.<br/>• Cannot break composition in unexpected ways.<br/>• Implementation is trivial: one rule, applied universally.<br/>• Matches what many designers already do manually (see evidence slide).',
      'CONS',
      '• Loses any sticky behavior the user intended on mobile.<br/>• For the blank-site path this is acceptable; for the template path it would be destructive (which is why this only applies to the blank-site path).',
      'WHEN IT WINS',
      'When the design wasn\'t tailored for mobile in the first place. Which is exactly the blank-site case.',
      '"What\'s the worst that can happen?" Nothing surprising. A scrollable page.',
      'SIMPLEST'
    ),

    // ─── 14. Option 2: Keep desktop values ─────────────────────────────────
    stickyOption(
      2, 'Keep desktop values as-is',
      'Whatever sticky configuration exists on desktop — properties, offsets, parents — is rendered identically on mobile.',
      'No translation layer. The mobile breakpoint inherits the desktop sticky setup verbatim. We don\'t try to interpret or adapt; we just don\'t touch.',
      'PROS',
      '• Cheap to implement — it\'s "do nothing."<br/>• Designer intent (if any) is preserved literally.<br/>• Reversible: easy to layer a different policy on top later.',
      'CONS',
      '• Desktop offsets are wrong at mobile scale — a 60px top offset can swallow most of a 390px viewport.<br/>• Sticky elements composed for a wide canvas often cover content on a narrow one.<br/>• We\'re not solving the problem, we\'re forwarding it.',
      'WHEN IT WINS',
      'Rare. Mostly when the sticky element is small, top-anchored, and the offset happens to land sanely on mobile by coincidence.',
      '"Are we taking a position?" No. We\'re passing the buck to whatever the user happened to do on desktop.',
      null
    ),

    // ─── 15. Option 3: Bypass — offsets to zero ────────────────────────────
    stickyOption(
      3, 'Bypass — keep sticky on, zero the offsets',
      'Sticky stays enabled on mobile, but every offset (top / bottom / left / right) is forced to 0.',
      'A middle path. We keep the <em>sticky semantics</em> (the element pins on scroll) but strip the <em>desktop-specific tuning</em> that doesn\'t translate. Element pins at the edge of the viewport instead of at a desktop-calibrated position.',
      'PROS',
      '• Preserves the "pinned on scroll" behavior when that\'s the user\'s intent.<br/>• Avoids the worst case of desktop offsets eating the mobile viewport.<br/>• Slightly more designer-friendly than turning off entirely.',
      'CONS',
      '• Highly dependent on <em>how</em> the user composed the sticky. There\'s no canonical way to build a sticky region on Wix — it\'s a blend of containers, parents, and offsets.<br/>• When the composition relies on the offset (e.g., a sticky element that should clear a fixed nav), zeroing breaks it.<br/>• Result is unpredictable per-template.',
      'WHEN IT WINS',
      'When sticky is built with the "preferred" structure we\'d document for designers. Outside that pattern, results are coin-flip.',
      '"Did we just make it half-broken in a different way?" Often, yes.',
      null
    ),

    // ─── 16. Option 4: Heuristics ──────────────────────────────────────────
    stickyOption(
      4, 'Generic heuristics',
      'Try to re-derive sane sticky behavior on mobile from scratch — classify elements, infer intent, choose offsets.',
      'The ambitious answer. We build a system that looks at the page, figures out which elements are "navigation-like" vs "content-like" vs "decorative," and applies sticky selectively with adjusted offsets.',
      'PROS',
      '• If it worked, would be the most "magical" experience — user does nothing, mobile looks great.<br/>• Could in principle handle complex cases the other options can\'t.',
      'CONS',
      '• Sticky is a composition, not a component — there\'s no pattern to detect (see slide 3).<br/>• Even <strong>non-sticky</strong> mobile composition heuristics don\'t hit 100%; sticky is harder.<br/>• Every miss is felt as "the editor broke my site" — high blast radius for low gain.<br/>• Expensive to build, expensive to debug, expensive to evolve.',
      'COST / BENEFIT',
      'High investment, ceiling is bounded by the impossibility of inferring intent from arbitrary compositions. Failure modes are worse than the other three options — because the heuristic confidently does the wrong thing.',
      '"What is the worst-case output?" Confidently wrong. Worse than doing nothing.',
      'AMBITIOUS'
    ),

    // ─── 17. Evidence wall #1: designers already disable mobile sticky ─────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Evidence',
        title:'Designers already<br/>turn sticky off<br/>on mobile.',
        titleSize:44,
        body:'In the scanner data, many templates have <strong>heavy sticky on desktop and almost none on mobile</strong>. These aren\'t bugs — they\'re design decisions. Template designers, working with full control, already conclude that mobile sticky is often not worth it.<br/><br/>This is real-world validation that "off on mobile" is a credible default — not a copout.',
        panel:{ kind:'image', data:{
          src:'/sticky-shots/3545-d.png',
          fit:'cover', bg:'#0a0a0a',
          tag:'Template 3545 · desktop',
          caption:'Template 3545: 19 sticky elements on desktop, 1 on mobile. Template 3578: 9 desktop, 0 mobile. The designer\'s deliberate choice was "off."',
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Evidence 1/2' },
    }),

    // ─── 18. Evidence wall #2: designer-crafted mobile sticky ──────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Evidence',
        title:'When designers<br/>do craft mobile sticky,<br/>it\'s composed.',
        titleSize:42,
        body:'When designers <em>do</em> keep sticky on mobile, the result is tailored — specific elements, specific offsets, specific parents. There is no pattern a heuristic could re-derive from "the page has these elements." The intent only lives in the design itself.<br/><br/>This is the case for "defer to the designer" on the template path — and the case <em>against</em> Option 4 on the blank-site path.',
        panel:{ kind:'image', data:{
          src:'/sticky-shots/3534-m.png',
          fit:'cover', bg:'#0a0a0a',
          tag:'Template 3534 · mobile',
          caption:'Template 3534: 8 sticky elements on mobile, all hand-placed. No heuristic would invent this composition; no heuristic can preserve it.',
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Evidence 2/2' },
    }),

    // ─── 19. The argument against heuristics ───────────────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'The argument',
        title:'Why heuristics<br/>lose on sticky.',
        titleSize:48,
        body:'The non-sticky mobile algorithm — which has been worked on for years against a far simpler problem (positioning, grouping) — still doesn\'t hit 100% on basic compositions. Sticky is strictly harder: it\'s a behavior assembled from arbitrary element combinations, scroll contexts, and offsets, with no canonical structure to anchor on.<br/><br/>Investing in sticky heuristics is climbing a steeper mountain with weaker footholds, for an outcome that\'s "confidently wrong" when it misses.',
        panel:{ kind:'split', data:{
          leftLabel:'What we can detect',
          left:[
            'That an element has position: sticky',
            'That it has some offset',
            'That it sits inside some parent',
            'Roughly where it is in the DOM',
          ],
          rightLabel:'What we can\'t infer',
          rightAccent:true,
          right:[
            'Whether sticky was the user\'s intent or an accident',
            'Whether the offset was tuned for desktop or universal',
            'Whether the element should pin to viewport or to parent',
            'What "looks right" on the narrow viewport',
          ],
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Anti-heuristics' },
    }),

    // ─── 20. Decision matrix ───────────────────────────────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Comparison',
        title:'The four options,<br/>side by side.',
        titleSize:44,
        body:'<strong>OPT 1 · Off</strong> — predictable, cheap, loses mobile sticky.<br/><strong>OPT 2 · Keep as-is</strong> — cheap, frequently broken at narrow widths.<br/><strong>OPT 3 · Bypass (offset 0)</strong> — variable quality, depends on composition.<br/><strong>OPT 4 · Heuristics</strong> — expensive, confidently wrong when wrong.<br/><br/>Across <strong>predictability</strong>, <strong>cost</strong>, and <strong>worst-case behavior</strong>, OPT 1 is the only option whose failure mode is "nothing surprising."',
        panel:{ kind:'metrics', data:[
          { num:'OPT 1', label:'Off',         body:'Predictable. Low cost. Failure mode = no sticky.' },
          { num:'OPT 3', label:'Bypass',       body:'Mixed. Low cost. Failure mode = subtly wrong.' },
          { num:'OPT 4', label:'Heuristics',   body:'Unpredictable. High cost. Failure mode = confidently wrong.' },
        ]},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Matrix' },
    }),

    // ─── 21. Our recommendation ────────────────────────────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'Recommendation',
        title:'Off on mobile.<br/>Plus designer-<br/>authored sticky<br/>on templates.',
        titleSize:40,
        body:'<strong>Blank-site path:</strong> OPT 1 — turn sticky off on the mobile breakpoint. Predictable, cheap, and matches what template designers already do by hand.<br/><br/><strong>Template path:</strong> defer to the designer — play back the mobile composition as authored. This requires the <strong>new locked-section</strong> mobile algorithm (Part 1).<br/><br/>Together: sticky on mobile becomes a <em>designer-curated feature</em>, not a heuristic-guessed one.',
        panel:{ kind:'accent', data:{
          tone:'yellow',
          eyebrow:'In one line',
          statement:'Designers get sticky on mobile. Users starting from blank don\'t — and that\'s the honest answer.',
          tag:'Recommendation',
        }},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Recommendation' },
    }),

    // ─── 22. What we\'d need from designers ────────────────────────────────
    slide({
      template:'twoColumn',
      fields:{
        eyebrow:'What follows',
        title:'A designer<br/>playbook.',
        titleSize:48,
        body:'If sticky on mobile becomes a designer-curated feature, designers need to know <em>how</em> to compose it for our renderer. Today there\'s no canonical "preferred way" to build a sticky region on Wix — that gap is part of why every option in Part 2 is hard.<br/><br/>The work here is small but real: pick a preferred composition pattern, document it, and steer template authors toward it.',
        panel:{ kind:'flow', data:[
          { title:'Pick a pattern',  body:'Decide which composition (container + element + offsets) we treat as canonical.' },
          { title:'Document it',     body:'Short guide for template designers: how to build sticky for mobile.', accent:true },
          { title:'Steer authors',   body:'Lightweight checks or hints when designers compose sticky outside the pattern.' },
        ]},
      },
      meta:{ brand:'Editor · Mobile', tr:'Sticky · Mobile', bl:'Designer playbook' },
    }),

    // ─── 23. Closing ───────────────────────────────────────────────────────
    slide({
      template:'closing',
      fields:{
        eyebrow:'The decision',
        quote:'Sticky on mobile is a designer feature, not a heuristic. Off by default for blank sites, on by intent for templates.',
        footEyebrow:'To resolve in this meeting',
        footLine:'1) Confirm Part 1 direction · 2) Commit to OPT 1 for blank-site path · 3) Greenlight the designer playbook.',
        tag:'Sticky · Mobile · 2026',
      },
      meta:{ brand:'Editor · Mobile', tr:'End.', bl:'Working group · 2026' },
    }),
  ],
};

// ─── Spectrum deck helpers (Sticky Mobile PDF style) ─────────────────────────
const spectrumLevelSlide = (levelId, levelName, { badge, signal, desc, markers, tell, thirdLabel, thirdValue, diagnostic }) => slide({
  template: 'spectrumLevel',
  fields: {
    levelId,
    levelLabel: formatSpectrumLevelId(levelId),
    levelName,
    badge: badge || undefined,
    signal,
    desc,
    markers,
    tell,
    thirdLabel: thirdLabel || 'THE WALL',
    thirdValue,
    diagnostic,
  },
  meta: { brand: 'Editor Cluster', tr: 'All Hands', bl: 'May— 2026' },
});

function formatSpectrumLevelId(id) {
  const n = String(id).replace(/\D/g, '');
  return `LEVEL ${n.padStart(2, '0')}`;
}

const SLIDE_SPECTRUM_PROFILE = slide({
  template: 'spectrumProfile',
  fields: {
    quote: 'AI-native is currently used as a binary when it should be a spectrum.',
    highlightWords: 'binary,spectrum.',
    name: 'Ann Miura-Ko',
    role: 'Co-founding Partner, Floodgate- pre-seed & seed VC',
    rows: [
      { label: 'PORTFOLIO', value: 'Lyft, Okta, Twitch, Outreach, Treasured' },
      { label: 'PRESS', value: '"Most powerful woman in startups" — Forbes' },
      { label: 'ACADEMIC', value: 'Stanford PhD — technology & market dynamics' },
      { label: 'KEY INSIGHT', value: 'A company where employees use ChatGPT to summarize meetings is not the same as one where AI agents query systems of record and take bounded action', badge: 'CORE THESIS' },
    ],
  },
  meta: { brand: 'Editor Cluster', tr: 'All Hands', bl: 'May— 2026' },
});

export const DIRECTION_SPECTRUM = {
  id: 'deck_direction_spectrum',
  title: 'Sticky Mobile (PDF style)',
  slides: [
    slide({
      template: 'stickyMobileCover',
      globalHeader: false,
      fields: {
        editorLabel: 'Editor',
        designersLabel: 'Designers',
        centerTitle: 'Sticky on Mobile',
        dateLabel: 'Date',
        date: 'May 2026',
        titlePrimary: 'Mobile Algo',
        titleSecondary: 'Sticky Expressions',
      },
    }),
    SLIDE_SPECTRUM_PROFILE,
    spectrumLevelSlide('L0', 'AI as Theater', {
      signal: 'Tools exist. Nothing changes.',
      desc: "AI tools are present but don't complete any business process end-to-end. Adoption is performative — announcements, pilots, demos — but no workflow has actually changed.",
      markers: 'AI in strategy decks but absent from daily work. Pilots never graduate to production.',
      tell: 'No process removed or replaced. Headcount unchanged. AI is a line item, not an operating change.',
      thirdValue: '"If we turned off every AI tool tomorrow, would anyone\'s job change?"',
      diagnostic: '"If we turned off every AI tool tomorrow, would anyone\'s job change?"',
    }),
    spectrumLevelSlide('L1', 'Personal Productivity', {
      badge: 'MOST ORGS',
      signal: "Individuals use AI. The org doesn't.",
      desc: "Individuals adopt AI independently - drafting, summarizing, coding. Gains are real but isolated. No shared tooling, no process change. Each person's AI usage is invisible to the system.",
      markers: 'Engineers use Copilot. PMs use ChatGPT. Designers use Midjourney. None of it coordinated or measured.',
      tell: 'If one person leaves, their AI workflows leave with them. Nothing documented, shared, or institutionalized.',
      thirdValue: 'This is where most companies claiming "AI-forward" sit. Individual tool use masquerades as transformation.',
      diagnostic: '"AI-native is currently used as a binary when it should be a spectrum."',
    }),
    spectrumLevelSlide('L2', 'Team Workflow', {
      signal: 'Teams share AI processes — within their walls.',
      desc: "Teams have shared AI tools and processes within functional boundaries. Engineering has its pipeline, marketing has its workflow. Real gains — but workflows don't cross teams.",
      markers: 'Standardized AI toolchains within teams. Shared prompts, templates, pipelines. Team-level metrics improve.',
      tell: 'Cross-team handoffs are still manual. Data flows through meetings, tickets, docs — not integrated AI systems.',
      thirdValue: 'L2→L3 is the hardest jump. Requires shared data models, integrated systems of record, cross-team trust in AI actions.',
      diagnostic: '"Can an AI workflow in one team trigger or feed a workflow in another?"',
    }),
    spectrumLevelSlide('L3', 'Organizational Infrastructure', {
      badge: 'INFLECTION',
      signal: 'AI acts across functions. The org chart changes.',
      desc: 'AI agents act across integrated systems and functions. Non-engineers create shareable workflows. Layers compress, roles merge, new functions emerge. The org chart visibly changes.',
      markers: 'Fewer management layers. AI agents query systems of record and take bounded action. Non-engineers build workflows.',
      tell: 'Roles that coordinated between teams replaced by AI-powered systems. Builder-to-manager ratio shifts dramatically.',
      thirdLabel: 'INFLECTION',
      thirdValue: 'This is where most companies claiming "AI-forward" sit. Individual tool use masquerades as transformation.',
      diagnostic: '"Has your org chart changed because of AI - not just your tool stack?"',
    }),
    spectrumLevelSlide('L4', 'Compounding OS', {
      signal: 'AI learns from itself. The org gets smarter automatically.',
      desc: 'AI continuously learns and improves from past runs. Non-engineers ship production tools. Hierarchy flattens. Each cycle makes the next faster — compounding advantage, not linear.',
      markers: 'Non-engineers ship production-grade tools. AI systems improve from accumulated data and feedback loops.',
      tell: "Last quarter's AI output is measurably worse than this quarter's — not from new features, but from self-learning.",
      thirdLabel: 'THE MOAT',
      thirdValue: 'Competitive advantage becomes structural. Competitors can copy your tools but not your accumulated learning.',
      diagnostic: '"Is your AI getting better on its own - without engineers manually improving it each time?"',
    }),
    spectrumLevelSlide('L5', 'Self-Driving', {
      signal: 'Humans govern. The system operates.',
      desc: 'Core operating loops run autonomously — sensing, diagnosing, acting, learning. Humans set strategy, define boundaries, handle exceptions. The system does the rest. No org fully operates here today.',
      markers: 'Autonomous sense-diagnose-act-learn loops. Humans intervene by exception, not by default.',
      tell: 'Organization responds to market shifts faster than any human decision chain could. Adaptation is continuous, not quarterly.',
      thirdLabel: 'REALITY',
      thirdValue: 'No organization is fully here. This is the north star — the direction, not the destination.',
      diagnostic: '"Could the core business run for a week with only strategic oversight and exception handling?"',
    }),
    slide({
      template: 'clusterExamples',
      fields: {
        titleBefore: 'Examples from the',
        titleAccent: 'Cluster',
        linkText: 'Link to full presentation',
        cards: [
          { title: 'BA On Call', description: "What's on fire? morning report — it scans 9 production tables, detects statistical anomalies" },
          { title: 'Heavy Migrations', description: 'Finished running a Sled2 → Sled3 migration with AI-assisted rollback planning.' },
          { title: 'Knowledge Skills /ask-ep', description: 'On-demand platform knowledge for UX designers, PMs, developers, and vertical teams.', status: 'Active' },
          { title: 'AI Code Review', description: 'Code review skill that enforces our specific principles, architectural invariants, forbidden patterns, design boundaries.', status: 'Demoable, in trials' },
        ],
      },
      meta: { brand: 'Editor Cluster', tr: 'All Hands', bl: 'May— 2026' },
    }),
    slide({
      template: 'spectrumLevelList',
      fields: {
        titleBefore: 'All',
        titleAccent: 'Levels',
        items: [
          { level: 'LEVEL 00', name: 'AI as Theater', comment: '// Tools exist. Nothing changes. No process completed end-to-end.' },
          { level: 'LEVEL 01', name: 'Personal Productivity', comment: '// Individuals use AI. No org integration. No shared tooling.' },
          { level: 'LEVEL 02', name: 'Team Workflow', comment: "// Shared AI within teams. Workflows don't cross boundaries." },
          { level: 'LEVEL 03', name: 'Org Infrastructure', comment: '// AI acts across functions. Org chart changes. Non-engineers build workflows.' },
          { level: 'LEVEL 04', name: 'Compounding OS', comment: '// AI learns from past runs. Non-engineers ship prod tools. Hierarchy flattens.' },
          { level: 'LEVEL 05', name: 'Self-Driving', comment: '// Autonomous operating loops. Humans govern strategy & exceptions.' },
        ],
      },
      meta: { brand: 'Editor Cluster', tr: 'All Hands', bl: 'May— 2026' },
    }),
  ],
};

// Default export for backwards compatibility
export const SEED_DECK = DIRECTION_A;

export const ALL_DIRECTIONS = [
  { key: 'spectrum', label: 'Sticky Mobile (PDF)', deck: DIRECTION_SPECTRUM },
  { key:'sticky', label:'Sticky on Mobile — Alternatives', deck:DIRECTION_STICKY },
  { key:'directionA', label:'A — The Ladder', deck:DIRECTION_A },
  { key:'directionB', label:'B — Mirror, then Model', deck:DIRECTION_B },
  { key:'directionC', label:'C — The Diagnostic', deck:DIRECTION_C },
  { key:'directionD', label:'D — Terminal Split', deck:DIRECTION_D },
  { key:'directionE', label:'E — Modern Split', deck:DIRECTION_E },
  { key:'teams', label:'Teams — Initiatives', deck:DIRECTION_TEAMS },
  { key:'profiles', label:'Profile Alts', deck:DIRECTION_PROFILES },
];
