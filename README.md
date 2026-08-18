# Mind Model — Active Inference Simulator

A cognitive neuroscience sandbox. You don't control the character; you control its *world*. Noa plans by minimising expected free energy, and the only way to change what it does is to change what it believes — by placing torches, evidence signs, scents and sounds that feed it new sensory evidence.

Six scenarios walk through phobia, hallucination, curiosity, Pavlovian conditioning, perseveration and joint action, each with a live readout of the beliefs, prediction errors and policy evaluations driving every step.

**Live:** https://mind-model.ai.studio/

---

## Contents

- [How the simulation works](#how-the-simulation-works)
- [Scenarios](#scenarios)
- [Tools](#tools)
- [Reading the interface](#reading-the-interface)
- [Getting started](#getting-started)
- [Scripts](#scripts)
- [Project structure](#project-structure)
- [Updating the live deployment](#updating-the-live-deployment)
- [Deploying somewhere new](#deploying-somewhere-new)
- [Writing your own scenario](#writing-your-own-scenario)
- [Known limitations](#known-limitations)
- [Tech stack](#tech-stack)

---

## How the simulation works

Every step runs one full active inference cycle:

```
1. SENSE        Sample the visual field (line-of-sight, brightness), sounds,
                scents and interoception (heart rate, safety estimate).

2. PREDICT      Compare each belief's top-down prediction against the bottom-up
                evidence. The mismatch is the prediction error ε.

3. UPDATE       Revise beliefs: posterior = prior + precision × learning-rate × ε.
                Free energy F = 1.5·ε + 0.5·(belief entropy).

4. EVALUATE     Score five candidate policies (Up/Down/Left/Right/Stay) by
                expected free energy G(π) = −(epistemic value + pragmatic value),
                then softmax over −G.

5. ACT          Execute the winning policy, interact with any tile it lands on,
                and update affect from dF/dt.
```

**Epistemic value** is what Noa expects to *learn*: novelty of unvisited tiles, ambiguity waiting to be resolved, and pull toward beacons the player has placed. **Pragmatic value** is what Noa expects to *get*: proximity to the goal, baits, scents, and avoidance of anything it believes is dangerous.

Both are computed over walkable path distance rather than straight-line distance, so Noa plans around walls instead of pressing itself against them. When a goal is genuinely unreachable — a gate is shut — the pragmatic drive switches off and epistemic value takes over, which is what sends Noa off to investigate a lever or stand on a pressure plate.

Affect is derived, not scripted. Valence tracks the rate of change of free energy (F falling feels good), arousal tracks prediction error, curiosity tracks the epistemic value of the chosen action, and fear tracks the strongest hazard belief.

Everything runs locally in the browser. There are no network calls and no API keys.

---

## Scenarios

| # | Scenario | Concept | The lesson |
| --- | --- | --- | --- |
| 1 | The Phobia of the Red Door | Hyper-precise priors | A 95%-certain trauma prior makes the door's expected cost catastrophic. Only high-precision safety evidence next to the door moves it. |
| 2 | Shadows in the Predictive Brain | Precision-weighted errors | At 65% sensory noise the top-down prior wins and harmless shadows are hallucinated as predators. Light restores bottom-up precision. |
| 3 | The Epistemic Switch | Expected free energy | The fruit is behind a gate; the lever is a 50/50 unknown. Noa won't cross a room for a switch it has no reason to care about, nor pull one that might raise an alarm. |
| 4 | Sensory Binding & Pavlovian Cueing | Conditioned attractors | Chime and fruit scent co-occurring bind into one prediction, until the sound alone carries pragmatic value. |
| 5 | Breaking the Perseveration Loop | Precision over habits | Pathological certainty about which room is safe traps Noa in a two-tile ritual. Entropy shatters the attractor. |
| 6 | Social Inference & The Mirror Automaton | Joint active inference | The green gate needs both plates pressed at once. Kip walks to whichever plate Noa isn't on — you only have to give Noa a reason to hold its own. |

Every scenario is unsolvable without tools and solvable with them; that gap is the puzzle.

---

## Tools

| Tool | Cognitive effect |
| --- | --- |
| **Illumination Torch** | Raises local brightness, which raises sensory precision and collapses darkness-driven threat beliefs. |
| **Safety Evidence Sign** | Strong counter-evidence against a hazard prior, and a powerful epistemic beacon when placed on an unresolved affordance. |
| **Aromatic Fruit Bait** | Pure pragmatic attractor. Leads Noa along the corridor — and will hold it in place indefinitely if left underfoot. |
| **Resonant Bell Chime** | Auditory cue. Worthless until conditioning binds it to reward, then it pulls as hard as the bait. |
| **Calming Scent** | Dampens the fear response near Noa. |
| **Stochastic Spore** | Injects entropy, lowering precision on over-confident habit beliefs. |
| **Echolocation Probe** | Resolves ambiguity about a mechanism and marks it as worth travelling to. |

---

## Reading the interface

**The cycle strip** across the top animates through all five stages on every step, with the live metric for each: tiles in the visual field, ε, F, the winning policy, and the resulting position.

**The world canvas** dims tiles outside Noa's line of sight and shades the rest by brightness, so you see roughly what Noa sees. Hovering with a tool selected previews its radius. Click a placed tool to remove it.

**The Mind Inspector** on the right shows each belief as a probability bar with its two competing hypotheses, the emotional state, the five scored policies with their epistemic/pragmatic breakdown, and a scrolling inner monologue explaining each decision in plain language.

**The Cognitive Codex** (top bar) is the glossary: free energy, precision, epistemic value, priors.

**Sandbox Neuro-Lab** gives you a blank canvas, every tool, a tile painter, and live sliders for Noa's five hyperparameters — precision weight, epistemic weight, sensory noise, fear threshold and habit persistence.

---

## Getting started

**Prerequisites:** Node.js 20+.

```bash
git clone <your-repo-url>
cd Mind-Model
npm install
npm run dev
```

Open **http://localhost:3000**. No `.env` and no API key are needed — the simulation is entirely local.

To run exactly what production runs:

```bash
npm run build
npm start
```

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Vite dev server with HMR on port 3000 |
| `npm run build` | `vite build` → `dist/`, then bundles the static server to `dist/server.cjs` |
| `npm start` | Runs the production server (reads `PORT`, defaults to 3000) |
| `npm run lint` | TypeScript check, no emit |
| `npm run clean` | Removes `dist/` |

---

## Project structure

```
├── server.ts                        Static production server (PORT-aware, SPA fallback)
├── index.html                       App shell and page metadata
├── vite.config.ts                   React + Tailwind v4 plugins
└── src/
    ├── main.tsx                     React root
    ├── App.tsx                      Scenario state, simulation timer, layout
    ├── index.css                    Tailwind import + fade-in keyframes
    ├── types/index.ts               Beliefs, policies, mind state, scenario schema
    ├── data/
    │   ├── scenarios.ts             The six levels (ASCII maps + priors)
    │   └── tools.ts                 Tool definitions and radii
    ├── engine/
    │   ├── activeInference.ts       The simulation: sensing, belief updates,
    │   │                            path planning, policy evaluation, affect
    │   └── soundSynth.ts            Web Audio cues, synthesized live
    ├── utils/storage.ts             Progress persistence
    └── components/
        ├── Header.tsx               Transport controls, speed, mute, codex
        ├── ActiveInferenceLoop.tsx  The five-stage cycle strip
        ├── WorldCanvas.tsx          Grid, agents, tools, FOV shading
        ├── MindInspector.tsx        Beliefs, affect, policies, monologue
        ├── Toolbox.tsx              Tool palette
        ├── ScenarioSelector.tsx     Level browser + sandbox toggle
        ├── SandboxControls.tsx      Hyperparameter sliders, tile painter
        └── CognitiveCodexModal.tsx  Glossary
```

### Map notation

Scenarios are authored as ASCII and parsed by `parseAsciiGrid`:

```
#  wall          R  red door (opens when fear drops)     L  lever
.  floor         B  blue door (opens via lever)          P  pressure plate
F  goal fruit    G  green door (opens on both plates)    S  shadow
```

---

## Updating the live deployment

The live app at **https://mind-model.ai.studio/** is a [custom AI Studio subdomain](https://ai.google.dev/gemini-api/docs/aistudio-deploying) pointing at a Cloud Run service. Two routes to ship an update; they can overwrite each other, so pick one and stay with it.

> **Read this first.** The original repo had **no `start` script and no server**, so `npm start` failed with *"Missing script: start"* and `vite preview` binds port 4173 on localhost while ignoring `$PORT`. A Cloud Run source deploy of the old code had nothing valid to run. This version adds `server.ts` and a `start` script, so a plain `gcloud run deploy --source .` now works. If your current live revision was published by AI Studio, it is running AI Studio's own generated wrapper rather than anything in the repo — which is why the site works today despite that gap.

### Option A — Republish from AI Studio

Best if AI Studio Build mode is still where you edit.

1. Open the app in [AI Studio](https://aistudio.google.com/app/apps) in **Build** mode.
2. Bring the corrected files across. Changed: `src/App.tsx`, `src/types/index.ts`, `src/engine/activeInference.ts`, `src/data/scenarios.ts`, `src/components/ActiveInferenceLoop.tsx`, `src/components/WorldCanvas.tsx`, `src/index.css`, `index.html`, `package.json`, `metadata.json`. New: `server.ts`, `src/utils/storage.ts`.
3. Click **Publish** in the top right.
4. In the deployment configuration, confirm the **Custom URL** field still reads `mind-model`. Leaving it unchanged keeps the same public address.
5. Click **Publish App** and wait for the deploy to finish.

> **Do not unpublish or delete the app to "start clean".** Custom subdomains are released on unpublish and reassigned first-come, first-served — `mind-model` could be taken before you republish.

### Option B — Deploy straight to Cloud Run from this repo

Best now that the code has moved well past what AI Studio generated. Needs the [gcloud CLI](https://cloud.google.com/sdk/docs/install).

```bash
gcloud auth login
gcloud config set project YOUR_PROJECT_ID

# Find the service behind mind-model.ai.studio
gcloud run services list --platform managed
```

Take the service **name** and **region** from that output, then from the repo root:

```bash
gcloud run deploy SERVICE_NAME \
  --source . \
  --region REGION
```

Cloud Run builds with Buildpacks, which run `npm run build` and then `npm start`. The custom domain follows the service, so `mind-model.ai.studio` picks up the new revision as soon as traffic shifts. You don't need `--port`: the server reads `PORT` from the environment.

No secrets or environment variables are required — this app makes no API calls. (`@google/genai` was listed as a dependency but never imported; it has been removed.)

### Verify the update

```bash
BASE=https://mind-model.ai.studio

curl -s $BASE/api/health
curl -s $BASE/ | grep -o "<title>.*</title>"     # should read "Mind Model — Active Inference Simulator"
curl -s -o /dev/null -w "%{http_code}\n" $BASE/some/deep/route   # 200 via SPA fallback
```

Then load the site and check: scenario 1 stalls at the red door with no tools, and clears it once you place a Safety Sign and Torch beside the door; the five-stage cycle strip animates rather than sitting on stage 5; and a solved scenario stays ticked after a refresh.

### Rolling back

```bash
gcloud run revisions list --service SERVICE_NAME --region REGION
gcloud run services update-traffic SERVICE_NAME --region REGION \
  --to-revisions PREVIOUS_REVISION_NAME=100
```

### A note on caching

`server.ts` sends `Cache-Control: no-cache` for `index.html` and a one-year immutable cache for hashed assets in `/assets`. That combination is what makes updates take effect immediately — without it, returning visitors can keep booting the previous deployment's JavaScript. If you ever see stale behaviour after a deploy, hard-refresh once and check those headers are present.

---

## Deploying somewhere new

```bash
gcloud run deploy mind-model \
  --source . \
  --region europe-west1 \
  --allow-unauthenticated
```

The app is fully stateless — progress lives in the visitor's browser — so it scales to zero between sessions with no data loss.

---

## Writing your own scenario

Append a `ScenarioLevel` to `SCENARIOS` in `src/data/scenarios.ts`.

1. **Draw the map** as ASCII and run it through `parseAsciiGrid`. Check that the route you intend is the *only* route: it is easy to leave a gap that lets Noa walk around the obstacle your lesson is about, which silently turns the puzzle into a stroll.
2. **Set `winCondition.targetPos` to the exact goal tile.** The engine honours it literally.
3. **Declare every belief the level depends on.** The engine looks beliefs up by id — `red_door_danger`, `shadow_is_monster`, `lever_unlocks_door`, `chime_signals_reward`, `habit_safety`, `dual_plate_cooperation`. A hazard the player is meant to talk Noa out of needs its belief present, or it sits at the engine default with no way to shift it.
4. **Use `category: 'hazard'`** for anything that should register as fear. Other categories are informational and deliberately do not feed the fear readout.
5. **Give the player a lever to pull.** Long-range attraction comes only from placed tools, so make sure the scenario's `availableTools` include something that can reach the thing you want investigated.

Sanity check by playing it twice: once with no tools (it should stall) and once with the intended solution (it should clear).

---

## Known limitations

- **Progress persistence covers completed scenarios only.** An in-progress board — placed tools, painted tiles, Noa's current beliefs — is not saved across a refresh.
- **Kip is deliberately simple.** The companion walks to the free plate; it does not run its own inference loop, so scenario 6 models coordination rather than genuine theory of mind.
- **One agent, one grid.** The engine assumes a single inferring agent on a rectangular grid with 4-connected movement.
- **Belief updates are hand-written per belief id** rather than a general generative model, so new mechanics mean new branches in `updateBeliefs`.
- **No mobile layout pass.** The three-column workspace is usable but cramped below tablet width.

---

## Tech stack

React 19 · TypeScript 5.8 · Vite 6 · Tailwind CSS v4 · Express 4 · Framer Motion · lucide-react · canvas-confetti · Web Audio API

The free energy formulation follows Karl Friston's active inference framework; the scenarios are illustrative teaching models, not published simulations.

---

## License

Add a `LICENSE` file to the repository root to make the terms explicit.
