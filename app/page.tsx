// // 'use client'

// // import { useState, useRef, useEffect } from 'react';
// // import { getAIResponse, generateAnalysis } from './actions';
// // import { Mic, Square, Video, Loader2, RefreshCcw, ChevronRight } from 'lucide-react';
// // import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// // type Message = { role: 'user' | 'ai'; text: string };

// // export default function InterviewPage() {
// //   const [phase, setPhase] = useState<'intro' | 'interview' | 'analyzing' | 'results'>('intro');
// //   const [isRecording, setIsRecording] = useState(false);
// //   const [aiState, setAiState] = useState<'idle' | 'talking'>('idle');
// //   const [messages, setMessages] = useState<Message[]>([]);
// //   const [analysis, setAnalysis] = useState<any>(null);
  
// //   const videoRef = useRef<HTMLVideoElement>(null);
// //   const recognitionRef = useRef<any>(null);

// //   // 1. INITIALIZATION
// //   useEffect(() => {
// //     if (phase === 'interview') {
// //         navigator.mediaDevices.getUserMedia({ video: true, audio: false })
// //         .then(stream => {
// //             if (videoRef.current) videoRef.current.srcObject = stream;
// //         });
// //     }

// //     if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
// //         const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
// //         recognitionRef.current = new SpeechRecognition();
// //         recognitionRef.current.continuous = false;
// //         recognitionRef.current.lang = 'en-IN'; // Changed to India English for better Hinglish detection
// //         recognitionRef.current.onresult = (event: any) => handleUserAnswer(event.results[0][0].transcript);
// //     }
// //   }, [phase]);

// //   // 2. LOGIC
// //  // REPLACE YOUR OLD handleUserAnswer WITH THIS:
// //   const handleUserAnswer = async (text: string) => {
// //     setIsRecording(false);
    
// //     if (!text) {
// //         alert("I didn't hear anything. Please try speaking louder or check your microphone.");
// //         return;
// //     }

// //     // Show user what they said instantly
// //     const newHistory = [...messages, { role: 'user', text } as Message];
// //     setMessages(newHistory);

// //     // Show a "Thinking..." state
// //     const tempHistory = [...newHistory, { role: 'ai', text: "..." } as Message];
// //     setMessages(tempHistory);

// //     try {
// //         const aiRes = await getAIResponse(text, newHistory);
        
// //         // Remove the "..." and add real response
// //         if (aiRes.success) {
// //             setMessages(prev => [...prev.slice(0, -1), { role: 'ai', text: aiRes.text }]);
// //             speak(aiRes.text);
// //         } else {
// //             // IF ERROR: Show it in an alert!
// //             alert("AI Error: " + aiRes.text); 
// //             setMessages(prev => prev.slice(0, -1)); // Remove "..."
// //         }
// //     } catch (err) {
// //         alert("Network Error: Could not connect to the backend.");
// //     }
// //   };

// //   const speak = (text: string) => {
// //     const utterance = new SpeechSynthesisUtterance(text);
// //     utterance.onstart = () => setAiState('talking');
// //     utterance.onend = () => setAiState('idle');
// //     window.speechSynthesis.speak(utterance);
// //   };

// //   const finishInterview = async () => {
// //     setPhase('analyzing');
// //     const result = await generateAnalysis(messages);
// //     setAnalysis(result);
// //     setPhase('results');
// //   };

// //   // 3. RENDER: LOADING
// //   if (phase === 'analyzing') {
// //     return (
// //       <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
// //         <Loader2 className="w-16 h-16 animate-spin text-green-500 mb-4" />
// //         <h2 className="text-2xl font-bold">Analyzing Soft Skills...</h2>
// //         <p className="text-gray-400">Checking: Empathy, Ownership, Solution, Tone</p>
// //       </div>
// //     );
// //   }

// //   // 4. RENDER: RESULTS (Dashboard)
// //   if (phase === 'results' && analysis) {
// //     return (
// //       <div className="min-h-screen bg-gray-50 text-black p-8 font-sans">
// //         <div className="max-w-5xl mx-auto">
// //           <div className="flex justify-between items-center mb-8">
// //             <h1 className="text-3xl font-bold text-gray-900">Staff Training Report</h1>
// //             <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
// //               <RefreshCcw size={16} /> Restart Roleplay
// //             </button>
// //           </div>

// //           <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
// //             <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
// //                <h2 className="text-gray-500 font-medium">Empathy Score</h2>
// //                <div className="mt-4 relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-green-100">
// //                  <span className="text-4xl font-bold text-green-600">{analysis.overallScore}</span>
// //                </div>
// //             </div>
// //             <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 md:col-span-2 h-[300px]">
// //                 <ResponsiveContainer width="100%" height="100%">
// //                   <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.radarChart}>
// //                     <PolarGrid />
// //                     <PolarAngleAxis dataKey="subject" />
// //                     <PolarRadiusAxis angle={30} domain={[0, 10]} />
// //                     <Radar name="Score" dataKey="A" stroke="#16a34a" fill="#22c55e" fillOpacity={0.5} />
// //                   </RadarChart>
// //                 </ResponsiveContainer>
// //             </div>
// //           </div>

// //           <h3 className="text-xl font-bold mb-4">Performance Breakdown</h3>
// //           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
// //             {analysis.feedback.map((item: any, idx: number) => (
// //               <div key={idx} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200">
// //                 <div className="flex justify-between items-center mb-2">
// //                   <span className="font-bold text-lg">{item.title}</span>
// //                   <span className={`px-3 py-1 rounded-full text-xs font-bold ${
// //                     item.score < 5 ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'
// //                   }`}>
// //                     {item.status}
// //                   </span>
// //                 </div>
// //                 <div className="w-full bg-gray-100 rounded-full h-2 mb-3">
// //                   <div className="bg-green-600 h-2 rounded-full" style={{ width: `${item.score * 10}%` }}></div>
// //                 </div>
// //                 <p className="text-sm text-gray-600">{item.details}</p>
// //               </div>
// //             ))}
// //           </div>
// //         </div>
// //       </div>
// //     );
// //   }

// //   // 5. RENDER: LANDING PAGE (Updated for Agitated Customer)
// //   if (phase === 'intro') {
// //       return (
// //           <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center">
// //               <h1 className="text-4xl font-bold mb-4 text-gray-800">Lenskart Staff Training</h1>
// //               <div className="bg-green-50 border border-green-200 p-6 rounded-xl max-w-2xl text-left mb-8 shadow-sm">
// //                 <h3 className="font-bold text-lg mb-4 text-green-800">Scenario: Handling an Agitated Customer</h3>
// //                 <p className="mb-4 text-gray-700">Speak naturally in Hinglish. Ensure you cover these points:</p>
// //                 <ul className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-800">
// //                     <li className="flex items-start gap-2">✅ <strong>Greet & Ask:</strong> "Sir kya issue face kr rahe hai?"</li>
// //                     <li className="flex items-start gap-2">✅ <strong>Empathy:</strong> "Problem bilkul genuine hai."</li>
// //                     <li className="flex items-start gap-2">✅ <strong>Ownership:</strong> "Main personally handle karunga."</li>
// //                     <li className="flex items-start gap-2">✅ <strong>Solution:</strong> "Right lenses banwa denge."</li>
// //                     <li className="flex items-start gap-2">✅ <strong>Closing:</strong> "Ye humari taraf se voucher."</li>
// //                 </ul>
// //               </div>
// //               <button onClick={() => setPhase('interview')} className="bg-green-600 text-white px-8 py-3 rounded-full font-bold text-lg flex items-center gap-2 hover:bg-green-700 shadow-lg hover:scale-105 transition-all">
// //                   Start Roleplay <ChevronRight />
// //               </button>
// //           </div>
// //       )
// //   }

// //   // 6. RENDER: INTERVIEW MODE
// //   return (
// //     <div className="min-h-screen bg-black text-white flex flex-col items-center p-4">
// //        <div className="w-full max-w-6xl flex justify-between items-center mb-4 p-4">
// //           <h1 className="text-xl font-bold text-white">Lenskart Training <span className="text-green-500">Live</span></h1>
// //           <button onClick={finishInterview} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg text-sm font-bold transition-colors">
// //             End & Analyze
// //           </button>
// //        </div>

// //        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-5xl h-[500px]">
// //           {/* AI Avatar */}
// //           <div className="relative bg-gray-900 rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
// //               <video 
// //                 src={aiState === 'idle' ? "/idle.mp4" : "/talking.mp4"} 
// //                 autoPlay loop muted playsInline 
// //                 className="w-full h-full object-cover opacity-90" 
// //               />
// //               <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-black p-6">
// //                  <p className="text-lg font-medium text-gray-200">
// //                     {messages.length > 0 && messages[messages.length-1].role === 'ai' 
// //                      ? messages[messages.length-1].text 
// //                      : "Hello! I am very upset with my glasses. (Waiting for you...)"}
// //                  </p>
// //               </div>
// //           </div>

// //           {/* User Camera */}
// //           <div className="flex flex-col gap-4 h-full">
// //              <div className="flex-1 bg-gray-800 rounded-2xl overflow-hidden relative shadow-2xl">
// //                  <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover transform scale-x-[-1]" />
// //                  <div className="absolute top-4 right-4 bg-red-600/90 text-white text-xs px-2 py-1 rounded animate-pulse">LIVE</div>
// //              </div>
             
// //              <div className="h-24 bg-gray-900 rounded-2xl flex items-center justify-center gap-4 border border-gray-800">
// //                 {!isRecording ? (
// //                     <button 
// //                      onClick={() => {
// //     try {
// //         if (!isRecording) {
// //             setIsRecording(true);
// //             recognitionRef.current?.start();
// //         }
// //     } catch (e) {
// //         console.log("Mic was already on");
// //     }
// // }}
// //                         className="flex items-center gap-2 bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold text-lg transition-all hover:scale-105"
// //                     >
// //                         <Mic size={20} /> Answer
// //                     </button>
// //                 ) : (
// //                     <button 
// //                         onClick={() => recognitionRef.current?.stop()} 
// //                         className="flex items-center gap-2 bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold text-lg animate-pulse"
// //                     >
// //                         <Square size={20} /> Stop
// //                     </button>
// //                 )}
// //              </div>
// //           </div>
// //        </div>
// //     </div>
// //   );
// // }

// 'use client'

// import { useState, useRef, useEffect } from 'react';
// import { getAIResponse, generateAnalysis } from './actions';
// import { Mic, RefreshCcw, ChevronRight, Loader2, ShieldCheck, FileText, User, Video, Phone, Calendar, Clock, MessageSquare, Play } from 'lucide-react';
// import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// // --- TYPES ---
// type Message = { role: 'user' | 'ai'; text: string };
// type UserData = { name: string; storeCode: string; ecode: string };

// export default function InterviewPage() {
//   const [phase, setPhase] = useState<'register' | 'intro' | 'interview' | 'analyzing' | 'results'>('register');
//   const [userData, setUserData] = useState<UserData>({ name: '', storeCode: '', ecode: '' });
//   const [messages, setMessages] = useState<Message[]>([]);
//   const [analysis, setAnalysis] = useState<any>(null);
  
//   // State for "Status" instead of manual recording
//   const [status, setStatus] = useState<'idle' | 'listening' | 'processing' | 'speaking'>('idle');
//   const [aiState, setAiState] = useState<'idle' | 'talking'>('idle');
//   const [startTime, setStartTime] = useState<Date | null>(null);
  
//   const videoRef = useRef<HTMLVideoElement>(null);
//   const recognitionRef = useRef<any>(null);

//   // --- 1. SETUP & AUTO-MIC LOGIC ---
//   useEffect(() => {
//     // Initialize Speech Engine
//     if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
//         const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
//         recognitionRef.current = new SpeechRecognition();
//         recognitionRef.current.continuous = false; // Auto-stop on silence
//         recognitionRef.current.interimResults = false;
//         recognitionRef.current.lang = 'en-IN'; 
        
//         recognitionRef.current.onstart = () => setStatus('listening');
        
//         recognitionRef.current.onresult = (event: any) => {
//             const transcript = event.results[0][0].transcript;
//             handleUserAnswer(transcript);
//         };

//         // IMPORTANT: If mic stops but we are still in interview and NOT processing/speaking, restart it.
//         // This keeps the "Always Listening" loop active.
//         recognitionRef.current.onend = () => {
//             if (status === 'listening') {
//                 // If it stopped purely due to silence but no text was caught, restart
//                 // We handle text in onresult. 
//             }
//         };
//     }
//   }, []);

//   // Trigger Camera & Mic when entering 'interview' phase
//   useEffect(() => {
//     if (phase === 'interview') {
//         setStartTime(new Date());
//         navigator.mediaDevices.getUserMedia({ video: true, audio: true })
//         .then(stream => {
//             if (videoRef.current) {
//                 videoRef.current.srcObject = stream;
//                 videoRef.current.volume = 0; 
//             }
//         });
        
//         // AUTO-START MIC on load
//         startListening();
//     }
//   }, [phase]);

//   const startListening = () => {
//     try {
//         if (recognitionRef.current && status !== 'listening') {
//             recognitionRef.current.start();
//             setStatus('listening');
//         }
//     } catch (e) {
//         console.log("Mic restart ignored (already active)");
//     }
//   };

//   const stopListening = () => {
//     if (recognitionRef.current) recognitionRef.current.stop();
//   };

//   // --- 2. CONVERSATION LOGIC ---
//   const handleUserAnswer = async (text: string) => {
//     if (!text) return;
    
//     // 1. Stop Mic
//     setStatus('processing');
    
//     // 2. Update Chat UI
//     const newHistory = [...messages, { role: 'user', text } as Message];
//     setMessages(newHistory);

//     // 3. Get AI Response
//     const aiRes = await getAIResponse(text, newHistory);
    
//     if (aiRes.success) {
//         setMessages(prev => [...prev, { role: 'ai', text: aiRes.text }]);
//         speak(aiRes.text);
//     } else {
//         alert(aiRes.text);
//         // Error? Go back to listening
//         startListening();
//     }
//   };

//   const speak = (text: string) => {
//     setStatus('speaking');
//     setAiState('talking');
    
//     const utterance = new SpeechSynthesisUtterance(text);
//     utterance.rate = 1.0;
    
//     utterance.onend = () => {
//       setAiState('idle');
//       // THE MAGIC: Once AI finishes, Auto-Start Mic again
//       setTimeout(() => startListening(), 500); 
//     };
    
//     window.speechSynthesis.speak(utterance);
//   };

//   const finishInterview = async () => {
//     stopListening();
//     window.speechSynthesis.cancel(); // Stop speaking
//     setPhase('analyzing');
//     const result = await generateAnalysis(messages);
//     setAnalysis(result);
//     setPhase('results');
//   };

//   // --- VIEWS ---

//   // A. REGISTER FORM
//   if (phase === 'register') {
//     return (
//         <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4 font-sans text-gray-900">
//             <div className="bg-white p-8 rounded-2xl shadow-xl max-w-md w-full border border-gray-100 text-center">
//                 <div className="flex justify-center mb-6">
//                     <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
//                         <FileText className="text-white w-8 h-8" />
//                     </div>
//                 </div>
//                 <h1 className="text-2xl font-bold mb-2">Lenskart Sales Pitch - v2</h1>
//                 <div className="space-y-4 text-left mt-6">
//                     <div><label className="block text-sm font-bold text-gray-700 mb-1">Name *</label><input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} /></div>
//                     <div><label className="block text-sm font-bold text-gray-700 mb-1">Store Code *</label><input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" value={userData.storeCode} onChange={(e) => setUserData({...userData, storeCode: e.target.value})} /></div>
//                     <div><label className="block text-sm font-bold text-gray-700 mb-1">Ecode *</label><input type="text" className="w-full px-4 py-3 rounded-lg border border-gray-200 bg-gray-50" value={userData.ecode} onChange={(e) => setUserData({...userData, ecode: e.target.value})} /></div>
//                     <button onClick={() => { if(userData.name) setPhase('intro'); }} className="w-full bg-indigo-600 text-white py-4 rounded-lg font-bold hover:bg-indigo-700 mt-4 flex justify-center items-center gap-2">Submit Form <ChevronRight size={20} /></button>
//                 </div>
//             </div>
//         </div>
//     );
//   }

//   // B. INTRO
//   if (phase === 'intro') {
//     return (
//         <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4 text-center font-sans">
//             <h1 className="text-3xl font-bold mb-2">Hi, {userData.name}</h1>
//             <div className="bg-blue-50 border border-blue-100 p-6 rounded-xl max-w-lg text-left mb-8 mt-8">
//                 <h3 className="font-bold text-blue-900 mb-2">Hands-Free Mode Enabled 🎙️</h3>
//                 <p className="text-blue-800 leading-relaxed">
//                     This interview is <strong>fully automatic</strong>. 
//                     <br/>1. The mic will start automatically.
//                     <br/>2. Speak your answer.
//                     <br/>3. Just stop talking, and the AI will reply.
//                 </p>
//             </div>
//             <button onClick={() => setPhase('interview')} className="bg-indigo-600 text-white px-10 py-4 rounded-full font-bold text-lg hover:bg-indigo-700 shadow-xl transition-all">
//                 Start Assessment
//             </button>
//         </div>
//     )
//   }

//   // C. LIVE INTERVIEW (Hands-Free)
//   if (phase === 'interview') {
//     return (
//     <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans">
//        <div className="w-full max-w-6xl flex justify-between items-center mb-6">
//           <div className="flex items-center gap-2"><div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div><h1 className="font-bold">LIVE INTERVIEW</h1></div>
//           <button onClick={finishInterview} className="bg-red-600 px-6 py-2 rounded-lg font-bold hover:bg-red-500 transition-colors">End & Analyze</button>
//        </div>

//        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-6xl h-[600px]">
//           {/* LEFT: AI */}
//           <div className="relative bg-gray-900 rounded-3xl flex flex-col items-center justify-center border border-gray-800 p-8 transition-all duration-500">
//               <div className={`w-48 h-48 rounded-full border-4 border-indigo-500 transition-all duration-300 ${aiState === 'talking' ? 'scale-110 shadow-[0_0_60px_indigo]' : 'scale-100'}`}>
//                   <img src="/avatar.png" className="w-full h-full object-cover rounded-full" />
//               </div>
//               <div className="mt-8 bg-gray-800 p-6 rounded-xl w-full text-center min-h-[100px] flex items-center justify-center">
//                  <p className="text-lg text-gray-200 leading-relaxed">
//                     {messages.length > 0 && messages[messages.length-1].role === 'ai' ? messages[messages.length-1].text : "Hello! I am upset with my glasses."}
//                  </p>
//               </div>
//           </div>

//           {/* RIGHT: USER */}
//           <div className="flex flex-col gap-6 h-full">
//              <div className="flex-1 bg-gray-800 rounded-3xl overflow-hidden relative border border-gray-700">
//                  <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
//                  <div className="absolute top-6 right-6 bg-black/40 backdrop-blur-md text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-2">
//                     {status === 'listening' && <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>}
//                     {status === 'processing' && <span className="w-2 h-2 bg-yellow-500 rounded-full animate-bounce"></span>}
//                     {status === 'speaking' && <span className="w-2 h-2 bg-red-500 rounded-full"></span>}
//                     {status === 'listening' ? "LISTENING..." : status === 'processing' ? "THINKING..." : "AI SPEAKING"}
//                  </div>
//              </div>
             
//              {/* STATUS BAR (No Button) */}
//              <div className={`h-24 rounded-3xl flex items-center justify-center gap-4 border transition-all duration-500
//                 ${status === 'listening' ? 'bg-indigo-900/20 border-indigo-500/50 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-gray-900 border-gray-800'}`}>
                
//                 {status === 'listening' ? (
//                     <div className="flex flex-col items-center">
//                         <div className="flex gap-1 h-6 items-end mb-2">
//                             <div className="w-1 bg-indigo-500 h-full animate-[bounce_1s_infinite]"></div>
//                             <div className="w-1 bg-indigo-500 h-3/4 animate-[bounce_1s_infinite_0.2s]"></div>
//                             <div className="w-1 bg-indigo-500 h-full animate-[bounce_1s_infinite_0.4s]"></div>
//                         </div>
//                         <span className="text-indigo-400 font-bold tracking-widest text-sm">LISTENING...</span>
//                     </div>
//                 ) : status === 'processing' ? (
//                     <div className="flex items-center gap-2 text-gray-400">
//                         <Loader2 className="animate-spin"/> Processing Answer...
//                     </div>
//                 ) : (
//                     <div className="flex items-center gap-2 text-gray-500">
//                         <div className="w-2 h-2 bg-red-500 rounded-full"></div> AI is speaking...
//                     </div>
//                 )}
//              </div>
//              <p className="text-gray-600 text-xs text-center">Hands-Free Mode Active</p>
//           </div>
//        </div>
//     </div>
//     );
//   }

//   // 4. ANALYZING
//   if (phase === 'analyzing') return <div className="min-h-screen flex items-center justify-center bg-white"><Loader2 className="animate-spin w-10 h-10 text-indigo-600"/></div>;

//   // 5. DETAILED RESULTS (Restored)
//   if (phase === 'results' && analysis) {
//     const duration = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 5;
//     return (
//       <div className="min-h-screen bg-[#F3F4F6] text-gray-900 font-sans p-6 md:p-12">
//         <div className="max-w-7xl mx-auto space-y-6">
          
//           {/* Header */}
//           <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex justify-between">
//              <div>
//                 <h1 className="text-2xl font-bold">Assessment Result</h1>
//                 <div className="flex gap-2 mt-2"><span className="bg-indigo-100 text-indigo-700 px-2 py-1 rounded text-xs font-bold">Roleplay</span></div>
//              </div>
//              <button onClick={() => window.location.reload()} className="text-indigo-600 font-bold flex gap-2 items-center"><RefreshCcw size={16}/> Restart</button>
//           </div>

//           {/* Profile & Overall Score */}
//           <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
//              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 lg:col-span-2">
//                 <div className="flex gap-4 items-center mb-6">
//                     <div className="w-16 h-16 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">{userData.name.charAt(0)}</div>
//                     <div><h2 className="text-xl font-bold">{userData.name}</h2><p className="text-gray-500 text-sm">{userData.storeCode} | {userData.ecode}</p></div>
//                 </div>
//                 <div className="grid grid-cols-4 gap-4 pt-6 border-t border-gray-100">
//                     <div><span className="text-gray-400 text-xs">Duration</span><div className="font-bold">{duration}m</div></div>
//                     <div><span className="text-gray-400 text-xs">Turns</span><div className="font-bold">{messages.length}</div></div>
//                 </div>
//              </div>
//              <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col items-center justify-center">
//                  <div className="relative w-32 h-32 flex items-center justify-center rounded-full border-8 border-gray-100">
//                     <span className={`text-4xl font-bold ${analysis.overallScore >= 70 ? 'text-green-600' : 'text-orange-500'}`}>{analysis.overallScore}</span>
//                  </div>
//                  <div className="text-gray-500 mt-2 font-medium">Overall Score</div>
//              </div>
//           </div>

//           {/* Detailed Charts */}
//           <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
//               <h3 className="text-xl font-bold mb-6">Detailed Analysis</h3>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
//                  <div className="h-[300px]">
//                     <ResponsiveContainer width="100%" height="100%">
//                         <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.radarChart}>
//                             <PolarGrid /><PolarAngleAxis dataKey="subject" /><PolarRadiusAxis angle={30} domain={[0, 10]} />
//                             <Radar name="Score" dataKey="A" stroke="#4f46e5" fill="#6366f1" fillOpacity={0.5} />
//                         </RadarChart>
//                     </ResponsiveContainer>
//                  </div>
//                  <div className="space-y-4 overflow-y-auto max-h-[300px]">
//                     {analysis.feedback.map((item: any, idx: number) => (
//                         <div key={idx} className="border border-gray-100 p-4 rounded-lg bg-gray-50">
//                             <div className="flex justify-between mb-1">
//                                 <span className="font-bold">{item.title}</span>
//                                 <span className={`text-xs font-bold px-2 py-1 rounded ${item.score >= 7 ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'}`}>{item.score}/10</span>
//                             </div>
//                             <p className="text-sm text-gray-600">{item.details}</p>
//                         </div>
//                     ))}
//                  </div>
//               </div>
//           </div>
          
//         </div>
//       </div>
//     );
//   }

//   return null;
// }


// -------------------

'use client'

import { useState, useRef, useEffect } from 'react';
import { getAIResponse, generateAnalysis } from './actions';
import { Mic, RefreshCcw, ChevronRight, Loader2, ShieldCheck, FileText, User, Calendar, Clock, MessageSquare, Star, Sparkles, Activity, CheckCircle2 } from 'lucide-react';
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
  const messagesRef = useRef<Message[]>([]); // Ref for data safety
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
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
        const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;
        recognitionRef.current.lang = 'en-IN'; 
        
        recognitionRef.current.onstart = () => setStatus('listening');
        recognitionRef.current.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript;
            processAnswer(transcript);
        };
    }
  }, []);

  useEffect(() => {
    if (phase === 'interview') {
        setStartTime(new Date());
        const randomIssue = SCENARIOS[Math.floor(Math.random() * SCENARIOS.length)];
        setCurrentScenario(randomIssue);
        
        // Reset
        setTurnCount(0);
        turnCountRef.current = 0;
        setMessages([]);
        messagesRef.current = []; 

        navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(stream => {
            if (videoRef.current) { videoRef.current.srcObject = stream; videoRef.current.volume = 0; }
        });
        setTimeout(startListening, 1000);
    }
  }, [phase]);

  const startListening = () => { 
      if (turnCountRef.current >= MAX_TURNS) return;
      try { recognitionRef.current?.start(); setStatus('listening'); } catch(e) {} 
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
        setTimeout(startListening, 500);
    }
  };

  const speak = (text: string) => {
    setStatus('speaking'); setAiState('talking');
    const utterance = new SpeechSynthesisUtterance(text);
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

  // 1. REGISTER (Dark Theme)
  if (phase === 'register') {
    return (
        <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-4 font-sans text-white relative overflow-hidden">
            {/* Background Gradient Blob */}
            <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-indigo-900/30 rounded-full blur-[100px]"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-emerald-900/30 rounded-full blur-[100px]"></div>

            <div className="bg-neutral-900/80 backdrop-blur-lg p-8 rounded-3xl shadow-2xl max-w-md w-full border border-neutral-800 text-center relative z-10">
                <div className="flex justify-center mb-6"><div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-emerald-700 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-500/20"><FileText className="text-white w-8 h-8" /></div></div>
                <h1 className="text-2xl font-bold mb-2 tracking-tight">Lenskart AI Training</h1>
                <p className="text-neutral-400 mb-8 text-sm">Enter details to start SERVE assessment</p>
                <div className="space-y-4 text-left">
                    <div><label className="block text-xs font-semibold text-neutral-400 mb-1 uppercase tracking-wider">Name</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none" value={userData.name} onChange={(e) => setUserData({...userData, name: e.target.value})} /></div>
                    <div><label className="block text-xs font-semibold text-neutral-400 mb-1 uppercase tracking-wider">Store Code</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none" value={userData.storeCode} onChange={(e) => setUserData({...userData, storeCode: e.target.value})} /></div>
                    <div><label className="block text-xs font-semibold text-neutral-400 mb-1 uppercase tracking-wider">Ecode</label><input type="text" className="w-full px-4 py-3 rounded-xl border border-neutral-700 bg-neutral-800 text-white focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all outline-none" value={userData.ecode} onChange={(e) => setUserData({...userData, ecode: e.target.value})} /></div>
                    <button onClick={() => { if(userData.name) setPhase('intro'); }} className="w-full bg-emerald-600 text-white py-4 rounded-xl font-bold hover:bg-emerald-500 mt-4 flex justify-center items-center gap-2 transition-all shadow-lg shadow-emerald-900/20">Start Assessment <ChevronRight size={20} /></button>
                </div>
            </div>
        </div>
    );
  }

  // 2. INTRO (Dark Theme)
  if (phase === 'intro') {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4 text-center font-sans">
            <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-white to-neutral-400 bg-clip-text text-transparent">Welcome, {userData.name}</h1>
            <div className="bg-neutral-900/50 border border-neutral-800 p-8 rounded-3xl max-w-lg text-left mb-10 backdrop-blur-sm">
                <h3 className="font-bold text-emerald-400 mb-4 text-lg flex items-center gap-2"><Activity size={20}/> Scenario: Agitated Customer</h3>
                <p className="text-neutral-300 leading-relaxed mb-4">
                    You will face a simulated angry customer. Your goal is to apply the <strong>SERVE</strong> framework:
                </p>
                <ul className="space-y-2 text-sm text-neutral-400">
                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> <strong>S</strong>top & Listen</li>
                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> <strong>E</strong>mpathize</li>
                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> <strong>R</strong>esolve</li>
                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> <strong>V</strong>erify Satisfaction</li>
                    <li className="flex gap-2"><CheckCircle2 size={16} className="text-emerald-500"/> <strong>E</strong>xceed Expectations</li>
                </ul>
            </div>
            <button onClick={() => setPhase('interview')} className="bg-white text-black px-12 py-4 rounded-full font-bold text-lg hover:scale-105 transition-transform shadow-xl shadow-white/10">Begin Simulation</button>
        </div>
    )
  }

  // 3. INTERVIEW (Dark Theme)
  if (phase === 'interview') {
    return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center p-4 font-sans relative">
       <div className="w-full max-w-6xl flex justify-between items-center mb-6 z-10">
          <div className="flex items-center gap-3 px-4 py-2 bg-neutral-900 rounded-full border border-neutral-800">
              <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
              <span className="text-xs font-bold tracking-widest text-neutral-300">LIVE REC</span>
          </div>
          <div className="text-neutral-500 font-mono text-sm">Turn {turnCount}/{MAX_TURNS}</div>
          <button onClick={finishInterview} className="bg-red-600/20 text-red-500 border border-red-500/50 px-6 py-2 rounded-lg font-bold hover:bg-red-600 hover:text-white transition-all">End Session</button>
       </div>

       <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-6xl h-[600px] z-10">
          <div className="relative bg-neutral-900 rounded-[2rem] flex flex-col items-center justify-center border border-neutral-800 p-8 overflow-hidden group">
              {/* Pulsing Background */}
              <div className={`absolute inset-0 bg-indigo-500/10 blur-3xl transition-opacity duration-500 ${aiState === 'talking' ? 'opacity-100' : 'opacity-0'}`}></div>
              
              <div className={`relative w-56 h-56 rounded-full border-4 border-indigo-500/50 transition-all duration-300 ${aiState === 'talking' ? 'scale-110 shadow-[0_0_80px_rgba(99,102,241,0.4)]' : 'scale-100 grayscale-[50%]'}`}>
                  <img src="/avatar.png" className="w-full h-full object-cover rounded-full" />
              </div>
              <div className="mt-10 text-center">
                 <p className="text-xl font-medium text-white leading-relaxed">
                    {messages.length > 0 && messages[messages.length-1].role === 'ai' ? messages[messages.length-1].text : `(Scenario: ${currentScenario})`}
                 </p>
                 <div className="flex gap-1 justify-center mt-4 h-6 items-end">
                    {aiState === 'talking' && [1,2,3,4].map(i => (
                        <div key={i} className="w-1 bg-indigo-500 animate-bounce" style={{height: '100%', animationDelay: `${i*0.1}s`}}></div>
                    ))}
                 </div>
              </div>
          </div>

          <div className="flex flex-col gap-6 h-full">
             <div className="flex-1 bg-neutral-900 rounded-[2rem] overflow-hidden relative border border-neutral-800">
                 <video ref={videoRef} autoPlay muted className="w-full h-full object-cover transform scale-x-[-1]" />
                 <div className="absolute top-6 right-6 bg-black/60 backdrop-blur-md text-white text-xs font-bold px-4 py-2 rounded-full flex items-center gap-2 border border-white/10">
                    {status === 'listening' ? <span className="text-emerald-400 flex gap-2 items-center"><Mic size={12}/> LISTENING</span> : <span className="text-neutral-400">PROCESSING</span>}
                 </div>
             </div>
             <div className="h-24 bg-neutral-900 rounded-[2rem] flex items-center justify-center border border-neutral-800 text-neutral-500 font-medium gap-3">
                <div className={`w-2 h-2 rounded-full ${status === 'listening' ? 'bg-emerald-500 animate-ping' : 'bg-neutral-700'}`}></div>
                Hands-Free Auto Mode
             </div>
          </div>
       </div>
    </div>
    );
  }

  // 4. ANALYZING
  if (phase === 'analyzing') return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white">
        <Loader2 className="animate-spin w-12 h-12 text-emerald-500 mb-4"/>
        <h2 className="text-xl font-bold">Analyzing SERVE Metrics...</h2>
    </div>
  );

  // --- 5. RESULTS DASHBOARD (Advanced Dark Mode) ---
  if (phase === 'results' && analysis) {
    const duration = startTime ? Math.round((new Date().getTime() - startTime.getTime()) / 1000 / 60) : 5;
    
    return (
      <div className="min-h-screen bg-[#0a0a0a] text-white font-sans p-6 md:p-12">
        <div className="max-w-7xl mx-auto space-y-8">
          
          {/* HEADER */}
          <div className="flex flex-col md:flex-row justify-between items-end border-b border-neutral-800 pb-6">
             <div>
                <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-white to-neutral-500 bg-clip-text text-transparent mb-2">Analysis Report</h1>
                <p className="text-neutral-400 flex items-center gap-2"><ShieldCheck size={16} className="text-emerald-500"/> Lenskart Official SERVE Evaluation</p>
             </div>
             <button onClick={() => window.location.reload()} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-bold hover:bg-neutral-200 transition-colors mt-4 md:mt-0">
                <RefreshCcw size={18}/> New Session
             </button>
          </div>

          {/* GRID LAYOUT */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
             
             {/* 1. PROFILE CARD */}
             <div className="lg:col-span-4 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between">
                <div>
                    <div className="w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center text-3xl font-bold mb-6 shadow-lg shadow-indigo-900/20">
                        {userData.name.charAt(0)}
                    </div>
                    <h2 className="text-2xl font-bold">{userData.name}</h2>
                    <p className="text-neutral-500">{userData.storeCode} • {userData.ecode}</p>
                </div>
                <div className="space-y-4 mt-8">
                    <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-3 text-neutral-400"><Calendar size={16}/> Date</div>
                        <span className="font-mono text-sm">{new Date().toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-neutral-900 rounded-xl border border-neutral-800">
                        <div className="flex items-center gap-3 text-neutral-400"><Clock size={16}/> Duration</div>
                        <span className="font-mono text-sm">{duration}m 12s</span>
                    </div>
                </div>
             </div>

             {/* 2. OVERALL SCORE (Glowing Ring) */}
             <div className="lg:col-span-4 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center relative overflow-hidden">
                 <div className="absolute inset-0 bg-emerald-500/5 blur-[100px]"></div>
                 <div className="relative w-48 h-48">
                    <svg className="w-full h-full transform -rotate-90">
                        <circle cx="96" cy="96" r="88" stroke="#262626" strokeWidth="12" fill="transparent" />
                        <circle cx="96" cy="96" r="88" stroke={analysis.overallScore >= 70 ? "#10b981" : "#ef4444"} strokeWidth="12" fill="transparent" strokeDasharray={553} strokeDashoffset={553 - (553 * analysis.overallScore) / 100} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-6xl font-bold tracking-tighter">{analysis.overallScore}</span>
                        <span className="text-sm text-neutral-500 uppercase tracking-widest mt-1">Score</span>
                    </div>
                 </div>
             </div>

             {/* 3. SPIDER CHART */}
             <div className="lg:col-span-4 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 flex items-center justify-center">
                <div className="h-[250px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={analysis.radarChart}>
                            <PolarGrid stroke="#404040" />
                            <PolarAngleAxis dataKey="subject" tick={{ fill: '#a3a3a3', fontSize: 10 }} />
                            <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                            <Radar name="Score" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        </RadarChart>
                    </ResponsiveContainer>
                </div>
             </div>
          </div>

          {/* SERVE CARDS */}
          <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2"><Star className="text-yellow-500" fill="currentColor"/> SERVE Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {analysis.feedback.map((item: any, idx: number) => (
                    <div key={idx} className="bg-neutral-900 border border-neutral-800 p-6 rounded-2xl hover:border-neutral-700 transition-colors group">
                        <div className="flex justify-between items-start mb-4">
                            <h4 className="font-bold text-lg text-neutral-200 group-hover:text-white transition-colors">{item.title}</h4>
                            <span className={`text-sm font-bold px-3 py-1 rounded-full ${item.score >= 7 ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'}`}>{item.score}/10</span>
                        </div>
                        <div className="w-full bg-neutral-800 h-1.5 rounded-full mb-4 overflow-hidden">
                            <div className={`h-full rounded-full ${item.score >= 7 ? 'bg-emerald-500' : 'bg-red-500'}`} style={{width: `${item.score * 10}%`}}></div>
                        </div>
                        <p className="text-sm text-neutral-400 leading-relaxed">{item.details}</p>
                    </div>
                ))}
              </div>
          </div>

          {/* NEW FEEDBACK SECTION (The request) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
             <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl">
                <h3 className="text-lg font-bold mb-4 text-white flex items-center gap-2"><Sparkles size={18} className="text-purple-500"/> Performance Summary</h3>
                <p className="text-neutral-300 leading-relaxed">{analysis.summary}</p>
             </div>

             <div className="bg-neutral-900 border border-neutral-800 p-8 rounded-3xl relative overflow-hidden">
                {/* Code/Terminal aesthetic for detailed feedback */}
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
                <h3 className="text-lg font-bold mb-6 text-white flex items-center gap-2"><FileText size={18} className="text-indigo-400"/> Detailed Analysis</h3>
                <div className="prose prose-invert max-w-none text-sm text-neutral-400 whitespace-pre-wrap font-mono bg-black/30 p-6 rounded-xl border border-neutral-800">
                    {analysis.markdown_report || "Detailed breakdown pending..."}
                </div>
             </div>
          </div>

        </div>
      </div>
    );
  }

  return null;
}