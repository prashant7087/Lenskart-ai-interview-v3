

// 'use server'

// import { GoogleGenerativeAI } from "@google/generative-ai";
// import { PrismaClient } from '@prisma/client';
// import { getSecret } from "./lib/vault"; 

// // --- DATABASE SETUP ---
// const globalForPrisma = global as unknown as { prisma: PrismaClient };
// const prisma = globalForPrisma.prisma || new PrismaClient();
// if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// // --- MODEL SETUP ---
// async function getModel(useJsonMode = false) {
//   let apiKey: string | undefined;

//   try {
//       apiKey = await getSecret('lenskart/juno/juno-config', 'GEMINI_API_KEY');
//       if (apiKey) console.log("✅ Using API Key from Vault", apiKey);
//   } catch (e) { /* ignore */ }

//   if (!apiKey) apiKey = process.env.GEMINI_API_KEY;
//   if (!apiKey) throw new Error("CRITICAL: No API Key found");

//   const genAI = new GoogleGenerativeAI(apiKey);
  
//   // ✅ STRICTLY USING 2.5 FLASH AS REQUESTED
//   return genAI.getGenerativeModel({ 
//     model: "gemini-2.5-flash",
//     generationConfig: { responseMimeType: useJsonMode ? "application/json" : "text/plain" }
//   });
// }

// // 🚀 NEW: RETRY HELPER FUNCTION
// // If the AI is busy (503), this waits and tries again up to 3 times.
// async function generateWithRetry(model: any, prompt: string, retries = 3, delay = 2000) {
//   for (let i = 0; i < retries; i++) {
//     try {
//       return await model.generateContent(prompt);
//     } catch (error: any) {
//       const isOverloaded = error.message?.includes("503") || error.message?.includes("Overloaded");
      
//       if (isOverloaded && i < retries - 1) {
//         console.warn(`⚠️ Model overloaded (503). Retrying in ${delay/1000}s... (Attempt ${i + 1}/${retries})`);
//         await new Promise(res => setTimeout(res, delay));
//         delay *= 2; // Wait longer next time (2s -> 4s -> 8s)
//       } else {
//         throw error; // If it's not a 503, or we ran out of retries, crash.
//       }
//     }
//   }
// }

// // --- 1. CHAT LOGIC ---
// export async function getAIResponse(userText: string, history: any[], scenario: string) {
//   const systemInstruction = `
//     You are a Lenskart Customer who is AGITATED.
//     YOUR ISSUE: "${scenario}"
//     The User is a Lenskart Staff Member.
//     BEHAVIOR: Start Angry. If they "Stop & Listen", soften. If they "Resolve", agree.
//     Keep responses SHORT.
//   `;
  
//   try {
//     const model = await getModel(false);
//     const chat = model.startChat({
//       history: history.map(msg => ({
//         role: msg.role === 'ai' ? 'model' : 'user',
//         parts: [{ text: msg.text }]
//       })),
//       systemInstruction: { role: 'system', parts: [{ text: systemInstruction }]}
//     });

//     // Chat usually handles retries internally, but if it fails, we catch it below.
//     const result = await chat.sendMessage(userText);
//     return { success: true, text: result.response.text() };
//   } catch (error: any) {
//     console.error("Chat Error:", error.message);
//     if (error.message?.includes("503")) return { success: false, text: "I'm thinking... (Network busy, please say that again)" };
//     return { success: false, text: "I didn't catch that." };
//   }
// }

// // --- 2. ANALYSIS LOGIC (WITH RETRY) ---
// export async function generateAnalysis(history: any[]) {
//   const prompt = `
//     Analyze this transcript based on the **SERVE Framework**.
//     TRANSCRIPT: ${JSON.stringify(history)}
//     CRITERIA: Stop & Listen, Empathize, Resolve, Verify Satisfaction, Exceed Expectations.
    
//     OUTPUT STRICT JSON:
//     {
//       "overallScore": number,
//       "summary": "string",
//       "radarChart": [
//         { "subject": "Stop & Listen", "A": number },
//         { "subject": "Empathize", "A": number },
//         { "subject": "Resolve", "A": number },
//         { "subject": "Verify Satisfaction", "A": number },
//         { "subject": "Exceed Expectations", "A": number }
//       ],
//       "feedback": [
//         { "title": "Stop & Listen", "score": number },
//         { "title": "Empathize", "score": number },
//         { "title": "Resolve", "score": number },
//         { "title": "Verify Satisfaction", "score": number },
//         { "title": "Exceed Expectations", "score": number }
//       ],
//       "markdown_report": "string"
//     }
//   `;

//   try {
//     const model = await getModel(true);
    
//     // 🚀 USE THE NEW RETRY FUNCTION HERE
//     const result = await generateWithRetry(model, prompt);
//     const text = result.response.text();
    
//     // Smart Clean
//     const firstBrace = text.indexOf('{');
//     const lastBrace = text.lastIndexOf('}');
//     if (firstBrace === -1) throw new Error("No JSON found");
    
//     const cleanJson = text.substring(firstBrace, lastBrace + 1);
//     const data = JSON.parse(cleanJson);

//     // DATABASE SAVE
//     try {
//         await prisma.interview.create({
//             data: {
//                 candidateName: "Prashant Gupta",
//                 overallScore: data.overallScore,
//                 duration: "2m", 
//                 scenario: "Agitated Customer",
//                 scoreStop: data.radarChart.find((x:any) => x.subject.includes("Stop"))?.A || 0,
//                 scoreEmpathize: data.radarChart.find((x:any) => x.subject.includes("Empathize"))?.A || 0,
//                 scoreResolve: data.radarChart.find((x:any) => x.subject.includes("Resolve"))?.A || 0,
//                 scoreVerify: data.radarChart.find((x:any) => x.subject.includes("Verify"))?.A || 0,
//                 scoreExceed: data.radarChart.find((x:any) => x.subject.includes("Exceed"))?.A || 0,
//                 summary: data.summary
//             }
//         });
//         console.log("✅ Interview saved to Database!");
//     } catch (err) {
//         console.error("❌ DB Save Failed:", err);
//     }

//     return data;

//   } catch (error) {
//     console.error("Analysis Failed after retries:", error);
//     // Return a "Safe" failure object so the UI doesn't crash
//     return { 
//       overallScore: 0, 
//       summary: "Server was overloaded. Data saved locally but analysis pending.", 
//       radarChart: [], 
//       feedback: [] 
//     };
//   }
// }

'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
import { PrismaClient } from '@prisma/client';
import { getSecret } from "./lib/vault"; 

// --- DATABASE SETUP ---
const globalForPrisma = global as unknown as { prisma: PrismaClient };
const prisma = globalForPrisma.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// --- MODEL SETUP (STRICT SECURITY MODE) ---
async function getModel(useJsonMode = false) {
  let apiKey: string | undefined;

  try {
      console.log("🔐 Requesting API Key from Vault...");
      apiKey = await getSecret('lenskart/juno/juno-config', 'GEMINI_API_KEY');
  } catch (e) {
      console.error("❌ Vault Connection Failed:", e);
  }

  // 🛑 STRICT SECURITY ENFORCEMENT
  // We removed the "process.env" fallback. 
  // If Vault fails, the app refuses to run.
  if (!apiKey) {
      throw new Error("⛔ CRITICAL SECURITY ERROR: No API Key found in Vault. Environment fallback is disabled.");
  }

  console.log("✅ Securely retrieved API Key from Vault");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Using Gemini 2.5 Flash as requested
  return genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: { responseMimeType: useJsonMode ? "application/json" : "text/plain" }
  });
}

// RETRY HELPER (Essential for 2.5 Flash 503 errors)
async function generateWithRetry(model: any, prompt: string, retries = 3, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error: any) {
      const isOverloaded = error.message?.includes("503") || error.message?.includes("Overloaded");
      if (isOverloaded && i < retries - 1) {
        console.warn(`⚠️ Model overloaded (503). Retrying in ${delay/1000}s...`);
        await new Promise(res => setTimeout(res, delay));
        delay *= 2; 
      } else {
        throw error;
      }
    }
  }
}

// --- 1. CHAT LOGIC ---
export async function getAIResponse(userText: string, history: any[], scenario: string) {
  const systemInstruction = `
    You are a Lenskart Customer who is AGITATED.
    YOUR ISSUE: "${scenario}"
    The User is a Lenskart Staff Member.
    BEHAVIOR: Start Angry. If they "Stop & Listen", soften. If they "Resolve", agree.
    Keep responses SHORT.
  `;
  
  try {
    const model = await getModel(false);
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role === 'ai' ? 'model' : 'user',
        parts: [{ text: msg.text }]
      })),
      systemInstruction: { role: 'system', parts: [{ text: systemInstruction }]}
    });

    const result = await chat.sendMessage(userText);
    return { success: true, text: result.response.text() };
  } catch (error: any) {
    console.error("Chat Error:", error.message);
    // Safe failure message if Vault/AI fails
    return { success: false, text: "I didn't catch that. (System Security Check Failed)" };
  }
}

// --- 2. ANALYSIS LOGIC ---
export async function generateAnalysis(history: any[], userDetails: { name: string, storeCode: string, ecode: string }) {
  const prompt = `
    Analyze this transcript based on the **SERVE Framework**.
    TRANSCRIPT: ${JSON.stringify(history)}
    CRITERIA: Stop & Listen, Empathize, Resolve, Verify Satisfaction, Exceed Expectations.
    
    OUTPUT STRICT JSON:
    {
      "overallScore": number,
      "summary": "string",
      "radarChart": [
        { "subject": "Stop & Listen", "A": number },
        { "subject": "Empathize", "A": number },
        { "subject": "Resolve", "A": number },
        { "subject": "Verify Satisfaction", "A": number },
        { "subject": "Exceed Expectations", "A": number }
      ],
      "feedback": [
        { "title": "Stop & Listen", "score": number },
        { "title": "Empathize", "score": number },
        { "title": "Resolve", "score": number },
        { "title": "Verify Satisfaction", "score": number },
        { "title": "Exceed Expectations", "score": number }
      ],
      "markdown_report": "string"
    }
  `;

  try {
    const model = await getModel(true);
    
    // Use Retry Logic
    const result = await generateWithRetry(model, prompt);
    const text = result.response.text();
    
    // Smart JSON Cleaning
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    if (firstBrace === -1) throw new Error("No JSON found");
    
    const cleanJson = text.substring(firstBrace, lastBrace + 1);
    const data = JSON.parse(cleanJson);

    // DATABASE SAVE
    try {
        await prisma.interview.create({
            data: {
                // 🚀 USING REAL USER DATA FROM FRONTEND
                candidateName: userDetails.name || "Unknown Candidate",
                storeCode: userDetails.storeCode || "N/A",
                overallScore: data.overallScore || 0,
                duration: "2m", // You can calculate real duration if needed
                scenario: "Agitated Customer",
                
                // Mapping Radar Chart Scores
                scoreStop: data.radarChart?.find((x:any) => x.subject.includes("Stop"))?.A || 0,
                scoreEmpathize: data.radarChart?.find((x:any) => x.subject.includes("Empathize"))?.A || 0,
                scoreResolve: data.radarChart?.find((x:any) => x.subject.includes("Resolve"))?.A || 0,
                scoreVerify: data.radarChart?.find((x:any) => x.subject.includes("Verify"))?.A || 0,
                scoreExceed: data.radarChart?.find((x:any) => x.subject.includes("Exceed"))?.A || 0,
                
                summary: data.summary || "No summary generated"
            }
        });
        console.log("✅ Interview saved to Database successfully!");
    } catch (err) {
        console.error("❌ DB Save Failed:", err);
    }

    return data;

  } catch (error) {
    console.error("Analysis Error:", error);
    // Return safe object so UI doesn't crash
    return { 
      overallScore: 0, 
      summary: "Security Error: Unable to retrieve credentials from Vault.", 
      radarChart: [], 
      feedback: [] 
    };
  }
}