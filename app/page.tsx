'use client'
import { Mic, RefreshCcw, ChevronRight, Loader2, FileText, UserCircle2, Zap, CheckCircle2, LayoutDashboard, Sparkles, Calendar, Clock, MessageSquare, BarChart3, Terminal } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { getAIResponse, generateAnalysis } from './actions';

import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

type Message = { role: 'user' | 'ai'; text: string };
type UserData = { name: string; storeCode: string; ecode: string };

const SCENARIOS = [
  "Wrong Product: I ordered Blue Ray lenses but got normal ones.",
  "Delay: You promised delivery yesterday, tracking shows nothing!",
  "Lens Issue: My vision is blurry with these new glasses.",
  "Quality: There is a scratch on the lens and I just opened the box!",
  "Service: Your customer care was very rude to me.",
  "Warranty: You are refusing my warranty claim!"
];

export default function InterviewPage() {
  const [phase, setPhase] = useState<'register' | 'intro' | 'interview' | 'analyzing' | 'results'>('register');
  const [userData, setUserData] = useState<UserData>({ name: '', storeCode: '', ecode: '' });
  const [messages, setMessages] = useState<Message[]>([]);
  const messagesRef = useRef<Message[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [currentScenario, setCurrentScenario] = useState<string>("");
  
  // State for Apple Dock Effect on Results Page
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  
  const [turnCount, setTurnCount] = useState(0);
  const turnCountRef = useRef(0);
  const MAX_TURNS = 5; 

  const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
  const [aiState, setAiState] = useState<'idle' | 'talking'>('idle');
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  // --- HELPERS ---
  const addMessage = (role: 'user' | 'ai', text: string) => {
      const newMessage: Message = { role, text };
      setMessages(prev => [...prev, newMessage]);
      messagesRef.current = [...messagesRef.current, newMessage];
  };

  // UseEffect Setup and other functions remain the same...
  // --- SETUP ---
  useEffect(() => {
    if (typeof window !== 'undefined') {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        if (SpeechRecognition) {
            recognitionRef.current = new SpeechRecognition();
            recognitionRef.current.continuous = false;
            recognitionRef.current.interimResults = false;
            recognitionRef.current.lang = 'en-US'; 
            
            recognitionRef.current.onstart = () => setStatus('listening');
            recognitionRef.current.onresult = (event: any) => processAnswer(event.results[0][0].transcript);
            recognitionRef.current.onerror = (event: any) => {
                if (event.error === 'not-allowed' || event.error === 'service-not-allowed') setStatus('idle');
            };
        }
    }
  }, []);

  useEffect(() => {
    if (phase === 'interview') {
        setStartTime(new Date());
        const randomIssue = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
        setCurrentScenario(randomIssue);
        setTurnCount(0); turnCountRef.current = 0;
        setMessages([]); messagesRef.current = []; 

        navigator.mediaDevices.getUserMedia({ video: { facingMode: "user" }, audio: true }).then(stream => {
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.volume = 0; }
        }).catch(e => console.log("Camera failed", e));

        setTimeout(startListening, 1000);
    }
  }, [phase]);

  const startListening = () => { 
      if (turnCountRef.current >= MAX_TURNS) return;
      try { recognitionRef.current?.start(); } catch(e) { setStatus('idle'); } 
  };
  const stopListening = () => { recognitionRef.current?.stop(); };

  const processAnswer = async (text: string) => {
    if (!text) return;
    setStatus('processing');
    addMessage('user', text);

    if (turnCountRef.current >= MAX_TURNS) {
        finishInterview();
        return;
    }

    const aiRes = await getAIResponse(text, messagesRef.current, currentScenario);
    
    if (aiRes.success) {
        addMessage('ai', aiRes.text);
        turnCountRef.current += 1;
        setTurnCount(prev => prev + 1);
        speak(aiRes.text);
    } else {
        alert(aiRes.text); 
        setStatus('idle');
    }
  };

  const speak = (text: string) => {
    setStatus('speaking'); setAiState('talking');
    const utterance = new SpeechSynthesisUtterance(text);
    window.speechSynthesis.cancel();
    utterance.onend = () => { 
      setAiState('idle'); 
      if (turnCountRef.current < MAX_TURNS) setTimeout(startListening, 500); 
      else finishInterview();
    };
    window.speechSynthesis.speak(utterance);
  };

  const finishInterview = async () => {
    stopListening(); 
    window.speechSynthesis.cancel(); 
    setPhase('analyzing');
    const result = await generateAnalysis(messagesRef.current);
    setAnalysis(result);
    setPhase('results');
  };

  // --- VIEWS ---

  // 1. REGISTER
  if (phase === 'register') {
    return (
        <div className="min-h-screen bg-[#000042] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">
            {/* Animated background gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,197,0,0.15),transparent_70%)] animate-pulse"></div>
            
            <div className="w-full max-w-md bg-white/95 backdrop-blur-xl p-8 rounded-3xl shadow-2xl border-2 border-[#ffc500]/50 relative z-10">
                <div className="flex justify-center mb-6">
                    <div className="w-20 h-20 bg-[#000042] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/50 ring-4 ring-[#ffc500]/20">
                        <FileText className="text-[#ffc500] w-10 h-10" />
                    </div>
                </div>
                <h1 className="text-3xl font-black text-center mb-2 tracking-tight text-[#000042]">LENSKART <span className="text-[#ffc500]">AI</span> TRAINER</h1>
                <p className="text-slate-500 text-center mb-8 text-xs font-bold uppercase tracking-widest">High-Fidelity Roleplay System</p>
                <div className="space-y-5">
                    {['Name', 'Store Code', 'Ecode'].map((label, i) => (
                        <div key={i} className="group">
                            <label className="text-xs font-bold text-[#000042] uppercase mb-2 block ml-1 group-focus-within:text-[#ffc500] transition-colors">{label}</label>
                            <input 
                                type="text" 
                                className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-200 focus:border-[#ffc500] focus:bg-white outline-none transition-all text-slate-900 placeholder-slate-400 font-medium shadow-sm focus:shadow-md focus:shadow-[#ffc500]/10"
                                placeholder={`Enter your ${label.toLowerCase()}...`}
                                onChange={(e) => {
                                    if(label === 'Name') setUserData({...userData, name: e.target.value});
                                    if(label === 'Store Code') setUserData({...userData, storeCode: e.target.value});
                                    if(label === 'Ecode') setUserData({...userData, ecode: e.target.value});
                                }}
                            />
                        </div>
                    ))}
                    <button onClick={() => { if(userData.name) setPhase('intro'); }} className="w-full bg-gradient-to-r from-[#ffc500] to-yellow-400 hover:from-yellow-400 hover:to-[#ffc500] text-[#000042] py-4 rounded-xl font-black text-lg mt-6 transition-all shadow-xl shadow-yellow-500/30 flex justify-center items-center gap-3 group relative overflow-hidden">
                        <span className="relative z-10 flex items-center gap-2">INITIALIZE SESSION <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform"/></span>
                        <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // 2. INTRO
  if (phase === 'intro') {
    return (
        <div className="min-h-screen bg-[#000042] flex flex-col items-center justify-center p-4 font-sans relative">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,197,0,0.1),transparent)] pointer-events-none"></div>
            <div className="bg-white/90 backdrop-blur-lg rounded-[2.5rem] p-2 max-w-4xl w-full shadow-2xl border border-white/50 relative z-10">
                <div className="p-8 md:p-12 text-center">
                    <h1 className="text-4xl md:text-5xl font-black text-[#000042] mb-6 leading-tight">Welcome, <br/><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000042] to-[#000080] underline decoration-[#ffc500] decoration-4 underline-offset-8">{userData.name}</span></h1>
                    
                    {/* THE SERVE CARD */}
                    <div className="bg-gradient-to-br from-slate-50 to-white rounded-[2rem] border-2 border-slate-100 shadow-xl shadow-slate-200/50 overflow-hidden mb-10">
                        <div className="bg-[#000042] py-5 text-center relative overflow-hidden">
                             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10 mix-blend-soft-light"></div>
                            <h2 className="text-[#ffc500] text-2xl font-black tracking-wider relative z-10 uppercase">Mission: Agitated Customer</h2>
                        </div>
                        <div className="p-8 md:p-10 relative">
                            <div className="absolute top-[4.5rem] left-12 right-12 h-2 bg-slate-100 rounded-full z-0 shadow-inner"></div>
                            <div className="flex justify-between relative z-10">
                                {[
                                    { letter: 'S', label: 'Stop &\nListen', active: true },
                                    { letter: 'E', label: 'Empathize', active: false },
                                    { letter: 'R', label: 'Resolve', active: false },
                                    { letter: 'V', label: 'Verify', active: false },
                                    { letter: 'E', label: 'Exceed', active: false }
                                ].map((step, idx) => (
                                    <div key={idx} className="flex flex-col items-center gap-5 w-20 md:w-24 group cursor-default">
                                        <div className={`w-12 h-12 md:w-14 md:h-14 rounded-full shadow-lg border-4 transition-all duration-300 flex items-center justify-center ${step.active ? 'border-[#ffc500] bg-[#000042] scale-110' : 'border-white bg-slate-200 group-hover:border-[#ffc500]/50'}`}>
                                            <div className={`w-4 h-4 rounded-full ${step.active ? 'bg-[#ffc500] animate-pulse' : 'bg-slate-400'}`}></div>
                                        </div>
                                        <div className="text-center leading-tight transition-all group-hover:-translate-y-1">
                                            <span className={`text-3xl md:text-4xl font-black block mb-1 ${step.active ? 'text-[#000042]' : 'text-slate-400'}`}>{step.letter}</span>
                                            <span className={`text-xs md:text-sm font-bold whitespace-pre-line uppercase tracking-tight ${step.active ? 'text-[#000042]' : 'text-slate-500'}`}>{step.label}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button onClick={() => setPhase('interview')} className="bg-[#ffc500] text-[#000042] px-16 py-6 rounded-full font-black text-xl hover:scale-105 hover:shadow-2xl hover:shadow-yellow-500/40 transition-all shadow-xl shadow-yellow-500/20 relative overflow-hidden group">
                         <span className="relative z-10 flex items-center gap-3">START SIMULATION <Zap size={24} className="fill-[#000042]"/></span>
                         <div className="absolute inset-0 bg-white/30 scale-x-0 group-hover:scale-x-100 transition-transform origin-left duration-500"></div>
                    </button>
                </div>
            </div>
        </div>
    )
  }

  // 3. INTERVIEW
  if (phase === 'interview') {
    return (
    <div className="min-h-screen bg-[#000042] text-white flex flex-col p-4 font-sans relative overflow-hidden">
        {/* Subtle animated background grid */}
       <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5"></div>
       <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(rgba(255,197,0,0.1) 1px, transparent 1px)', backgroundSize: '40px 40px', maskImage: 'radial-gradient(circle at center, black 40%, transparent 80%)'}}></div>

       <div className="flex justify-between items-center mb-4 z-10">
          <div className="flex items-center gap-3 px-4 py-2 bg-[#00002e]/80 backdrop-blur-md rounded-full border border-[#ffc500]/30 shadow-[0_0_15px_rgba(255,197,0,0.2)]">
              <div className="w-2.5 h-2.5 bg-[#ffc500] rounded-full animate-pulse shadow-[0_0_10px_#ffc500]"></div>
              <span className="text-xs font-black tracking-widest text-[#ffc500]">LIVE SESSION</span>
          </div>
          <div className="font-mono text-[#ffc500]/70 text-xs bg-[#00002e]/80 border border-[#ffc500]/20 px-4 py-2 rounded-full backdrop-blur-md">
            TURN <span className="text-[#ffc500] font-bold">{turnCount}</span> / {MAX_TURNS}
          </div>
          <button onClick={finishInterview} className="text-xs bg-red-500/20 text-red-400 border border-red-500/30 px-4 py-2 rounded-full hover:bg-red-500 hover:text-white transition-all font-bold backdrop-blur-md">TERMINATE</button>
       </div>

       <div className="flex flex-col md:flex-row gap-6 flex-1 z-10 min-h-0">
          {/* AI Avatar Card */}
          <div className="flex-1 bg-[#00002e]/90 backdrop-blur-xl rounded-[2rem] flex flex-col items-center justify-center border border-[#ffc500]/20 p-6 relative min-h-[300px] overflow-hidden shadow-2xl">
              <div className={`absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[#ffc500]/20 blur-[100px] rounded-full transition-opacity duration-500 pointer-events-none ${aiState === 'talking' ? 'opacity-100' : 'opacity-30'}`}></div>
              
              <div className={`relative w-40 h-40 md:w-56 md:h-56 rounded-full border-[6px] border-[#ffc500] transition-all duration-300 p-1 z-20 ${aiState === 'talking' ? 'scale-105 shadow-[0_0_40px_#ffc500]' : 'scale-100 shadow-[0_0_10px_#ffc500]/30 grayscale-[50%]'}`}>
                  <img src="/avatar.png" className="w-full h-full object-cover rounded-full bg-[#000042]" />
                  {aiState === 'talking' && <div className="absolute inset-0 rounded-full border-4 border-white/50 animate-ping"></div>}
              </div>
              
              <div className="mt-8 text-center w-full px-6 relative z-20">
                 <div className="min-h-[80px] flex items-center justify-center">
                    <p className="text-lg md:text-xl font-bold text-white leading-relaxed max-w-lg mx-auto">
                        {messages.length > 0 && messages[messages.length-1].role === 'ai' ? (
                            <span>"{messages[messages.length-1].text}"</span>
                        ) : (
                            <span className="text-[#ffc500] italic opacity-80">(Scenario: {currentScenario})</span>
                        )}
                    </p>
                 </div>
                 {aiState === 'talking' && <div className="text-[#ffc500] text-xs font-black tracking-widest mt-4 animate-pulse flex justify-center gap-2 items-center"><Zap size={14} className="fill-[#ffc500]"/> VOICE ACTIVE ///</div>}
              </div>
          </div>

          {/* User Camera & Controls */}
          <div className="flex-1 flex flex-col gap-4 min-h-[300px]">
             <div className="flex-1 bg-[#00002e]/90 backdrop-blur-xl rounded-[2rem] overflow-hidden relative border border-[#ffc500]/20 shadow-xl group">
                 <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1] opacity-80 group-hover:opacity-100 transition-all duration-500" />
                 <div className="absolute inset-0 bg-gradient-to-t from-[#000042] via-transparent to-transparent opacity-50"></div>
                 
                 <div className="absolute top-5 right-5 bg-[#000042]/80 backdrop-blur-md border border-[#ffc500]/30 text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 shadow-lg">
                    {status === 'listening' ? 
                        <><span className="relative flex h-2.5 w-2.5"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ffc500] opacity-75"></span><span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#ffc500]"></span></span> <span className="text-[#ffc500] tracking-wider">LISTENING</span></> 
                        : <span className="text-slate-400 tracking-wider">STANDBY</span>
                    }
                 </div>
             </div>
             
             {/* Controls */}
             {status === 'idle' ? (
                 <button onClick={startListening} className="h-20 bg-[#ffc500] text-[#000042] rounded-2xl flex items-center justify-center font-black gap-3 text-xl shadow-[0_0_25px_rgba(255,197,0,0.3)] hover:shadow-[0_0_40px_rgba(255,197,0,0.5)] hover:scale-[1.02] transition-all relative overflow-hidden group">
                    <Mic size={28} className="fill-[#000042]"/> TAP TO SPEAK
                    <div className="absolute inset-0 bg-white/30 scale-y-0 group-hover:scale-y-100 transition-transform origin-bottom duration-300"></div>
                 </button>
             ) : (
                 <div className="h-20 bg-[#00002e]/90 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-[#ffc500]/20 text-[#ffc500] font-bold gap-4 text-lg relative overflow-hidden shadow-inner">
                    {status === 'listening' ? (
                        <><div className="w-16 flex justify-between px-2"><div className="w-2 h-2 bg-[#ffc500] rounded-full animate-bounce"></div><div className="w-2 h-2 bg-[#ffc500] rounded-full animate-bounce [animation-delay:0.2s]"></div><div className="w-2 h-2 bg-[#ffc500] rounded-full animate-bounce [animation-delay:0.4s]"></div></div> Listening...</>
                    ) : "Processing Voice..."}
                    <div className="absolute bottom-0 left-0 h-1 bg-[#ffc500] animate-[progress_2s_ease-in-out_infinite]" style={{width: '100%'}}></div>
                 </div>
             )}
          </div>
       </div>
    </div>
    );
  }

  if (phase === 'analyzing') return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900"><div className="text-center"><Loader2 className="animate-spin w-12 h-12 text-[#000042] mx-auto mb-6"/><h2 className="text-2xl font-black text-[#000042] mb-2">Analyzing Performance</h2><p className="font-medium text-slate-500 uppercase tracking-widest text-sm">Generating SERVE Diagnostics...</p></div></div>;

  // --- 5. RESULTS (FUTURISTIC & DOCK EFFECT) ---
  if (phase === 'results' && analysis) {
    const duration = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 5;
    
    return (
      <div className="min-h-screen bg-[#f0f4f8] text-slate-900 font-sans p-6 md:p-12 overflow-x-hidden">
        <div className="max-w-[90rem] mx-auto space-y-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-6 items-end pb-4 border-b-2 border-slate-200">
             <div>
                <div className="flex items-center gap-3 mb-3">
                    <span className="px-4 py-1.5 bg-[#000042] text-white border-2 border-[#000042] text-[11px] font-black rounded-full uppercase tracking-widest shadow-sm flex items-center gap-2"><Terminal size={12}/> Report Generated</span>
                </div>
                <h1 className="text-4xl md:text-5xl font-black text-[#000042] tracking-tight"><span className="text-transparent bg-clip-text bg-gradient-to-r from-[#000042] to-blue-700">Performance</span> Analysis</h1>
             </div>
             <button onClick={() => window.location.reload()} className="bg-white text-[#000042] border-2 border-slate-200 px-8 py-4 rounded-xl font-bold hover:bg-slate-50 hover:border-[#000042] hover:shadow-md transition-all flex items-center gap-3 shadow-sm group">
                <RefreshCcw size={18} className="group-hover:rotate-180 transition-transform duration-500"/> New Session
             </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
             
             {/* LEFT: Futuristic Radar Chart */}
             <div className="lg:col-span-7 bg-white rounded-[2.5rem] p-8 relative shadow-xl shadow-slate-200/50 flex flex-col border-2 border-slate-100 overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#000042] via-[#ffc500] to-[#000042]"></div>
                 <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-[#ffc500]/10 blur-[80px] rounded-full pointer-events-none"></div>
                
                <div className="flex justify-between items-start mb-8 z-10">
                    <h3 className="text-slate-400 font-bold flex items-center gap-3 text-sm tracking-widest uppercase">
                        <div className="p-2 bg-[#000042] rounded-lg text-[#ffc500] shadow-md"><LayoutDashboard size={18}/></div> SERVE Diagnostics Protocol
                    </h3>
                </div>
                <div className="flex-1 w-full min-h-[400px] relative z-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="75%" data={analysis.radarChart}>
                            <defs>
                                {/* Neon Glow Filter */}
                                <filter id="neonGlow" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
                                    <feMerge>
                                        <feMergeNode in="blur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                                {/* Sci-Fi Gradient Fill */}
                                <linearGradient id="radarFillFuturistic" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="0%" stopColor="#ffc500" stopOpacity={0.7}/>
                                    <stop offset="100%" stopColor="#ffc500" stopOpacity={0.1}/>
                                </linearGradient>
                            </defs>

                            {/* Glowing Grid Lines */}
                            <PolarGrid gridType="circle" stroke="#0ea5e9" strokeWidth={1.5} strokeOpacity={0.4} strokeDasharray="4 4" />
                            
                            {/* Digital Labels */}
                            <PolarAngleAxis 
                                dataKey="subject" 
                            tick={{ fill: '#000042', fontSize: 12, fontWeight: '800', fontFamily: 'monospace' }}
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                            
                            {/* The Data Shape with Neon Glow */}
                            <Radar 
                                name="Score" 
                                dataKey="A" 
                                stroke="#000042" 
                                strokeWidth={4}
                                fill="url(#radarFillFuturistic)" 
                                fillOpacity={1} 
                                filter="url(#neonGlow)"
                                activeDot={{ r: 8, fill: '#ffc500', stroke: '#000042', strokeWidth: 3 }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
             </div>

             {/* RIGHT: Stats & Score */}
             <div className="lg:col-span-5 flex flex-col gap-8">
                {/* Score Card */}
                <div className="flex-1 bg-[#000042] rounded-[2.5rem] p-10 flex items-center justify-between relative overflow-hidden text-white shadow-2xl shadow-blue-900/30 border-4 border-[#ffc500]">
                    <div className="absolute right-[-30px] top-[-30px] w-40 h-40 bg-[#ffc500]/30 blur-[60px] rounded-full animate-pulse"></div>
                    <div className="relative z-10">
                        <p className="text-[#ffc500] font-bold text-sm uppercase mb-2 tracking-widest flex items-center gap-2"><Sparkles size={14}/> Overall Rating</p>
                        <h2 className="text-7xl font-black text-white tracking-tighter">{analysis.overallScore}</h2>
                    </div>
                    <div className="relative z-10">
                         <div className={`w-28 h-28 rounded-full border-[6px] flex items-center justify-center bg-[#000042] shadow-[0_0_30px_#ffc500] ${analysis.overallScore >= 70 ? 'border-emerald-500 text-emerald-500 shadow-emerald-500/50' : 'border-red-500 text-red-500 shadow-red-500/50'}`}>
                            <div className="text-lg font-black tracking-wider">
                                {analysis.overallScore >= 70 ? 'PASS' : 'FAIL'}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="bg-white border-2 border-slate-100 rounded-[2.5rem] p-10 shadow-xl shadow-slate-200/50 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-slate-100 rounded-bl-[2.5rem] -z-0"></div>
                    <div className="flex items-center gap-6 mb-8 relative z-10">
                        <div className="w-16 h-16 bg-[#000042] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-900/20">
                            <UserCircle2 size={32} className="text-[#ffc500]"/>
                        </div>
                        <div>
                            <h3 className="font-black text-2xl text-[#000042] mb-1">{userData.name}</h3>
                            <div className="flex gap-3 text-xs font-bold text-slate-500 uppercase tracking-wider">
                                <span className="bg-slate-100 px-3 py-1 rounded-md">Store: {userData.storeCode}</span>
                            </div>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6 relative z-10">
                        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200 flex items-center gap-4">
                             <div className="p-3 bg-white rounded-xl shadow-sm"><Clock size={20} className="text-slate-400"/></div>
                             <div>
                                <p className="text-xs text-slate-400 font-bold uppercase mb-1">Duration</p>
                                <p className="font-mono text-lg font-black text-[#000042]">{duration}m 12s</p>
                             </div>
                        </div>
                        <div className="bg-[#ffc500]/10 p-5 rounded-2xl border border-[#ffc500]/30 flex items-center gap-4">
                             <div className="p-3 bg-[#ffc500] rounded-xl shadow-sm text-[#000042]"><Zap size={20} className="fill-[#000042]"/></div>
                             <div>
                                <p className="text-xs text-[#ffc500] font-bold uppercase mb-1">Scenario</p>
                                <p className="font-mono text-lg font-black text-[#000042]">Agitated</p>
                             </div>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* SERVE CARDS WITH APPLE DOCK HOVER EFFECT */}
          <div>
              <h3 className="text-xl font-black text-[#000042] mb-6 flex items-center gap-3 ml-2"><BarChart3 size={24} className="text-[#ffc500] fill-[#ffc500]"/> Performance Breakdown</h3>
              
              {/* The Dock Container */}
              <div className="flex justify-center items-end h-48 gap-4 px-4">
                {analysis.feedback.map((item: any, idx: number) => {
                    // Apple Dock Scale Calculation
                    let scaleClass = 'scale-100 z-0 bg-white border-slate-200 opacity-90';
                    if (hoveredIndex !== null) {
                        const distance = Math.abs(hoveredIndex - idx);
                        if (distance === 0) scaleClass = 'scale-125 z-20 bg-white border-[#ffc500] shadow-[0_20px_40px_rgba(0,0,66,0.2)] -translate-y-4'; // Main Hover
                        else if (distance === 1) scaleClass = 'scale-110 z-10 bg-slate-50 border-slate-300 shadow-lg -translate-y-2'; // Immediate Neighbors
                        else scaleClass = 'scale-95 z-0 bg-slate-100 border-slate-200 opacity-70 blur-[1px]'; // Distant Items
                    }

                    return (
                    <div 
                        key={idx} 
                        onMouseEnter={() => setHoveredIndex(idx)}
                        onMouseLeave={() => setHoveredIndex(null)}
                        className={`w-1/5 p-6 rounded-[2rem] border-2 transition-all duration-300 ease-out transform-gpu relative overflow-hidden flex flex-col justify-between min-h-[160px] cursor-default ${scaleClass}`}
                    >
                        {hoveredIndex === idx && <div className="absolute top-0 left-0 w-full h-1 bg-[#ffc500]"></div>}
                        <div>
                            {/* HIGHLIGHT FIRST LETTER LOGIC - BIGGER & BOLDER */}
                            <div className="mb-2">
                                <span className={`text-4xl font-black mr-1 float-left leading-none transition-colors ${hoveredIndex === idx ? 'text-[#ffc500]' : 'text-[#000042]'}`}>
                                    {item.title.charAt(0)}
                                </span>
                                <span className="text-xs font-extrabold text-slate-400 uppercase tracking-tight block pt-2 leading-tight">
                                    {item.title.slice(1)}
                                </span>
                            </div>
                            <div className={`text-4xl font-black mb-4 mt-4 transition-colors ${item.score >= 7 ? 'text-[#000042]' : 'text-red-500'} ${hoveredIndex === idx ? 'scale-110 origin-left' : ''}`}>{item.score}</div>
                        </div>
                        <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                            <div className={`h-full rounded-full transition-all duration-500 ${item.score >= 7 ? 'bg-[#ffc500]' : 'bg-red-500'}`} style={{width: `${item.score * 10}%`}}></div>
                        </div>
                    </div>
                )})}
              </div>
          </div>

          {/* FEEDBACK SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pb-10">
             <div className="bg-white border-2 border-slate-100 p-10 rounded-[2.5rem] shadow-xl shadow-slate-200/50 relative overflow-hidden">
                 <div className="absolute top-0 right-0 p-10 opacity-10"><Sparkles size={100} className="text-[#ffc500]"/></div>
                <h3 className="text-sm font-black text-slate-400 uppercase tracking-wider mb-6 flex gap-3 items-center relative z-10">
                    <div className="p-2 bg-[#ffc500]/20 rounded-lg"><Sparkles size={16} className="text-[#ffc500]"/></div> Executive Summary
                </h3>
                <p className="text-slate-700 leading-relaxed text-base font-medium relative z-10">{analysis.summary}</p>
             </div>

             <div className="bg-[#000042] border-4 border-[#000042] p-10 rounded-[2.5rem] relative overflow-hidden text-white/80 shadow-2xl">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 mix-blend-overlay"></div>
                <h3 className="text-sm font-black text-[#ffc500] uppercase tracking-wider mb-6 flex gap-3 items-center relative z-10">
                    <div className="p-2 bg-[#ffc500]/20 rounded-lg"><Terminal size={16} className="text-[#ffc500]"/></div> Detailed Logs
                </h3>
                <div className="prose prose-invert max-w-none text-xs font-mono leading-relaxed h-56 overflow-y-auto custom-scrollbar bg-[#00002e] p-6 rounded-2xl border border-white/10 relative z-10 shadow-inner">
                    {analysis.markdown_report || "Generating report..."}
                </div>
             </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}