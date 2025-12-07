import React, { useState, useEffect, useRef } from 'react';
import { 
  Message, 
  ChatSession, 
  UserProfile, 
  AppState, 
  ControlState,
  INITIAL_PROFILE,
  INITIAL_CONTROLS
} from './types';
import { streamSocraticResponse, analyzeAndUpdateProfile } from './services/geminiService';
import { DEMO_DATA } from './demoData';
import { ChatArea } from './components/ChatArea';
import { ProfileModal } from './components/ProfileModal';
import { AboutModal } from './components/AboutModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { 
  MessageSquare, 
  Plus, 
  Download, 
  Upload, 
  Trash2, 
  Menu, 
  X,
  User,
  Fingerprint,
  Info,
  Sparkles,
  RotateCcw,
  Anchor,
  Layers,
  Activity
} from './components/Icon';

const STORAGE_KEY = 'socratic_mirror_state_v2'; // Changed key for v2 migration

const generateId = () => Math.random().toString(36).substring(2, 15);

function App() {
  // --- State ---
  const [chats, setChats] = useState<Record<string, ChatSession>>({});
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile>(INITIAL_PROFILE);
  const [controls, setControls] = useState<ControlState>(INITIAL_CONTROLS);
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAboutOpen, setIsAboutOpen] = useState(false);
  const [isDemoConfirmOpen, setIsDemoConfirmOpen] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Initialization ---
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed: AppState = JSON.parse(saved);
        // Basic validation for v2 structure
        if (!parsed.userProfile.philosophy) {
            console.warn("Detected invalid/old state. Resetting to default.");
            createNewChat();
        } else {
            setChats(parsed.chats || {});
            setActiveChatId(parsed.activeChatId);
            setUserProfile(parsed.userProfile || INITIAL_PROFILE);
            setControls(parsed.controls || INITIAL_CONTROLS);
        }
      } catch (e) {
        console.error("Failed to load state", e);
        createNewChat();
      }
    } else {
      createNewChat();
    }
  }, []);

  // --- Persistence ---
  useEffect(() => {
    const state: AppState = {
      chats,
      activeChatId,
      userProfile,
      controls,
      darkMode: false
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [chats, activeChatId, userProfile, controls]);

  // --- Logic ---

  const createNewChat = () => {
    const id = generateId();
    const newChat: ChatSession = {
      id,
      title: 'New Dialogue',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setChats(prev => ({ ...prev, [id]: newChat }));
    setActiveChatId(id);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
    return id;
  };

  const executeResetProfile = () => {
    const newId = generateId();
    const newChat: ChatSession = {
      id: newId,
      title: 'New Dialogue',
      messages: [],
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    setChats({ [newId]: newChat });
    setActiveChatId(newId);
    setUserProfile(INITIAL_PROFILE);
    setControls(INITIAL_CONTROLS);
    if (window.innerWidth < 1024) setIsSidebarOpen(false);
  };

  const handleLoadDemoRequest = () => {
    setIsDemoConfirmOpen(true);
  };

  const executeLoadDemoData = () => {
    if (!DEMO_DATA || !DEMO_DATA.chats) {
       alert("Error: Demo data source is missing.");
       return;
    }

    try {
      const demoChats = JSON.parse(JSON.stringify(DEMO_DATA.chats));
      const demoProfile = JSON.parse(JSON.stringify(DEMO_DATA.userProfile));
      const demoControls = JSON.parse(JSON.stringify(DEMO_DATA.controls || INITIAL_CONTROLS));
      const demoActiveId = DEMO_DATA.activeChatId;

      setChats(demoChats);
      setUserProfile(demoProfile);
      setControls(demoControls);
      setActiveChatId(demoActiveId);
      
      setIsSidebarOpen(false);
      
      setTimeout(() => alert("Demo profile v2 loaded."), 100);
    } catch (e: any) {
      console.error("Failed to load demo data", e);
      alert(`Error loading demo data: ${e.message}`);
    }
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setChats(prev => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    
    if (activeChatId === id) {
       setActiveChatId(null); 
    }
  };

  const updateChatMessages = (chatId: string, messages: Message[]) => {
    setChats(prev => ({
      ...prev,
      [chatId]: {
        ...prev[chatId],
        messages,
        updatedAt: Date.now(),
        title: prev[chatId].title === 'New Dialogue' && messages[0] 
          ? messages[0].text.slice(0, 30) + '...' 
          : prev[chatId].title
      }
    }));
  };

  const handleSendMessage = async (text: string, overrideChatId?: string) => {
    const currentChatId = overrideChatId || activeChatId;
    
    if (!currentChatId) {
      const newId = createNewChat();
      handleSendMessage(text, newId);
      return;
    }

    const newMessage: Message = {
      id: generateId(),
      role: 'user',
      text,
      timestamp: Date.now()
    };
    
    setChats(prevChats => {
      const chat = prevChats[currentChatId];
      if (!chat) return prevChats;

      const updatedMessages = [...chat.messages, newMessage];
      const updatedChat = {
        ...chat,
        messages: updatedMessages,
        updatedAt: Date.now(),
        title: chat.title === 'New Dialogue' ? text.slice(0, 30) + '...' : chat.title
      };
      
      (async () => {
         setIsProcessing(true);
         
         // 2. Start Profile Analysis (Background) - v2 Logic
         analyzeAndUpdateProfile(text, userProfile, controls, currentChatId).then(updatedProfile => {
            setUserProfile(updatedProfile);
         });

         // 3. Stream AI Response - v2 Logic (passing controls)
         const botMessageId = generateId();
         let botText = '';
         
         const initialBotMessage: Message = {
            id: botMessageId,
            role: 'model',
            text: '',
            timestamp: Date.now()
         };
         
         updateChatMessages(currentChatId, [...updatedMessages, initialBotMessage]);

         try {
            await streamSocraticResponse(updatedMessages, userProfile, controls, (chunk) => {
              botText += chunk;
              updateChatMessages(currentChatId, [
                ...updatedMessages,
                { ...initialBotMessage, text: botText }
              ]);
            });
         } catch (error) {
            updateChatMessages(currentChatId, [
              ...updatedMessages,
              { ...initialBotMessage, text: "I apologize, but I am unable to contemplate right now. Please try again." }
            ]);
         } finally {
            setIsProcessing(false);
         }
      })();

      return {
        ...prevChats,
        [currentChatId]: updatedChat
      };
    });
  };

  const handleDisagree = (category: string, value: string) => {
    setIsProfileOpen(false);
    const newChatId = createNewChat();
    setActiveChatId(newChatId);
    const challengeText = `I disagree with the inference: "${value}" (${category}). I don't think that fits me. Let's discuss why.`;
    handleSendMessage(challengeText, newChatId);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ chats, activeChatId, userProfile, controls }, null, 2));
    const downloadAnchorNode = document.createElement('a');
    downloadAnchorNode.setAttribute("href", dataStr);
    downloadAnchorNode.setAttribute("download", "socratic_mirror_v2_backup.json");
    document.body.appendChild(downloadAnchorNode);
    downloadAnchorNode.click();
    downloadAnchorNode.remove();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const parsed = JSON.parse(e.target?.result as string);
        if (parsed.chats && parsed.userProfile) {
          setChats(parsed.chats);
          setUserProfile(parsed.userProfile);
          setControls(parsed.controls || INITIAL_CONTROLS);
          if (parsed.activeChatId && parsed.chats[parsed.activeChatId]) {
            setActiveChatId(parsed.activeChatId);
          } else {
            setActiveChatId(Object.keys(parsed.chats)[0] || null);
          }
          alert('State loaded successfully.');
        } else {
          throw new Error("Missing required fields");
        }
      } catch (err) {
        alert('Invalid JSON file.');
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleUpdateSelfDesc = (text: string) => {
    setUserProfile(prev => ({ ...prev, selfDescription: text }));
  };

  // --- Controls Handlers ---
  const toggleGrounding = () => setControls(prev => ({ ...prev, grounding: !prev.grounding }));
  const setDepth = (depth: 'surface' | 'moderate' | 'deep') => setControls(prev => ({ ...prev, depth }));
  const toggleInference = () => setControls(prev => ({ ...prev, inferenceEnabled: !prev.inferenceEnabled }));

  const activeChat = activeChatId ? chats[activeChatId] : null;

  return (
    <div className="fixed inset-0 flex bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 overflow-hidden font-sans">
      
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-72 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 transform transition-transform duration-200 ease-in-out flex flex-col shadow-xl lg:shadow-none h-full
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900 shrink-0">
          <div className="flex items-center gap-2">
             <h1 className="text-xl font-serif font-bold text-slate-800 dark:text-slate-100 tracking-tight">Socratic Mirror</h1>
             <button onClick={() => setIsAboutOpen(true)} className="text-slate-400 hover:text-indigo-600 transition-colors p-1"><Info size={16} /></button>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden p-1 text-slate-500 hover:bg-slate-200 rounded"><X size={20} /></button>
        </div>

        {/* v2 Controls Section */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900 shrink-0 space-y-4">
           
           {/* Depth Slider */}
           <div>
              <div className="flex items-center gap-2 mb-2 text-xs font-bold text-slate-500 uppercase tracking-wider">
                <Layers size={12}/> Philosophical Depth
              </div>
              <div className="grid grid-cols-3 gap-1 bg-slate-200 dark:bg-slate-800 p-1 rounded-lg">
                 {['surface', 'moderate', 'deep'].map((lvl) => (
                   <button 
                     key={lvl}
                     onClick={() => setDepth(lvl as any)}
                     className={`text-[10px] py-1.5 rounded-md font-medium transition-all ${controls.depth === lvl ? 'bg-white dark:bg-slate-700 shadow-sm text-indigo-600 dark:text-indigo-300' : 'text-slate-500 dark:text-slate-400'}`}
                   >
                     {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                   </button>
                 ))}
              </div>
           </div>

           {/* Grounding Toggle */}
           <button 
             onClick={toggleGrounding}
             className={`w-full flex items-center justify-between p-2 rounded-lg border transition-all ${
               controls.grounding 
               ? 'bg-emerald-50 border-emerald-200 text-emerald-800 dark:bg-emerald-900/20 dark:border-emerald-800 dark:text-emerald-300' 
               : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-400'
             }`}
           >
             <div className="flex items-center gap-2">
               <Anchor size={16} className={controls.grounding ? "text-emerald-500" : "text-slate-400"} />
               <div className="flex flex-col items-start">
                 <span className="text-xs font-bold">Grounding Mode</span>
                 <span className="text-[10px] opacity-70">{controls.grounding ? "Emotional Safety On" : "Standard Socratic"}</span>
               </div>
             </div>
             <div className={`w-3 h-3 rounded-full ${controls.grounding ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-slate-300 dark:bg-slate-600'}`}></div>
           </button>
           
           {/* Inference Toggle */}
           <div className="flex items-center justify-between px-1">
             <span className="text-[10px] text-slate-500 uppercase font-bold tracking-wider flex items-center gap-1">
               <Activity size={10} /> Active Profiling
             </span>
             <button 
               onClick={toggleInference}
               className={`w-8 h-4 rounded-full relative transition-colors ${controls.inferenceEnabled ? 'bg-indigo-500' : 'bg-slate-300 dark:bg-slate-600'}`}
             >
               <div className={`absolute top-0.5 w-3 h-3 bg-white rounded-full transition-transform ${controls.inferenceEnabled ? 'left-4.5' : 'left-0.5'}`}></div>
             </button>
           </div>
        </div>

        {/* Sidebar Controls */}
        <div className="p-3 space-y-2 shrink-0">
           <button onClick={() => createNewChat()} className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-sm">
             <Plus size={18} /> New Dialogue
           </button>
           <div className="grid grid-cols-2 gap-2">
              <button onClick={handleLoadDemoRequest} className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-amber-700 bg-amber-100 hover:bg-amber-200 rounded-lg border border-amber-200"><Sparkles size={14} /> Demo</button>
              <button onClick={() => setIsResetConfirmOpen(true)} className="flex items-center justify-center gap-1.5 px-2 py-2 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-slate-700"><RotateCcw size={14} /> Reset</button>
           </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-1 min-h-0">
           <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2 mb-2 mt-2">History</div>
           
           {(Object.values(chats) as ChatSession[]).length === 0 ? (
             <div className="text-center p-4 text-sm text-slate-400 italic">No history yet.</div>
           ) : (
             (Object.values(chats) as ChatSession[])
              .sort((a, b) => b.updatedAt - a.updatedAt)
              .map(chat => (
               <div 
                  key={chat.id}
                  onClick={() => { setActiveChatId(chat.id); if(window.innerWidth < 1024) setIsSidebarOpen(false); }}
                  className={`group flex items-center justify-between w-full px-3 py-3 text-sm rounded-lg cursor-pointer transition-all border ${
                    activeChatId === chat.id 
                      ? 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-900/30 dark:border-indigo-800 dark:text-indigo-300 shadow-sm' 
                      : 'border-transparent text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
               >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare size={16} className={`shrink-0 ${activeChatId === chat.id ? 'opacity-100' : 'opacity-50'}`} />
                    <span className="truncate font-medium">{chat.title}</span>
                  </div>
                  <button onClick={(e) => deleteChat(chat.id, e)} className="opacity-0 group-hover:opacity-100 p-1.5 hover:bg-red-100 text-red-600 rounded"><Trash2 size={14} /></button>
               </div>
             ))
           )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900 shrink-0 grid grid-cols-2 gap-3">
            <button onClick={handleExport} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-100"><Download size={14} /> Export</button>
            <button onClick={handleImportClick} className="flex items-center justify-center gap-2 px-3 py-2 text-xs font-medium bg-white dark:bg-slate-800 border rounded-lg hover:bg-slate-100"><Upload size={14} /> Import</button>
            <input type="file" ref={fileInputRef} accept=".json" onChange={handleImportFile} className="hidden" />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col h-full relative w-full bg-slate-50 dark:bg-slate-950 min-h-0">
        
        {/* Header */}
        <header className="h-16 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 bg-white dark:bg-slate-900 shrink-0 shadow-sm z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setIsSidebarOpen(true)} className="lg:hidden p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-lg"><Menu size={24} /></button>
            <div className="flex flex-col">
               <span className="font-serif font-bold text-lg text-slate-900 dark:text-white truncate max-w-[200px] sm:max-w-md">{activeChat ? activeChat.title : "Socratic Mirror"}</span>
            </div>
          </div>
          <button 
             onClick={() => setIsProfileOpen(true)}
             className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 rounded-full border border-emerald-200 dark:border-emerald-800 transition-all text-sm font-medium shadow-sm"
           >
             <Fingerprint size={18} />
             <span className="hidden sm:inline">Profile v2</span>
           </button>
        </header>

        {/* Chat Area */}
        <div className="flex-1 relative overflow-hidden min-h-0">
          {activeChat ? (
            <ChatArea 
              key={activeChat.id} 
              messages={activeChat.messages} 
              isLoading={isProcessing}
              onSendMessage={(text) => handleSendMessage(text)}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-400 p-8 text-center bg-slate-50 dark:bg-slate-950">
               <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                 <User size={40} className="opacity-50" />
               </div>
               <h2 className="text-2xl font-serif text-slate-600 dark:text-slate-300 mb-2">Welcome, Seeker</h2>
               <p className="max-w-md mx-auto mb-8">Select an existing dialogue or start a new inquiry to begin your journey of self-discovery.</p>
               <button onClick={() => createNewChat()} className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium shadow-md">Begin New Dialogue</button>
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      <ProfileModal 
        isOpen={isProfileOpen} 
        onClose={() => setIsProfileOpen(false)} 
        profile={userProfile}
        onUpdateSelfDescription={handleUpdateSelfDesc}
        onDisagree={handleDisagree}
      />
      <AboutModal isOpen={isAboutOpen} onClose={() => setIsAboutOpen(false)} />
      <ConfirmationModal isOpen={isDemoConfirmOpen} onClose={() => setIsDemoConfirmOpen(false)} onConfirm={executeLoadDemoData} title="Load Demo v2?" message="This will overwrite current data with the v2 demo set." />
      <ConfirmationModal isOpen={isResetConfirmOpen} onClose={() => setIsResetConfirmOpen(false)} onConfirm={executeResetProfile} title="Start Fresh?" message="This will wipe all history and profile data." />
    </div>
  );
}

export default App;