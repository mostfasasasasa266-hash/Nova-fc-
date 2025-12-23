
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { chatWithGemini } from '../services/geminiService';
import { ChatMessage, Language } from '../types';

interface AICoachProps {
  currentLang: Language;
}

const AICoach: React.FC<AICoachProps> = ({ currentLang }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [useSearch, setUseSearch] = useState(false);
  
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMessages([{ role: 'model', text: currentLang === 'ar' ? 'أهلاً بك. أنا Nova، مدربك الذكي. كيف يمكنني مساعدتك اليوم؟' : 'Welcome. I am Nova, your AI Coach. How can I assist you?' }]);
  }, [currentLang]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = useCallback(async () => {
    if (!input.trim() || loading) return;
    
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setLoading(true);

    try {
      const result = await chatWithGemini(userMsg, messages, { useSearch });
      // Store groundingChunks for mandatory source listing
      setMessages(prev => [...prev, { 
        role: 'model', 
        text: result.text, 
        groundingChunks: result.groundingChunks 
      }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: 'Error connecting to Nova Engine.' }]);
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, useSearch]);

  return (
    <div className="flex flex-col h-[75vh] nova-glass rounded-[3.5rem] overflow-hidden border border-white/5 bg-black/20">
      <div className="p-8 border-b border-white/5 flex items-center justify-between">
         <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600/20 rounded-2xl flex items-center justify-center text-2xl">🤖</div>
            <h3 className="font-black text-xl italic">Nova <span className="text-[#bef264]">Intelligence</span></h3>
         </div>
         <button 
           onClick={() => setUseSearch(!useSearch)}
           className={`px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${useSearch ? 'bg-[#bef264] text-black' : 'bg-white/5 text-gray-500'}`}
         >
           {useSearch ? 'Live Search On' : 'Search Off'}
         </button>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar" ref={scrollRef}>
        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-6 rounded-[2rem] text-sm leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-tr-none' : 'bg-white/5 text-gray-300 rounded-tl-none border border-white/5'}`}>
              {msg.text}
              
              {/* Mandatory listing of Grounding Source URLs as per Gemini API rules */}
              {msg.groundingChunks && msg.groundingChunks.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-2">
                  <p className="text-[10px] font-black text-[#bef264] uppercase tracking-widest">المصادر / Sources:</p>
                  {msg.groundingChunks.map((chunk: any, idx: number) => {
                    if (chunk.web) {
                      return (
                        <a key={idx} href={chunk.web.uri} target="_blank" rel="noopener noreferrer" className="block text-xs text-indigo-400 hover:underline">
                          • {chunk.web.title || chunk.web.uri}
                        </a>
                      );
                    }
                    return null;
                  })}
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="bg-white/5 p-6 rounded-[2rem] rounded-tl-none border border-white/5 animate-pulse">
               <div className="flex gap-2">
                  <div className="w-1.5 h-1.5 bg-[#bef264] rounded-full animate-bounce"></div>
                  <div className="w-1.5 h-1.5 bg-[#bef264] rounded-full animate-bounce [animation-delay:0.2s]"></div>
                  <div className="w-1.5 h-1.5 bg-[#bef264] rounded-full animate-bounce [animation-delay:0.4s]"></div>
               </div>
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-white/5 bg-black/40">
        <div className="flex gap-4">
           <input 
             type="text" 
             value={input}
             onChange={(e) => setInput(e.target.value)}
             onKeyDown={(e) => e.key === 'Enter' && handleSend()}
             className="flex-1 bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-sm focus:ring-1 focus:ring-[#bef264] outline-none"
             placeholder="اسأل Nova عن تمرين أو نصيحة..."
           />
           <button onClick={handleSend} className="w-14 h-14 bg-[#bef264] text-black rounded-2xl flex items-center justify-center shadow-lg active:scale-90">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
           </button>
        </div>
      </div>
    </div>
  );
};

export default AICoach;
