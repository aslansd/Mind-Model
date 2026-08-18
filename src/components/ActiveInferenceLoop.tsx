import React from 'react';
import { Eye, Activity, Brain, Compass, Footprints } from 'lucide-react';
import { CharacterMindState } from '../types';

interface ActiveInferenceLoopProps {
  mind: CharacterMindState;
  /** Animated stage from App. Falls back to the mind's own stage. */
  stage?: CharacterMindState['activeInferenceStage'];
}

export const ActiveInferenceLoop: React.FC<ActiveInferenceLoopProps> = ({ mind, stage: stageProp }) => {
  const stage = stageProp ?? mind.activeInferenceStage;

  const nodes = [
    {
      id: 'observe',
      label: '1. SENSORY INPUT',
      sublabel: `${mind.sensory.visibleTiles.length} tiles in visual field`,
      icon: Eye,
      color: 'border-cyan-500 text-cyan-400 bg-cyan-950/40',
      activeColor: 'border-cyan-400 text-white bg-cyan-600/30 ring-2 ring-cyan-400',
      metric: `${(mind.sensory.ambientLight * 100).toFixed(0)}% light`,
    },
    {
      id: 'error_calc',
      label: '2. PREDICTION ERROR',
      sublabel: 'Surprise / Discrepancy',
      icon: Activity,
      color: 'border-rose-500 text-rose-400 bg-rose-950/40',
      activeColor: 'border-rose-400 text-white bg-rose-600/30 ring-2 ring-rose-400',
      metric: `ε = ${mind.currentPredictionError.toFixed(2)}`,
    },
    {
      id: 'belief_update',
      label: '3. BELIEF REVISION',
      sublabel: 'Bayesian posterior update',
      icon: Brain,
      color: 'border-purple-500 text-purple-400 bg-purple-950/40',
      activeColor: 'border-purple-400 text-white bg-purple-600/30 ring-2 ring-purple-400',
      metric: `F = ${mind.freeEnergy.toFixed(2)}`,
    },
    {
      id: 'policy_eval',
      label: '4. EXPECTED FREE ENERGY',
      sublabel: 'G(π) = Epistemic + Pragmatic',
      icon: Compass,
      color: 'border-amber-500 text-amber-400 bg-amber-950/40',
      activeColor: 'border-amber-400 text-white bg-amber-600/30 ring-2 ring-amber-400',
      metric: `Top: ${mind.selectedAction?.label ?? 'None'}`,
    },
    {
      id: 'act',
      label: '5. MOTOR ACTION',
      sublabel: 'Active policy execution',
      icon: Footprints,
      color: 'border-emerald-500 text-emerald-400 bg-emerald-950/40',
      activeColor: 'border-emerald-400 text-white bg-emerald-600/30 ring-2 ring-emerald-400',
      metric: `Pos (${mind.position.x}, ${mind.position.y})`,
    },
  ];

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-xl p-3 sm:p-4 backdrop-blur-md shadow-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
            Active Inference Computational Cycle
          </span>
        </div>
        <span className="text-xs font-mono text-slate-400">
          Step #{mind.stepCount}
        </span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 relative">
        {nodes.map((node) => {
          const Icon = node.icon;
          const isActive = true; // Loop is continuous in cognitive real-time

          return (
            <div
              key={node.id}
              className={`flex flex-col p-2.5 rounded-lg border transition-all duration-300 ${
                isActive ? node.color : 'border-slate-800 text-slate-500 bg-slate-950/30'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Icon className="w-4 h-4" />
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/40 border border-white/5">
                  {node.metric}
                </span>
              </div>
              <span className="text-xs font-bold leading-tight truncate">{node.label}</span>
              <span className="text-[10px] text-slate-400 leading-tight mt-0.5 truncate">{node.sublabel}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
