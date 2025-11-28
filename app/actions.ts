'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";
// ✅ FIXED IMPORT: Points to your local lib folder inside app
import { getSecret } from "./lib/vault"; 

// Helper to initialize the model securely
async function getModel(useJsonMode = false) {
  let apiKey: string | undefined;

  // 1. Try Vault first (Using Lenskart Production Path)
  try {
      // Path based on your screenshot: lenskart/juno/juno-config
      // Key: GEMINI_API_KEY
      apiKey = await getSecret('lenskart/juno/juno-config', 'GEMINI_API_KEY');
      if (apiKey) console.log("✅ Using API Key from Vault");
  } catch (e) {
      console.warn("⚠️ Vault secret lookup failed:", e);
  }

  // 2. Fallback to Docker ENV (Local Dev / Fallback)
  if (!apiKey) {
      console.log("ℹ️ Falling back to Environment Variable");
      apiKey = process.env.GEMINI_API_KEY;
  }

  if (!apiKey) throw new Error("CRITICAL: No API Key found in Vault or Environment");

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // ✅ FIXED: Using Gemini 2.5 Flash
  return genAI.getGenerativeModel({ 
    model: "gemini-2.5-flash",
    generationConfig: {
        // Only enable JSON mode if specifically requested
        responseMimeType: useJsonMode ? "application/json" : "text/plain",
    }
  });
}

// --- 1. CHAT LOGIC ---
export async function getAIResponse(userText: string, history: any[], scenario: string) {
  const systemInstruction = `
    You are a Lenskart Customer who is AGITATED.
    YOUR ISSUE: "${scenario}"
    
    The User is a Lenskart Staff Member.
    
    YOUR BEHAVIOR:
    - Start Angry.
    - If they "Stop & Listen" (acknowledge issue), soften up.
    - If they "Empathize" (say sorry), calm down.
    - If they "Resolve" (take ownership), agree.
    - If they "Exceed" (offer voucher), be happy.
    
    Keep responses SHORT (spoken style).
  `;
  
  try {
    // Standard text mode for chat
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
    if (error.message?.includes("503")) return { success: false, text: "I'm listening... (Server busy)" };
    return { success: false, text: "I didn't catch that." };
  }
}

// --- 2. ANALYSIS LOGIC (JSON MODE) ---
export async function generateAnalysis(history: any[]) {
  const prompt = `
    Analyze this Lenskart Staff Roleplay transcript based on the **SERVE Framework**.
    TRANSCRIPT: ${JSON.stringify(history)}

    CRITERIA (Score 0-10):
    1. **Stop & Listen**: Acknowledge issue?
    2. **Empathize**: Validate feelings?
    3. **Resolve**: Take ownership?
    4. **Verify Satisfaction**: Check happiness?
    5. **Exceed Expectations**: Offer Delight/Voucher?

    OUTPUT STRICT JSON ONLY:
    {
      "overallScore": number,
      "summary": "Short summary string.",
      "radarChart": [
        { "subject": "Stop & Listen", "A": number },
        { "subject": "Empathize", "A": number },
        { "subject": "Resolve", "A": number },
        { "subject": "Verify Satisfaction", "A": number },
        { "subject": "Exceed Expectations", "A": number }
      ],
      "feedback": [
        { "title": "Stop & Listen", "score": number, "status": "Good", "details": "string" },
        { "title": "Empathize", "score": number, "status": "Good", "details": "string" },
        { "title": "Resolve", "score": number, "status": "Good", "details": "string" },
        { "title": "Verify Satisfaction", "score": number, "status": "Good", "details": "string" },
        { "title": "Exceed Expectations", "score": number, "status": "Good", "details": "string" }
      ],
      "markdown_report": "Detailed report string..."
    }
  `;

  try {
    // ✅ FORCE JSON MODE
    const model = await getModel(true);
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    if (!text) throw new Error("Empty response");

    // 🛡️ SMART EXTRACTION (Just in case AI adds markdown wraps)
    const firstBrace = text.indexOf('{');
    const lastBrace = text.lastIndexOf('}');
    
    if (firstBrace === -1 || lastBrace === -1) throw new Error("No JSON found");

    const cleanJson = text.substring(firstBrace, lastBrace + 1);
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Analysis Error:", error);
    
    // Fail-safe data so the app never crashes
    return { 
        overallScore: 0, 
        summary: "Analysis failed. Please try again.", 
        radarChart: [
            { "subject": "Stop & Listen", "A": 0 },
            { "subject": "Empathize", "A": 0 },
            { "subject": "Resolve", "A": 0 },
            { "subject": "Verify Satisfaction", "A": 0 },
            { "subject": "Exceed Expectations", "A": 0 }
        ], 
        feedback: [],
        markdown_report: "Error generating report."
    };
  }
}