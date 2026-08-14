import React from 'react';
import { CharacterMindState, TileType } from '../types';
import { Sliders, Wrench, RefreshCw, Palette } from 'lucide-react';

interface SandboxControlsProps {
  hyperParams: CharacterMindState['hyperParameters'];
  onUpdateHyperParam: (key: keyof CharacterMindState['hyperParameters'], value: number) => void;
  paintTile: TileType | null;
  onSelectPaintTile: (tile: TileType | null) => void;
  onResetGrid: () => void;
}

export const SandboxControls: React.FC<SandboxControlsProps> = ({
  hyperParams,
  onUpdateHyperParam,
  paintTile,
  onSelectPaintTile,
  onResetGrid,
}) => {
  const paintPalette: { tile: TileType; label: string; color: string }[] = [
    { tile: 'empty', label: 'Floor', color: 'bg-slate-800' },
    { tile: 'wall', label: 'Wall', color: 'bg-slate-700' },
    { tile: 'red_door', label: 'Red Door', color: 'bg-rose-600' },
    { tile: 'blue_door', label: 'Blue Door', color: 'bg-blue-600' },
    { tile: 'shadow', label: 'Shadow Fog', color: 'bg-indigo-900' },
    { tile: 'lever', label: 'Lever', color: 'bg-amber-600' },
    { tile: 'goal_fruit', label: 'Goal Fruit', color: 'bg-yellow-500' },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Sliders className="w-5 h-5 text-pink-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            ACTIVE INFERENCE HYPERPARAMETER LAB
          </h3>
        </div>

        <button
          onClick={onResetGrid}
          className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset Lab Map</span>
        </button>
      </div>

      {/* Sliders Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* 1. Precision Weight gamma */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Belief Precision (γ)</span>
            <span className="font-mono text-cyan-400">{hyperParams.precisionWeight.toFixed(2)}x</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            How rigidly the brain trusts its current beliefs vs sensory evidence.
          </p>
          <input
            type="range"
            min="0.2"
            max="2.5"
            step="0.1"
            value={hyperParams.precisionWeight}
            onChange={(e) => onUpdateHyperParam('precisionWeight', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 cursor-pointer"
          />
        </div>

        {/* 2. Epistemic Weight beta */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Curiosity / Epistemic (β)</span>
            <span className="font-mono text-amber-400">{hyperParams.epistemicWeight.toFixed(2)}x</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Weight of information gain and ambiguity reduction in Expected Free Energy.
          </p>
          <input
            type="range"
            min="0.0"
            max="2.5"
            step="0.1"
            value={hyperParams.epistemicWeight}
            onChange={(e) => onUpdateHyperParam('epistemicWeight', parseFloat(e.target.value))}
            className="w-full accent-amber-400 cursor-pointer"
          />
        </div>

        {/* 3. Sensory Noise omega */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Sensory Noise (ω)</span>
            <span className="font-mono text-rose-400">{(hyperParams.sensoryNoise * 100).toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Sensory uncertainty causing top-down prior hallucinations.
          </p>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={hyperParams.sensoryNoise}
            onChange={(e) => onUpdateHyperParam('sensoryNoise', parseFloat(e.target.value))}
            className="w-full accent-rose-400 cursor-pointer"
          />
        </div>

        {/* 4. Fear Freeze Threshold */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Fear Freeze Threshold</span>
            <span className="font-mono text-purple-400">{(hyperParams.fearThreshold * 100).toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Hazard probability threshold that triggers catastrophic motor freeze.
          </p>
          <input
            type="range"
            min="0.1"
            max="0.9"
            step="0.05"
            value={hyperParams.fearThreshold}
            onChange={(e) => onUpdateHyperParam('fearThreshold', parseFloat(e.target.value))}
            className="w-full accent-purple-400 cursor-pointer"
          />
        </div>

        {/* 5. Habit Persistence */}
        <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 space-y-1.5">
          <div className="flex justify-between text-xs font-semibold">
            <span className="text-slate-300">Habit Perseveration</span>
            <span className="font-mono text-pink-400">{((hyperParams.habitPersistence ?? 0.5) * 100).toFixed(0)}%</span>
          </div>
          <p className="text-[10px] text-slate-400 leading-tight">
            Tendency to repeat familiar policy routines despite changing environments.
          </p>
          <input
            type="range"
            min="0.0"
            max="1.0"
            step="0.05"
            value={hyperParams.habitPersistence ?? 0.5}
            onChange={(e) => onUpdateHyperParam('habitPersistence', parseFloat(e.target.value))}
            className="w-full accent-pink-400 cursor-pointer"
          />
        </div>
      </div>

      {/* Paint Tile Palette */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <div className="flex items-center space-x-2 text-xs font-bold text-slate-300">
          <Palette className="w-4 h-4 text-emerald-400" />
          <span>PAINT MAP TILES (CLICK ON GRID TO DRAW)</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {paintPalette.map(item => (
            <button
              key={item.tile}
              onClick={() => onSelectPaintTile(paintTile === item.tile ? null : item.tile)}
              className={`px-3 py-1.5 rounded-xl border text-xs font-semibold flex items-center space-x-1.5 transition-all ${
                paintTile === item.tile
                  ? 'bg-emerald-600 text-white border-emerald-400 ring-2 ring-emerald-400/40'
                  : 'bg-slate-950 text-slate-300 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div className={`w-3 h-3 rounded-full ${item.color}`} />
              <span>{item.label}</span>
            </button>
          ))}
          {paintTile && (
            <button
              onClick={() => onSelectPaintTile(null)}
              className="px-3 py-1.5 rounded-xl bg-slate-800 text-rose-300 text-xs font-semibold hover:bg-slate-700 transition-colors"
            >
              Stop Painting
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
