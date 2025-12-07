import React, { useState } from 'react';
import { UserProfile, InferredAttribute, Evidence } from '../types';
import { X, BookOpen, BrainCircuit, User, Sparkles, MessageSquare, Eye, MessageCircleQuestion, Activity, Layers, Fingerprint, Zap } from './Icon';

interface ProfileModalProps {
  profile: UserProfile;
  isOpen: boolean;
  onClose: () => void;
  onUpdateSelfDescription: (text: string) => void;
  onDisagree: (category: string, value: string) => void;
}

const ConfidencePill = ({ value }: { value: number }) => {
  let color = "bg-slate-200 text-slate-500";
  let label = "Low";
  
  if (value >= 0.8) {
    color = "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400";
    label = "High";
  } else if (value >= 0.5) {
    color = "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400";
    label = "Med";
  }

  return (
    <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded ${color}`}>
      {label}
    </span>
  );
};

const AttributeItem: React.FC<{ 
  item: InferredAttribute; 
  icon?: React.ReactNode;
  categoryLabel: string;
  onDisagree: (category: string, value: string) => void;
}> = ({ item, icon, categoryLabel, onDisagree }) => {
  const [showEvidence, setShowEvidence] = useState(false);

  return (
    <div className="mb-2 last:mb-0">
      <div 
        className="flex items-center justify-between p-2.5 rounded-lg border bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 hover:border-indigo-200 dark:hover:border-indigo-800 transition-colors cursor-pointer group shadow-sm"
        onClick={() => setShowEvidence(!showEvidence)}
      >
        <div className="flex items-center gap-2">
           {icon && <span className="text-slate-400">{icon}</span>}
           <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{item.value}</span>
        </div>
        
        <div className="flex items-center gap-2">
          <ConfidencePill value={item.confidence} />
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDisagree(categoryLabel, item.value);
            }}
            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full text-slate-400 hover:text-indigo-600 transition-all"
            title="Disagree & Discuss"
          >
            <MessageCircleQuestion size={14} />
          </button>
        </div>
      </div>
      
      {showEvidence && (
        <div className="mt-1 ml-2 pl-3 border-l-2 border-indigo-100 dark:border-slate-700 space-y-2 animate-in slide-in-from-top-1 duration-200">
          <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-1 mt-2">Inferred from:</p>
          {item.evidence.map((ev, idx) => (
             <div key={idx} className="bg-slate-50 dark:bg-slate-800/50 p-2 rounded text-xs text-slate-600 dark:text-slate-400 italic">
                "{ev.quote}"
             </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const ProfileModal: React.FC<ProfileModalProps> = ({ 
  profile, 
  isOpen, 
  onClose,
  onUpdateSelfDescription,
  onDisagree
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'philosophy' | 'psychology' | 'bio'>('overview');
  const [isEditing, setIsEditing] = useState(false);
  const [tempDesc, setTempDesc] = useState(profile.selfDescription);

  if (!isOpen) return null;

  const handleSaveDescription = () => {
    onUpdateSelfDescription(tempDesc);
    setIsEditing(false);
  };

  const TabButton = ({ id, label, icon }: { id: any, label: string, icon: React.ReactNode }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
        activeTab === id 
          ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400 dark:border-indigo-400' 
          : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
      }`}
    >
      {icon}
      {label}
    </button>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 sm:p-6">
      <div className="bg-slate-50 dark:bg-slate-950 w-full max-w-4xl max-h-[90vh] rounded-xl shadow-2xl overflow-hidden flex flex-col border border-slate-200 dark:border-slate-800 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="shrink-0 p-6 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex justify-between items-start">
          <div className="flex gap-4">
             <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center shadow-lg text-white shrink-0">
               <Fingerprint size={28} />
             </div>
             <div>
                <h1 className="text-xl font-serif font-bold text-slate-900 dark:text-white">
                  {profile.name || "Subject"}
                </h1>
                <p className="text-sm text-slate-500 flex items-center gap-2 mt-1">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full text-xs font-medium text-slate-600 dark:text-slate-400">v2.0 Profile</span>
                  <span className="text-xs">Dynamic Analysis</span>
                </p>
             </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400"><X size={24} /></button>
        </div>

        {/* Tabs */}
        <div className="flex px-6 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
           <TabButton id="overview" label="Overview" icon={<Activity size={16}/>} />
           <TabButton id="philosophy" label="Philosophy" icon={<Layers size={16}/>} />
           <TabButton id="psychology" label="Psychology" icon={<BrainCircuit size={16}/>} />
           <TabButton id="bio" label="Context" icon={<User size={16}/>} />
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-slate-950">
           
           {/* OVERVIEW TAB */}
           {activeTab === 'overview' && (
             <div className="space-y-6 max-w-3xl mx-auto">
                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <div className="flex justify-between items-center mb-3">
                     <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider">Self Definition</h3>
                     {!isEditing ? (
                        <button onClick={() => setIsEditing(true)} className="text-xs text-indigo-600 hover:underline">Edit</button>
                      ) : (
                        <button onClick={handleSaveDescription} className="text-xs text-emerald-600 font-bold">Save</button>
                      )}
                   </div>
                   {isEditing ? (
                      <textarea value={tempDesc} onChange={(e) => setTempDesc(e.target.value)} className="w-full h-24 p-2 border rounded" />
                    ) : (
                      <p className="font-serif text-lg italic text-slate-700 dark:text-slate-300">
                        "{profile.selfDescription || "The subject has not yet defined themselves."}"
                      </p>
                    )}
                </div>

                <div className="bg-white dark:bg-slate-900 p-6 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                   <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-4">Psychological Summary</h3>
                   <div className="prose prose-slate dark:prose-invert max-w-none text-sm leading-relaxed">
                     {profile.psychologicalProfile}
                   </div>
                </div>
             </div>
           )}

           {/* PHILOSOPHY TAB */}
           {activeTab === 'philosophy' && (
             <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
               <div>
                  <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Leanings & Worldview</h3>
                  <div className="space-y-2">
                    {profile.philosophy.leanings.map(item => (
                      <AttributeItem key={item.id} item={item} icon={<Layers size={14}/>} categoryLabel="Philosophical Leaning" onDisagree={onDisagree} />
                    ))}
                    {profile.philosophy.leanings.length === 0 && <p className="text-slate-400 text-sm italic">No patterns detected yet.</p>}
                  </div>
               </div>
               <div className="space-y-6">
                 <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Epistemic Style</h3>
                    <div className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 text-sm font-medium">
                      {profile.philosophy.epistemicStyle}
                    </div>
                 </div>
                 <div>
                    <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Argument Patterns</h3>
                    {profile.philosophy.argumentPatterns.map(item => (
                      <AttributeItem key={item.id} item={item} categoryLabel="Argument Pattern" onDisagree={onDisagree} />
                    ))}
                 </div>
               </div>
             </div>
           )}

           {/* PSYCHOLOGY TAB */}
           {activeTab === 'psychology' && (
             <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
                <div>
                   <h3 className="text-xs font-bold uppercase text-emerald-600 dark:text-emerald-500 tracking-wider mb-3">Core Values</h3>
                   {profile.psychology.coreValues.map(item => (
                      <AttributeItem key={item.id} item={item} icon={<BookOpen size={14}/>} categoryLabel="Core Value" onDisagree={onDisagree} />
                   ))}
                </div>
                <div>
                   <h3 className="text-xs font-bold uppercase text-amber-600 dark:text-amber-500 tracking-wider mb-3">Motivational Drivers</h3>
                   <div className="bg-amber-50 dark:bg-amber-900/10 p-4 rounded-xl border border-amber-100 dark:border-amber-900/30">
                     {profile.psychology.motivationalDrivers.map(item => (
                        <AttributeItem key={item.id} item={item} icon={<Zap size={14}/>} categoryLabel="Motivational Driver" onDisagree={onDisagree} />
                     ))}
                     {profile.psychology.motivationalDrivers.length === 0 && <p className="text-amber-800/50 text-sm italic">Hidden drivers appear here over time.</p>}
                   </div>
                </div>
                <div>
                   <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Emotional Themes</h3>
                   {profile.psychology.emotionalThemes.map(item => (
                      <AttributeItem key={item.id} item={item} categoryLabel="Emotional Theme" onDisagree={onDisagree} />
                   ))}
                </div>
             </div>
           )}

           {/* BIO TAB */}
           {activeTab === 'bio' && (
             <div className="max-w-2xl mx-auto">
                <h3 className="text-xs font-bold uppercase text-slate-400 tracking-wider mb-3">Known Facts</h3>
                {profile.biographical.facts.map(item => (
                   <AttributeItem key={item.id} item={item} icon={<User size={14}/>} categoryLabel="Biographical Fact" onDisagree={onDisagree} />
                ))}
             </div>
           )}

        </div>
      </div>
    </div>
  );
};