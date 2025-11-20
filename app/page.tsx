// 'use client'

// import { useState, useRef, useEffect } from 'react';
// import { getAIResponse, generateAnalysis } from './actions';
// import { Mic, Square, Video, Loader2, RefreshCcw, ChevronRight } from 'lucide-react';
// import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// type Message = { role: 'user' | 'ai'; text: string };

// export default function InterviewPage() {
//   const [phase, setPhase] = useState<'intro' | 'interview' | 'analyzing' | 'results'>('intro');
//   const [isRecording, setIsRecording] = useState(false);
//   const [aiState, setAiState] = useState<'idle' | 'talking'>('idle');
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [analysis, setAnalysis] = useState<any>(null);
  
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const recognitionRef = useRef<any>(null);

//   // 1. INITIALIZATION
//   useEffect(() => {
//     if (phase === 'interview') {
//         navigator.mediaDevices.getUserMedia({ video: true, audio: false })
//         .then(stream => {
//             if (videoRef.current) videoRef.current.srcObject = stream;
//         });
//     }

//     if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
//         const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
//         recognitionRef.current = new SpeechRecognition();
//         recognitionRef.current.continuous = false;
//         recognitionRef.current.lang = 'en-IN'; // Changed to India English for better Hinglish detection
//         recognitionRef.current.onresult = (event: any) => handleUserAnswer(event.results[0][0].transcript);
//     }
//   }, [phase]);

//   // 2. LOGIC
//  // REPLACE YOUR OLD handleUserAnswer WITH THIS:
//   const handleUserAnswer = async (text: string) => {
//     setIsRecording(false);
    
//     if (!text) {
//         alert("I didn't hear anything. Please try speaking louder or check your microphone.");
//         return;
//     }

//     // Show user what they said instantly
//     const newHistory = [...messages, { role: 'user', text } as Message];
//     setMessages(newHistory);

//     // Show a "Thinking..." state
//     const tempHistory = [...newHistory, { role: 'ai', text: "..." } as Message];
//     setMessages(tempHistory);

//     try {
//         const aiRes = await getAIResponse(text, newHistory);
        
//         // Remove the "..." and add real response
//         if (aiRes.success) {
//             setMessages(prev => [...prev.slice(0, -1), { role: 'ai', text: aiRes.text }]);
//             speak(aiRes.text);
//         } else {
//             // IF ERROR: Show it in an alert!
//             alert("AI Error: " + aiRes.text); 
//             setMessages(prev => prev.slice(0, -1)); // Remove "..."
//         }
//     } catch (err) {
//         alert("Network Error: Could not connect to the backend.");
//     }
//   };

//   const speak = (text: string) => {
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.onstart = () => setAiState('talking');
//     utterance.onend = () => setAiState('idle');
//     window.speechSynthesis.speak(utterance);
//   };

//   const finishInterview = async () => {
//     setPhase('analyzing');
//     const result = await generateAnalysis(messages);
//     setAnalysis(result);
//     setPhase('results');
//   };

//   // 3. RENDER: LOADING
//   if (phase === 'analyzing') {
//     return (
//       <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
//         <Loader2 className="w-16 h-16 animate-spin text-green-500 mb-4" />
//         <h2 className="text-2xl font-bold">Analyzing Soft Skills...</h2>
//         <p className="text-gray-400">Checking: Empathy, Ownership, Solution, Tone</p>
//       </div>
//     );
//   }

//   // 4. RENDER: RESULTS (Dashboard)
//   if (phase === 'results' && analysis) {
//     return (
//       <div className="min-h-screen bg-gray-50 text-black p-8 font-sans">
//         <div className="max-w-5xl mx-auto">
//           <div className="flex justify-between items-center mb-8">
//             <h1 className="text-3xl font-bold text-gray-900">Staff Training Report</h1>
//             <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
//               <RefreshCcw size={16} /> Restart Roleplay
//             </button>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
//             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
//                <h2 className="text-gray-500 font-medium">Empathy Score</h2>
//                <div className="mt-4 relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-green-100">
//                  <span className="text-4xl font-bold text-green-600">{analysis.overallScore}</span>
//                </div>
//             </div>
//             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 md:col-span-2 h-[300px]">
//                 <ResponsiveContainer width="100%" height="100%">
//                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.radarChart}>
//                     <PolarGrid />
//                     <PolarAngleAxis dataKey="subject" />
//                     <PolarRadiusAxis angle={30} domain={[0, 10]} />
//                     <Radar name="Score" dataKey="A" stroke="#16a34a" fill="#22c55e" fillOpacity={0.5} />
//                   </RadarChart>
//                 </ResponsiveContainer>
//             </div>
//           </div>

//           <h3 className="text-xl font-bold mb-4">Performance Breakdown</h3>
//           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//             {analysis.feedback.map((item: any, idx: number) => (
//               <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
//                 <div className="flex justify-between items-center mb-2">
//                   <span className="font-bold text-lg">{item.title}</span>
//                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${
//                     item.score < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
//                   }`}>
//                     {item.status}
//                   </span>
//                 </div>
//                 <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
//                   <div className="bg-green-600 h-2 rounded-full" style={{ width: `${item.score * 10}%` }}></div>
//                 </div>
//                 <p className="text-sm text-gray-600">{item.details}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </div>
//     );
//   }

//   // 5. RENDER: LANDING PAGE (Updated for Agitated Customer)
//   if (phase === 'intro') {
//       return (
//           <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
//               <h1 className="text-4xl font-bold mb-4 text-gray-800">Lenskart Staff Training</h1>
//               <div className="bg-green-50 border border-green-200 p-6 rounded-xl max-w-2xl text-left mb-8 shadow-sm">
//                 <h3 className="font-bold text-lg mb-4 text-green-800">Scenario: Handling an Agitated Customer</h3>
//                 <p className="mb-4 text-gray-700">Speak naturally in Hinglish. Ensure you cover these points:</p>
//                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-800">
//                     <li className="flex items-start gap-2">✅ <strong>Greet & Ask:</strong> "Sir kya issue face kr rahe hai?"</li>
//                     <li className="flex items-start gap-2">✅ <strong>Empathy:</strong> "Problem bilkul genuine hai."</li>
//                     <li className="flex items-start gap-2">✅ <strong>Ownership:</strong> "Main personally handle karunga."</li>
//                     <li className="flex items-start gap-2">✅ <strong>Solution:</strong> "Right lenses banwa denge."</li>
//                     <li className="flex items-start gap-2">✅ <strong>Closing:</strong> "Ye humari taraf se voucher."</li>
//                 </ul>
//               </div>
//               <button onClick={() => setPhase('interview')} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-green-700 shadow-lg hover:scale-105 transition-all">
//                   Start Roleplay <ChevronRight />
//               </button>
//           </div>
//       )
//   }

//   // 6. RENDER: INTERVIEW MODE
//   return (
//     <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
//        <div className="w-full max-w-6xl flex justify-between items-center mb-4 p-4">
//           <h1 className="text-xl font-bold text-white">Lenskart Training <span className="text-green-500">Live</span></h1>
//           <button onClick={finishInterview} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
//             End & Analyze
//           </button>
//        </div>

//        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl h-[500px]">
//           {/* AI Avatar */}
//           <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
//               <video 
//                 src={aiState === 'idle' ? "/idle.mp4" : "/talking.mp4"} 
//                 autoPlay loop muted playsInline 
//                 className="w-full h-full object-cover opacity-90" 
//               />
//               <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black p-6">
//                  <p className="text-lg font-medium text-gray-200">
//                     {messages.length > 0 && messages[messages.length-1].role === 'ai' 
//                      ? messages[messages.length-1].text 
//                      : "Hello! I am very upset with my glasses. (Waiting for you...)"}
//                  </p>
//               </div>
//           </div>

//           {/* User Camera */}
//           <div className="flex flex-col gap-4 h-full">
//              <div className="flex-1 bg-gray-800 rounded-2xl overflow-hidden relative shadow-2xl">
//                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
//                  <div className="absolute top-4 right-4 bg-red-600/90 text-white text-xs px-2 py-1 rounded animate-pulse">LIVE</div>
//              </div>
             
//              <div className="h-24 bg-gray-900 rounded-2xl flex items-center justify-center gap-4 border border-gray-800">
//                 {!isRecording ? (
//                     <button 
//                      onClick={() => {
//     try {
//         if (!isRecording) {
//             setIsRecording(true);
//             recognitionRef.current?.start();
//         }
//     } catch (e) {
//         console.log("Mic was already on");
//     }
// }}
//                         className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all hover:scale-105"
//                     >
//                         <Mic size={20} /> Answer
//                     </button>
//                 ) : (
//                     <button 
//                         onClick={() => recognitionRef.current?.stop()} 
//                         className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold text-lg animate-pulse"
//                     >
//                         <Square size={20} /> Stop
//                     </button>
//                 )}
//              </div>
//           </div>
//        </div>
//     </div>
//   );
// }

'use client'

import { useState, useRef, useEffect } from 'react';
import { getAIResponse, generateAnalysis } from './actions';
import { Mic, Square, RefreshCcw, ChevronRight, Loader2, Phone, Mail, Calendar, Clock, MessageSquare, User } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// --- TYPES ---
type Message = { role: 'user' | 'ai'; text: string };

export default function InterviewPage() {
  const [phase, setPhase] = useState<'intro' | 'interview' | 'analyzing' | 'results'>('intro');
  const [isRecording, setIsRecording] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [analysis, setAnalysis] = useState<any>(null);
  const [aiState, setAiState] = useState<'idle' | 'talking'>('idle');
  const [startTime, setStartTime] = useState<Date | null>(null);
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const recognitionRef = useRef<any>(null);

  // --- 1. SETUP ---
  useEffect(() => {
    if (phase === 'interview') {
        setStartTime(new Date());
        navigator.mediaDevices.getUserMedia({ video: true, audio: false })
        .then(stream => {
            if (videoRef.current) videoRef.current.srcObject = stream;
        });
    }
    
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.lang = 'en-IN'; 
        
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            handleUserAnswer(transcript);
        };
        
        recognitionRef.current.onend = () => setIsRecording(false);
    }
  }, [phase]);

  // --- 2. LOGIC ---
  const handleUserAnswer = async (text: string) => {
    setIsRecording(false);
    if (!text) return;

    const newHistory = [...messages, { role: 'user', text } as Message];
    setMessages(newHistory);

    const aiRes = await getAIResponse(text, newHistory);
    
    if (aiRes.success) {
        setMessages(prev => [...prev, { role: 'ai', text: aiRes.text }]);
        speak(aiRes.text);
    } else {
        alert("AI Error: " + aiRes.text);
    }
  };

  const speak = (text: string) => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onstart = () => setAiState('talking');
    utterance.onend = () => setAiState('idle');
    window.speechSynthesis.speak(utterance);
  };

  const finishInterview = async () => {
    setPhase('analyzing');
    const result = await generateAnalysis(messages);
    setAnalysis(result);
    setPhase('results');
  };

  // --- 3. VIEWS ---

  // LOADING VIEW
  if (phase === 'analyzing') {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center text-gray-800">
        <Loader2 className="w-16 h-16 animate-spin text-indigo-600 mb-4" />
        <h2 className="text-2xl font-bold">Generating Performance Report...</h2>
        <p className="text-gray-500 mt-2">Analyzing Transcripts & Calculating Scores</p>
      </div>
    );
  }

  // RESULTS DASHBOARD (MATCHING YOUR VIDEO)
  if (phase === 'results' && analysis) {
    const duration = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 5;
    const formattedDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute:'2-digit' });

    return (
      <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-6">
          
          {/* HEADER */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
             <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Lenskart Staff Training - Agitated Customer</h1>
                    <div className="flex gap-2 mt-3">
                        <span className="bg-indigo-100 text-indigo-700 px-3 py-1 rounded-md text-xs font-semibold">Type: role_play</span>
                        <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-md text-xs font-semibold">Questions: 1</span>
                        <span className="bg-purple-100 text-purple-700 px-3 py-1 rounded-md text-xs font-semibold">Duration: 5 min</span>
                    </div>
                </div>
                <button onClick={() => window.location.reload()} className="text-indigo-600 hover:underline text-sm font-medium flex items-center gap-1">
                    <RefreshCcw size={14} /> Restart
                </button>
             </div>
          </div>

          {/* TOP ROW: PROFILE & OVERALL SCORE */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
             
             {/* PROFILE CARD */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
                <div className="flex justify-between items-start">
                    <div className="flex gap-4">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-bold text-xl">
                            VK
                        </div>
                        <div>
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                Candidate Name <span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">Completed</span>
                            </h2>
                            <p className="text-gray-400 text-sm mt-1">ID: 584293ac-544e...</p>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-gray-100">
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-xs flex items-center gap-1"><Phone size={12}/> Phone</span>
                        <span className="text-sm font-medium">Not provided</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-xs flex items-center gap-1"><Calendar size={12}/> Date</span>
                        <span className="text-sm font-medium">{formattedDate}</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-xs flex items-center gap-1"><Clock size={12}/> Duration</span>
                        <span className="text-sm font-medium">{duration}m 30s</span>
                    </div>
                    <div className="flex flex-col gap-1">
                        <span className="text-gray-400 text-xs flex items-center gap-1"><MessageSquare size={12}/> Responses</span>
                        <span className="text-sm font-medium">{messages.filter(m=>m.role==='user').length} responses</span>
                    </div>
                </div>
             </div>

             {/* OVERALL SCORE CARD */}
             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center text-center">
                 <h3 className="text-gray-900 font-bold text-lg mb-2">Overall Performance</h3>
                 <p className="text-gray-400 text-xs mb-6">Comprehensive evaluation results</p>
                 
                 <div className="relative w-40 h-40 flex items-center justify-center">
                    {/* Circle Background */}
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="80" cy="80" r="70" stroke="#F3F4F6" strokeWidth="12" fill="transparent" />
                        <circle cx="80" cy="80" r="70" stroke={analysis.overallScore > 50 ? "#22c55e" : "#ef4444"} strokeWidth="12" fill="transparent" 
                                strokeDasharray={440} 
                                strokeDashoffset={440 - (440 * analysis.overallScore) / 100} 
                                className="transition-all duration-1000 ease-out"
                        />
                    </svg>
                    <div className="absolute flex flex-col items-center">
                        <span className={`text-4xl font-bold ${analysis.overallScore > 50 ? "text-green-600" : "text-red-500"}`}>
                            {analysis.overallScore}
                        </span>
                        <span className="text-gray-400 text-xs">/ 100</span>
                    </div>
                 </div>
                 <p className="text-sm font-medium mt-4 text-gray-600">Final performance rating</p>
             </div>
          </div>

          {/* CHART SECTION */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-xl font-bold text-center mb-2">Performance Overview</h3>
              <p className="text-gray-500 text-center text-sm mb-8">Visual breakdown of assessment scores across all areas</p>
              <div className="h-[400px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.radarChart}>
                    <PolarGrid stroke="#e5e7eb" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#4b5563', fontSize: 12 }} />
                    <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                    <Radar name="Score" dataKey="A" stroke="#6366f1" fill="#818cf8" fillOpacity={0.3} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
          </div>

          {/* DETAILED SCORE BREAKDOWN */}
          <div className="space-y-6">
             <h3 className="text-xl font-bold flex items-center gap-2">
                <span className="text-indigo-600">📊</span> Detailed Score Breakdown
             </h3>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {analysis.feedback.map((item: any, idx: number) => (
                    <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-start mb-4">
                                <h4 className="font-bold text-gray-900">{item.title}</h4>
                                <div className="text-right">
                                    <span className="block text-2xl font-bold text-red-500">{item.score}</span>
                                    <span className="text-xs text-gray-400">out of 10</span>
                                </div>
                            </div>
                            
                            <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold mb-4 ${
                                item.score < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
                            }`}>
                                {item.status}
                            </span>

                            <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
                                <div className="bg-indigo-600 h-1.5 rounded-full" style={{ width: `${item.score * 10}%` }}></div>
                            </div>
                            <p className="text-xs text-gray-400 mb-1">Performance</p>
                            <p className="text-right text-xs font-bold text-gray-600 mb-4">{item.score * 10}%</p>
                        </div>
                        <p className="text-sm text-gray-600 border-t pt-4 mt-2">{item.details}</p>
                    </div>
                ))}
             </div>
          </div>

          {/* SUMMARY SECTION */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold mb-4 border-l-4 border-indigo-500 pl-3">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{analysis.summary}</p>
          </div>

          {/* TRANSCRIPT SECTION */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
             <h3 className="text-lg font-bold mb-6 border-l-4 border-blue-500 pl-3">Response Analysis</h3>
             <div className="space-y-6">
                {messages.map((msg, i) => (
                    <div key={i} className={`flex gap-4 ${msg.role === 'ai' ? 'flex-row' : 'flex-row-reverse'}`}>
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 
                            ${msg.role === 'ai' ? 'bg-indigo-100 text-indigo-600' : 'bg-green-100 text-green-600'}`}>
                            {msg.role === 'ai' ? <User size={20}/> : <Mic size={20}/>}
                        </div>
                        <div className={`p-4 rounded-xl max-w-[80%] text-sm leading-relaxed
                            ${msg.role === 'ai' ? 'bg-gray-50 text-gray-800' : 'bg-blue-50 text-blue-900'}`}>
                            <p className="font-bold text-xs mb-1 opacity-50 uppercase">{msg.role === 'ai' ? 'AI Interviewer' : 'Candidate'}</p>
                            {msg.text}
                        </div>
                    </div>
                ))}
             </div>
          </div>

        </div>
      </div>
    );
  }

  // INTRO SCREEN
  if (phase === 'intro') {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center font-sans">
            <h1 className="text-4xl font-extrabold mb-4 text-gray-900 tracking-tight">Lenskart Staff Training</h1>
            <p className="text-gray-500 mb-8 text-lg max-w-xl">
                Scenario: Agitated Customer Handling. <br/>
                Speak naturally in Hinglish to demonstrate empathy and ownership.
            </p>
            <button onClick={() => setPhase('interview')} className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-indigo-700 shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1">
                Start Assessment <ChevronRight />
            </button>
        </div>
    )
  }

  // INTERVIEW SCREEN
  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans">
       <div className="w-full max-w-6xl flex justify-between items-center mb-6 p-4">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h1 className="text-lg font-bold tracking-wide">LENSKART LIVE ASSESSMENT</h1>
          </div>
          <button onClick={finishInterview} className="bg-red-600 hover:bg-red-500 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg">
            End & Analyze
          </button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl h-[600px]">
          <div className="relative bg-gray-900 rounded-3xl overflow-hidden border border-gray-800 shadow-2xl">
              <video src={aiState === 'idle' ? "/idle.mp4" : "/talking.mp4"} autoPlay loop muted className="w-full h-full object-cover opacity-80" />
              <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black via-black/50 to-transparent p-8">
                 <p className="text-xl font-medium text-white leading-relaxed">
                    {messages.length > 0 && messages[messages.length-1].role === 'ai' ? messages[messages.length-1].text : "I am waiting for your response..."}
                 </p>
              </div>
          </div>

          <div className="flex flex-col gap-6 h-full">
             <div className="flex-1 bg-gray-800 rounded-3xl overflow-hidden relative shadow-2xl border border-gray-700">
                 <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                 <div className="absolute top-6 right-6 bg-red-600/90 backdrop-blur-sm text-white text-xs font-bold px-3 py-1 rounded-full animate-pulse">
                    LIVE FEED
                 </div>
             </div>
             
             <div className="h-28 bg-gray-900 rounded-3xl flex items-center justify-center gap-6 border border-gray-800 shadow-lg">
                {!isRecording ? (
                    <button onClick={() => {
                        try {
                            if(!isRecording) { setIsRecording(true); recognitionRef.current?.start(); }
                        } catch(e) { console.log("Mic error", e); }
                    }} className="group bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg flex gap-3 items-center hover:bg-indigo-500 transition-all shadow-lg hover:shadow-indigo-500/30">
                        <Mic className="group-hover:scale-110 transition-transform"/> Start Speaking
                    </button>
                ) : (
                    <button onClick={() => recognitionRef.current?.stop()} className="bg-red-600 text-white px-10 py-4 rounded-full font-bold text-lg flex gap-3 items-center hover:bg-red-500 transition-all shadow-lg animate-pulse">
                        <Square /> Stop Recording
                    </button>
                )}
             </div>
          </div>
       </div>
    </div>
  );
}