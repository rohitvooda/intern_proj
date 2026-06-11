'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useStore } from '@/store/useStore';
import Header from '@/components/Header';
import AITutorPanel from '@/components/AITutorPanel';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { 
  Activity, Sparkles, Play, Pause, RotateCcw, 
  Sliders, MessageSquare, Volume2, HelpCircle, CheckCircle2, AlertCircle
} from 'lucide-react';

export default function PhysicsLab() {
  const router = useRouter();
  const { token, apiBaseUrl, setCourse } = useStore();
  
  // Experiment selection: 'projectile' | 'pendulum' | 'freefall'
  const [experiment, setExperiment] = useState<'projectile' | 'pendulum' | 'freefall'>('projectile');
  
  // Controls state
  const [velocity, setVelocity] = useState(20); // initial velocity (m/s) or length for pendulum
  const [mass, setMass] = useState(5); // mass (kg)
  const [angle, setAngle] = useState(45); // launch angle (degrees) or amplitude
  const [gravity, setGravity] = useState(9.8); // gravity (m/s^2)

  // Simulation run states
  const [isSimulating, setIsSimulating] = useState(false);
  const [simTime, setSimTime] = useState(0);
  const [simData, setSimData] = useState<any[]>([]);
  const requestRef = useRef<number | null>(null);
  const previousTimeRef = useRef<number | null>(null);

  // AI Tutor state
  const [tutorQuestion, setTutorQuestion] = useState('Why does maximum range occur at 45 degrees?');
  const [tutorAnswer, setTutorAnswer] = useState('');
  const [loadingTutor, setLoadingTutor] = useState(false);

  // Quiz state
  const [quizMode, setQuizMode] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState<any[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [quizResult, setQuizResult] = useState<any>(null);
  const [loadingQuiz, setLoadingQuiz] = useState(false);

  useEffect(() => {
    setCourse('physics-lab');
    resetSimulation();
    return () => {
      setCourse(null);
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [experiment, velocity, mass, angle, gravity]);

  // Physics simulation math
  const resetSimulation = () => {
    setIsSimulating(false);
    setSimTime(0);
    previousTimeRef.current = null;
    if (requestRef.current) cancelAnimationFrame(requestRef.current);
    
    // Generate theoretical/preview dataset
    generatePreviewData();
  };

  const generatePreviewData = () => {
    const data = [];
    const g = gravity;
    const m = mass;
    
    if (experiment === 'projectile') {
      const v0 = velocity;
      const rad = (angle * Math.PI) / 180;
      const totalTime = (2 * v0 * Math.sin(rad)) / g;
      const timeStep = totalTime / 30;

      for (let i = 0; i <= 30; i++) {
        const t = Math.min(i * timeStep, totalTime);
        const x = v0 * Math.cos(rad) * t;
        const y = Math.max(0, v0 * Math.sin(rad) * t - 0.5 * g * t * t);
        const vx = v0 * Math.cos(rad);
        const vy = v0 * Math.sin(rad) - g * t;
        const speed = Math.sqrt(vx * vx + vy * vy);

        data.push({
          time: parseFloat(t.toFixed(2)),
          distance: parseFloat(x.toFixed(1)),
          altitude: parseFloat(y.toFixed(1)),
          velocity: parseFloat(speed.toFixed(1))
        });
      }
    } else if (experiment === 'pendulum') {
      // Small angle approximation or basic pendulum math
      // Period T = 2 * PI * sqrt(L/g). Let length = velocity (1 to 30)
      const L = Math.max(2, velocity / 3);
      const period = 2 * Math.PI * Math.sqrt(L / g);
      const totalTime = period * 2; // two cycles
      const timeStep = totalTime / 40;

      for (let i = 0; i <= 40; i++) {
        const t = i * timeStep;
        // theta(t) = theta0 * cos(omega * t)
        const omega = Math.sqrt(g / L);
        const rad0 = (angle * Math.PI) / 180;
        const theta = rad0 * Math.cos(omega * t);
        
        // Cartesian coordinates for plotting swing
        const x = L * Math.sin(theta);
        const y = -L * Math.cos(theta);
        const speed = Math.abs(L * omega * rad0 * Math.sin(omega * t));

        data.push({
          time: parseFloat(t.toFixed(2)),
          distance: parseFloat(x.toFixed(2)),
          altitude: parseFloat((y + L).toFixed(2)), // ground reference
          velocity: parseFloat(speed.toFixed(2))
        });
      }
    } else {
      // Free Fall
      // starting height h = 100m
      const h0 = 100;
      const totalTime = Math.sqrt((2 * h0) / g);
      const timeStep = totalTime / 30;

      for (let i = 0; i <= 30; i++) {
        const t = Math.min(i * timeStep, totalTime);
        const y = Math.max(0, h0 - 0.5 * g * t * t);
        const speed = g * t;

        data.push({
          time: parseFloat(t.toFixed(2)),
          distance: 0,
          altitude: parseFloat(y.toFixed(1)),
          velocity: parseFloat(speed.toFixed(1))
        });
      }
    }
    setSimData(data);
  };

  // Run simulation frame updates
  const animate = (time: number) => {
    if (previousTimeRef.current !== null) {
      const delta = (time - previousTimeRef.current) / 1000; // seconds
      
      setSimTime((prevTime) => {
        const newTime = prevTime + delta * 1.5; // speed up simulation slightly
        
        // Check end condition
        let endCondition = false;
        if (experiment === 'projectile') {
          const rad = (angle * Math.PI) / 180;
          const totalTime = (2 * velocity * Math.sin(rad)) / gravity;
          if (newTime >= totalTime) endCondition = true;
        } else if (experiment === 'pendulum') {
          const L = Math.max(2, velocity / 3);
          const period = 2 * Math.PI * Math.sqrt(L / gravity);
          if (newTime >= period * 2) endCondition = true;
        } else {
          const totalTime = Math.sqrt(200 / gravity); // falling from 100m
          if (newTime >= totalTime) endCondition = true;
        }

        if (endCondition) {
          setIsSimulating(false);
          return prevTime;
        }
        return newTime;
      });
    }
    previousTimeRef.current = time;
    if (isSimulating) {
      requestRef.current = requestAnimationFrame(animate);
    }
  };

  useEffect(() => {
    if (isSimulating) {
      requestRef.current = requestAnimationFrame(animate);
    } else {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
      previousTimeRef.current = null;
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [isSimulating]);

  // AI Tutor Ask API
  const askAITutor = async () => {
    setLoadingTutor(true);
    setTutorAnswer('');
    try {
      const res = await fetch(`${apiBaseUrl}/ai/explain`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          topic: `Physics Lab Simulator Variable Changes`,
          context: `The student is simulating ${experiment} in the lab. ` + 
            `Current parameters: velocity/length=${velocity}, mass=${mass}, angle=${angle}, gravity=${gravity}. ` + 
            `Question: ${tutorQuestion}`,
          age_group: "12"
        })
      });

      if (res.ok) {
        const data = await res.json();
        setTutorAnswer(data.explanation);
      }
    } catch (err) {
      console.error(err);
      setTutorAnswer("Failed to reach AI Tutor. Please ensure backend is running.");
    } finally {
      setLoadingTutor(false);
    }
  };

  // Quiz logic
  const startQuiz = async () => {
    setLoadingQuiz(true);
    setAnswers({});
    setQuizResult(null);
    try {
      const res = await fetch(`${apiBaseUrl}/quiz/questions/physics-lab`);
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

      const res = await fetch(`${apiBaseUrl}/quiz/submit/physics-lab`, {
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

  // Compute instantaneous points for visual animation rendering
  const getAnimatedBallPosition = () => {
    const t = simTime;
    const g = gravity;
    if (experiment === 'projectile') {
      const v0 = velocity;
      const rad = (angle * Math.PI) / 180;
      const x = v0 * Math.cos(rad) * t;
      const y = Math.max(0, v0 * Math.sin(rad) * t - 0.5 * g * t * t);
      
      // Scaling coordinate bounds for container display
      return { x: 50 + x * 8, y: 350 - y * 8 };
    } else if (experiment === 'pendulum') {
      const L = Math.max(2, velocity / 3);
      const omega = Math.sqrt(g / L);
      const theta = ((angle * Math.PI) / 180) * Math.cos(omega * t);
      
      const x = Math.sin(theta) * 120;
      const y = Math.cos(theta) * 120;
      return { x: 200 + x, y: 80 + y };
    } else {
      // Free fall
      const y = Math.max(0, 100 - 0.5 * g * t * t);
      return { x: 200, y: 80 + (100 - y) * 2.8 };
    }
  };

  const ballPos = getAnimatedBallPosition();

  return (
    <div className="min-h-screen flex flex-col relative pb-12">
      <Header />
      
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 md:px-8 py-6 space-y-6">
        
        {/* Title / Module header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span className="text-xs font-mono text-cyan-400 font-bold uppercase tracking-wider">MODULE 2</span>
            </div>
            <h2 className="font-space font-extrabold text-2xl text-white">Physics Lab Simulator</h2>
            <p className="text-xs text-gray-400">Tweak launch forces, mass, gravity, and angles. Analyze kinetics and real-time parameters.</p>
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={startQuiz}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-tr from-cyan-600 to-indigo-500 text-white hover:scale-105 active:scale-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-700/20"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              Test Knowledge
            </button>
          </div>
        </div>

        {/* Experiment tabs */}
        <div className="flex border-b border-white/10 gap-2">
          {(['projectile', 'pendulum', 'freefall'] as const).map((exp) => (
            <button
              key={exp}
              onClick={() => setExperiment(exp)}
              className={`pb-3 px-4 text-sm font-bold capitalize transition-all border-b-2 cursor-pointer ${
                experiment === exp
                  ? 'border-cyan-400 text-cyan-400'
                  : 'border-transparent text-gray-400 hover:text-white'
              }`}
            >
              {exp === 'freefall' ? 'Free Fall' : `${exp} Motion`}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* Left panel: sliders & interactive simulation display */}
          <div className="lg:col-span-8 flex flex-col space-y-6">
            
            {/* Visual simulation box */}
            <div className="h-[380px] relative rounded-3xl overflow-hidden border border-white/10 glass-panel shadow-inner bg-black/20 flex items-center justify-center">
              
              {/* Physics 2D Canvas Representation */}
              <svg className="w-full h-full pointer-events-none">
                {/* Horizontal ground reference */}
                <line x1="10" y1="350" x2="700" y2="350" stroke="rgba(255,255,255,0.15)" strokeWidth="2" />
                
                {/* Projectile simulation vectors */}
                {experiment === 'projectile' && (
                  <>
                    <circle cx="50" cy="350" r="8" fill="#a78bfa" />
                    {/* Launch barrel indicator */}
                    <line 
                      x1="50" 
                      y1="350" 
                      x2={50 + 25 * Math.cos((angle * Math.PI) / 180)} 
                      y2={350 - 25 * Math.sin((angle * Math.PI) / 180)} 
                      stroke="#fbbf24" 
                      strokeWidth="4" 
                      strokeLinecap="round"
                    />
                    {/* Trajectory dotted preview */}
                    <path
                      d={`M 50 350 Q ${50 + (velocity * velocity * Math.sin((2 * angle * Math.PI) / 180)) / (2 * gravity) * 4} ${350 - (velocity * velocity * Math.sin((angle * Math.PI) / 180) * Math.sin((angle * Math.PI) / 180)) / (2 * gravity) * 8} ${50 + (velocity * velocity * Math.sin((2 * angle * Math.PI) / 180)) / gravity * 8} 350`}
                      fill="none"
                      stroke="rgba(6, 182, 212, 0.25)"
                      strokeWidth="2"
                      strokeDasharray="4 4"
                    />
                    {/* Ball animation */}
                    <circle cx={ballPos.x} cy={ballPos.y} r={Math.max(5, 5 + mass / 2)} fill="#22d3ee" className="glow-cyan" />
                  </>
                )}

                {/* Pendulum simulation vectors */}
                {experiment === 'pendulum' && (
                  <>
                    {/* Anchor point */}
                    <circle cx="200" cy="80" r="6" fill="#fff" />
                    {/* String line */}
                    <line x1="200" y1="80" x2={ballPos.x} y2={ballPos.y} stroke="rgba(255,255,255,0.4)" strokeWidth="2" />
                    {/* Bob weight ball */}
                    <circle cx={ballPos.x} cy={ballPos.y} r={Math.max(8, 8 + mass * 1.5)} fill="#ec4899" />
                  </>
                )}

                {/* Free fall simulation vectors */}
                {experiment === 'freefall' && (
                  <>
                    {/* Release scaffold platform */}
                    <line x1="170" y1="80" x2="230" y2="80" stroke="rgba(255,255,255,0.3)" strokeWidth="4" />
                    <line x1="200" y1="80" x2="200" y2="350" stroke="rgba(255,255,255,0.05)" strokeWidth="1" strokeDasharray="3 3" />
                    {/* Dropping ball */}
                    <circle cx={ballPos.x} cy={ballPos.y} r={Math.max(6, 6 + mass)} fill="#e11d48" />
                  </>
                )}
              </svg>

              {/* Action buttons */}
              <div className="absolute bottom-4 left-4 flex gap-2">
                <button
                  onClick={() => setIsSimulating(!isSimulating)}
                  className="p-3 rounded-2xl bg-cyan-600 hover:bg-cyan-500 text-white transition-all flex items-center gap-1.5 shadow-lg shadow-cyan-700/20 cursor-pointer text-xs font-bold"
                >
                  {isSimulating ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  {isSimulating ? 'Pause' : 'Simulate'}
                </button>
                <button
                  onClick={resetSimulation}
                  className="p-3 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all flex items-center justify-center cursor-pointer"
                  title="Reset Simulation"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
              </div>

              {/* Variable values telemetry readout overlay */}
              <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md border border-white/5 p-3 rounded-2xl text-[10px] text-gray-300 space-y-1 font-mono">
                <p>⚡ Time: {simTime.toFixed(2)}s</p>
                <p>📍 X-Pos: {(experiment === 'projectile' ? (ballPos.x - 50) / 8 : 0).toFixed(1)}m</p>
                <p>📈 Altitude: {(experiment === 'projectile' ? (350 - ballPos.y) / 8 : experiment === 'pendulum' ? (350 - ballPos.y) / 2 : (350 - ballPos.y) / 2.8).toFixed(1)}m</p>
              </div>
            </div>

            {/* Parameter sliders */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10 space-y-4">
              <h4 className="font-space font-bold text-sm text-white flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" />
                Variable Adjustments
              </h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">
                      {experiment === 'pendulum' ? 'String Length (m)' : 'Initial Velocity (m/s)'}
                    </span>
                    <span className="font-bold text-cyan-400 font-mono">{velocity}</span>
                  </div>
                  <input
                    type="range"
                    min="5"
                    max="40"
                    value={velocity}
                    onChange={(e) => setVelocity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Mass (kg)</span>
                    <span className="font-bold text-cyan-400 font-mono">{mass}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    value={mass}
                    onChange={(e) => setMass(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Launch Angle (°)</span>
                    <span className="font-bold text-cyan-400 font-mono">{angle}</span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="85"
                    value={angle}
                    onChange={(e) => setAngle(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Local Gravity (m/s²)</span>
                    <span className="font-bold text-cyan-400 font-mono">{gravity}</span>
                  </div>
                  <input
                    type="range"
                    min="1.6" // moon
                    max="25" // jupiter
                    step="0.1"
                    value={gravity}
                    onChange={(e) => setGravity(parseFloat(e.target.value))}
                    className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Real-time Graph Panel */}
            <div className="glass-panel p-6 rounded-3xl border border-white/10">
              <h4 className="font-space font-bold text-sm text-white mb-4">
                Real-time Parameter Graph (Distance, Height, Velocity)
              </h4>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={simData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.4)" label={{ value: 'Time (s)', position: 'insideBottom', offset: -5, fill: 'rgba(255,255,255,0.4)' }} />
                    <YAxis stroke="rgba(255,255,255,0.4)" />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(10,10,25,0.85)', borderColor: 'rgba(255,255,255,0.1)' }} />
                    <Legend />
                    <Line type="monotone" dataKey="altitude" stroke="#38bdf8" name="Altitude (m)" strokeWidth={2} activeDot={{ r: 8 }} />
                    <Line type="monotone" dataKey="velocity" stroke="#fb7185" name="Velocity (m/s)" strokeWidth={2} />
                    <Line type="monotone" dataKey="distance" stroke="#a78bfa" name="Distance (m)" strokeWidth={1.5} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

          </div>

          {/* Right panel: AI Tutor & Quiz portals */}
          <div className="lg:col-span-4 flex flex-col">
            
            {!quizMode ? (
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex-1 flex flex-col justify-between space-y-6">
                
                {/* AI Tutor Interface */}
                <div className="space-y-4 flex-1">
                  <h3 className="font-space font-bold text-white flex items-center gap-2 border-b border-white/5 pb-3">
                    <Sparkles className="w-5 h-5 text-cyan-400 animate-pulse" />
                    Physics Lab AI Tutor
                  </h3>

                  <div className="space-y-3">
                    <div className="text-xs text-gray-400">
                      Select or ask a question about variable adjustments:
                    </div>

                    <div className="grid grid-cols-1 gap-2">
                      <button
                        onClick={() => setTutorQuestion('Why does increasing angle increase then decrease range?')}
                        className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-left text-xs hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-gray-300"
                      >
                        ❓ Why does launch angle peak range at 45°?
                      </button>
                      
                      <button
                        onClick={() => setTutorQuestion('Does the mass of a pendulum affect its swing speed?')}
                        className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-left text-xs hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-gray-300"
                      >
                        ❓ Does pendulum mass affect the period?
                      </button>

                      <button
                        onClick={() => setTutorQuestion('How does gravity affect free fall acceleration?')}
                        className="p-2.5 rounded-xl border border-white/5 bg-white/5 text-left text-xs hover:border-cyan-500/30 hover:bg-cyan-500/5 transition-all text-gray-300"
                      >
                        ❓ How does gravity affect free fall?
                      </button>
                    </div>

                    <div className="pt-2">
                      <textarea
                        value={tutorQuestion}
                        onChange={(e) => setTutorQuestion(e.target.value)}
                        placeholder="Type your own question here..."
                        className="w-full p-3 h-20 text-xs rounded-xl glass-input placeholder-gray-600 resize-none"
                      />
                    </div>
                  </div>

                  <button
                    onClick={askAITutor}
                    disabled={loadingTutor}
                    className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-500 transition-all flex items-center justify-center gap-1.5 shadow-lg shadow-cyan-700/20 cursor-pointer"
                  >
                    {loadingTutor ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      'Ask AI Tutor'
                    )}
                  </button>
                </div>

                {/* AI Answer view */}
                {tutorAnswer && (
                  <div className="border border-cyan-500/20 bg-cyan-950/15 p-4 rounded-2xl max-h-60 overflow-y-auto space-y-2 mt-4">
                    <span className="text-[10px] font-bold text-cyan-400 block uppercase tracking-wider">AI Tutor Explanation:</span>
                    <div className="text-xs text-gray-200 whitespace-pre-line leading-relaxed">
                      {tutorAnswer}
                    </div>
                  </div>
                )}

              </div>
            ) : (
              // Quiz panel
              <div className="glass-panel p-6 rounded-3xl border border-white/10 flex-1 flex flex-col justify-between overflow-hidden">
                <div className="flex items-center justify-between border-b border-white/5 pb-3 mb-4">
                  <h3 className="font-space font-bold text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-cyan-400" />
                    Physics Lab Quiz
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
                                    ? 'bg-cyan-600/20 border-cyan-500 text-white'
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
                        ? 'bg-cyan-950/20 border-cyan-500/30 text-cyan-400' 
                        : 'bg-red-950/20 border-red-500/30 text-red-400'
                    }`}>
                      <h4 className="font-space font-extrabold text-lg">
                        {quizResult.passed ? '🎉 Master Level Achieved!' : '😢 Try Again!'}
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
                              Correct answer: <span className="text-cyan-400 font-semibold">{q.correct_answer}</span>
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
                      className="w-full py-2.5 rounded-xl text-xs font-bold bg-cyan-600 text-white hover:bg-cyan-500 transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-cyan-700/20"
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
