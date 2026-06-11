'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useStore } from '@/store/useStore';
import { MessageSquare, Send, Volume2, VolumeX, Mic, MicOff, X, Sparkles, ChevronLeft, ChevronRight, HelpCircle } from 'lucide-react';

export default function AITutorPanel() {
  const { token, apiBaseUrl, currentCourseCode } = useStore();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    { role: 'assistant', content: "Hi! I'm your AI ScienceVerse Tutor. Ask me any questions about our lessons, diagrams, or physics experiments!" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [isSpeechListening, setIsSpeechListening] = useState(false);
  
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const recognitionRef = useRef<any>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
      
      // Initialize Speech Recognition
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = 'en-US';
        
        recognition.onstart = () => {
          setIsSpeechListening(true);
        };
        
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          setInput(transcript);
        };
        
        recognition.onerror = (event: any) => {
          console.error("Speech recognition error:", event.error);
          setIsSpeechListening(false);
        };
        
        recognition.onend = () => {
          setIsSpeechListening(false);
        };
        
        recognitionRef.current = recognition;
      }
    }
    return () => {
      stopSpeaking();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    
    stopSpeaking();
    
    // Strip markdown formatting for cleaner speech synthesis
    const cleanText = text
      .replace(/[#*`_$\-\[\]()]/g, '')
      .replace(/https?:\/\/\S+/g, '')
      .trim();

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => {
      setIsReading(false);
    };
    utterance.onerror = () => {
      setIsReading(false);
    };
    
    utteranceRef.current = utterance;
    setIsReading(true);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setIsReading(false);
  };

  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.start();
    } else {
      alert("Speech recognition is not supported in this browser. Try Chrome or Edge.");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      // Format history
      const history = messages.map(m => ({
        role: m.role === 'assistant' ? 'assistant' : 'user',
        content: m.content
      }));

      const res = await fetch(`${apiBaseUrl}/ai/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify({
          message: userMessage,
          chat_history: history,
          context_topic: currentCourseCode || 'General Science'
        })
      });

      if (res.ok) {
        const data = await res.json();
        setMessages(prev => [...prev, { role: 'assistant', content: data.reply }]);
        
        // Auto-read response if speech is enabled
        speakText(data.reply);
      } else {
        setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I had trouble processing that request. Please try again." }]);
      }
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'assistant', content: "Connection error. Make sure the backend server is running." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* Floating Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed bottom-6 right-6 z-40 p-4 rounded-full bg-gradient-to-tr from-violet-600 to-indigo-600 text-white shadow-2xl hover:scale-110 active:scale-95 transition-all duration-300 border border-white/20 glow-purple cursor-pointer flex items-center gap-2 ${isOpen ? 'rotate-90 scale-90 opacity-0 pointer-events-none' : ''}`}
      >
        <Sparkles className="w-6 h-6 animate-pulse" />
        <span className="font-space font-semibold text-sm pr-1 hidden sm:inline">Ask AI Tutor</span>
      </button>

      {/* Floating Tutor Drawer */}
      <div
        className={`fixed top-20 right-6 bottom-6 w-[380px] max-w-[calc(100vw-48px)] z-40 glass-panel-heavy rounded-3xl border border-white/10 shadow-2xl flex flex-col overflow-hidden transition-all duration-500 ease-out transform ${
          isOpen ? 'translate-x-0 opacity-100 scale-100' : 'translate-x-[450px] opacity-0 scale-90 pointer-events-none'
        }`}
      >
        {/* Header */}
        <div className="p-4 bg-white/5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center glow-purple">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <div>
              <h3 className="font-space font-bold text-sm text-white flex items-center gap-1.5">
                AI Science Tutor
                <span className="text-[10px] bg-cyan-500/20 text-cyan-300 px-1.5 py-0.5 rounded-full font-mono uppercase">
                  {currentCourseCode ? currentCourseCode.replace('-', ' ') : 'General'}
                </span>
              </h3>
              <p className="text-[10px] text-gray-400">Ask explanations, concepts, or mini quizzes</p>
            </div>
          </div>
          <button
            onClick={() => setIsOpen(false)}
            className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Message List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex flex-col max-w-[85%] ${
                m.role === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <div
                className={`p-3 rounded-2xl text-sm ${
                  m.role === 'user'
                    ? 'bg-violet-600 text-white rounded-br-none shadow-md'
                    : 'bg-white/10 text-gray-100 rounded-bl-none border border-white/5'
                }`}
              >
                {/* Clean markdown paragraphs */}
                <p className="whitespace-pre-line leading-relaxed">{m.content}</p>
              </div>

              {m.role === 'assistant' && (
                <div className="flex items-center gap-2 mt-1">
                  <button
                    onClick={() => speakText(m.content)}
                    className="p-1 rounded hover:bg-white/5 text-gray-400 hover:text-cyan-400 transition-all text-[10px] flex items-center gap-1 cursor-pointer"
                    title="Read out loud"
                  >
                    <Volume2 className="w-3.5 h-3.5" />
                    Speak
                  </button>
                  {isReading && (
                    <button
                      onClick={stopSpeaking}
                      className="p-1 rounded hover:bg-white/5 text-red-400 transition-all text-[10px] flex items-center gap-1 cursor-pointer"
                    >
                      <VolumeX className="w-3.5 h-3.5" />
                      Stop
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-center gap-2 mr-auto max-w-[85%] bg-white/5 border border-white/5 p-3 rounded-2xl rounded-bl-none">
              <div className="flex space-x-1.5">
                <div className="w-2.5 h-2.5 bg-violet-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2.5 h-2.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2.5 h-2.5 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-white/5 border-t border-white/10 flex items-center gap-2">
          {isSpeechListening ? (
            <button
              type="button"
              onClick={stopListening}
              className="p-2.5 rounded-xl bg-red-600 text-white animate-pulse transition-all cursor-pointer"
              title="Stop listening"
            >
              <MicOff className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={startListening}
              className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-cyan-400 border border-white/10 transition-all cursor-pointer"
              title="Speak question"
            >
              <Mic className="w-4 h-4" />
            </button>
          )}
          
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={isSpeechListening ? "Listening..." : "Ask your tutor anything..."}
            className="flex-1 px-3 py-2 rounded-xl text-sm glass-input placeholder-gray-500"
            disabled={isSpeechListening}
          />
          
          <button
            type="submit"
            className="p-2.5 rounded-xl bg-violet-600 text-white hover:bg-violet-500 transition-all cursor-pointer glow-purple"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </>
  );
}
