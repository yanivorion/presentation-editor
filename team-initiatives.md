# Team AI Initiatives — Editor Cluster

## Viewer

| Initiative | Description | Status |
|---|---|---|
| **Prybar** | A thin authenticated wrapper around playwright-cli. It gives you a logged-in Wix browser session and a local TB dev environment in both live-sites and editor. | Active |
| **Heavy Migrations** | Finished running a Sled2 -> Sled3 migration. Now running a "Remove Carmi" Effort spearheaded by AI. | Active / POC |
| **Integrate Wix AI Solutions** | We started evaluating / testing Wix given tools: Automatic Code Reviews (participating in beta stage, we're not happy with it), remote dev machines for SLA fixes / Skipped tests. | POC |
| **Dev Buddy** | A personal assistant that implements a spec-driven SW development flow. Will be the entry point to any new development endeavour. | Future |
| **Repo AI Readiness** | - **D2D QOL** - dedicated skills and tools (merge-exp, deploy-previews). - **Domain Mastery** - Knowledge base of past & current design decisions for each feature. - **PR Context Enrichment** - Add a hidden summarized context of sessions into PRs. | Active / Future |
| **AI Awareness** | - A dedicated 2 day workshop on AI mastery. - Weekly AI Council - share ideas and decide on company-wide standards. | Future |

---

## Platform

| Initiative | Description | Status |
|---|---|---|
| **Knowledge Skills** (/ask-ep, /ask-builder, /ask-wix) | On-demand platform knowledge for UX designers, PMs, developers, and vertical teams. Answers from curated knowledge base + live Slack/GitHub/Docs — reduces dependency on specific people for platform understanding. | Active |
| **Product/UX: NotebookLM** - product knowledge curation | Per-feature knowledge notebooks aggregating docs, specs, and designs into one queryable source for product and UX workflows. | Active |
| **Product/UX: Prototyping tools and repo** (/prototype-composition) | Generate interactive HTML prototypes from descriptions. Enables faster alignment between UX, product, and developers — shared artifact instead of verbal handoffs, explain complex topics with editor+wds shards for consistency. | Active |
| **Integration: Migration Skills** (/extract-contexts, /create-context-provider, /create-site-widget) | For vertical teams migrating to Builder. Analyzes legacy controllers, proposes Context Provider decomposition, scaffolds required files — codifies patterns so each team doesn't start from scratch. | Active |
| **Dev: AI-Native Repo Setup** | AGENTS.md + xai comments + .ai/ templates - internal patterns. Implements according to Wix and EP conventions. | Active |
| **Dev: Sled 3 Test Migration** | AI-assisted migration of EP test files from sled 2 to Playwright. | In Progress |

---

## Editor Harmony

| Initiative | Description | Status |
|---|---|---|
| **The Brain** | Knowledge base for features in progress, Harmony-level knowledge and Harmony-specific skills from all disciplines. | POC (Demo) |
| **Automatic tester** | Performs testing activities in the browser using playwright mcp according to the provided scenarios. In comparison with Argus testing tool released by Mobile team. | POC (Demo) |
| **Playwright test writer** | Transforms written scenario into playwright test. Later will be re-used in various scenarios like: bugs validation, additional regression testing. | POC |
| **User Action Analysis** | Replaces tedious and overwhelming user actions identification using event snitch to quick and effective analysis with trino mcp. Solution is handed over to CCQA. | Active |
| **BA On Call** | "What's on fire?" morning report — it scans 9 production tables, detects statistical anomalies across Harmony's key health signals, and delivers a prioritized list of what needs attention today. Pinpoints exact time of regression and identifies which AB or GA rollout caused it. | Active (Demo) |

---

## Studio

| Title | Description | Status |
|---|---|---|
| **Domain intelligence** | Curated knowledge base of design principles, architecture, and invariants, distilled from years of internal docs and presentations. Makes implicit rules explicit and machine-readable. | Demoable, in trials |
| **AI Code Review** | Code review skill that enforces our specific principles, architectural invariants, forbidden patterns, design boundaries. Not generic feedback. Checks what actually breaks things in this codebase, including bigger-picture fit. | Demoable, in trials |
| **Full AI Development Method** | Spec-first protocol where AI produces a spec, architecture, and test plan before writing code, each gated on evidence, not plausibility. Defines what a quality spec looks like and what "done" means. Makes AI output reviewable, not just convincing. | POC |
| **AI Driven Migrations** | AI as primary executor on large-scale mechanical migrations. Progress tracked across sessions. E.g. - Redux to signals, sled2->3, design system migration, etc. | Active |
| **Reusable AI Workflows (skills)** | Slash-command skills for repeating tasks: create a store, clean an experiment, audit a public API, verify a migration. Encodes institutional knowledge so it's applied consistently. | Active |

---

## AI SC

| Initiative | Description | Status |
|---|---|---|
| **Project Standardization** | Ensure all our project adhere to the same structure, so we can re-use coding skills easily (docs/architecture/glossary/etc). | Done |
| **Domain Knowledge** | Make sure all our projects contain needed docs and references needed for agents, focus on knowledge not encoded in code. | Ongoing |
| **Coding workflow skills** | Leverage the standard project structure to create standard coding workflows (e.g. add new EML capabilities). | Ongoing |
| **Knowledge Graph for Other projects** | A lot of our features rely on knowledge from other teams, we want to make sure agents know how to get to it when they need to. | Future |
| **EML debug skill** | Easily debug/investigate/analyze specific EML generation data, queries all logs/conversation history and analyzes it. | Active - Demo |
| **Oncall skill** | Investigate alerts using our own playbook. | Active - Demo |
| **Bug Investigation skill** | Triage jira tickets to determine the relevant team. | POC |
| **AICM plugin** | Bundle our shared skills using Wix's AICM system. | Future |

---

## DM

| Initiative (Title) | Description (Purpose, AI, Integrations …etc) | Status |
|---|---|---|
| **Schema Explorer + builder extension** [Tools] | A vibe coded tool to debug dev/prod issues with manifests, schemas and their cache status: https://bo.wix.com/schema-explorer-app | Active |
| **Optimus logs analyzer** [Tool] | A vibe coded tool to analyze optimus migration logs (running a migration can output very heavy reports, hard to read. The tool is extracting relevant information and warnings): https://bo.wix.com/optimus-results | Active |
| **Task-to-pr** [Workflow] | A workflow to open an initial PR from a given task. | Working POC |
| **Experiments rollout** [Workflow] | A workflow to automate management of experiments rollout. | Active |
| **Merge-experiment** [Workflow] | A workflow to merge an experiment without handling the all the overhead of branch creation, prompting etc. | Working POC |
| **Bug pre-investigation** [Workflow] | A flow where a bug can have pre-investigation results, possibly even a fix, before the developer opens the ticket. | Future |
| **On call helper** [Tool] | A bot that will investigate oncall tags and give a pre answer, with knowledge of the codebase, opened issues and oncall history. | Future |
