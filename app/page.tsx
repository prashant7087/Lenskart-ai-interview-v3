'use client'

import { useState, useRef, useEffect } from 'react';
import { getAIResponse, generateAnalysis } from './actions';
import { Mic, RefreshCcw, ChevronRight, Loader2, FileText, UserCircle2, Zap, CheckCircle2, LayoutDashboard, Sparkles, Calendar, Clock, MessageSquare, BarChart3, Terminal } from 'lucide-react';
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

  // 1. REGISTER (BRANDED BLUE)
  if (phase === 'register') {
    return (
        <div className="min-h-screen bg-[#000042] flex flex-col items-center justify-center p-4 font-sans text-white">
            <div className="w-full max-w-md bg-white p-8 rounded-3xl shadow-2xl border-4 border-[#ffc500]">
                <div className="flex justify-center mb-6">
                    <div className="w-16 h-16 bg-[#000042] rounded-2xl flex items-center justify-center shadow-lg">
                        <FileText className="text-[#ffc500] w-8 h-8" />
                    </div>
                </div>
                <h1 className="text-2xl font-bold text-center mb-1 tracking-tight text-[#000042]">Agent Assessment</h1>
                <p className="text-slate-500 text-center mb-8 text-sm uppercase tracking-widest">Lenskart AI Training</p>
                <div className="space-y-4">
                    {['Name', 'Store Code', 'Ecode'].map((label, i) => (
                        <div key={i}>
                            <label className="text-xs font-bold text-[#000042] uppercase mb-1 block ml-1">{label}</label>
                            <input 
                                type="text" 
                                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-300 focus:border-[#000042] focus:ring-2 focus:ring-[#000042]/20 outline-none transition-all text-slate-900 placeholder-slate-400"
                                placeholder={`Enter ${label}`}
                                onChange={(e) => {
                                    if(label === 'Name') setUserData({...userData, name: e.target.value});
                                    if(label === 'Store Code') setUserData({...userData, storeCode: e.target.value});
                                    if(label === 'Ecode') setUserData({...userData, ecode: e.target.value});
                                }}
                            />
                        </div>
                    ))}
                    <button onClick={() => { if(userData.name) setPhase('intro'); }} className="w-full bg-[#ffc500] hover:bg-yellow-400 text-[#000042] py-4 rounded-xl font-bold mt-4 transition-all shadow-lg flex justify-center items-center gap-2 group">
                        Initialize Session <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                </div>
            </div>
        </div>
    );
  }

  // 2. INTRO (BRANDED)
  if (phase === 'intro') {
    return (
        <div className="min-h-screen bg-[#000042] text-white flex flex-col items-center justify-center p-4 text-center font-sans">
            <div className="w-full max-w-2xl bg-white p-10 rounded-[2.5rem] shadow-2xl border border-slate-100">
                <h1 className="text-4xl font-bold mb-4 text-[#000042]">Welcome, <span className="text-[#000042] underline decoration-[#ffc500] decoration-4 underline-offset-4">{userData.name}</span></h1>
                <div className="bg-slate-50 border border-slate-200 p-6 rounded-2xl text-left mb-8">
                    <h3 className="font-bold text-[#000042] mb-3 text-lg flex items-center gap-2"><Zap size={20} className="text-[#ffc500] fill-[#ffc500]"/> Simulation Parameters</h3>
                    <p className="text-slate-600 leading-relaxed mb-6 text-sm">
                        You are entering a high-fidelity roleplay simulation. Your objective is to de-escalate an agitated customer using the <strong>SERVE Protocol</strong>.
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                        {['Stop & Listen', 'Empathize', 'Resolve', 'Verify', 'Exceed'].map((s, i) => (
                            <div key={i} className="bg-white px-3 py-2 rounded-lg border border-slate-200 text-xs text-slate-600 font-semibold shadow-sm flex items-center gap-2">
                                <div className="w-5 h-5 rounded-full bg-[#000042] text-white flex items-center justify-center text-[10px]">{i+1}</div>{s}
                            </div>
                        ))}
                    </div>
                </div>
                <button onClick={() => setPhase('interview')} className="bg-[#ffc500] text-[#000042] px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl">Start Simulation</button>
            </div>
        </div>
    )
  }

  // 3. INTERVIEW (Dark Blue)
  if (phase === 'interview') {
    return (
    <div className="min-h-screen bg-[#000042] text-white flex flex-col p-4 font-sans relative overflow-hidden">
       <div className="flex justify-between items-center mb-4 z-10">
          <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-full border border-white/20">
              <div className="w-2 h-2 bg-[#ffc500] rounded-full animate-pulse"></div>
              <span className="text-[10px] font-bold tracking-widest text-[#ffc500]">LIVE</span>
          </div>
          <div className="font-mono text-white/50 text-xs bg-white/10 px-3 py-1 rounded-full">TURN {turnCount}/{MAX_TURNS}</div>
          <button onClick={finishInterview} className="text-xs bg-red-500/10 text-red-500 border border-red-500/20 px-3 py-1 rounded hover:bg-red-500 hover:text-white transition-all">End</button>
       </div>

       <div className="flex flex-col md:flex-row gap-4 flex-1 z-10 min-h-0">
          <div className="flex-1 bg-[#00002e] rounded-3xl flex flex-col items-center justify-center border border-white/10 p-4 relative min-h-[250px]">
              <div className={`relative w-32 h-32 md:w-48 md:h-48 rounded-full border-4 border-[#ffc500] transition-all duration-300 ${aiState === 'talking' ? 'scale-110 ring-4 ring-[#ffc500]/30' : 'scale-100 grayscale'}`}>
                  <img src="/avatar.png" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="mt-6 text-center w-full px-4">
                 <p className="text-base md:text-lg font-medium text-white leading-snug">
                    {messages.length > 0 && messages[messages.length-1].role === 'ai' ? messages[messages.length-1].text : `(Scenario: ${currentScenario})`}
                 </p>
              </div>
          </div>

          <div className="flex-1 flex flex-col gap-3 min-h-[250px]">
             <div className="flex-1 bg-[#00002e] rounded-3xl overflow-hidden relative border border-white/10">
                 <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
                 <div className="absolute top-4 right-4 bg-black/60 backdrop-blur-md text-white text-[10px] font-bold px-3 py-1 rounded-full">
                    {status === 'listening' ? <span className="text-[#ffc500] flex gap-1 items-center"><Mic size={10}/> LISTENING</span> : "PROCESSING"}
                 </div>
             </div>
             
             {status === 'idle' ? (
                 <button onClick={startListening} className="h-16 bg-[#ffc500] text-[#000042] rounded-2xl flex items-center justify-center font-bold gap-2 text-lg shadow-lg animate-pulse">
                    <Mic /> TAP TO SPEAK
                 </button>
             ) : (
                 <div className="h-16 bg-white/10 rounded-2xl flex items-center justify-center border border-white/10 text-white/50 font-medium gap-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${status === 'listening' ? 'bg-[#ffc500] animate-ping' : 'bg-slate-700'}`}></div>
                    {status === 'listening' ? "Listening..." : "Wait..."}
                 </div>
             )}
          </div>
       </div>
    </div>
    );
  }

  if (phase === 'analyzing') return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900"><div className="text-center"><Loader2 className="animate-spin w-10 h-10 text-[#000042] mx-auto mb-4"/><p className="font-medium text-sm text-slate-500">Generating Report...</p></div></div>;

  // --- 5. RESULTS (BRANDED UI) ---
  if (phase === 'results' && analysis) {
    const duration = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 5;
    
    return (
      <div className="min-h-screen bg-slate-50 text-slate-900 font-sans p-4 md:p-10 overflow-x-hidden">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between gap-4 items-end pb-2">
             <div>
                <div className="flex items-center gap-2 mb-2">
                    <span className="px-3 py-1 bg-[#000042] text-white border border-[#000042] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">Report Generated</span>
                    <span className="px-3 py-1 bg-[#ffc500] text-[#000042] border border-[#ffc500] text-[10px] font-bold rounded-full uppercase tracking-wider shadow-sm">Valid Session</span>
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-[#000042] tracking-tight">Performance Analysis</h1>
             </div>
             <button onClick={() => window.location.reload()} className="bg-white text-[#000042] border border-slate-200 px-6 py-3 rounded-xl font-bold hover:bg-slate-50 hover:shadow-md transition-all flex items-center gap-2 shadow-sm">
                <RefreshCcw size={16}/> New Session
             </button>
          </div>

          {/* MAIN DASHBOARD GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             
             {/* LEFT: Spider Chart */}
             <div className="lg:col-span-7 bg-white border border-slate-200 rounded-[2rem] p-8 relative shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-4 z-10">
                    <h3 className="text-slate-400 font-bold flex items-center gap-2 text-xs tracking-widest uppercase">
                        <LayoutDashboard size={16} className="text-[#000042]"/> SERVE Diagnostics
                    </h3>
                </div>
                <div className="flex-1 w-full min-h-[350px] relative z-0">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.radarChart}>
                            {/* Grid Lines */}
                            <PolarGrid gridType="circle" stroke="#e2e8f0" strokeWidth={1} />
                            {/* Axis Labels */}
                            <PolarAngleAxis 
                                dataKey="subject" 
                                tick={{ fill: '#64748b', fontSize: 12, fontWeight: '600', textTransform: 'uppercase' }} 
                            />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                            {/* The Chart Itself: Blue Stroke, Yellow Fill */}
                            <Radar 
                                name="Score" 
                                dataKey="A" 
                                stroke="#000042" 
                                strokeWidth={3} 
                                fill="#ffc500" 
                                fillOpacity={0.6} 
                                activeDot={{ r: 6, fill: '#ffffff', stroke: '#000042', strokeWidth: 2 }}
                            />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
             </div>

             {/* RIGHT: Stats & Score */}
             <div className="lg:col-span-5 flex flex-col gap-6">
                {/* Score Card */}
                <div className="flex-1 bg-[#000042] rounded-[2rem] p-8 flex items-center justify-between relative overflow-hidden text-white shadow-xl">
                    <div className="absolute right-[-20px] top-[-20px] w-32 h-32 bg-[#ffc500]/20 blur-[50px] rounded-full"></div>
                    <div>
                        <p className="text-[#ffc500] font-medium text-xs uppercase mb-1 tracking-wider">Overall Rating</p>
                        <h2 className="text-6xl font-bold text-white">{analysis.overallScore}</h2>
                    </div>
                    <div className="w-24 h-24 rounded-full border-4 border-[#ffc500] flex items-center justify-center bg-white/10 backdrop-blur-sm">
                        <div className="text-sm font-bold text-[#ffc500]">
                            {analysis.overallScore >= 70 ? 'PASS' : 'FAIL'}
                        </div>
                    </div>
                </div>

                {/* Profile Details */}
                <div className="bg-white border border-slate-200 rounded-[2rem] p-8 shadow-sm">
                    <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center text-xl font-bold text-[#000042]"><UserCircle2/></div>
                        <div>
                            <h3 className="font-bold text-lg text-[#000042]">{userData.name}</h3>
                            <p className="text-slate-500 text-xs font-mono font-medium">{userData.storeCode}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Duration</p>
                            <p className="font-mono text-sm font-medium text-slate-700">{duration}m 12s</p>
                        </div>
                        <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Scenario</p>
                            <p className="font-mono text-sm font-bold text-[#000042]">Agitated</p>
                        </div>
                    </div>
                </div>
             </div>
          </div>

          {/* SERVE CARDS */}
          <div>
              <h3 className="text-lg font-bold text-[#000042] mb-4 flex items-center gap-2"><BarChart3 size={18} className="text-[#ffc500]"/> Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {analysis.feedback.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all relative overflow-hidden group">
                        <div className="absolute top-0 left-0 w-1 h-full bg-slate-100 group-hover:bg-[#ffc500] transition-colors"></div>
                        <div className="flex flex-col h-full justify-between pl-2">
                            <div>
                                <div className="text-xs font-bold text-slate-400 uppercase mb-2 truncate" title={item.title}>{item.title}</div>
                                <div className={`text-3xl font-bold mb-3 ${item.score >= 7 ? 'text-[#000042]' : 'text-red-500'}`}>{item.score}</div>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                <div className={`h-full rounded-full ${item.score >= 7 ? 'bg-[#ffc500]' : 'bg-red-500'}`} style={{width: `${item.score * 10}%`}}></div>
                            </div>
                        </div>
                    </div>
                ))}
              </div>
          </div>

          {/* FEEDBACK SECTIONS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-white border border-slate-200 p-8 rounded-[2rem] shadow-sm">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4 flex gap-2 items-center"><Sparkles size={14} className="text-[#ffc500]"/> Executive Summary</h3>
                <p className="text-slate-600 leading-relaxed text-sm">{analysis.summary}</p>
             </div>

             <div className="bg-[#000042] border border-[#000042] p-8 rounded-[2rem] relative overflow-hidden text-white/80">
                <h3 className="text-sm font-bold text-[#ffc500] uppercase tracking-wider mb-4 flex gap-2 items-center"><Terminal size={14}/> Detailed Logs</h3>
                <div className="prose prose-invert max-w-none text-xs font-mono leading-relaxed h-48 overflow-y-auto custom-scrollbar">
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