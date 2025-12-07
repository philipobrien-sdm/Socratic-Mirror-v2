import React, { useRef, useEffect, useState, useLayoutEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { Message } from '../types';
import { Send, Sparkles, User, BrainCircuit } from './Icon';

interface ChatAreaProps {
  messages: Message[];
  isLoading: boolean;
  onSendMessage: (text: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({ messages, isLoading, onSendMessage }) => {
  const [input, setInput] = useState('');
  const [visibleCount, setVisibleCount] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // This ref helps us track if we are in the middle of a "bulk load" (initial open)
  // or a live update (user typing).
  const isBulkLoading = useRef(true);

  // Reset visible count when messages array length decreases (cleared) or on mount
  // Note: Since this component is Keyed by ChatID in App.tsx, this state resets automatically on chat switch.
  // We only need to handle the logic for incrementing.

  useEffect(() => {
    // If we have shown all messages, we are done loading.
    if (visibleCount === messages.length) {
      isBulkLoading.current = false;
      return;
    }

    // If we have more actual messages than visible messages, schedule the next one.
    if (visibleCount < messages.length) {
      // If we are far behind (loading history), go fast (10ms). 
      // If we are caught up (live chat), just show it immediately (0ms) or with a slight breath.
      const delay = isBulkLoading.current ? 20 : 0;

      const timer = setTimeout(() => {
        setVisibleCount(prev => prev + 1);
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [visibleCount, messages.length]);

  // Scroll handling
  useLayoutEffect(() => {
    if (visibleCount > 0 && messagesEndRef.current) {
      // If we are bulk loading, use 'auto' (instant) to prevent scrolling fatigue/jank.
      // If we are adding a live message, use 'smooth' for nice UX.
      const behavior = isBulkLoading.current ? 'auto' : 'smooth';
      messagesEndRef.current.scrollIntoView({ behavior, block: 'end' });
    }
  }, [visibleCount]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() && !isLoading) {
      onSendMessage(input);
      setInput('');
      // We anticipate a new message, so ensure we aren't in bulk mode for the user's own message
      isBulkLoading.current = false;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Derived state for rendering
  const displayedMessages = messages.slice(0, visibleCount);

  return (
    <div className="flex flex-col h-full bg-white dark:bg-slate-900 relative">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 min-h-0">
        
        {/* Empty State / Welcome */}
        {displayedMessages.length === 0 && !isLoading && visibleCount === 0 && messages.length === 0 && (
          <div className="h-full flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 opacity-60 animate-in fade-in duration-500">
            <BrainCircuit size={64} strokeWidth={1} className="mb-4" />
            <p className="text-lg font-serif italic text-center max-w-md">
              "The unexamined life is not worth living." <br/>
              <span className="text-sm not-italic mt-2 block">— Socrates</span>
            </p>
            <p className="mt-8 text-sm">Start by stating a belief, a feeling, or a fact about yourself.</p>
          </div>
        )}
        
        {/* Message List */}
        {displayedMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex w-full animate-in slide-in-from-bottom-2 fade-in duration-300 ${
              msg.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`flex max-w-[90%] sm:max-w-[80%] md:max-w-[70%] gap-3 ${
                msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
              }`}
            >
              <div
                className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-1 ${
                  msg.role === 'user' 
                    ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-300' 
                    : 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300'
                }`}
              >
                {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
              </div>

              <div
                className={`p-4 rounded-2xl text-base leading-relaxed font-serif shadow-sm break-words ${
                  msg.role === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-none border border-slate-200 dark:border-slate-700'
                }`}
              >
                <ReactMarkdown 
                  components={{
                    p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                    strong: ({node, ...props}) => <strong className="font-semibold text-inherit opacity-90" {...props} />,
                    em: ({node, ...props}) => <em className="italic opacity-90" {...props} />,
                    ul: ({node, ...props}) => <ul className="list-disc list-inside mb-2" {...props} />,
                    ol: ({node, ...props}) => <ol className="list-decimal list-inside mb-2" {...props} />,
                  }}
                >
                  {msg.text}
                </ReactMarkdown>
              </div>
            </div>
          </div>
        ))}

        {/* Loading Indicator */}
        {isLoading && visibleCount === messages.length && (
          <div className="flex w-full justify-start animate-in fade-in duration-300">
            <div className="flex max-w-[85%] gap-3 flex-row">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900 dark:text-emerald-300 flex items-center justify-center mt-1">
                 <Sparkles size={16} className="animate-pulse" />
              </div>
              <div className="flex items-center space-x-2 p-4 rounded-2xl rounded-tl-none bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800">
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-0"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></div>
                <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-300"></div>
              </div>
            </div>
          </div>
        )}
        
        {/* Bottom Spacer & Ref */}
        <div ref={messagesEndRef} className="h-4 w-full shrink-0" />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 shrink-0 z-10">
        <form
          onSubmit={handleSubmit}
          className="max-w-4xl mx-auto relative flex items-center bg-slate-100 dark:bg-slate-800 rounded-xl border border-transparent focus-within:border-indigo-500 transition-all shadow-inner"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="I believe that..."
            className="flex-1 bg-transparent border-none focus:ring-0 p-4 text-slate-900 dark:text-slate-100 placeholder-slate-400 font-serif text-lg"
            disabled={isLoading}
            autoComplete="off"
          />
          <button
            type="submit"
            disabled={!input.trim() || isLoading}
            className="p-3 mr-1 text-slate-500 hover:text-indigo-600 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
          >
            <Send size={20} />
          </button>
        </form>
        <div className="text-center mt-2">
            <p className="text-xs text-slate-400 dark:text-slate-500">
                Socratic Mirror learns from your responses to build your profile.
            </p>
        </div>
      </div>
    </div>
  );
};