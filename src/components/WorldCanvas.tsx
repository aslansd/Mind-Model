import React, { useState, useRef, useEffect } from 'react';
import { 
  CharacterMindState, 
  PlacedTool, 
  Position, 
  ScenarioLevel, 
  TileType, 
  ToolType 
} from '../types';
import { TOOL_DEFINITIONS } from '../data/tools';
import { Sparkles, Flame, Apple, Bell, ShieldCheck, Wind, Radio, Trash2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface WorldCanvasProps {
  scenario: ScenarioLevel;
  grid: TileType[][];
  mind: CharacterMindState;
  placedTools: PlacedTool[];
  selectedTool: ToolType | null;
  onPlaceTool: (x: number, y: number, toolType: ToolType) => void;
  onRemoveTool: (id: string) => void;
  onTileClick?: (x: number, y: number) => void;
}

export const WorldCanvas: React.FC<WorldCanvasProps> = ({
  scenario,
  grid,
  mind,
  placedTools,
  selectedTool,
  onPlaceTool,
  onRemoveTool,
  onTileClick,
}) => {
  const [hoverPos, setHoverPos] = useState<Position | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const height = grid.length;
  const width = grid[0].length;

  const handleCellClick = (x: number, y: number) => {
    // Check if clicking existing tool
    const existingTool = placedTools.find(t => t.x === x && t.y === y);
    if (existingTool && !selectedTool) {
      onRemoveTool(existingTool.id);
      return;
    }

    if (selectedTool) {
      onPlaceTool(x, y, selectedTool);
    } else if (onTileClick) {
      onTileClick(x, y);
    }
  };

  // Helper to get tool icon component
  const renderToolIcon = (type: ToolType) => {
    switch (type) {
      case 'torch': return <Flame className="w-5 h-5 text-amber-400 animate-pulse" />;
      case 'fruit_bait': return <Apple className="w-5 h-5 text-rose-400 animate-bounce" />;
      case 'bell_chime': return <Bell className="w-5 h-5 text-purple-400" />;
      case 'safe_clue': return <ShieldCheck className="w-5 h-5 text-emerald-400" />;
      case 'calming_scent': return <Sparkles className="w-5 h-5 text-cyan-400 animate-spin" />;
      case 'stochastic_spore': return <Wind className="w-5 h-5 text-pink-400 animate-pulse" />;
      case 'acoustic_probe': return <Radio className="w-5 h-5 text-blue-400 animate-ping" />;
      default: return null;
    }
  };

  // Emotion color for character
  const getEmotionAura = (emotion: string) => {
    switch (emotion) {
      case 'Terrified':
      case 'Anxious':
        return 'from-rose-500/50 to-red-600/30 ring-red-500 shadow-red-500/50';
      case 'Curious':
      case 'Euphoric':
        return 'from-cyan-500/50 to-indigo-600/30 ring-cyan-400 shadow-cyan-500/50';
      case 'Confident':
      case 'Content':
        return 'from-emerald-500/50 to-teal-600/30 ring-emerald-400 shadow-emerald-500/50';
      case 'Perplexed':
      case 'Cautious':
      default:
        return 'from-amber-500/50 to-yellow-600/30 ring-amber-400 shadow-amber-500/50';
    }
  };

  // Check if tile is in character FOV
  const isTileVisible = (x: number, y: number) => {
    return mind.sensory.visibleTiles.some(t => t.x === x && t.y === y);
  };

  // Check tile brightness
  const getTileBrightness = (x: number, y: number) => {
    const tileObs = mind.sensory.visibleTiles.find(t => t.x === x && t.y === y);
    return tileObs ? tileObs.brightness : 0.15;
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full overflow-hidden bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-6 shadow-2xl flex flex-col items-center justify-center select-none"
    >
      {/* Top status bar overlay */}
      <div className="w-full flex items-center justify-between mb-4 px-2">
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Agent:</span>
            <span className="font-semibold text-cyan-300">Noa</span>
            <span className="text-slate-600">|</span>
            <span className="text-slate-400">Affect:</span>
            <span className="font-medium text-amber-300">{mind.emotions.dominantEmotion}</span>
          </div>

          <div className="hidden sm:flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-xs">
            <span className="text-slate-400">Heart:</span>
            <span className="font-mono text-rose-400">{mind.sensory.interoception.heartRate} bpm</span>
          </div>
        </div>

        <div className="text-xs text-slate-400 flex items-center space-x-2">
          {selectedTool ? (
            <span className="text-amber-400 font-medium animate-pulse flex items-center space-x-1">
              <span>Click tile to place {TOOL_DEFINITIONS[selectedTool].name}</span>
            </span>
          ) : (
            <span>Click any placed tool to remove</span>
          )}
        </div>
      </div>

      {/* Grid Canvas Wrapper */}
      <div 
        className="relative grid gap-1.5 p-3 sm:p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-inner max-w-full overflow-auto"
        style={{
          gridTemplateColumns: `repeat(${width}, minmax(44px, 58px))`,
          gridTemplateRows: `repeat(${height}, minmax(44px, 58px))`,
        }}
      >
        {/* Render each grid tile */}
        {grid.map((row, y) =>
          row.map((tile, x) => {
            const isCharHere = mind.position.x === x && mind.position.y === y;
            const isCompanionHere = scenario.companionPos?.x === x && scenario.companionPos?.y === y;
            const placedToolHere = placedTools.find(t => t.x === x && t.y === y);
            const visible = isTileVisible(x, y);
            const brightness = getTileBrightness(x, y);
            const isHovered = hoverPos?.x === x && hoverPos?.y === y;

            // Check if selected tool radius covers this tile
            const isInToolRadius = selectedTool && hoverPos
              ? Math.hypot(x - hoverPos.x, y - hoverPos.y) <= TOOL_DEFINITIONS[selectedTool].radius
              : false;

            return (
              <div
                key={`${x}-${y}`}
                onClick={() => handleCellClick(x, y)}
                onMouseEnter={() => setHoverPos({ x, y })}
                onMouseLeave={() => setHoverPos(null)}
                className={`relative w-full h-full rounded-lg flex items-center justify-center cursor-pointer transition-all duration-200 ${
                  tile === 'wall'
                    ? 'bg-slate-800 border-2 border-slate-700/80 shadow-md'
                    : 'bg-slate-950/80 border border-slate-800/60 hover:border-slate-600'
                } ${isInToolRadius ? 'ring-2 ring-amber-400/40 bg-amber-950/20' : ''}`}
                style={{
                  opacity: visible || tile === 'wall' ? 1 : 0.45,
                  filter: visible ? `brightness(${0.6 + brightness * 0.5})` : 'brightness(0.35)',
                }}
              >
                {/* Visual rendering for specific tiles */}
                {tile === 'red_door' && (
                  <div className="flex flex-col items-center justify-center w-full h-full rounded-lg bg-rose-950/80 border-2 border-rose-600 shadow-lg shadow-rose-900/50">
                    <div className="w-3 h-4 rounded-t-sm border border-rose-400 bg-rose-500/40 flex items-center justify-center">
                      <div className="w-1 h-1.5 rounded-full bg-rose-200 animate-ping" />
                    </div>
                    <span className="text-[9px] font-bold text-rose-300 mt-0.5 tracking-tighter">RED DOOR</span>
                  </div>
                )}

                {tile === 'blue_door' && (
                  <div className="flex flex-col items-center justify-center w-full h-full rounded-lg bg-blue-950/80 border-2 border-blue-600 shadow-lg shadow-blue-900/50">
                    <div className="w-4 h-4 rounded border border-blue-400 bg-blue-500/30 flex items-center justify-center">
                      <div className="w-1.5 h-1.5 bg-blue-300 animate-pulse" />
                    </div>
                    <span className="text-[9px] font-bold text-blue-300 mt-0.5 tracking-tighter">LOCKED</span>
                  </div>
                )}

                {tile === 'green_door' && (
                  <div className="flex flex-col items-center justify-center w-full h-full rounded-lg bg-emerald-950/80 border-2 border-emerald-600 shadow-lg shadow-emerald-900/50">
                    <span className="text-[9px] font-bold text-emerald-300 tracking-tighter">DUAL GATE</span>
                  </div>
                )}

                {tile === 'goal_fruit' && (
                  <div className="relative flex items-center justify-center">
                    <div className="absolute w-8 h-8 rounded-full bg-amber-400/30 animate-ping" />
                    <Apple className="w-6 h-6 text-amber-400 drop-shadow-[0_0_8px_rgba(251,191,36,0.8)] animate-pulse" />
                  </div>
                )}

                {tile === 'shadow' && (
                  <div className="w-full h-full rounded-lg bg-indigo-950/60 border border-indigo-900 flex items-center justify-center overflow-hidden">
                    <div className="text-[10px] text-indigo-400/80 font-mono tracking-widest animate-pulse">
                      ~ FOG ~
                    </div>
                  </div>
                )}

                {tile === 'lever' && (
                  <div className="flex flex-col items-center justify-center">
                    <div className="w-1.5 h-5 bg-amber-500 rounded-full rotate-12 shadow-md shadow-amber-500/50 border border-amber-300" />
                    <span className="text-[8px] font-mono text-amber-400 font-bold mt-0.5">LEVER</span>
                  </div>
                )}

                {tile === 'target_pad' && (
                  <div className="w-7 h-7 rounded-full border-2 border-dashed border-emerald-400 flex items-center justify-center bg-emerald-950/30 animate-pulse">
                    <div className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
                  </div>
                )}

                {/* Placed Tools on this tile */}
                {placedToolHere && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-slate-900/80 rounded-lg border border-amber-400/80 shadow-lg group">
                    {renderToolIcon(placedToolHere.type)}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveTool(placedToolHere.id);
                      }}
                      className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-rose-600 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-2.5 h-2.5" />
                    </button>
                  </div>
                )}

                {/* Companion Automaton Kip */}
                {isCompanionHere && !isCharHere && (
                  <div className="absolute inset-0 z-15 flex flex-col items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-indigo-600 border-2 border-indigo-300 shadow-lg flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-cyan-200 animate-pulse" />
                    </div>
                    <span className="text-[8px] font-bold text-indigo-300 mt-0.5">KIP</span>
                  </div>
                )}

                {/* Character Noa */}
                {isCharHere && (
                  <motion.div 
                    layoutId="character-noa"
                    transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                    className={`absolute inset-0 z-20 flex flex-col items-center justify-center`}
                  >
                    {/* Expressive Avatar */}
                    <div className={`relative w-9 h-9 rounded-full bg-gradient-to-tr ${getEmotionAura(mind.emotions.dominantEmotion)} border-2 shadow-xl flex items-center justify-center`}>
                      {/* Inner eye / neural pupil */}
                      <div className="w-4 h-4 rounded-full bg-slate-950 border border-white/40 flex items-center justify-center">
                        <div 
                          className="w-2 h-2 rounded-full bg-cyan-300 shadow-sm"
                          style={{
                            transform: mind.facing === 'right' ? 'translateX(1.5px)' 
                              : mind.facing === 'left' ? 'translateX(-1.5px)'
                              : mind.facing === 'up' ? 'translateY(-1.5px)'
                              : 'translateY(1.5px)',
                          }}
                        />
                      </div>

                      {/* Heading direction arrow */}
                      <div className="absolute -bottom-1 w-2 h-2 bg-white rounded-full shadow-sm" />
                    </div>
                  </motion.div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Floating Cognitive Thought Bubble */}
      <div className="w-full max-w-xl mt-4 px-3 py-2.5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-lg flex items-start space-x-3">
        <div className="p-1.5 rounded-lg bg-cyan-950 border border-cyan-700/50 text-cyan-400 shrink-0">
          <Sparkles className="w-4 h-4" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-slate-300">Noa's Internal Cognitive Thought</span>
            <span className="text-[10px] font-mono text-cyan-400">
              Entropy F: {mind.freeEnergy.toFixed(2)}
            </span>
          </div>
          <p className="text-xs text-slate-200 mt-0.5 leading-relaxed font-sans italic">
            "{mind.thoughtBubble}"
          </p>
        </div>
      </div>
    </div>
  );
};
