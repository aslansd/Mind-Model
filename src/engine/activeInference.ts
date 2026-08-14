import { 
  CharacterMindState, 
  DiscreteBelief, 
  EmotionalState, 
  PlacedTool, 
  PolicyAction, 
  Position, 
  ScenarioLevel, 
  SensoryObservation, 
  TileType 
} from '../types';
import { soundSynth } from './soundSynth';

// Distance calculation
export function manhattanDist(p1: Position, p2: Position): number {
  return Math.abs(p1.x - p2.x) + Math.abs(p1.y - p2.y);
}

export function euclideanDist(p1: Position, p2: Position): number {
  return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

// Compute line of sight
export function hasLineOfSight(from: Position, to: Position, grid: TileType[][]): boolean {
  const dx = Math.abs(to.x - from.x);
  const dy = Math.abs(to.y - from.y);
  const sx = from.x < to.x ? 1 : -1;
  const sy = from.y < to.y ? 1 : -1;
  let err = dx - dy;

  let cx = from.x;
  let cy = from.y;

  while (true) {
    if (cx === to.x && cy === to.y) return true;
    if (cx !== from.x || cy !== from.y) {
      if (grid[cy]?.[cx] === 'wall') return false;
    }
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      cx += sx;
    }
    if (e2 < dx) {
      err += dx;
      cy += sy;
    }
  }
}

/**
 * Gather sensory inputs from the environment given character position and placed tools.
 */
export function sampleSensoryInputs(
  pos: Position,
  grid: TileType[][],
  tools: PlacedTool[],
  sensoryNoise: number
): SensoryObservation {
  const height = grid.length;
  const width = grid[0].length;
  const visibleTiles: { x: number; y: number; tile: TileType; brightness: number }[] = [];
  const auditorySensations: { source: Position; soundType: string; amplitude: number }[] = [];
  const perceivedHazards: { x: number; y: number; type: string; certainty: number }[] = [];
  const perceivedRewards: { x: number; y: number; type: string; certainty: number }[] = [];

  // Check torches for ambient light
  let localLight = 0.25; // Default dim ambient
  tools.forEach(tool => {
    const dist = euclideanDist(pos, { x: tool.x, y: tool.y });
    if (tool.type === 'torch' && dist <= 3.5) {
      localLight = Math.min(1.0, localLight + (1 - dist / 4) * 0.85);
    }
    if (tool.type === 'bell_chime' && dist <= 5.0) {
      const amp = Math.max(0.1, 1.0 - dist / 5.5);
      auditorySensations.push({
        source: { x: tool.x, y: tool.y },
        soundType: 'Resonant Chime',
        amplitude: amp,
      });
    }
    if (tool.type === 'fruit_bait' && dist <= 4.0) {
      const certainty = Math.max(0.2, 1.0 - dist / 4.5);
      perceivedRewards.push({
        x: tool.x,
        y: tool.y,
        type: 'Fruit Scent Gradient',
        certainty,
      });
    }
    if (tool.type === 'safe_clue' && dist <= 3.0) {
      perceivedRewards.push({
        x: tool.x,
        y: tool.y,
        type: 'Safety Certificate Proof',
        certainty: 0.95,
      });
    }
  });

  // Sample visual field in 4-tile radius
  for (let y = Math.max(0, pos.y - 4); y <= Math.min(height - 1, pos.y + 4); y++) {
    for (let x = Math.max(0, pos.x - 4); x <= Math.min(width - 1, pos.x + 4); x++) {
      const d = euclideanDist(pos, { x, y });
      if (d <= 4.2 && hasLineOfSight(pos, { x, y }, grid)) {
        // Tile illumination
        let tileLight = localLight;
        tools.forEach(t => {
          if (t.type === 'torch' && euclideanDist({ x, y }, { x: t.x, y: t.y }) <= 3.2) {
            tileLight = Math.min(1.0, tileLight + 0.65);
          }
        });

        const tile = grid[y][x];
        visibleTiles.push({ x, y, tile, brightness: tileLight });

        if (tile === 'hazard' || tile === 'shadow') {
          // If dark, shadows look terrifying
          const cert = tile === 'shadow' ? (1 - tileLight) * 0.9 : 0.95;
          perceivedHazards.push({ x, y, type: tile, certainty: cert });
        }
        if (tile === 'goal_fruit') {
          perceivedRewards.push({ x, y, type: 'Goal Fruit', certainty: tileLight });
        }
        if (tile === 'red_door') {
          perceivedHazards.push({ x, y, type: 'Red Door Threshold', certainty: 0.95 });
        }
      }
    }
  }

  // Interoception
  const nearbyDanger = perceivedHazards.some(h => manhattanDist(pos, { x: h.x, y: h.y }) <= 2);
  const heartRate = nearbyDanger ? 125 + Math.round(Math.random() * 15) : 75 + Math.round(Math.random() * 8);
  const safetyEstimate = nearbyDanger ? 0.25 : 0.85;

  return {
    visibleTiles,
    ambientLight: localLight,
    auditorySensations,
    tactileProximity: null,
    perceivedHazards,
    perceivedRewards,
    interoception: {
      energy: 0.75,
      heartRate,
      safetyEstimate,
    },
  };
}

/**
 * Bayesian Belief Update given new sensory observation.
 */
export function updateBeliefs(
  beliefs: DiscreteBelief[],
  obs: SensoryObservation,
  tools: PlacedTool[],
  pos: Position,
  precisionWeight: number
): { updatedBeliefs: DiscreteBelief[]; totalPredictionError: number; thoughts: string[] } {
  let totalPE = 0;
  const thoughts: string[] = [];

  const updatedBeliefs = beliefs.map(belief => {
    let newProb = belief.probabilityA;
    let pe = 0;

    // 1. Red Door Hazard Belief
    if (belief.id === 'red_door_danger') {
      const redDoorObs = obs.visibleTiles.find(t => t.tile === 'red_door');
      if (redDoorObs) {
        // Look for safe clues or calming tools near the red door
        let safeEvidencePower = 0;
        tools.forEach(tool => {
          const distToDoor = euclideanDist({ x: redDoorObs.x, y: redDoorObs.y }, { x: tool.x, y: tool.y });
          const distToChar = euclideanDist(pos, { x: tool.x, y: tool.y });
          if (tool.type === 'safe_clue' && distToDoor <= 2.5) {
            safeEvidencePower += 0.45;
          }
          if (tool.type === 'torch' && distToDoor <= 2.5) {
            safeEvidencePower += 0.25;
          }
          if (tool.type === 'fruit_bait' && distToDoor <= 2.5) {
            safeEvidencePower += 0.20;
          }
          if (tool.type === 'calming_scent' && distToChar <= 2.0) {
            safeEvidencePower += 0.15;
          }
        });

        // Compute predicted observation vs actual observation
        const expectedDangerSignal = belief.probabilityA; // Top-down prediction
        const actualSensorySignal = Math.max(0.02, 1.0 - safeEvidencePower); // Bottom-up evidence

        pe = Math.abs(actualSensorySignal - expectedDangerSignal);
        totalPE += pe;

        // Kalman / Bayesian update step: New = Prior + Precision * LearningRate * PE
        const learningRate = 0.45 * precisionWeight;
        if (actualSensorySignal < expectedDangerSignal) {
          newProb = Math.max(0.05, belief.probabilityA - learningRate * pe);
          thoughts.push(
            `Sensory evidence near Red Door shows safe indicators! P(Hazard) reduced from ${(belief.probabilityA * 100).toFixed(0)}% to ${(newProb * 100).toFixed(0)}%.`
          );
        } else {
          newProb = Math.min(0.99, belief.probabilityA + learningRate * pe * 0.2);
        }
      }
    }

    // 2. Darkness & Shadow Monster Belief
    if (belief.id === 'shadow_is_monster') {
      const shadowObs = obs.visibleTiles.filter(t => t.tile === 'shadow');
      if (shadowObs.length > 0) {
        const avgBrightness = shadowObs.reduce((acc, s) => acc + s.brightness, 0) / shadowObs.length;
        // In high light, shadow is revealed to be harmless
        const expectedMonster = belief.probabilityA;
        const actualMonsterEvidence = Math.max(0.05, 1.0 - avgBrightness * 1.3);

        pe = Math.abs(actualMonsterEvidence - expectedMonster);
        totalPE += pe;

        const updateRate = 0.5 * precisionWeight;
        if (avgBrightness > 0.45) {
          newProb = Math.max(0.04, belief.probabilityA - updateRate * pe);
          thoughts.push(
            `Illumination reveals shadows are harmless geometry! Monster illusion collapsing to ${(newProb * 100).toFixed(0)}%.`
          );
        } else {
          thoughts.push(
            `Sensory uncertainty in the dark is high (${(obs.ambientLight * 100).toFixed(0)}% light). Top-down threat prior dominates.`
          );
        }
      }
    }

    // 3. Lever Mechanism Belief
    if (belief.id === 'lever_unlocks_door') {
      const leverObs = obs.visibleTiles.find(t => t.tile === 'lever');
      if (leverObs) {
        const dist = manhattanDist(pos, { x: leverObs.x, y: leverObs.y });
        let clueNearLever = tools.some(
          t => (t.type === 'safe_clue' || t.type === 'acoustic_probe') && euclideanDist({ x: leverObs.x, y: leverObs.y }, { x: t.x, y: t.y }) <= 2.5
        );

        if (dist <= 2 || clueNearLever) {
          const expected = belief.probabilityA;
          const actualEvidence = 0.96;
          pe = Math.abs(actualEvidence - expected);
          totalPE += pe;
          newProb = Math.min(0.98, belief.probabilityA + 0.5 * pe * precisionWeight);
          thoughts.push(
            `Inspected the lever mechanism! Epistemic ambiguity resolved. P(Opens Gate) = ${(newProb * 100).toFixed(0)}%.`
          );
        }
      }
    }

    // 4. Acoustic Chime Pavlovian Value
    if (belief.id === 'chime_signals_reward') {
      const chimeSound = obs.auditorySensations.find(s => s.soundType === 'Resonant Chime');
      const rewardObs = obs.perceivedRewards.find(r => r.type.includes('Fruit'));
      if (chimeSound && rewardObs) {
        pe = 0.4;
        totalPE += pe;
        newProb = Math.min(0.95, belief.probabilityA + 0.35 * precisionWeight);
        thoughts.push(
          `Acoustic chime co-occurs with fruit scent! Updating conditioned sensory binding P(Chime=Reward) = ${(newProb * 100).toFixed(0)}%.`
        );
      }
    }

    // 5. Perseveration / Habit safety
    if (belief.id === 'habit_safety') {
      const hasEntropySpores = tools.some(
        t => t.type === 'stochastic_spore' && manhattanDist(pos, { x: t.x, y: t.y }) <= 2
      );
      if (hasEntropySpores) {
        pe = 0.85;
        totalPE += pe;
        newProb = Math.max(0.12, belief.probabilityA - 0.45 * precisionWeight);
        thoughts.push(
          `Stochastic entropy spores destabilized rigid habit basin! P(Only Left Room Safe) dropped to ${(newProb * 100).toFixed(0)}%.`
        );
      }
    }

    // 6. Social Cooperative Rule
    if (belief.id === 'dual_plate_cooperation') {
      const companionObs = obs.visibleTiles.find(t => t.tile === 'companion');
      if (companionObs) {
        pe = 0.25;
        totalPE += pe;
        newProb = Math.min(0.95, belief.probabilityA + 0.25 * precisionWeight);
        thoughts.push(
          `Observed companion automaton Kip! Generative model predicts joint coordination on dual pressure pads.`
        );
      }
    }

    return {
      ...belief,
      probabilityA: newProb,
      precision: Math.min(0.99, belief.precision + 0.02),
    };
  });

  return { updatedBeliefs, totalPredictionError: totalPE, thoughts };
}

/**
 * Expected Free Energy (EFE) calculation G(pi) for candidate motor policies.
 * G(pi) = - Epistemic Value - Pragmatic Value
 */
export function evaluatePolicyActions(
  pos: Position,
  grid: TileType[][],
  beliefs: DiscreteBelief[],
  obs: SensoryObservation,
  tools: PlacedTool[],
  hyperParams: CharacterMindState['hyperParameters'],
  targetGoal: Position | null
): { policies: PolicyAction[]; selected: PolicyAction; thought: string } {
  const directions: { dx: number; dy: number; label: PolicyAction['label'] }[] = [
    { dx: 0, dy: -1, label: 'Up' },
    { dx: 0, dy: 1, label: 'Down' },
    { dx: -1, dy: 0, label: 'Left' },
    { dx: 1, dy: 0, label: 'Right' },
    { dx: 0, dy: 0, label: 'Stay' },
  ];

  const height = grid.length;
  const width = grid[0].length;

  const redDoorBelief = beliefs.find(b => b.id === 'red_door_danger')?.probabilityA ?? 0.5;
  const shadowBelief = beliefs.find(b => b.id === 'shadow_is_monster')?.probabilityA ?? 0.5;
  const chimeBelief = beliefs.find(b => b.id === 'chime_signals_reward')?.probabilityA ?? 0.3;
  const leverBelief = beliefs.find(b => b.id === 'lever_unlocks_door')?.probabilityA ?? 0.5;
  const habitSafety = beliefs.find(b => b.id === 'habit_safety')?.probabilityA ?? 0.0;

  const evaluated: PolicyAction[] = directions.map(dir => {
    const nx = pos.x + dir.dx;
    const ny = pos.y + dir.dy;

    // Check bounds
    if (nx < 0 || nx >= width || ny < 0 || ny >= height) {
      return {
        ...dir,
        epistemicValue: -100,
        pragmaticValue: -100,
        expectedFreeEnergy: 200,
        probability: 0,
      };
    }

    const tile = grid[ny][nx];

    // Wall collision
    if (tile === 'wall') {
      return {
        ...dir,
        epistemicValue: -100,
        pragmaticValue: -100,
        expectedFreeEnergy: 200,
        probability: 0,
      };
    }

    // Door check
    if (tile === 'red_door') {
      // If red door is believed dangerous above threshold, immense negative pragmatic penalty
      if (redDoorBelief > hyperParams.fearThreshold) {
        return {
          ...dir,
          epistemicValue: 0.1,
          pragmaticValue: -120 * redDoorBelief,
          expectedFreeEnergy: 120 * redDoorBelief,
          probability: 0.001,
        };
      }
    }

    if (tile === 'blue_door') {
      return {
        ...dir,
        epistemicValue: -50,
        pragmaticValue: -50,
        expectedFreeEnergy: 100,
        probability: 0,
      };
    }

    // --- Epistemic Value Calculation (Information Gain / Ambiguity Resolution) ---
    let epistemicVal = 0.5; // Base exploration incentive

    // Distance to unlit or unexplored areas
    tools.forEach(t => {
      const d = euclideanDist({ x: nx, y: ny }, { x: t.x, y: t.y });
      if (t.type === 'torch' && d <= 2.5) epistemicVal += 1.2;
      if (t.type === 'safe_clue' && d <= 2.0) epistemicVal += 1.8;
      if (t.type === 'acoustic_probe' && d <= 3.0) epistemicVal += 1.5;
      if (t.type === 'bell_chime' && d <= 3.5) epistemicVal += 1.1 * chimeBelief;
      if (t.type === 'stochastic_spore' && d <= 2.0) epistemicVal += 2.0;
    });

    if (tile === 'lever') {
      // If lever belief is ambiguous, epistemic value is maximal!
      const ambiguity = 1.0 - Math.abs(leverBelief - 0.5) * 2;
      epistemicVal += 3.5 * ambiguity;
    }

    if (tile === 'shadow') {
      if (shadowBelief > hyperParams.fearThreshold) {
        epistemicVal -= 2.0; // Avoid terrified shadows
      } else {
        epistemicVal += 1.0; // Safe curiosity
      }
    }

    // --- Pragmatic Value Calculation (Prior Preference Alignment C(o)) ---
    let pragmaticVal = 0;

    // Moving toward goal fruit
    if (targetGoal) {
      const currDist = manhattanDist(pos, targetGoal);
      const newDist = manhattanDist({ x: nx, y: ny }, targetGoal);
      if (newDist < currDist) {
        pragmaticVal += 4.5;
      } else if (newDist > currDist) {
        pragmaticVal -= 1.5;
      }
    }

    if (tile === 'goal_fruit') {
      pragmaticVal += 25.0; // Maximal primary reward
    }

    // Baits & attractors
    tools.forEach(t => {
      const d = manhattanDist({ x: nx, y: ny }, { x: t.x, y: t.y });
      if (t.type === 'fruit_bait') {
        pragmaticVal += Math.max(0, 8.0 - d * 2.0);
      }
      if (t.type === 'calming_scent' && d <= 2) {
        pragmaticVal += 3.0;
      }
    });

    // Shadow penalty if darkness feared
    if (tile === 'shadow' && shadowBelief > hyperParams.fearThreshold) {
      pragmaticVal -= 15.0 * shadowBelief;
    }

    // Perseveration habit bias (if right passage perceived dangerous)
    if (habitSafety > 0.5 && nx > 4) {
      pragmaticVal -= 20.0 * habitSafety * (hyperParams.habitPersistence ?? 0.5);
    }

    // Stay penalty to avoid stagnation (unless trapped)
    if (dir.label === 'Stay') {
      pragmaticVal -= 2.0;
    }

    // Expected Free Energy G(pi) = - (gamma_epistemic * Epistemic + Pragmatic)
    const weightedEpistemic = epistemicVal * hyperParams.epistemicWeight;
    const expectedFreeEnergy = -(weightedEpistemic + pragmaticVal);

    return {
      ...dir,
      epistemicValue: parseFloat(weightedEpistemic.toFixed(2)),
      pragmaticValue: parseFloat(pragmaticVal.toFixed(2)),
      expectedFreeEnergy: parseFloat(expectedFreeEnergy.toFixed(2)),
      probability: 0,
    };
  });

  // Softmax selection over -G(pi)
  const validPolicies = evaluated.filter(p => p.expectedFreeEnergy < 150);
  const minG = Math.min(...validPolicies.map(p => p.expectedFreeEnergy));
  
  // Exponentiate with inverse temperature
  const temp = 0.85;
  const expWeights = evaluated.map(p => {
    if (p.expectedFreeEnergy >= 150) return 0;
    return Math.exp(-(p.expectedFreeEnergy - minG) / temp);
  });
  const sumExp = expWeights.reduce((a, b) => a + b, 0) || 1;

  evaluated.forEach((p, idx) => {
    p.probability = parseFloat((expWeights[idx] / sumExp).toFixed(3));
  });

  // Choose top policy or sample from softmax distribution
  let selected = evaluated[0];
  let maxProb = -1;
  evaluated.forEach(p => {
    if (p.probability > maxProb) {
      maxProb = p.probability;
      selected = p;
    }
  });

  const thought = `Evaluated 5 motor policies. Selected [${selected.label}] with Expected Free Energy G = ${selected.expectedFreeEnergy} (Epistemic: +${selected.epistemicValue}, Pragmatic: +${selected.pragmaticValue}).`;

  return { policies: evaluated, selected, thought };
}

/**
 * Update character affective / emotional state based on Free Energy dynamics.
 */
export function updateAffect(
  prevEmotions: EmotionalState,
  prevFreeEnergy: number,
  currFreeEnergy: number,
  predictionError: number,
  selectedPolicy: PolicyAction,
  beliefs: DiscreteBelief[]
): EmotionalState {
  // Rate of change of Free Energy (dF/dt)
  const deltaF = currFreeEnergy - prevFreeEnergy;

  // Valence: negative dF/dt -> Positive Valence (Joy/Relief)
  let valence = prevEmotions.valence - deltaF * 0.35;
  valence = Math.max(-1, Math.min(1, valence));

  // Arousal: proportional to surprise / prediction error
  let arousal = 0.2 + predictionError * 0.7;
  arousal = Math.max(0.1, Math.min(1, arousal));

  // Curiosity: epistemic value of chosen action
  const curiosity = Math.max(0, Math.min(1, selectedPolicy.epistemicValue / 4.0));

  // Fear: highest hazard probability
  const maxHazard = Math.max(
    ...beliefs.filter(b => b.category === 'hazard' || b.category === 'sensory').map(b => b.probabilityA),
    0
  );
  const fear = maxHazard;

  // Determine dominant emotion label
  let dominant: EmotionalState['dominantEmotion'] = 'Curious';
  if (fear > 0.75 && arousal > 0.6) {
    dominant = 'Terrified';
  } else if (fear > 0.45) {
    dominant = 'Anxious';
  } else if (curiosity > 0.65 && valence >= 0) {
    dominant = 'Curious';
  } else if (predictionError > 0.6) {
    dominant = 'Perplexed';
  } else if (valence > 0.6) {
    dominant = 'Euphoric';
  } else if (valence > 0.1 && arousal < 0.4) {
    dominant = 'Content';
  } else {
    dominant = 'Cautious';
  }

  return {
    valence: parseFloat(valence.toFixed(2)),
    arousal: parseFloat(arousal.toFixed(2)),
    curiosity: parseFloat(curiosity.toFixed(2)),
    fear: parseFloat(fear.toFixed(2)),
    frustration: deltaF > 0.2 ? Math.min(1, prevEmotions.frustration + 0.15) : Math.max(0, prevEmotions.frustration - 0.1),
    dominantEmotion: dominant,
  };
}

/**
 * Execute 1 full step of the Active Inference Cycle.
 */
export function stepActiveInference(
  state: CharacterMindState,
  scenario: ScenarioLevel,
  tools: PlacedTool[],
  grid: TileType[][]
): {
  nextState: CharacterMindState;
  nextGrid: TileType[][];
  didWin: boolean;
  eventSummary: string | null;
} {
  const nextGrid = grid.map(row => [...row]);
  let didWin = false;
  let eventSummary: string | null = null;

  // 1. SENSORY OBSERVATION
  const sensory = sampleSensoryInputs(
    state.position,
    nextGrid,
    tools,
    state.hyperParameters.sensoryNoise
  );

  // 2. BAYESIAN BELIEF UPDATE & PREDICTION ERROR
  const { updatedBeliefs, totalPredictionError, thoughts: beliefThoughts } = updateBeliefs(
    state.beliefs,
    sensory,
    tools,
    state.position,
    state.hyperParameters.precisionWeight
  );

  // Compute variational Free Energy F = Complexity - Accuracy
  const beliefEntropy = updatedBeliefs.reduce((acc, b) => {
    const p = Math.max(0.01, Math.min(0.99, b.probabilityA));
    return acc - (p * Math.log2(p) + (1 - p) * Math.log2(1 - p));
  }, 0);
  const freeEnergy = parseFloat((totalPredictionError * 1.5 + beliefEntropy * 0.5).toFixed(2));

  // Audio cues
  if (totalPredictionError > 0.25) {
    soundSynth.playPredictionErrorSound(totalPredictionError);
  }

  // Find goal destination
  let goalPos: Position | null = null;
  for (let r = 0; r < nextGrid.length; r++) {
    for (let c = 0; c < nextGrid[0].length; c++) {
      if (nextGrid[r][c] === 'goal_fruit') {
        goalPos = { x: c, y: r };
        break;
      }
    }
  }

  // 3. POLICY EVALUATION & MOTOR ACTION SELECTION
  const { policies, selected: chosenAction, thought: policyThought } = evaluatePolicyActions(
    state.position,
    nextGrid,
    updatedBeliefs,
    sensory,
    tools,
    state.hyperParameters,
    goalPos
  );

  // 4. AFFECT / EMOTION DYNAMICS
  const updatedEmotions = updateAffect(
    state.emotions,
    state.freeEnergy,
    freeEnergy,
    totalPredictionError,
    chosenAction,
    updatedBeliefs
  );

  // 5. MOTOR EXECUTION & ENVIRONMENT INTERACTION
  let newX = state.position.x + chosenAction.dx;
  let newY = state.position.y + chosenAction.dy;
  let facing = state.facing;

  if (chosenAction.dx > 0) facing = 'right';
  else if (chosenAction.dx < 0) facing = 'left';
  else if (chosenAction.dy > 0) facing = 'down';
  else if (chosenAction.dy < 0) facing = 'up';

  // Interaction with special tiles
  const destTile = nextGrid[newY]?.[newX];

  if (destTile === 'red_door') {
    const dangerBelief = updatedBeliefs.find(b => b.id === 'red_door_danger')?.probabilityA ?? 0.9;
    if (dangerBelief <= state.hyperParameters.fearThreshold) {
      // Unlock door!
      nextGrid[newY][newX] = 'empty';
      eventSummary = 'Noa bravely unlocked and passed through the Red Door!';
      soundSynth.playBeliefShiftSound('positive');
    } else {
      // Abort move
      newX = state.position.x;
      newY = state.position.y;
    }
  }

  if (destTile === 'lever') {
    // Check if lever opens anything in scenario
    const leverKey = `${newX},${newY}`;
    const connection = scenario.leverConnections?.[leverKey];
    if (connection) {
      nextGrid[connection.targetPos.y][connection.targetPos.x] = connection.unlocksTile;
      eventSummary = 'Noa activated the mechanical lever! The security gate clicked open.';
      soundSynth.playEurekaSound();
    }
  }

  if (destTile === 'goal_fruit') {
    didWin = true;
    eventSummary = 'Goal reached! Primary homeostatic nourishment obtained.';
    soundSynth.playEurekaSound();
  }

  // Play footstep if moved
  if (newX !== state.position.x || newY !== state.position.y) {
    soundSynth.playStepSound();
  }

  // Generate short thought bubble
  let thoughtBubble = 'Sampling environment...';
  if (updatedEmotions.dominantEmotion === 'Terrified') {
    thoughtBubble = 'Fear prior high! Staying back.';
  } else if (updatedEmotions.dominantEmotion === 'Curious') {
    thoughtBubble = 'High epistemic value ahead!';
  } else if (beliefThoughts.length > 0) {
    thoughtBubble = beliefThoughts[0].slice(0, 48) + '...';
  } else if (didWin) {
    thoughtBubble = 'Eureka! Nourishment reached!';
  }

  // Assemble Monologue log
  const newMonologue = [
    `[Step ${state.stepCount + 1}] Affect: ${updatedEmotions.dominantEmotion} (Valence: ${updatedEmotions.valence}, Arousal: ${updatedEmotions.arousal})`,
    ...beliefThoughts,
    policyThought,
    `Action taken: [${chosenAction.label}] -> Position (${newX}, ${newY})`,
  ];

  const nextState: CharacterMindState = {
    ...state,
    position: { x: newX, y: newY },
    facing,
    beliefs: updatedBeliefs,
    emotions: updatedEmotions,
    sensory,
    freeEnergy,
    currentPredictionError: totalPredictionError,
    policyCandidates: policies,
    selectedAction: chosenAction,
    innerMonologue: [...newMonologue, ...state.innerMonologue].slice(0, 30),
    thoughtBubble,
    stepCount: state.stepCount + 1,
    activeInferenceStage: 'act',
  };

  return {
    nextState,
    nextGrid,
    didWin,
    eventSummary,
  };
}
