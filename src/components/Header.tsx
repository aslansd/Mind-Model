import React from 'react';
import { 
  Play, 
  Pause, 
  SkipForward, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  BookOpen, 
  BrainCircuit, 
  Gauge 
} from 'lucide-react';
import { soundSynth } from '../engine/soundSynth';

interface HeaderProps {
  isRunning: boolean;
  onTogglePlay: () => void;
  onStepNext: () => void;
  onReset: () => void;
  speed: number;
  onChangeSpeed: (speed: number) => void;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenCodex: () => void;
  currentScenarioTitle: string;
}

export const Header: React.FC<HeaderProps> = ({
  isRunning,
  onTogglePlay,
  onStepNext,
  onReset,
  speed,
  onChangeSpeed,
  isMuted,
  onToggleMute,
  onOpenCodex,
  currentScenarioTitle,
}) => {
  return (
    <header className="w-full bg-slate-950/80 border-b border-slate-800 backdrop-blur-md sticky top-0 z-40 px-4 py-3 sm:px-6">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Brand & Active Scenario */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-600 to-indigo-600 text-white shadow-lg shadow-cyan-600/30">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-base sm:text-lg font-black tracking-tight text-white flex items-center space-x-1.5">
                <span>MIND MODEL</span>
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-bold">
                Active Inference
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium truncate max-w-sm sm:max-w-md">
              {currentScenarioTitle}
            </p>
          </div>
        </div>

        {/* Action & Simulation Controls */}
        <div className="flex items-center flex-wrap gap-2">
          {/* Play / Pause */}
          <button
            onClick={onTogglePlay}
            className={`flex items-center space-x-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shadow-md ${
              isRunning
                ? 'bg-amber-500 hover:bg-amber-400 text-black shadow-amber-500/20'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-600/30'
            }`}
          >
            {isRunning ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            <span>{isRunning ? 'Pause' : 'Run Cycle'}</span>
          </button>

          {/* Step 1 cycle */}
          <button
            onClick={onStepNext}
            disabled={isRunning}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors"
          >
            <SkipForward className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Step</span>
          </button>

          {/* Speed Selector */}
          <div className="flex items-center bg-slate-900 border border-slate-800 rounded-xl p-0.5">
            {[1, 2, 4].map((s) => (
              <button
                key={s}
                onClick={() => onChangeSpeed(s)}
                className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-colors ${
                  speed === s
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {s}x
              </button>
            ))}
          </div>

          {/* Reset button */}
          <button
            onClick={onReset}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
            title="Reset simulation state"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-xl border transition-colors ${
              isMuted
                ? 'bg-slate-900 border-slate-800 text-slate-500'
                : 'bg-slate-800 border-slate-700 text-cyan-400'
            }`}
            title={isMuted ? 'Unmute cognitive audio synthesis' : 'Mute audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Educational Codex button */}
          <button
            onClick={onOpenCodex}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800/80 hover:to-indigo-800/80 text-purple-200 text-xs font-bold border border-purple-700/50 transition-all shadow-md"
          >
            <BookOpen className="w-4 h-4 text-purple-300" />
            <span className="hidden sm:inline">Cognitive Codex</span>
          </button>
        </div>
      </div>
    </header>
  );
};
