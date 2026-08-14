import React from 'react';
import { BookOpen, X, Brain, Activity, Compass, Shield, Sparkles, CheckCircle } from 'lucide-react';

interface CognitiveCodexModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CognitiveCodexModal: React.FC<CognitiveCodexModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-slate-900 border border-slate-700 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-200">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-cyan-950 border border-cyan-700 text-cyan-400">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-100">Cognitive Codex: Active Inference & Predictive Processing</h2>
              <p className="text-xs text-slate-400">The Neuroscience & Mathematics behind Mind Model</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 text-sm leading-relaxed">
          {/* Section 1: The Predictive Brain */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-cyan-400 font-bold text-sm">
              <Brain className="w-4 h-4" />
              <span>1. The Predictive Brain & Helmholtzian Inference</span>
            </div>
            <p className="text-xs text-slate-300">
              Traditional neuroscience viewed the brain as a passive sensory receiver: inputs come in from the eyes, get processed step-by-step, and generate a reaction.
              In <strong>Predictive Processing (Andy Clark, Anil Seth, Karl Friston)</strong>, the brain is an <em>active prediction machine</em>.
              It continuously generates top-down expectations about the world, and only transmits <strong>prediction errors</strong> (the difference between expected and actual sensory inputs) up the neural hierarchy.
            </p>
          </div>

          {/* Section 2: The Free Energy Principle */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-purple-400 font-bold text-sm">
              <Activity className="w-4 h-4" />
              <span>2. The Free Energy Principle (Karl Friston)</span>
            </div>
            <p className="text-xs text-slate-300">
              Any self-organizing biological entity must resist entropy and maintain homeostatic bounds. It does so by minimizing a mathematical quantity called <strong>Variational Free Energy (F)</strong>:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-center text-amber-300">
              Free Energy F = Complexity(Belief || Prior) − Accuracy(Observation | Belief)
            </div>
            <p className="text-xs text-slate-300">
              Minimizing Free Energy mathematically bounds <em>surprise</em>. An organism has two ways to minimize Free Energy:
            </p>
            <ul className="text-xs text-slate-300 space-y-1 list-disc list-inside">
              <li><strong className="text-cyan-300">Perceptual Inference:</strong> Update internal beliefs to match sensory observations (Bayesian update).</li>
              <li><strong className="text-emerald-300">Active Inference:</strong> Take actions in the world to make sensory observations conform to prior expectations!</li>
            </ul>
          </div>

          {/* Section 3: Expected Free Energy G(pi) */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-amber-400 font-bold text-sm">
              <Compass className="w-4 h-4" />
              <span>3. Expected Free Energy G(π): Curiosity vs Exploitation</span>
            </div>
            <p className="text-xs text-slate-300">
              How does the brain choose actions? It evaluates candidate motor policies (π) by computing their <strong>Expected Free Energy G(π)</strong>:
            </p>
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800 font-mono text-xs text-center text-cyan-300">
              G(π) = − [ Epistemic Value (Information Gain) + Pragmatic Value (Reward Prior) ]
            </div>
            <p className="text-xs text-slate-300">
              This explains why humans and animals are naturally <strong>curious</strong>: actions that resolve ambiguity (epistemic value) minimize future free energy just as effectively as actions that secure food (pragmatic value).
            </p>
          </div>

          {/* Section 4: Computational Psychiatry */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-rose-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>4. Precision Weighting & Computational Psychiatry</span>
            </div>
            <p className="text-xs text-slate-300">
              <strong>Precision (γ)</strong> is the brain's confidence in its predictions or sensory channels.
            </p>
            <ul className="text-xs text-slate-300 space-y-1.5 list-disc list-inside">
              <li><strong>Phobias & Trauma:</strong> Hyper-precise danger priors cause the brain to discount safe evidence and freeze (e.g. Level 1's Red Door).</li>
              <li><strong>Hallucinations & Sensory Attenuation:</strong> In darkness or sensory deprivation, low bottom-up precision causes prior expectations to project phantom threats (Level 2).</li>
              <li><strong>Perseveration & OCD:</strong> Hyper-rigid habit precision locks the agent into repetitive checking loops (Level 5).</li>
            </ul>
          </div>

          {/* Section 5: Why You Manipulate the Environment */}
          <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-emerald-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>5. Why Environment Manipulation Works</span>
            </div>
            <p className="text-xs text-slate-300">
              In Mind Model, you do not possess direct telepathic motor control over Noa. Instead, you act as the environment.
              By placing lighting, evidence markers, auditory chimes, and scent baits, you alter the <em>sensory evidence landscape</em>.
              Noa's autonomous Bayesian generative model senses this new evidence, updates its posterior beliefs, recalculates Expected Free Energy, and willingly navigates forward!
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between">
          <span className="text-xs text-slate-400">Active Inference Game Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold transition-all shadow-lg shadow-cyan-600/30"
          >
            Return to Simulation
          </button>
        </div>
      </div>
    </div>
  );
};
