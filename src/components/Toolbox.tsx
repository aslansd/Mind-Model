import React from 'react';
import { ToolType } from '../types';
import { TOOL_DEFINITIONS } from '../data/tools';
import { Flame, Apple, Bell, ShieldCheck, Sparkles, Wind, Radio, Info, RotateCcw } from 'lucide-react';

interface ToolboxProps {
  availableTools: ToolType[];
  selectedTool: ToolType | null;
  onSelectTool: (tool: ToolType | null) => void;
  onClearTools: () => void;
  placedCount: number;
}

export const Toolbox: React.FC<ToolboxProps> = ({
  availableTools,
  selectedTool,
  onSelectTool,
  onClearTools,
  placedCount,
}) => {
  const getToolIcon = (type: ToolType) => {
    switch (type) {
      case 'torch': return <Flame className="w-5 h-5 text-amber-400" />;
      case 'fruit_bait': return <Apple className="w-5 h-5 text-rose-400" />;
      case 'bell_chime': return <Bell className="w-5 h-5 text-purple-400" />;
      case 'safe_clue': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'calming_scent': return <Sparkles className="w-5 h-5 text-cyan-400" />;
      case 'stochastic_spore': return <Wind className="w-5 h-5 text-pink-400" />;
      case 'acoustic_probe': return <Radio className="w-5 h-5 text-blue-400" />;
      default: return null;
    }
  };

  const activeToolDef = selectedTool ? TOOL_DEFINITIONS[selectedTool] : null;

  return (
    <div className="w-full bg-slate-900/90 border border-slate-800 rounded-2xl p-4 sm:p-5 backdrop-blur-md shadow-xl flex flex-col space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-200">
            ENVIRONMENTAL MANIPULATION TOOLBOX
          </h3>
        </div>

        {placedCount > 0 && (
          <button
            onClick={onClearTools}
            className="flex items-center space-x-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear Placed ({placedCount})</span>
          </button>
        )}
      </div>

      {/* Tool items grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
        {availableTools.map((type) => {
          const def = TOOL_DEFINITIONS[type];
          const isSelected = selectedTool === type;

          return (
            <button
              key={type}
              onClick={() => onSelectTool(isSelected ? null : type)}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center space-y-1.5 transition-all text-center group ${
                isSelected
                  ? 'bg-amber-500/20 border-amber-400 ring-2 ring-amber-400/50 shadow-lg'
                  : 'bg-slate-950/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
              }`}
            >
              <div className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 group-hover:scale-110 transition-transform">
                {getToolIcon(type)}
              </div>
              <span className="text-[11px] font-bold text-slate-200 leading-tight">
                {def.name}
              </span>
              <span className="text-[9px] text-slate-400 font-mono">
                r = {def.radius} tiles
              </span>
            </button>
          );
        })}
      </div>

      {/* Active Selected Tool Information Card */}
      {activeToolDef ? (
        <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-500/30 flex items-start space-x-3 text-xs">
          <div className="p-1.5 rounded-lg bg-amber-900/40 text-amber-300 shrink-0 mt-0.5">
            <Info className="w-4 h-4" />
          </div>
          <div className="space-y-1 flex-1">
            <div className="font-semibold text-amber-200">{activeToolDef.name}: {activeToolDef.description}</div>
            <div className="text-slate-300 text-[11px] leading-relaxed">
              <strong className="text-amber-400">Cognitive Mechanism: </strong>
              {activeToolDef.cognitiveEffect}
            </div>
          </div>
        </div>
      ) : (
        <div className="text-[11px] text-slate-400 italic text-center py-1">
          Select a tool above, then click on the grid map to place it.
        </div>
      )}
    </div>
  );
};
