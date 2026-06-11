'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Header from '@/components/Header';
import AITutorPanel from '@/components/AITutorPanel';
import { 
  Cpu, Sparkles, Plus, Trash2, Search, Play, RotateCcw, 
  HelpCircle, CheckCircle2, AlertCircle, ArrowRight
} from 'lucide-react';

interface BSTNode {
  value: number;
  left: BSTNode | null;
  right: BSTNode | null;
  x: number;
  y: number;
}

export default function DSVisualizer() {
  const router = useRouter();
  const { token, apiBaseUrl, setCourse } = useStore();

  // Active topic: 'array' | 'stack' | 'queue' | 'linkedlist' | 'bst'
  const [topic, setTopic] = useState<'array' | 'stack' | 'queue' | 'linkedlist' | 'bst'>('array');
  
  // Data structures state
  const [elements, setElements] = useState<number[]>([15, 23, 8, 42, 12]);
  const [inputValue, setInputValue] = useState('');
  const [highlightIdx, setHighlightIdx] = useState<number | null>(null);
  const [activeStep, setActiveStep] = useState<string>('Ready for operations');

  // BST Tree State
  const [bstRoot, setBstRoot] = useState<BSTNode | null>(null);

  // AI explanations
  const [aiExplanation, setAiExplanation] = useState<string>('');
  const [loadingAI, setLoadingAI] = useState(false);

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    setCourse('ds-visualizer');
    initializeData();
    return () => setCourse(null);
  }, [topic]);

  const initializeData = () => {
    setHighlightIdx(null);
    setAiExplanation('');
    setInputValue('');
    setActiveStep('Initialized structure');
    
    if (topic === 'array') {
      setElements([12, 45, 8, 23, 56]);
    } else if (topic === 'stack') {
      setElements([5, 10, 15, 20]);
    } else if (topic === 'queue') {
      setElements([100, 200, 300]);
    } else if (topic === 'linkedlist') {
      setElements([42, 17, 89, 5]);
    } else if (topic === 'bst') {
      // Build a simple pre-seeded BST structure
      // Values: 20 (root), 10 (left), 30 (right), 5 (left-left), 15 (left-right)
      const root: BSTNode = {
        value: 20,
        x: 200,
        y: 60,
        left: {
          value: 10,
          x: 100,
          y: 120,
          left: { value: 5, x: 50, y: 180, left: null, right: null },
          right: { value: 15, x: 150, y: 180, left: null, right: null }
        },
        right: {
          value: 30,
          x: 300,
          y: 120,
          left: null,
          right: null
        }
      };
      setBstRoot(root);
      setElements([20, 10, 30, 5, 15]);
    }
  };

  const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

  // 1. Insert Operation
  const handleInsert = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');
    setAiExplanation('');

    if (topic === 'array') {
      if (elements.length >= 8) {
        setActiveStep('Array is full (Max 8 elements for display)');
        return;
      }
      setActiveStep(`Inserting ${val} at the end of the array...`);
      setHighlightIdx(elements.length);
      await delay(800);
      setElements(prev => [...prev, val]);
      setHighlightIdx(null);
      setActiveStep(`Inserted ${val} at index ${elements.length}`);
    } else if (topic === 'stack') {
      if (elements.length >= 6) {
        setActiveStep('Stack Overflow! Stack cannot exceed 6 plates.');
        return;
      }
      setActiveStep(`Pushing ${val} onto the Stack...`);
      setHighlightIdx(elements.length);
      await delay(800);
      setElements(prev => [...prev, val]);
      setHighlightIdx(null);
      setActiveStep(`Pushed ${val} onto Top of Stack`);
    } else if (topic === 'queue') {
      if (elements.length >= 6) {
        setActiveStep('Queue is full! Max queue size is 6.');
        return;
      }
      setActiveStep(`Enqueueing ${val} to the Rear of the Queue...`);
      setHighlightIdx(elements.length);
      await delay(800);
      setElements(prev => [...prev, val]);
      setHighlightIdx(null);
      setActiveStep(`Enqueued ${val} at Rear position`);
    } else if (topic === 'linkedlist') {
      if (elements.length >= 6) return;
      setActiveStep(`Inserting node with value ${val} at head of list...`);
      setHighlightIdx(0);
      await delay(800);
      setElements(prev => [val, ...prev]);
      setHighlightIdx(null);
      setActiveStep(`Inserted ${val} at Head of Linked List`);
    } else if (topic === 'bst') {
      setActiveStep(`Inserting ${val} into Binary Search Tree...`);
      // Simulating tree insert traversal paths
      const steps = [];
      let current = bstRoot;
      
      while (current) {
        steps.push(current.value);
        if (val < current.value) {
          if (!current.left) break;
          current = current.left;
        } else {
          if (!current.right) break;
          current = current.right;
        }
      }

      // Highlight path nodes step-by-step
      for (const stepVal of steps) {
        setActiveStep(`Comparing ${val} with node ${stepVal}...`);
        const idx = elements.indexOf(stepVal);
        setHighlightIdx(idx >= 0 ? idx : null);
        await delay(1000);
      }

      // Perform local state update for BST node
      const insertNode = (node: BSTNode | null, value: number): BSTNode => {
        if (!node) {
          return { value, x: 200, y: 60, left: null, right: null };
        }
        if (value < node.value) {
          node.left = node.left ? insertNode(node.left, value) : { value, x: node.x - 50, y: node.y + 60, left: null, right: null };
        } else {
          node.right = node.right ? insertNode(node.right, value) : { value, x: node.x + 50, y: node.y + 60, left: null, right: null };
        }
        return node;
      };

      if (!bstRoot) {
        setBstRoot({ value: val, x: 200, y: 60, left: null, right: null });
      } else {
        const rootCopy = { ...bstRoot };
        insertNode(rootCopy, val);
        setBstRoot(rootCopy);
      }
      
      setElements(prev => [...prev, val]);
      setHighlightIdx(null);
      setActiveStep(`Successfully inserted ${val} into BST conforming to left<parent<right rule`);
    }
  };

  // 2. Delete Operation
  const handleDelete = async () => {
    setAiExplanation('');
    if (elements.length === 0) {
      setActiveStep('Structure is empty!');
      return;
    }

    if (topic === 'array') {
      const idx = inputValue ? parseInt(inputValue) : elements.length - 1;
      setInputValue('');
      if (isNaN(idx) || idx < 0 || idx >= elements.length) {
        setActiveStep('Invalid delete index');
        return;
      }
      setActiveStep(`Deleting item at index ${idx}...`);
      setHighlightIdx(idx);
      await delay(850);
      setElements(prev => prev.filter((_, i) => i !== idx));
      setHighlightIdx(null);
      setActiveStep(`Deleted element at index ${idx}`);
    } else if (topic === 'stack') {
      setActiveStep(`Popping top element off the Stack...`);
      setHighlightIdx(elements.length - 1);
      await delay(850);
      const popped = elements[elements.length - 1];
      setElements(prev => prev.slice(0, -1));
      setHighlightIdx(null);
      setActiveStep(`Popped value ${popped} from Top of Stack`);
    } else if (topic === 'queue') {
      setActiveStep(`Dequeuing front element from Queue...`);
      setHighlightIdx(0);
      await delay(850);
      const dequeued = elements[0];
      setElements(prev => prev.slice(1));
      setHighlightIdx(null);
      setActiveStep(`Dequeued value ${dequeued} from Front of Queue`);
    } else if (topic === 'linkedlist') {
      setActiveStep(`Deleting head of Linked List...`);
      setHighlightIdx(0);
      await delay(850);
      setElements(prev => prev.slice(1));
      setHighlightIdx(null);
      setActiveStep(`Deleted head node. Next node promoted to Head.`);
    } else if (topic === 'bst') {
      // Simple BST clear/deletion mock
      setActiveStep('Clearing BST to root Node...');
      setHighlightIdx(0);
      await delay(800);
      setBstRoot(null);
      setElements([]);
      setHighlightIdx(null);
      setActiveStep('Cleared all BST nodes');
    }
  };

  // 3. Search Operation
  const handleSearch = async () => {
    const val = parseInt(inputValue);
    if (isNaN(val)) return;
    setInputValue('');
    setAiExplanation('');
    setActiveStep(`Searching for value ${val}...`);

    let found = false;
    
    if (topic !== 'bst') {
      // Linear Search
      for (let i = 0; i < elements.length; i++) {
        setHighlightIdx(i);
        setActiveStep(`Comparing target ${val} at index ${i} with value ${elements[i]}...`);
        await delay(1000);
        if (elements[i] === val) {
          found = true;
          setActiveStep(`Target ${val} found at index ${i}!`);
          break;
        }
      }
    } else {
      // BST Binary Search
      let current = bstRoot;
      while (current) {
        const idx = elements.indexOf(current.value);
        setHighlightIdx(idx >= 0 ? idx : null);
        setActiveStep(`Checking BST Node ${current.value}...`);
        await delay(1200);

        if (val === current.value) {
          found = true;
          setActiveStep(`Found target node ${val} in BST!`);
          break;
        } else if (val < current.value) {
          setActiveStep(`${val} is smaller than ${current.value}. Navigating to LEFT branch.`);
          current = current.left;
        } else {
          setActiveStep(`${val} is larger than ${current.value}. Navigating to RIGHT branch.`);
          current = current.right;
        }
      }
    }

    if (!found) {
      setHighlightIdx(null);
      setActiveStep(`Search complete. Value ${val} not found in the structure.`);
    }
  };

  // AI Explanation of operation
  const explainOperation = async () => {
    setLoadingAI(true);
    setAiExplanation('');
    try {
      const res = await fetch(`${apiBaseUrl}/ai/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: `Data Structures: ${topic} operations`,
          context: `The student just ran the following operation log: "${activeStep}" on an interactive ${topic} structure containing elements: [${elements.join(', ')}].`,
          age_group: "12"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setAiExplanation(data.explanation);
      }
    } catch (err) {
      console.error(err);
      setAiExplanation("Could not reach AI Tutor. Please check backend is running.");
    } finally {
      setLoadingAI(false);
    }
  };

  // Quiz loader
  const startQuiz = async () => {
    setLoadingQuiz(true);
    setAnswers({});
    setQuizResult(null);
    try {
      const res = await fetch(`${apiBaseUrl}/quiz/questions/ds-visualizer`);
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

      const res = await fetch(`${apiBaseUrl}/quiz/submit/ds-visualizer`, {
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

  // Recursive Helper to draw BST paths/nodes dynamically
  const renderBSTSvg = (node: BSTNode | null): React.ReactNode => {
    if (!node) return null;
    return (
      <g key={node.value}>
        {/* Draw Left child connection */}
        {node.left && (
          <>
            <line 
              x1={node.x} y1={node.y} 
              x2={node.left.x} y2={node.left.y} 
              stroke="rgba(255,255,255,0.2)" 
              strokeWidth="2" 
            />
            {renderBSTSvg(node.left)}
          </>
        )}
        
        {/* Draw Right child connection */}
        {node.right && (
          <>
            <line 
              x1={node.x} y1={node.y} 
              x2={node.right.x} y2={node.right.y} 
              stroke="rgba(255,255,255,0.2)" 
              strokeWidth="2" 
            />
            {renderBSTSvg(node.right)}
          </>
        )}

        {/* Draw Node Circle */}
        {(() => {
          const isHighlighted = elements.indexOf(node.value) === highlightIdx;
          return (
            <g className="transition-all duration-300">
              <circle 
                cx={node.x} 
                cy={node.y} 
                r="22" 
                fill={isHighlighted ? "#a78bfa" : "#1e1b4b"} 
                stroke={isHighlighted ? "#c084fc" : "#818cf8"} 
                strokeWidth="2"
              />
              <text 
                x={node.x} 
                y={node.y + 4} 
                textAnchor="middle" 
                fill="#fff" 
                fontSize="12" 
                fontWeight="bold"
              >
                {node.value}
              </text>
            </g>
          );
        })()}
      </g>
    );
  };

  return (
    <div className="min-h-screen flex flex-col relative pb-12">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Title */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet-400" />
              <span className="text-xs font-mono text-violet-400 font-bold uppercase tracking-wider">MODULE 3</span>
            </div>
            <h2 className="font-space font-extrabold text-2xl text-white">Algorithms & DS Visualizer</h2>
            <p className="text-xs text-gray-400">Animate operations in linear lists, stacks, and binary trees. Learn logic step-by-step.</p>
          </div>

          <button
            onClick={startQuiz}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-tr from-violet-600 to-indigo-500 text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-violet-700/20"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Quiz Challenges
          </button>
        </div>

        {/* Structure selection tab */}
        <div className="flex border-b border-white/10 overflow-x-auto gap-2">
          {(['array', 'stack', 'queue', 'linkedlist', 'bst'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTopic(t)}
              className={`pb-3 px-4 text-sm font-bold capitalize transition-all border-b-2 cursor-pointer ${
                topic === t
                  ? 'border-violet-400 text-violet-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {t === 'linkedlist' ? 'Linked List' : t === 'bst' ? 'Binary Tree (BST)' : t}
            </button>
          ))}
        </div>

        {/* Workspace Panels */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: interactive data visualizer screen */}
          <div className="lg:col-span-8 flex flex-col space-y-4">
            
            {/* Simulation Canvas Box */}
            <div className="h-[360px] relative rounded-3xl overflow-hidden border border-white/10 glass-panel shadow-inner bg-black/20 flex items-center justify-center p-6">
              
              {topic !== 'bst' ? (
                // Linear Structure Display (Array, Stack, Queue, LinkedList)
                <div className={`flex gap-3 justify-center items-center ${
                  topic === 'stack' ? 'flex-col-reverse justify-end w-36 h-full max-h-[280px] border-l border-r border-b border-white/20 px-3 pb-2 rounded-b-2xl' : 'flex-wrap'
                }`}>
                  {elements.map((el, idx) => {
                    const isHighlighted = idx === highlightIdx;
                    return (
                      <div key={idx} className="flex items-center">
                        <div className={`w-14 h-14 rounded-xl flex flex-col items-center justify-center border transition-all duration-300 relative ${
                          isHighlighted 
                            ? 'bg-violet-600/30 border-violet-400 scale-110 glow-purple text-white' 
                            : 'bg-white/5 border-white/10 text-gray-200'
                        }`}>
                          <span className="text-xs font-extrabold">{el}</span>
                          <span className="text-[8px] text-gray-400 font-mono absolute bottom-1">
                            {topic === 'array' ? `[${idx}]` : topic === 'stack' && idx === elements.length - 1 ? 'TOP' : topic === 'queue' && idx === 0 ? 'FRONT' : topic === 'queue' && idx === elements.length - 1 ? 'REAR' : ''}
                          </span>
                        </div>
                        
                        {/* Linked List pointer arrow */}
                        {topic === 'linkedlist' && idx < elements.length - 1 && (
                          <div className="flex items-center mx-1">
                            <ArrowRight className="w-5 h-5 text-indigo-400 animate-pulse" />
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {elements.length === 0 && (
                    <div className="text-sm text-gray-500 font-mono">Structure Empty</div>
                  )}
                </div>
              ) : (
                // Hierarchical BST Tree display using SVG lines/nodes
                <svg className="w-full h-full min-h-[300px]">
                  {bstRoot ? renderBSTSvg(bstRoot) : (
                    <text x="50%" y="50%" textAnchor="middle" fill="rgba(255,255,255,0.3)" fontSize="14" fontFamily="monospace">
                      BST Empty. Insert nodes.
                    </text>
                  )}
                </svg>
              )}

              {/* Status footer inside visualizer */}
              <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-2xl flex items-center justify-between text-[11px] text-gray-300 font-mono">
                <span className="flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-violet-400" />
                  {activeStep}
                </span>
                <button
                  onClick={initializeData}
                  className="p-1 rounded hover:bg-white/10 text-gray-400 hover:text-white transition-all"
                  title="Reset Structure"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>

            </div>

            {/* Operations controls bar */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 flex flex-wrap items-center gap-4">
              <div className="flex-1 min-w-[150px]">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={topic === 'array' && activeStep.includes('Deleting') ? "Index..." : "Node Value..."}
                  className="w-full px-4 py-2.5 rounded-xl text-sm glass-input placeholder-gray-600"
                />
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  onClick={handleInsert}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-violet-600 hover:bg-violet-500 text-white transition-all flex items-center gap-1 cursor-pointer glow-purple"
                >
                  <Plus className="w-4 h-4" />
                  Insert
                </button>
                <button
                  onClick={handleDelete}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-red-950/20 border border-red-500/20 hover:bg-red-500/10 text-red-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
                <button
                  onClick={handleSearch}
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-cyan-400 transition-all flex items-center gap-1 cursor-pointer"
                >
                  <Search className="w-4 h-4" />
                  Search
                </button>
              </div>
            </div>

          </div>

          {/* Right panel: AI Explanation & Quizzes */}
          <div className="lg:col-span-4 flex flex-col">
            
            {!quizMode ? (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex-1 flex flex-col justify-between space-y-6">
                
                {/* AI Tutor Operation breakdown */}
                <div className="space-y-4 flex-1">
                  <h3 className="font-space font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sparkles className="w-5 h-5 text-violet-400" />
                    AI Algorithm Analyst
                  </h3>

                  <p className="text-xs text-gray-400 leading-relaxed">
                    Execute operations in the visualizer, then click explain. The AI Analyst dissects complexity indices and traversals.
                  </p>

                  <button
                    onClick={explainOperation}
                    disabled={loadingAI}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-violet-700/20 cursor-pointer glow-purple"
                  >
                    {loadingAI ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Explain Operation'
                    )}
                  </button>
                </div>

                {/* AI explanation readout */}
                {aiExplanation && (
                  <div className="border border-violet-500/20 bg-violet-950/15 p-4 rounded-2xl max-h-60 overflow-y-auto space-y-2 mt-4">
                    <span className="text-[10px] font-bold text-violet-400 block uppercase tracking-wider">AI Operations Analysis:</span>
                    <div className="text-xs text-gray-200 whitespace-pre-line leading-relaxed">
                      {aiExplanation}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              // Quiz panel
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <h3 className="font-space font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-violet-400" />
                    CS Algorithms Quiz
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
                                    ? 'bg-violet-600/20 border-violet-500 text-white'
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
                        ? 'bg-violet-950/20 border-violet-500/30 text-violet-400' 
                        : 'bg-red-950/20 border-red-500/30 text-red-400'
                    }`}>
                      <h4 className="font-space font-extrabold text-lg">
                        {quizResult.passed ? '🎉 Code Architect Unlocked!' : '😢 Try Again!'}
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
                              Correct answer: <span className="text-violet-400 font-semibold">{q.correct_answer}</span>
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
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-violet-600 text-white hover:bg-violet-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-violet-700/20"
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
