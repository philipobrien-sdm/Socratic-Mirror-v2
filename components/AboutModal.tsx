import React from 'react';
import { X, Sparkles, BrainCircuit, User, ShieldCheck, MessageCircleQuestion, AlertTriangle, RotateCcw, Layers, Anchor, Activity } from './Icon';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-white dark:bg-slate-900 w-full max-w-2xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="shrink-0 p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-slate-50 dark:bg-slate-950">
          <h2 className="text-2xl font-serif font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="text-indigo-500" />
            About Socratic Mirror <span className="text-xs font-sans font-normal text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-0.5 rounded-full ml-2">v2.0</span>
          </h2>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition-colors text-slate-400 hover:text-slate-600"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-8 text-slate-600 dark:text-slate-300">
          
          <section>
            <p className="text-lg font-serif leading-relaxed text-slate-800 dark:text-slate-200">
              Socratic Mirror v2 is a next-generation introspective engine. It separates your philosophical logic from your psychological drivers, giving you fine-grained control over the depth and safety of the dialogue.
            </p>
          </section>

          <div className="grid sm:grid-cols-2 gap-4">
             <div className="p-4 bg-indigo-50 dark:bg-indigo-900/10 rounded-xl border border-indigo-100 dark:border-indigo-900/30">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                   <Layers size={16} className="text-indigo-500" />
                   Philosophy vs. Psychology
                </h3>
                <p className="text-xs leading-relaxed opacity-90">
                   v2 clearly distinguishes between your <strong>Argument Structures</strong> (logic, epistemology) and your <strong>Emotional Drivers</strong> (values, fears). This prevents valid logical points from being misinterpreted as emotional defense mechanisms.
                </p>
             </div>

             <div className="p-4 bg-emerald-50 dark:bg-emerald-900/10 rounded-xl border border-emerald-100 dark:border-emerald-900/30">
                <h3 className="font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-2 text-sm">
                   <Anchor size={16} className="text-emerald-500" />
                   Grounding & Safety
                </h3>
                <p className="text-xs leading-relaxed opacity-90">
                   New controls allow you to toggle <strong>Grounding Mode</strong> for emotional safety, or adjust the <strong>Philosophical Depth</strong> slider to control how abstract or existential the questioning becomes.
                </p>
             </div>
          </div>

          <section className="space-y-4">
             <h3 className="font-bold text-slate-900 dark:text-white uppercase tracking-wider text-xs">New in v2.0</h3>
             <ul className="space-y-3 text-sm">
               <li className="flex items-start gap-3">
                 <div className="mt-0.5 text-slate-400"><Activity size={16}/></div>
                 <span><strong>Precision Inference:</strong> The engine now requires stronger evidence before inferring subconscious traits, reducing "over-diagnosis" and keeping the profile grounded in your actual words.</span>
               </li>
               <li className="flex items-start gap-3">
                 <div className="mt-0.5 text-slate-400"><MessageCircleQuestion size={16}/></div>
                 <span><strong>Personal Pivots:</strong> The dialogue engine is tuned to regularly pivot from abstract concepts back to your lived experience, preventing purely academic sparring.</span>
               </li>
               <li className="flex items-start gap-3">
                 <div className="mt-0.5 text-slate-400"><ShieldCheck size={16}/></div>
                 <span><strong>Privacy First:</strong> As always, your profile exists only in your browser's LocalStorage. No data is trained on or stored externally.</span>
               </li>
             </ul>
          </section>
          
           <div className="bg-slate-100 dark:bg-slate-800 p-4 rounded-lg flex gap-3 items-start">
            <AlertTriangle size={20} className="text-amber-500 shrink-0 mt-0.5" />
            <div>
              <h4 className="font-bold text-slate-900 dark:text-white text-xs mb-1">Not a Medical Tool</h4>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-normal">
                Socratic Mirror is a philosophical reasoning tool, not a mental health service or therapist. Inferences about "vulnerabilities" or "drivers" are pattern-matching heuristics based on text, not clinical diagnoses.
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};