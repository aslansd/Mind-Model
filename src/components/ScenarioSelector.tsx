import React from 'react';
import { ScenarioLevel } from '../types';
import { SCENARIOS } from '../data/scenarios';
import { Sparkles, CheckCircle2, ChevronRight, FlaskConical, BookOpen, Brain } from 'lucide-react';

interface ScenarioSelectorProps {
  currentScenarioId: string;
  onSelectScenario: (scenario: ScenarioLevel) => void;
  completedScenarioIds: string[];
  isSandboxMode: boolean;
  onToggleSandbox: () => void;
}

export const ScenarioSelector: React.FC<ScenarioSelectorProps> = ({
  currentScenarioId,
  onSelectScenario,
  completedScenarioIds,
  isSandboxMode,
  onToggleSandbox,
}) => {
  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
        <div className="flex items-center space-x-2">
          <Brain className="w-5 h-5 text-indigo-400" />
          <h2 className="text-sm font-bold tracking-wide text-slate-100 uppercase">
            COGNITIVE EXPERIMENT SCENARIOS
          </h2>
        </div>

        <button
          onClick={onToggleSandbox}
          className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            isSandboxMode
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 text-white shadow-lg shadow-pink-600/30 ring-2 ring-pink-400'
              : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
          }`}
        >
          <FlaskConical className="w-4 h-4" />
          <span>{isSandboxMode ? 'Active: Sandbox Lab' : 'Enter Sandbox Lab'}</span>
        </button>
      </div>

      {/* Scenarios Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {SCENARIOS.map((sc) => {
          const isSelected = !isSandboxMode && currentScenarioId === sc.id;
          const isCompleted = completedScenarioIds.includes(sc.id);

          return (
            <div
              key={sc.id}
              onClick={() => onSelectScenario(sc)}
              className={`p-3.5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between space-y-2.5 ${
                isSelected
                  ? 'bg-indigo-950/50 border-indigo-500 ring-2 ring-indigo-400/50 shadow-xl'
                  : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-indigo-400 font-bold">
                    {sc.concept}
                  </span>
                  {isCompleted && (
                    <span className="flex items-center space-x-1 text-emerald-400 text-[10px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Solved</span>
                    </span>
                  )}
                </div>

                <h3 className="text-xs font-bold text-slate-100 leading-snug">
                  {sc.title}
                </h3>
                <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                  {sc.subtitle}
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-900 text-[10px] text-slate-400">
                <span className="font-mono">{sc.gridWidth}×{sc.gridHeight} Grid</span>
                <span className="flex items-center space-x-0.5 text-indigo-300 font-semibold group-hover:translate-x-0.5 transition-transform">
                  <span>Experiment</span>
                  <ChevronRight className="w-3 h-3" />
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
