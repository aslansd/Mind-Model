export type TileType = 
  | 'empty' 
  | 'wall' 
  | 'red_door' 
  | 'blue_door' 
  | 'green_door' 
  | 'goal_fruit' 
  | 'hazard' 
  | 'shadow' 
  | 'lever' 
  | 'companion'
  | 'target_pad';

export interface Position {
  x: number;
  y: number;
}

export interface PlacedTool {
  id: string;
  type: ToolType;
  x: number;
  y: number;
  duration?: number;
  intensity?: number;
  label?: string;
}

export type ToolType = 
  | 'torch' 
  | 'fruit_bait' 
  | 'bell_chime' 
  | 'safe_clue' 
  | 'calming_scent' 
  | 'stochastic_spore' 
  | 'acoustic_probe';

export interface ToolDef {
  type: ToolType;
  name: string;
  description: string;
  cognitiveEffect: string;
  icon: string;
  cost?: number;
  color: string;
  radius: number;
}

export interface DiscreteBelief {
  id: string;
  name: string;
  description: string;
  hypothesisA: string;
  hypothesisB: string;
  probabilityA: number; // 0 to 1 (P(A))
  priorProbabilityA: number;
  precision: number; // confidence / inverse variance 0 to 1
  category: 'hazard' | 'affordance' | 'sensory' | 'social' | 'rule';
}

export interface EmotionalState {
  valence: number; // -1 (distress/fear) to +1 (joy/calm/relief)
  arousal: number; // 0 (calm/lethargic) to 1 (hyper-vigilant/excited)
  curiosity: number; // 0 to 1 (epistemic exploration drive)
  fear: number; // 0 to 1
  frustration: number; // 0 to 1
  dominantEmotion: 'Curious' | 'Anxious' | 'Confident' | 'Cautious' | 'Euphoric' | 'Perplexed' | 'Terrified' | 'Content';
}

export interface PredictionErrorRecord {
  step: number;
  freeEnergy: number;
  predictionError: number;
  valence: number;
  surprise: number;
}

export interface MemoryEntry {
  id: string;
  step: number;
  location: Position;
  event: string;
  observationSummary: string;
  predictionError: number;
  beliefShift: string;
  emotion: string;
}

export interface PolicyAction {
  dx: number;
  dy: number;
  label: 'Up' | 'Down' | 'Left' | 'Right' | 'Stay' | 'Inspect' | 'Interact';
  epistemicValue: number; // Information gain (entropy reduction)
  pragmaticValue: number; // Reward prior alignment
  expectedFreeEnergy: number; // G(pi) = - (Epistemic + Pragmatic)
  probability: number; // Softmax selection probability
}

export interface SensoryObservation {
  visibleTiles: { x: number; y: number; tile: TileType; brightness: number }[];
  ambientLight: number; // 0 to 1
  auditorySensations: { source: Position; soundType: string; amplitude: number }[];
  tactileProximity: string | null;
  perceivedHazards: { x: number; y: number; type: string; certainty: number }[];
  perceivedRewards: { x: number; y: number; type: string; certainty: number }[];
  interoception: {
    energy: number; // 0 to 1
    heartRate: number; // 60 to 160 bpm
    safetyEstimate: number; // 0 to 1
  };
}

export interface CharacterMindState {
  name: string;
  position: Position;
  targetDestination: Position | null;
  facing: 'up' | 'down' | 'left' | 'right';
  beliefs: DiscreteBelief[];
  emotions: EmotionalState;
  sensory: SensoryObservation;
  freeEnergy: number; // F = Complexity - Accuracy
  currentPredictionError: number;
  hyperParameters: {
    precisionWeight: number; // gamma: 0.1 to 3.0 (learning rate / flexibility)
    epistemicWeight: number; // beta: curiosity vs exploit (0 to 2.0)
    sensoryNoise: number; // 0 to 1
    fearThreshold: number; // threshold for freezing/avoiding
    habitPersistence: number; // perseveration strength
  };
  policyCandidates: PolicyAction[];
  selectedAction: PolicyAction | null;
  innerMonologue: string[];
  thoughtBubble: string;
  stepCount: number;
  activeInferenceStage: 'observe' | 'error_calc' | 'belief_update' | 'policy_eval' | 'act';
}

export interface ScenarioLevel {
  id: string;
  title: string;
  subtitle: string;
  concept: string;
  description: string;
  neuroScienceLesson: string;
  gridWidth: number;
  gridHeight: number;
  grid: TileType[][];
  initialCharacterPos: Position;
  initialBeliefs: DiscreteBelief[];
  initialHyperParams?: Partial<CharacterMindState['hyperParameters']>;
  availableTools: ToolType[];
  winCondition: {
    type: 'reach_tile' | 'update_belief' | 'solve_lever' | 'cooperative';
    targetPos?: Position;
    targetBeliefId?: string;
    targetBeliefValue?: number; // e.g. < 0.25
    description: string;
  };
  hints: string[];
  leverConnections?: { [leverKey: string]: { targetPos: Position; unlocksTile: TileType } };
  companionPos?: Position;
}
