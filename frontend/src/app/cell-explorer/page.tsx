'use client';

import React, { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Header from '@/components/Header';
import AITutorPanel from '@/components/AITutorPanel';
import { 
  Compass, Sparkles, Volume2, VolumeX, RefreshCw, 
  HelpCircle, ChevronRight, CheckCircle2, AlertCircle, Play
} from 'lucide-react';

// Custom interface for organelles
interface Organelle {
  name: string;
  key: string;
  color: string;
  description: string;
  facts: string;
  position: [number, number, number];
  size: number;
}

const organelles: Organelle[] = [
  {
    name: "Nucleus",
    key: "nucleus",
    color: "#a78bfa",
    description: "The nucleus is the control center of the cell. It houses the DNA, which serves as the instructions for making proteins and running cellular operations.",
    facts: "It is the largest organelle in animal cells and is surrounded by a double membrane called the nuclear envelope.",
    position: [0, 0, 0],
    size: 1.4
  },
  {
    name: "Mitochondria",
    key: "mitochondria",
    color: "#f87171",
    description: "Mitochondria are the power generators of the cell. They convert glucose (sugar) and oxygen into ATP, the cell's main energy source.",
    facts: "Mitochondria have their own independent DNA and are believed to have evolved from ancient engulfed bacteria.",
    position: [1.8, 0.8, -0.5],
    size: 0.6
  },
  {
    name: "Ribosomes",
    key: "ribosomes",
    color: "#67e8f9",
    description: "Ribosomes are the assembly workers of the cell. They read genetic blueprints sent from the nucleus to synthesize proteins.",
    facts: "Ribosomes are not bound by a membrane. A single active human cell can contain up to 10 million ribosomes.",
    position: [-1.2, -1.2, 0.8],
    size: 0.3
  },
  {
    name: "Cell Membrane",
    key: "membrane",
    color: "#fbbf24",
    description: "The cell membrane is a semi-permeable lipid bilayer that surrounds the cell, regulating what materials enter and leave.",
    facts: "It is highly flexible and contains protein channels that act as gated tunnels for specific nutrients.",
    position: [0, 0, 2.5],
    size: 0.2
  },
  {
    name: "Golgi Apparatus",
    key: "golgi",
    color: "#f472b6",
    description: "The Golgi apparatus is the packing and shipping facility of the cell, labeling and sending proteins to their target locations.",
    facts: "It consists of flattened sac-like membranes called cisternae. It packages items in bubbles called vesicles.",
    position: [-1.5, 1.2, -0.4],
    size: 0.7
  },
  {
    name: "Endoplasmic Reticulum",
    key: "er",
    color: "#fb7185",
    description: "The ER is a complex cellular highway network. The rough ER houses ribosomes for protein assembly; the smooth ER synthesizes lipids.",
    facts: "It accounts for more than half of the total membrane surface area in typical eukaryotic cells.",
    position: [0.8, -1.5, -0.6],
    size: 0.8
  }
];

// Lazy load Three.js Canvas to avoid SSR issues
const Cell3DCanvas = dynamic(() => import('@/components/Cell3DCanvas'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full flex items-center justify-center bg-white/5 border border-white/10 rounded-3xl animate-pulse">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className="text-sm text-gray-400 font-mono">LOADING 3D CELL ENGINE...</p>
      </div>
    </div>
  )
});

export default function CellExplorer() {
  const router = useRouter();
  const { token, apiBaseUrl, setCourse } = useStore();
  const [selectedOrganelle, setSelectedOrganelle] = useState<Organelle>(organelles[0]);
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);
  const [isReading, setIsReading] = useState(false);
  
  // Quiz states
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    setCourse('cell-explorer');
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      setCourse(null);
      stopSpeaking();
    };
  }, []);

  // Fetch AI explanation "Like I'm 10"
  const handleAIExplain = async () => {
    setLoadingAI(true);
    setAiExplanation('');
    stopSpeaking();
    try {
      const res = await fetch(`${apiBaseUrl}/ai/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: selectedOrganelle.name,
          context: `An organelle of a cell. Function: ${selectedOrganelle.description}`,
          age_group: "10"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.explanation);
        speakText(data.explanation);
      }
    } catch (err) {
      console.error(err);
      setAiExplanation("Connection error. Ensure backend server is running.");
    } finally {
      setLoadingAI(false);
    }
  };

  const speakText = (text: string) => {
    if (!synthRef.current) return;
    stopSpeaking();
    
    const cleanText = text.replace(/[#*`_$\-\[\]()]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.onend = () => setIsReading(false);
    utterance.onerror = () => setIsReading(false);
    
    setIsReading(true);
    synthRef.current.speak(utterance);
  };

  const stopSpeaking = () => {
    if (synthRef.current && synthRef.current.speaking) {
      synthRef.current.cancel();
    }
    setIsReading(false);
  };

  // Start the Quiz
  const startQuiz = async () => {
    setLoadingQuiz(true);
    setQuizResult(null);
    setAnswers({});
    try {
      const res = await fetch(`${apiBaseUrl}/quiz/questions/cell-explorer`);
      if (res.ok) {
        const data = await res.json();
        setQuizQuestions(data);
        setQuizMode(true);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  const selectAnswer = (qId: number, answer: string) => {
    setAnswers(prev => ({ ...prev, [qId]: answer }));
  };

  const submitQuiz = async () => {
    // Check all questions answered
    if (Object.keys(answers).length < quizQuestions.length) {
      alert("Please answer all questions before submitting.");
      return;
    }

    setLoadingQuiz(true);
    try {
      const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
        question_id: parseInt(qId),
        answer: val
      }));

      const res = await fetch(`${apiBaseUrl}/quiz/submit/cell-explorer`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ answers: formattedAnswers })
      });

      if (res.ok) {
        const data = await res.json();
        setQuizResult(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingQuiz(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-12">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Module Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Compass className="w-5 h-5 text-emerald-400" />
              <span className="text-xs font-mono text-emerald-400 font-bold uppercase tracking-wider">MODULE 1</span>
            </div>
            <h2 className="font-space font-extrabold text-2xl text-white">Biology Cell Explorer</h2>
            <p className="text-xs text-gray-400">Click organelles on the 3D cell to dissect their structures and run AI tutor lessons.</p>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setSelectedOrganelle(organelles[0]);
                setAiExplanation('');
                stopSpeaking();
              }}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Reset View
            </button>
            <button
              onClick={startQuiz}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-tr from-emerald-600 to-teal-500 text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-700/20"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Take Quiz
            </button>
          </div>
        </div>

        {/* Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left Panel: 3D interactive viewer */}
          <div className="lg:col-span-7 flex flex-col space-y-4">
            <div className="h-[460px] relative rounded-3xl overflow-hidden border border-white/10 glass-panel shadow-2xl flex items-center justify-center">
              
              {/* Dynamic 3D canvas loader */}
              <Cell3DCanvas 
                selectedKey={selectedOrganelle.key}
                organelles={organelles}
                onSelectOrganelle={(key) => {
                  const organ = organelles.find(o => o.key === key);
                  if (organ) {
                    setSelectedOrganelle(organ);
                    setAiExplanation('');
                    stopSpeaking();
                  }
                }}
              />

              {/* Instructions Overlay */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-2xl flex justify-between items-center text-[10px] text-gray-300">
                <span className="flex items-center gap-1">
                  🖱️ Drag to rotate • Scroll to Zoom • Right-click to Pan
                </span>
                <span className="font-mono text-cyan-400">WebGL Active</span>
              </div>
            </div>

            {/* Organelles list shortcuts */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {organelles.map((o) => (
                <button
                  key={o.key}
                  onClick={() => {
                    setSelectedOrganelle(o);
                    setAiExplanation('');
                    stopSpeaking();
                  }}
                  className={`py-2 px-1 rounded-xl text-[11px] font-semibold transition-all border ${
                    selectedOrganelle.key === o.key
                      ? 'bg-white/10 text-white border-white/20 scale-105 glow-purple'
                      : 'bg-white/5 text-gray-400 border-white/5 hover:text-white hover:bg-white/10'
                  }`}
                  style={{ borderLeftColor: o.color, borderLeftWidth: '3px' }}
                >
                  {o.name}
                </button>
              ))}
            </div>
          </div>

          {/* Right Panel: Explanations / Quizzes */}
          <div className="lg:col-span-5 flex flex-col">
            
            {!quizMode ? (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex-1 flex flex-col justify-between space-y-6">
                
                {/* Organelle profile */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <h3 
                      className="font-space font-bold text-xl flex items-center gap-2"
                      style={{ color: selectedOrganelle.color }}
                    >
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedOrganelle.color }} />
                      {selectedOrganelle.name}
                    </h3>
                    <span className="text-[10px] bg-white/5 text-gray-400 px-2 py-0.5 rounded-full font-mono">
                      ORGANELLE
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <span className="text-[10px] font-mono text-cyan-400 block uppercase tracking-wider">Function:</span>
                      <p className="text-sm text-gray-200 leading-relaxed mt-0.5">
                        {selectedOrganelle.description}
                      </p>
                    </div>

                    <div className="border border-white/5 bg-white/5 p-3 rounded-2xl">
                      <span className="text-[10px] font-mono text-amber-400 block uppercase tracking-wider">Interesting Fact:</span>
                      <p className="text-xs text-gray-300 leading-relaxed mt-0.5">
                        {selectedOrganelle.facts}
                      </p>
                    </div>
                  </div>
                </div>

                {/* AI & Voice Explanations */}
                <div className="space-y-4 pt-4 border-t border-white/5">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <button
                      onClick={handleAIExplain}
                      disabled={loadingAI}
                      className="flex-1 py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 transition-all flex items-center justify-center gap-1.5 glow-purple cursor-pointer"
                    >
                      {loadingAI ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <>
                          <Sparkles className="w-4 h-4" />
                          Explain Like I'm 10
                        </>
                      )}
                    </button>

                    {isReading ? (
                      <button
                        onClick={stopSpeaking}
                        className="py-2.5 px-4 rounded-xl text-xs font-bold bg-red-950/20 border border-red-500/20 text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <VolumeX className="w-4 h-4" />
                        Mute Voice
                      </button>
                    ) : (
                      <button
                        onClick={() => speakText(aiExplanation || selectedOrganelle.description)}
                        className="py-2.5 px-4 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Volume2 className="w-4 h-4 text-cyan-400" />
                        Read Aloud
                      </button>
                    )}
                  </div>

                  {aiExplanation && (
                    <div className="border border-violet-500/20 bg-violet-950/15 p-4 rounded-2xl max-h-56 overflow-y-auto">
                      <span className="text-[10px] font-bold text-violet-400 block mb-1">AI 10-Yr Old Explanation:</span>
                      <p className="text-xs text-gray-200 whitespace-pre-line leading-relaxed">
                        {aiExplanation}
                      </p>
                    </div>
                  )}
                </div>

              </div>
            ) : (
              // Quiz panel
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <h3 className="font-space font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-emerald-400" />
                    Biology Cell Quiz
                  </h3>
                  <button
                    onClick={() => {
                      setQuizMode(false);
                      setQuizResult(null);
                    }}
                    className="text-xs text-gray-400 hover:text-white transition-all cursor-pointer"
                  >
                    Exit Quiz
                  </button>
                </div>

                {!quizResult ? (
                  <div className="flex-1 overflow-y-auto space-y-5 pr-1 max-h-[380px]">
                    {quizQuestions.map((q, qidx) => (
                      <div key={q.id} className="space-y-2">
                        <span className="text-xs font-bold text-gray-400">
                          Question {qidx + 1} of {quizQuestions.length}
                        </span>
                        <p className="text-sm font-semibold text-white leading-snug">
                          {q.question_text}
                        </p>
                        <div className="grid grid-cols-1 gap-2 pt-1">
                          {q.options?.map((opt: string) => {
                            const isSelected = answers[q.id] === opt;
                            return (
                              <button
                                key={opt}
                                onClick={() => selectAnswer(q.id, opt)}
                                className={`w-full py-2.5 px-4 rounded-xl text-xs text-left transition-all border ${
                                  isSelected
                                    ? 'bg-emerald-600/20 border-emerald-500 text-white'
                                    : 'bg-white/5 border-white/5 hover:border-white/10 text-gray-300'
                                }`}
                              >
                                {opt}
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  // Quiz Result summary
                  <div className="flex-1 overflow-y-auto space-y-4">
                    <div className={`p-4 rounded-2xl text-center border ${
                      quizResult.passed 
                        ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-400' 
                        : 'bg-red-950/20 border-red-500/30 text-red-400'
                    }`}>
                      <h4 className="font-space font-extrabold text-lg">
                        {quizResult.passed ? '🎉 Congratulations!' : '😢 Keep Learning!'}
                      </h4>
                      <p className="text-sm mt-1">
                        You scored <span className="font-bold">{quizResult.score}</span> out of <span className="font-bold">{quizResult.total}</span>!
                      </p>
                      <span className="text-[10px] font-mono block mt-2 text-cyan-400">
                        +{quizResult.xp_gained} XP GAINED
                      </span>
                      {quizResult.unlocked_badges?.length > 0 && (
                        <div className="mt-2 text-xs font-bold text-amber-400">
                          🔓 Badges unlocked: {quizResult.unlocked_badges.join(', ')}
                        </div>
                      )}
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wide block">Review Explanations:</span>
                      {quizQuestions.map((q, idx) => {
                        const feedback = quizResult.explanations[q.id];
                        return (
                          <div key={q.id} className="border border-white/5 bg-white/5 p-3 rounded-2xl text-xs">
                            <p className="font-semibold text-white flex items-center gap-1.5">
                              {feedback?.correct ? (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                              ) : (
                                <AlertCircle className="w-4 h-4 text-red-400" />
                              )}
                              {idx + 1}. {q.question_text}
                            </p>
                            <p className="text-gray-400 mt-1">
                              Correct answer: <span className="text-emerald-400 font-semibold">{q.correct_answer}</span>
                            </p>
                            <p className="text-gray-300 italic mt-1 bg-black/30 p-2 rounded-lg text-[11px]">
                              {q.explanation}
                            </p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                <div className="pt-4 border-t border-white/5 flex gap-2">
                  {!quizResult ? (
                    <button
                      onClick={submitQuiz}
                      disabled={loadingQuiz}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-emerald-600 text-white hover:bg-emerald-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-700/20"
                    >
                      {loadingQuiz ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        'Submit Answers'
                      )}
                    </button>
                  ) : (
                    <button
                      onClick={startQuiz}
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      Retake Quiz
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>

        </div>

      </main>

      <AITutorPanel />
    </div>
  );
}
