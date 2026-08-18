import { ScenarioLevel, TileType } from '../types';

// Helper to create grid from ASCII visual layout
function parseAsciiGrid(ascii: string[]): { grid: TileType[][]; width: number; height: number } {
  const height = ascii.length;
  const width = ascii[0].length;
  const grid: TileType[][] = Array.from({ length: height }, () => Array(width).fill('empty'));

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const char = ascii[y][x];
      switch (char) {
        case '#': grid[y][x] = 'wall'; break;
        case 'R': grid[y][x] = 'red_door'; break;
        case 'B': grid[y][x] = 'blue_door'; break;
        case 'G': grid[y][x] = 'green_door'; break;
        case 'F': grid[y][x] = 'goal_fruit'; break;
        case 'H': grid[y][x] = 'hazard'; break;
        case 'S': grid[y][x] = 'shadow'; break;
        case 'L': grid[y][x] = 'lever'; break;
        case 'C': grid[y][x] = 'companion'; break;
        case 'P': grid[y][x] = 'target_pad'; break;
        case '.':
        default:
          grid[y][x] = 'empty';
          break;
      }
    }
  }
  return { grid, width, height };
}

// Level 1: The Red Door
const l1Ascii = [
  '#######',
  '#.....#',
  '#.#####',
  '#...R.F',
  '#######',
];
const l1Data = parseAsciiGrid(l1Ascii);

// Level 2: Shadows of the Mind
const l2Ascii = [
  '#########',
  '#.......#',
  '#S#S#S#S#',
  '#.......F',
  '#########',
];
const l2Data = parseAsciiGrid(l2Ascii);

// Level 3: The Deceptive Lever & Epistemic Clue
const l3Ascii = [
  '#########',
  '#...L...#',
  '#.#######',
  '#.....B.F',
  '#########',
];
const l3Data = parseAsciiGrid(l3Ascii);

// Level 4: Pavlovian Conditioning
const l4Ascii = [
  '##########',
  '#........#',
  '#.######.#',
  '#....S..F#',
  '##########',
];
const l4Data = parseAsciiGrid(l4Ascii);

// Level 5: Breaking Perseveration
const l5Ascii = [
  '#########',
  '#...#...#',
  '#...#...#',
  '#.......F',
  '#########',
];
const l5Data = parseAsciiGrid(l5Ascii);

// Level 6: Social Inference & Mirror Automaton
const l6Ascii = [
  '############',
  '#....P.....#',
  '#.########.#',
  '#....P...#GF',
  '############',
];
const l6Data = parseAsciiGrid(l6Ascii);

export const SCENARIOS: ScenarioLevel[] = [
  {
    id: 'red_door_phobia',
    title: '1. The Phobia of the Red Door',
    subtitle: 'Overcoming Trauma Priors via Bayesian Counter-Evidence',
    concept: 'Active Inference & Hyper-Priors',
    description: 'Noa believes with 95% certainty that the Red Door is lethal due to a traumatic past prior. The goal fruit lies just beyond it. Because expected free energy treats danger as catastrophic, Noa refuses to approach. Place safe clues and light to deliver sensory evidence that updates Noa’s belief.',
    neuroScienceLesson: 'In predictive processing, phobias and PTSD are modeled as hyper-precise top-down priors that resist updating. To change the belief, we must expose the brain to high-precision sensory evidence in safe gradations.',
    gridWidth: l1Data.width,
    gridHeight: l1Data.height,
    grid: l1Data.grid,
    initialCharacterPos: { x: 1, y: 1 },
    initialBeliefs: [
      {
        id: 'red_door_danger',
        name: 'Red Door Hazard',
        description: 'Prior probability that the red portal contains lethal danger.',
        hypothesisA: 'Lethal Hazard',
        hypothesisB: 'Harmless Passageway',
        probabilityA: 0.95,
        priorProbabilityA: 0.95,
        precision: 0.88,
        category: 'hazard',
      },
      {
        id: 'fruit_nourishment',
        name: 'Fruit Nourishment',
        description: 'Subjective value of reaching nourishment.',
        hypothesisA: 'High Value (+50)',
        hypothesisB: 'Zero Value',
        probabilityA: 0.90,
        priorProbabilityA: 0.90,
        precision: 0.80,
        category: 'affordance',
      },
    ],
    initialHyperParams: {
      precisionWeight: 1.2,
      epistemicWeight: 0.9,
      fearThreshold: 0.45,
    },
    availableTools: ['safe_clue', 'torch', 'fruit_bait', 'calming_scent'],
    winCondition: {
      type: 'reach_tile',
      targetPos: { x: 6, y: 3 },
      description: 'Guide Noa to open the Red Door and collect the Goal Fruit.',
    },
    hints: [
      'Place a "Safety Evidence Sign" near the red door corridor.',
      'Add an "Illumination Torch" to increase bottom-up sensory precision.',
      'Drop "Aromatic Fruit Bait" to boost pragmatic value and draw Noa closer.',
    ],
  },
  {
    id: 'shadow_hallucinations',
    title: '2. Shadows in the Predictive Brain',
    subtitle: 'Sensory Attenuation & Top-Down Hallucinations',
    concept: 'Precision-Weighted Prediction Errors',
    description: 'The corridor is enveloped in deep darkness. Because sensory certainty is near zero, Noa’s top-down expectation hallucinates the harmless shadow patches into hostile entities. Deploy torches to restore bottom-up visual precision and clear the illusions.',
    neuroScienceLesson: 'Perception is a constructive compromise between prior expectations and sensory signals. When sensory noise is high (darkness), the brain relies almost entirely on top-down priors, leading to visual illusions and paranoia.',
    gridWidth: l2Data.width,
    gridHeight: l2Data.height,
    grid: l2Data.grid,
    initialCharacterPos: { x: 1, y: 1 },
    initialBeliefs: [
      {
        id: 'shadow_is_monster',
        name: 'Darkness Threat',
        description: 'Belief that unlit shadows conceal predatory creatures.',
        hypothesisA: 'Predator Lurking',
        hypothesisB: 'Harmless Shadow',
        probabilityA: 0.88,
        priorProbabilityA: 0.88,
        precision: 0.75,
        category: 'hazard',
      },
      {
        id: 'torch_clarity',
        name: 'Illumination Reliability',
        description: 'Belief that light reveals empirical ground truth.',
        hypothesisA: 'Ground Truth',
        hypothesisB: 'Uncertain',
        probabilityA: 0.95,
        priorProbabilityA: 0.95,
        precision: 0.90,
        category: 'rule',
      },
    ],
    initialHyperParams: {
      sensoryNoise: 0.65, // High sensory uncertainty
      epistemicWeight: 1.1,
      fearThreshold: 0.40,
    },
    availableTools: ['torch', 'acoustic_probe', 'calming_scent'],
    winCondition: {
      type: 'reach_tile',
      targetPos: { x: 8, y: 3 },
      description: 'Illuminate the shadows so Noa realizes the path is safe and reaches the fruit.',
    },
    hints: [
      'The shadow tiles are the only gaps between the two corridors — Noa has to cross one, and will not while it believes a predator lurks.',
      'Place Torches directly on the Shadow tiles; above ~45% brightness the monster hypothesis collapses.',
      'Watch Noa’s prediction error meter spike, then drop, as illumination overrides the top-down prior.',
    ],
  },
  {
    id: 'epistemic_lever',
    title: '3. The Epistemic Switch',
    subtitle: 'Information Gain (Epistemic Value) vs Pragmatic Reward',
    concept: 'Expected Free Energy G(π)',
    description: 'A blue barrier blocks the exit fruit. Above sits a mechanical lever. Noa has never seen this lever and is uncertain whether pulling it unlocks the path or triggers an alarm. Provide clues so Noa explores the epistemic value of the switch.',
    neuroScienceLesson: 'In Active Inference, action selection minimizes Expected Free Energy G(π) = - (Epistemic Value + Pragmatic Value). An organism will proactively explore uncertain options if the information gain (epistemic value) resolves critical doubt.',
    gridWidth: l3Data.width,
    gridHeight: l3Data.height,
    grid: l3Data.grid,
    initialCharacterPos: { x: 1, y: 3 },
    initialBeliefs: [
      {
        id: 'lever_unlocks_door',
        name: 'Lever Mechanism',
        description: 'Belief about whether the switch opens the blue security gate.',
        hypothesisA: 'Opens Gate',
        hypothesisB: 'Triggers Alarm',
        probabilityA: 0.50, // Pure 50/50 ambiguity
        priorProbabilityA: 0.50,
        precision: 0.30,
        category: 'rule',
      },
      {
        id: 'blue_gate_state',
        name: 'Gate Locked State',
        description: 'Belief that blue gate is currently locked.',
        hypothesisA: 'Locked Impassable',
        hypothesisB: 'Open Passable',
        probabilityA: 0.95,
        priorProbabilityA: 0.95,
        precision: 0.90,
        category: 'affordance',
      },
    ],
    initialHyperParams: {
      epistemicWeight: 1.5, // Strong curiosity
      precisionWeight: 1.0,
    },
    availableTools: ['safe_clue', 'bell_chime', 'fruit_bait', 'acoustic_probe'],
    winCondition: {
      type: 'reach_tile',
      targetPos: { x: 8, y: 3 },
      description: 'Guide Noa to investigate and activate the lever, opening the blue gate.',
    },
    leverConnections: {
      '4,1': {
        targetPos: { x: 6, y: 3 },
        unlocksTile: 'empty',
      },
    },
    hints: [
      'Place a "Safety Evidence Sign" or "Echolocation Probe" by the lever to boost its epistemic salience.',
      'Once Noa inspects the lever, its belief updates to P(Opens Gate) = 0.99 and it pulls the switch!',
    ],
  },
  {
    id: 'pavlovian_binding',
    title: '4. Sensory Binding & Pavlovian Cueing',
    subtitle: 'Associative Inference & Conditioned Attractors',
    concept: 'Conditioned Sensory Predictions',
    description: 'Noa is hesitant to navigate the long shadowy corridor. By using the Resonant Bell alongside fruit rewards, condition Noa to associate chime soundwaves with safety and high pragmatic value.',
    neuroScienceLesson: 'Sensory binding occurs when multi-modal sensory inputs (sound + reward) co-occur repeatedly, constructing a unified generative prediction where hearing the chime triggers immediate exploratory confidence.',
    gridWidth: l4Data.width,
    gridHeight: l4Data.height,
    grid: l4Data.grid,
    initialCharacterPos: { x: 1, y: 1 },
    initialBeliefs: [
      {
        id: 'chime_signals_reward',
        name: 'Acoustic Cue Value',
        description: 'Belief that the chime sound correlates with high nourishment.',
        hypothesisA: 'Rewards Ahead',
        hypothesisB: 'Irrelevant Noise',
        probabilityA: 0.30,
        priorProbabilityA: 0.30,
        precision: 0.50,
        category: 'sensory',
      },
      {
        id: 'shadow_is_monster',
        name: 'Corridor Gloom',
        description: 'Belief that the dim patch halfway down the corridor is unsafe.',
        hypothesisA: 'Unsafe Gloom',
        hypothesisB: 'Just Dim Floor',
        probabilityA: 0.70,
        priorProbabilityA: 0.70,
        precision: 0.60,
        category: 'hazard',
      },
    ],
    initialHyperParams: {
      precisionWeight: 1.4,
      epistemicWeight: 1.2,
    },
    availableTools: ['bell_chime', 'fruit_bait', 'torch', 'safe_clue'],
    winCondition: {
      type: 'reach_tile',
      targetPos: { x: 8, y: 3 },
      description: 'Create an auditory attractor path with the bell and fruit to guide Noa.',
    },
    hints: [
      'The dim patch mid-corridor reads as unsafe. A Torch on it lowers P(Unsafe Gloom) enough to walk through.',
      'Place a Bell Chime in the corridor and Fruit Bait beyond it: co-occurrence binds the sound to reward, and the chime then pulls Noa forward on its own.',
      'Scent and sound follow the corridor, so a bait placed round a corner still leads Noa there.',
    ],
  },
  {
    id: 'perseveration_loop',
    title: '5. Breaking the Perseveration Loop',
    subtitle: 'Overcoming Pathological Certainty with Entropy',
    concept: 'Precision Weighting & Entropy Injection',
    description: 'Noa is stuck in a repetitive loop between two familiar tiles, suffering from hyper-precision on habit policies (perseveration / confirmation bias). Use Novelty Spores to inject sensory entropy and shatter the rigid attractor state.',
    neuroScienceLesson: 'In neuropsychiatry, perseverative behaviors (such as OCD rituals or addictive habits) arise when policy precision over habits is excessively high, ignoring new environmental affordances. High-entropy surprise forces the brain to reset its policy distribution.',
    gridWidth: l5Data.width,
    gridHeight: l5Data.height,
    grid: l5Data.grid,
    initialCharacterPos: { x: 1, y: 1 },
    initialBeliefs: [
      {
        id: 'habit_safety',
        name: 'Habitual Zone Safety',
        description: 'Belief that only the left room is safe, while the right passage is dangerous.',
        hypothesisA: 'Left Room Only',
        hypothesisB: 'Whole Maze Safe',
        probabilityA: 0.98,
        priorProbabilityA: 0.98,
        precision: 0.95,
        category: 'rule',
      },
    ],
    initialHyperParams: {
      precisionWeight: 0.4, // Stubborn prior
      habitPersistence: 0.85, // Heavy habit bias
      epistemicWeight: 0.4,
    },
    availableTools: ['stochastic_spore', 'torch', 'fruit_bait', 'calming_scent'],
    winCondition: {
      type: 'reach_tile',
      targetPos: { x: 8, y: 3 },
      description: 'Inject entropy spores to break Noa’s repetitive loop and steer it into the right corridor.',
    },
    hints: [
      'Drop "Novelty Spores" right where Noa is pacing back and forth.',
      'Place Fruit Bait and Torches in the right corridor to give curiosity a new target.',
    ],
  },
  {
    id: 'social_inference',
    title: '6. Social Inference & The Mirror Automaton',
    subtitle: 'Joint Active Inference & Theory of Mind',
    concept: 'Mutual Generative Models',
    description: 'A second autonomous automaton ("Kip") is in the chamber. The heavy Green Gate will only open if BOTH Noa and Kip stand simultaneously on their respective pressure pads (P). Guide both minds using complementary environmental cues.',
    neuroScienceLesson: 'Social interaction in Active Inference is modeled as "Joint Active Inference": two agents aligning their internal generative models through shared cultural or environmental cues to achieve coordinated action without telepathy.',
    gridWidth: l6Data.width,
    gridHeight: l6Data.height,
    grid: l6Data.grid,
    initialCharacterPos: { x: 1, y: 3 },
    companionPos: { x: 1, y: 1 },
    initialBeliefs: [
      {
        id: 'dual_plate_cooperation',
        name: 'Cooperation Gate Rule',
        description: 'Belief that both pressure pads must be occupied together.',
        hypothesisA: 'Requires 2 Agents',
        hypothesisB: 'Single Plate Sufficient',
        probabilityA: 0.70,
        priorProbabilityA: 0.70,
        precision: 0.60,
        category: 'social',
      },
    ],
    initialHyperParams: {
      epistemicWeight: 1.3,
      precisionWeight: 1.1,
    },
    availableTools: ['bell_chime', 'fruit_bait', 'torch', 'safe_clue', 'calming_scent'],
    winCondition: {
      type: 'reach_tile',
      targetPos: { x: 11, y: 3 },
      description: 'Get Noa and Kip onto both pressure pads to open the green gate, then reach the fruit.',
    },
    hints: [
      'The green gate is a hard barrier — until both plates are pressed, the fruit is unreachable and Noa will look for something else to do.',
      'Kip walks toward whichever plate Noa is not standing on. Give Noa a reason to hold its plate: drop Fruit Bait or a Bell Chime on it.',
      'A Safety Sign or Echolocation Probe on a plate raises its epistemic pull, which is what draws Noa across the room.',
      'Careful with Fruit Bait on a plate: it works, but Noa will happily camp on the bait forever. Remove it once the gate is open.',
    ],
  },
];
