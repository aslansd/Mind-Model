import React, { useState, useEffect, useRef, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { 
  CharacterMindState, 
  PlacedTool, 
  Position, 
  ScenarioLevel, 
  TileType, 
  ToolType 
} from './types';
import { SCENARIOS } from './data/scenarios';
import { soundSynth } from './engine/soundSynth';
import { sampleSensoryInputs, stepActiveInference } from './engine/activeInference';
import { Header } from './components/Header';
import { ActiveInferenceLoop } from './components/ActiveInferenceLoop';
import { WorldCanvas } from './components/WorldCanvas';
import { MindInspector } from './components/MindInspector';
import { Toolbox } from './components/Toolbox';
import { ScenarioSelector } from './components/ScenarioSelector';
import { SandboxControls } from './components/SandboxControls';
import { CognitiveCodexModal } from './components/CognitiveCodexModal';
import { loadProgress, saveProgress } from './utils/storage';
import { 
  Brain, 
  Trophy, 
  ArrowRight, 
  Lightbulb, 
  ChevronDown, 
  ChevronUp, 
  Sparkles, 
  Info,
  Layers
} from 'lucide-react';

export default function App() {
  // Scenario state — restored from localStorage so solved experiments survive a refresh.
  const saved = useRef(loadProgress()).current;
  const [currentScenarioIndex, setCurrentScenarioIndex] = useState<number>(() => {
    const idx = saved?.lastScenarioId ? SCENARIOS.findIndex(s => s.id === saved.lastScenarioId) : -1;
    return idx >= 0 ? idx : 0;
  });
  const [completedScenarioIds, setCompletedScenarioIds] = useState<string[]>(saved?.completedScenarioIds ?? []);
  const [isSandboxMode, setIsSandboxMode] = useState<boolean>(false);
  const [showCodexModal, setShowCodexModal] = useState<boolean>(false);
  const [showHints, setShowHints] = useState<boolean>(false);

  const scenario = SCENARIOS[currentScenarioIndex];

  // Grid & Placed Tools
  const [grid, setGrid] = useState<TileType[][]>(() => scenario.grid.map(row => [...row]));
  const [placedTools, setPlacedTools] = useState<PlacedTool[]>([]);
  const [selectedTool, setSelectedTool] = useState<ToolType | null>(null);
  const [paintTile, setPaintTile] = useState<TileType | null>(null);

  // Simulation running state
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLevelWon, setIsLevelWon] = useState<boolean>(false);
  // The engine has always returned an eventSummary ("Noa bravely unlocked the Red
  // Door!"), but nothing ever displayed it. Surface it as a transient banner.
  const [eventBanner, setEventBanner] = useState<string | null>(null);
  // The five-stage cycle indicator: the engine finishes every step in the 'act'
  // stage, so the diagram was frozen on stage 5. Sweep it after each step.
  const [loopStage, setLoopStage] = useState<CharacterMindState['activeInferenceStage']>('observe');

  // Initial Character Mind State generator
  const createInitialMindState = useCallback((sc: ScenarioLevel): CharacterMindState => {
    const initialSensory = sampleSensoryInputs(
      sc.initialCharacterPos,
      sc.grid,
      [],
      sc.initialHyperParams?.sensoryNoise ?? 0.1
    );

    return {
      name: 'Noa',
      position: { ...sc.initialCharacterPos },
      targetDestination: null,
      facing: 'right',
      beliefs: sc.initialBeliefs.map(b => ({ ...b })),
      emotions: {
        valence: 0.1,
        arousal: 0.35,
        curiosity: 0.6,
        fear: sc.initialBeliefs.find(b => b.category === 'hazard')?.probabilityA ?? 0.2,
        frustration: 0,
        dominantEmotion: 'Cautious',
      },
      sensory: initialSensory,
      freeEnergy: 1.5,
      currentPredictionError: 0.1,
      hyperParameters: {
        precisionWeight: sc.initialHyperParams?.precisionWeight ?? 1.0,
        epistemicWeight: sc.initialHyperParams?.epistemicWeight ?? 1.0,
        sensoryNoise: sc.initialHyperParams?.sensoryNoise ?? 0.1,
        fearThreshold: sc.initialHyperParams?.fearThreshold ?? 0.45,
        habitPersistence: sc.initialHyperParams?.habitPersistence ?? 0.5,
      },
      companionPosition: sc.companionPos ? { ...sc.companionPos } : undefined,
      cooperativeGateOpen: false,
      visitCounts: { [`${sc.initialCharacterPos.x},${sc.initialCharacterPos.y}`]: 1 },
      policyCandidates: [],
      selectedAction: null,
      innerMonologue: [
        `[Initial State] Loaded scenario: "${sc.title}". Prior beliefs active.`,
      ],
      thoughtBubble: 'Awaiting environmental clues...',
      stepCount: 0,
      activeInferenceStage: 'observe',
    };
  }, []);

  const [mind, setMind] = useState<CharacterMindState>(() => createInitialMindState(scenario));

  // Reset current scenario
  const resetCurrentLevel = useCallback(() => {
    setIsRunning(false);
    setIsLevelWon(false);
    setEventBanner(null);
    setGrid(scenario.grid.map(row => [...row]));
    setPlacedTools([]);
    setSelectedTool(null);
    setMind(createInitialMindState(scenario));
  }, [scenario, createInitialMindState]);

  // Handle switching scenario
  const handleSelectScenario = (newScenario: ScenarioLevel) => {
    const idx = SCENARIOS.findIndex(s => s.id === newScenario.id);
    if (idx !== -1) {
      setCurrentScenarioIndex(idx);
      setIsSandboxMode(false);
      setIsRunning(false);
      setIsLevelWon(false);
      setEventBanner(null);
      setPaintTile(null);
      setGrid(newScenario.grid.map(row => [...row]));
      setPlacedTools([]);
      setSelectedTool(null);
      setMind(createInitialMindState(newScenario));
    }
  };

  // Step 1 Active Inference Cycle
  const handleStepNext = useCallback(() => {
    if (isLevelWon) return;

    const { nextState, nextGrid, didWin, eventSummary } = stepActiveInference(
      mind,
      scenario,
      placedTools,
      grid
    );

    setMind(nextState);
    setGrid(nextGrid);
    if (eventSummary) setEventBanner(eventSummary);

    if (didWin && !isLevelWon) {
      setIsLevelWon(true);
      setIsRunning(false);
      if (!completedScenarioIds.includes(scenario.id)) {
        setCompletedScenarioIds(prev => [...prev, scenario.id]);
      }
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch {
        // Fallback
      }
    }
  }, [mind, scenario, placedTools, grid, isLevelWon, completedScenarioIds]);

  // Persist progress whenever it changes.
  useEffect(() => {
    saveProgress({ completedScenarioIds, lastScenarioId: scenario.id });
  }, [completedScenarioIds, scenario.id]);

  // Sweep the cycle indicator through all five stages after each step so the
  // diagram reflects the loop instead of sitting permanently on 'act'.
  useEffect(() => {
    const stages: CharacterMindState['activeInferenceStage'][] =
      ['observe', 'error_calc', 'belief_update', 'policy_eval', 'act'];
    const timers = stages.map((st, i) => setTimeout(() => setLoopStage(st), i * 70));
    return () => timers.forEach(clearTimeout);
  }, [mind.stepCount]);

  // Expire the event banner.
  useEffect(() => {
    if (!eventBanner) return;
    const t = setTimeout(() => setEventBanner(null), 4000);
    return () => clearTimeout(t);
  }, [eventBanner]);

  // Simulation timer loop
  useEffect(() => {
    if (!isRunning || isLevelWon) return;

    const intervalMs = Math.max(250, 1000 / speed);
    const timer = setInterval(() => {
      handleStepNext();
    }, intervalMs);

    return () => clearInterval(timer);
  }, [isRunning, speed, handleStepNext, isLevelWon]);

  // Place tool
  const handlePlaceTool = (x: number, y: number, toolType: ToolType) => {
    // Check if walkable or shadow
    if (grid[y]?.[x] === 'wall') return;

    // Replace if already tool on tile
    const filtered = placedTools.filter(t => !(t.x === x && t.y === y));
    const newTool: PlacedTool = {
      id: `${toolType}-${x}-${y}-${Date.now()}`,
      type: toolType,
      x,
      y,
    };

    setPlacedTools([...filtered, newTool]);
    soundSynth.playToolPlacedSound();
  };

  // Remove tool
  const handleRemoveTool = (id: string) => {
    setPlacedTools(prev => prev.filter(t => t.id !== id));
  };

  // Clear all tools
  const handleClearTools = () => {
    setPlacedTools([]);
  };

  // Toggle audio
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundSynth.setMuted(next);
  };

  // Tile click in sandbox / paint mode
  const handleTileClick = (x: number, y: number) => {
    if (isSandboxMode && paintTile) {
      setGrid(prev => {
        const next = prev.map(row => [...row]);
        next[y][x] = paintTile;
        return next;
      });
    }
  };

  // Sandbox hyperparameter update
  const handleUpdateHyperParam = (key: keyof CharacterMindState['hyperParameters'], value: number) => {
    setMind(prev => ({
      ...prev,
      hyperParameters: {
        ...prev.hyperParameters,
        [key]: value,
      },
    }));
  };

  /**
   * Entering the lab starts from a blank canvas; leaving it restores the
   * scenario. Previously the flag flipped on its own, so the "Sandbox" map was
   * really still scenario N, and any tiles painted there leaked back into the
   * scenario when you left.
   */
  const handleToggleSandbox = () => {
    const entering = !isSandboxMode;
    setIsSandboxMode(entering);
    setIsRunning(false);
    setIsLevelWon(false);
    setEventBanner(null);
    setSelectedTool(null);
    setPaintTile(null);
    setPlacedTools([]);

    if (entering) {
      const blank: TileType[][] = Array.from({ length: 7 }, () => Array(11).fill('empty'));
      blank[3][9] = 'goal_fruit';
      setGrid(blank);
      setMind({ ...createInitialMindState(scenario), position: { x: 1, y: 3 }, companionPosition: undefined });
    } else {
      setGrid(scenario.grid.map(row => [...row]));
      setMind(createInitialMindState(scenario));
    }
  };

  // Advance to next level
  const handleNextScenario = () => {
    const nextIdx = (currentScenarioIndex + 1) % SCENARIOS.length;
    handleSelectScenario(SCENARIOS[nextIdx]);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-cyan-500 selection:text-black">
      {/* Top Navigation & Simulation Header */}
      <Header
        isRunning={isRunning}
        onTogglePlay={() => setIsRunning(!isRunning)}
        onStepNext={handleStepNext}
        onReset={resetCurrentLevel}
        speed={speed}
        onChangeSpeed={setSpeed}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenCodex={() => setShowCodexModal(true)}
        currentScenarioTitle={isSandboxMode ? 'Sandbox Neuro-Lab' : scenario.title}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Lesson & Educational Context Banner */}
        {!isSandboxMode && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-indigo-950/30 to-slate-900 border border-slate-800 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-[11px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-indigo-950 border border-indigo-800 text-indigo-300">
                  {scenario.concept}
                </span>
                <span className="text-xs text-slate-400 font-semibold">{scenario.subtitle}</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                {scenario.description}
              </p>
            </div>

            <button
              onClick={() => setShowHints(!showHints)}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-amber-300 text-xs font-semibold border border-slate-700 transition-colors shrink-0"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{showHints ? 'Hide Hints' : 'View Hints'}</span>
              {showHints ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}

        {/* Collapsible Hints Panel */}
        {showHints && !isSandboxMode && (
          <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/30 space-y-2 animate-fade-in">
            <div className="flex items-center space-x-2 text-xs font-bold text-amber-300">
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>EXPERIMENTAL STRATEGY HINTS</span>
            </div>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              {scenario.hints.map((hint, idx) => (
                <li key={idx}>{hint}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Transient event notice (door unlocked, gate opened, ...) */}
        {eventBanner && !isLevelWon && (
          <div className="p-3 rounded-2xl bg-cyan-950/40 border border-cyan-500/40 flex items-center gap-2.5 animate-fade-in">
            <Sparkles className="w-4 h-4 text-cyan-300 shrink-0" />
            <p className="text-xs text-cyan-100">{eventBanner}</p>
          </div>
        )}

        {/* Victory Banner */}
        {isLevelWon && (
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-emerald-950/80 via-teal-950/60 to-emerald-950/80 border-2 border-emerald-500 shadow-2xl shadow-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 animate-fade-in">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500 text-black shadow-lg shadow-emerald-500/50">
                <Trophy className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-emerald-200">
                  Experiment Successfully Completed!
                </h3>
                <p className="text-xs text-emerald-300/80">
                  {scenario.neuroScienceLesson}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <button
                onClick={resetCurrentLevel}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
              >
                Replay
              </button>
              <button
                onClick={handleNextScenario}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black text-xs font-black transition-all shadow-lg shadow-emerald-500/30"
              >
                <span>Next Scenario</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Live Active Inference Cycle Flow Indicator */}
        <ActiveInferenceLoop mind={mind} stage={loopStage} />

        {/* Primary Simulation Layout: Grid Canvas & Mind Inspector */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: World Canvas & Toolbox (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            <WorldCanvas
              scenario={scenario}
              grid={grid}
              mind={mind}
              placedTools={placedTools}
              selectedTool={selectedTool}
              onPlaceTool={handlePlaceTool}
              onRemoveTool={handleRemoveTool}
              onTileClick={handleTileClick}
            />

            <Toolbox
              availableTools={isSandboxMode ? ['torch', 'safe_clue', 'fruit_bait', 'bell_chime', 'calming_scent', 'stochastic_spore', 'acoustic_probe'] : scenario.availableTools}
              selectedTool={selectedTool}
              onSelectTool={setSelectedTool}
              onClearTools={handleClearTools}
              placedCount={placedTools.length}
            />
          </div>

          {/* Right Column: Internal Mind Inspector (5 cols) */}
          <div className="lg:col-span-5 h-full">
            <MindInspector mind={mind} />
          </div>
        </div>

        {/* Sandbox Hyperparameters & Level Editor (if in Sandbox Mode) */}
        {isSandboxMode && (
          <SandboxControls
            hyperParams={mind.hyperParameters}
            onUpdateHyperParam={handleUpdateHyperParam}
            paintTile={paintTile}
            onSelectPaintTile={setPaintTile}
            onResetGrid={() => {
              const blank: TileType[][] = Array.from({ length: 7 }, () => Array(11).fill('empty'));
              blank[3][9] = 'goal_fruit';
              setGrid(blank);
              setPlacedTools([]);
              setIsLevelWon(false);
              setMind({ ...createInitialMindState(scenario), position: { x: 1, y: 3 }, companionPosition: undefined });
            }}
          />
        )}

        {/* Scenario Browser Carousel */}
        <ScenarioSelector
          currentScenarioId={scenario.id}
          onSelectScenario={handleSelectScenario}
          completedScenarioIds={completedScenarioIds}
          isSandboxMode={isSandboxMode}
          onToggleSandbox={handleToggleSandbox}
        />
      </main>

      {/* Footer */}
      <footer className="w-full border-t border-slate-900 bg-slate-950 py-4 px-6 text-center text-xs text-slate-500">
        <p>
          <strong>Mind Model</strong> — Computational Cognitive Neuroscience Simulation. Based on the Free Energy Principle (Karl Friston) & Predictive Processing.
        </p>
      </footer>

      {/* Educational Cognitive Codex Modal */}
      <CognitiveCodexModal
        isOpen={showCodexModal}
        onClose={() => setShowCodexModal(false)}
      />
    </div>
  );
}
