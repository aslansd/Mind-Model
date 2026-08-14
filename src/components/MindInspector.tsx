import React, { useState } from 'react';
import { 
  CharacterMindState, 
  DiscreteBelief, 
  PolicyAction 
} from '../types';
import { Brain, Activity, Compass, MessageSquareCode, ShieldAlert, Sparkles, TrendingUp, Info } from 'lucide-react';

interface MindInspectorProps {
  mind: CharacterMindState;
}

export const MindInspector: React.FC<MindInspectorProps> = ({ mind }) => {
  const [activeTab, setActiveTab] = useState<'beliefs' | 'emotions' | 'policies' | 'monologue'>('beliefs');

  const getBeliefCategoryBadge = (category: DiscreteBelief['category']) => {
    switch (category) {
      case 'hazard':
        return <span className="px-2 py-0.5 rounded bg-rose-950 text-rose-300 border border-rose-800 text-[10px] uppercase font-bold">Hazard Prior</span>;
      case 'affordance':
        return <span className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800 text-[10px] uppercase font-bold">Affordance</span>;
      case 'sensory':
        return <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-[10px] uppercase font-bold">Sensory Binding</span>;
      case 'social':
        return <span className="px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800 text-[10px] uppercase font-bold">Theory of Mind</span>;
      case 'rule':
      default:
        return <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] uppercase font-bold">Rule Model</span>;
    }
  };

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col h-full min-h-[420px]">
      {/* Header with Tab Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-cyan-400" />
          <h2 className="text-sm font-bold tracking-wide text-slate-100">
            INTERNAL MIND ARCHITECTURE
          </h2>
        </div>

        {/* Tab Buttons */}
        <div className="flex items-center space-x-1 bg-slate-950 p-1 rounded-xl border border-slate-800/80 overflow-x-auto">
          <button
            onClick={() => setActiveTab('beliefs')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'beliefs'
                ? 'bg-cyan-600 text-white shadow-md shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>Beliefs & Precision</span>
          </button>

          <button
            onClick={() => setActiveTab('emotions')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'emotions'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            <span>Free Energy & Affect</span>
          </button>

          <button
            onClick={() => setActiveTab('policies')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'policies'
                ? 'bg-amber-600 text-white shadow-md shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>Policy EFE G(π)</span>
          </button>

          <button
            onClick={() => setActiveTab('monologue')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'monologue'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <MessageSquareCode className="w-3.5 h-3.5" />
            <span>Cognitive Stream</span>
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto mt-4 pr-1">
        {/* TAB 1: BELIEFS & PRECISION */}
        {activeTab === 'beliefs' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Bayesian Posterior Distributions P(s|o) ∝ P(o|s) P(s)</span>
              <span className="font-mono text-cyan-400">Precision Weight: {mind.hyperParameters.precisionWeight}x</span>
            </div>

            {mind.beliefs.map(belief => {
              const probPercent = Math.round(belief.probabilityA * 100);
              const priorPercent = Math.round(belief.priorProbabilityA * 100);
              const delta = probPercent - priorPercent;

              return (
                <div 
                  key={belief.id}
                  className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-slate-200">{belief.name}</span>
                      {getBeliefCategoryBadge(belief.category)}
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-slate-400">Prior: {priorPercent}%</span>
                      <span className="text-slate-600">→</span>
                      <span className={`font-bold ${probPercent > 50 ? 'text-amber-400' : 'text-emerald-400'}`}>
                        {probPercent}%
                      </span>
                      {delta !== 0 && (
                        <span className={`text-[10px] font-bold ${delta < 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({delta > 0 ? `+${delta}` : delta}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-[11px] text-slate-400 leading-tight">
                    {belief.description}
                  </p>

                  {/* Dual Probability Bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                      <span className="text-rose-400 font-medium">{belief.hypothesisA}</span>
                      <span className="text-emerald-400 font-medium">{belief.hypothesisB}</span>
                    </div>
                    <div className="w-full h-3 rounded-full bg-slate-800 overflow-hidden flex p-0.5 border border-slate-700">
                      <div 
                        className="h-full rounded-l-full bg-gradient-to-r from-rose-500 to-amber-500 transition-all duration-300"
                        style={{ width: `${probPercent}%` }}
                      />
                      <div 
                        className="h-full rounded-r-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-300"
                        style={{ width: `${100 - probPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Precision Meter */}
                  <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                    <span>Hyper-Prior Precision (Confidence / Inverse Variance γ):</span>
                    <span className="font-mono text-cyan-300 font-bold">{(belief.precision * 100).toFixed(0)}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 2: FREE ENERGY & EMOTIONS */}
        {activeTab === 'emotions' && (
          <div className="space-y-4">
            {/* Top metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Variational Free Energy (F)</span>
                <div className="text-xl font-mono font-bold text-purple-400 mt-1">
                  {mind.freeEnergy.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500">Complexity − Accuracy</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Prediction Error (ε)</span>
                <div className="text-xl font-mono font-bold text-rose-400 mt-1">
                  {mind.currentPredictionError.toFixed(2)}
                </div>
                <span className="text-[10px] text-slate-500">Sensory Surprise magnitude</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Epistemic Drive (Curiosity)</span>
                <div className="text-xl font-mono font-bold text-cyan-400 mt-1">
                  {(mind.emotions.curiosity * 100).toFixed(0)}%
                </div>
                <span className="text-[10px] text-slate-500">Information gain drive</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-[10px] uppercase font-bold text-slate-400">Dominant Affect</span>
                <div className="text-base font-bold text-amber-300 mt-1 truncate">
                  {mind.emotions.dominantEmotion}
                </div>
                <span className="text-[10px] text-slate-500">Valence: {mind.emotions.valence > 0 ? `+${mind.emotions.valence}` : mind.emotions.valence}</span>
              </div>
            </div>

            {/* Affective Circumplex (2D Plane of Valence vs Arousal) */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-200">2D Affective Core Circumplex</span>
                <span className="text-[10px] font-mono text-slate-400">Russells Model of Emotion</span>
              </div>

              <div className="relative w-full h-44 bg-slate-900 rounded-lg border border-slate-800 p-2 flex items-center justify-center overflow-hidden">
                {/* Axis lines */}
                <div className="absolute inset-x-0 h-px bg-slate-700/60 top-1/2" />
                <div className="absolute inset-y-0 w-px bg-slate-700/60 left-1/2" />

                {/* Quadrant Labels */}
                <span className="absolute top-2 left-3 text-[9px] text-rose-400/70 font-semibold uppercase">Terrified / Anxious</span>
                <span className="absolute top-2 right-3 text-[9px] text-cyan-400/70 font-semibold uppercase">Excited / Curious</span>
                <span className="absolute bottom-2 left-3 text-[9px] text-slate-500 font-semibold uppercase">Lethargic / Frozen</span>
                <span className="absolute bottom-2 right-3 text-[9px] text-emerald-400/70 font-semibold uppercase">Calm / Content</span>

                {/* Axis labels */}
                <span className="absolute right-2 top-1/2 -translate-y-4 text-[8px] font-mono text-slate-400">+Valence</span>
                <span className="absolute left-2 top-1/2 -translate-y-4 text-[8px] font-mono text-slate-400">-Valence</span>
                <span className="absolute top-2 left-1/2 translate-x-2 text-[8px] font-mono text-slate-400">+Arousal</span>

                {/* Agent Emotional Coordinate Marker */}
                <div 
                  className="absolute w-5 h-5 rounded-full bg-cyan-400 border-2 border-white shadow-lg shadow-cyan-400/80 transition-all duration-500 flex items-center justify-center -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${((mind.emotions.valence + 1) / 2) * 80 + 10}%`,
                    top: `${(1 - mind.emotions.arousal) * 80 + 10}%`,
                  }}
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                </div>
              </div>

              <p className="text-[11px] text-slate-400 leading-relaxed">
                In Active Inference, <strong className="text-slate-300">Valence</strong> reflects the rate of Free Energy reduction (<span className="font-mono">dF/dt</span>), and <strong className="text-slate-300">Arousal</strong> reflects sensory surprise / entropy.
              </p>
            </div>
          </div>
        )}

        {/* TAB 3: POLICY EVALUATION G(pi) */}
        {activeTab === 'policies' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>Expected Free Energy: G(π) = − Epistemic − Pragmatic</span>
              <span className="font-mono text-amber-400">Softmax Choice</span>
            </div>

            <div className="space-y-2.5">
              {mind.policyCandidates.map((policy) => {
                const isSelected = mind.selectedAction?.label === policy.label;
                const probPercent = Math.round(policy.probability * 100);

                return (
                  <div
                    key={policy.label}
                    className={`p-3 rounded-xl border transition-all ${
                      isSelected
                        ? 'bg-amber-950/40 border-amber-500/80 ring-1 ring-amber-400 shadow-md'
                        : 'bg-slate-950/70 border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-bold text-slate-200">
                          Policy: {policy.label}
                        </span>
                        {isSelected && (
                          <span className="px-1.5 py-0.2 rounded bg-amber-500 text-black text-[9px] font-bold">
                            CHOSEN
                          </span>
                        )}
                      </div>
                      <div className="text-xs font-mono">
                        <span className="text-slate-400">P(π): </span>
                        <span className="font-bold text-cyan-300">{probPercent}%</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 mt-2 text-[10px] font-mono">
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Epistemic: </span>
                        <span className="text-cyan-400 font-bold">+{policy.epistemicValue}</span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">Pragmatic: </span>
                        <span className={policy.pragmaticValue >= 0 ? 'text-emerald-400 font-bold' : 'text-rose-400 font-bold'}>
                          {policy.pragmaticValue >= 0 ? `+${policy.pragmaticValue}` : policy.pragmaticValue}
                        </span>
                      </div>
                      <div className="p-1.5 rounded bg-slate-900 border border-slate-800">
                        <span className="text-slate-400">G(π): </span>
                        <span className="text-amber-300 font-bold">{policy.expectedFreeEnergy}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 4: COGNITIVE STREAM */}
        {activeTab === 'monologue' && (
          <div className="space-y-2 font-mono text-xs">
            <div className="text-slate-400 mb-2 flex items-center justify-between">
              <span>Active Inference Stream of Consciousness</span>
              <span className="text-purple-400">Live Rationale</span>
            </div>

            {mind.innerMonologue.length === 0 ? (
              <div className="text-slate-500 italic p-4 text-center">
                Awaiting first step observation...
              </div>
            ) : (
              mind.innerMonologue.map((thought, idx) => (
                <div
                  key={idx}
                  className={`p-2.5 rounded-lg border leading-relaxed ${
                    thought.includes('Action taken')
                      ? 'bg-emerald-950/30 border-emerald-800/60 text-emerald-300'
                      : thought.includes('PE') || thought.includes('Prediction')
                      ? 'bg-rose-950/30 border-rose-800/60 text-rose-300'
                      : thought.includes('Sensory') || thought.includes('P(')
                      ? 'bg-cyan-950/30 border-cyan-800/60 text-cyan-300'
                      : 'bg-slate-950 border-slate-800/80 text-slate-300'
                  }`}
                >
                  {thought}
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
