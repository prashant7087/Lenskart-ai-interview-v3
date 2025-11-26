

'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

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
    // Graceful error handling
    return { success: false, text: "I didn't catch that. Could you repeat?" };
  }
}

// --- 2. ANALYSIS LOGIC (Fixed with Safety Checks) ---
export async function generateAnalysis(history: any[]) {
  const prompt = `
    Analyze this Lenskart Staff Roleplay transcript based on the **SERVE Framework**.
    TRANSCRIPT: ${JSON.stringify(history)}

    CRITERIA (Score 0-10):
    1. **S - Stop & Listen**: Acknowledge issue?
    2. **E - Empathize**: Validate feelings?
    3. **R - Resolve**: Take ownership ("Personally handle")?
    4. **V - Verify Satisfaction**: Check happiness?
    5. **E - Exceed Expectations**: Offer Delight/Voucher?

    OUTPUT STRICT JSON ONLY (No markdown):
    {
      "overallScore": number,
      "summary": "Short summary string.",
      "radarChart": [
        { "subject": "Stop & Listen", "A": number },
        { "subject": "Empathize", "A": number },
        { "subject": "Resolve", "A": number },
        { "subject": "Verify", "A": number },
        { "subject": "Exceed", "A": number }
      ],
      "feedback": [
        { "title": "S - Stop & Listen", "score": number, "status": "Good", "details": "string" },
        { "title": "E - Empathize", "score": number, "status": "Good", "details": "string" },
        { "title": "R - Resolve", "score": number, "status": "Good", "details": "string" },
        { "title": "V - Verify", "score": number, "status": "Good", "details": "string" },
        { "title": "E - Exceed", "score": number, "status": "Good", "details": "string" }
      ],
      "markdown_report": "Detailed report string..."
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    
    // ⚠️ SAFEGUARD: Check if text exists before using .replace
    const text = result.response.text();
    
    if (!text) {
        throw new Error("AI returned empty response");
    }

    // Now it is safe to use replace
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    
    return JSON.parse(cleanJson);

  } catch (error) {
    console.error("Analysis Error:", error);
    
    // Fallback Data (Prevents the app from crashing)
    return { 
        overallScore: 0, 
        summary: "Analysis could not be generated. Please try again.", 
        radarChart: [
            { "subject": "Stop & Listen", "A": 0 },
            { "subject": "Empathize", "A": 0 },
            { "subject": "Resolve", "A": 0 },
            { "subject": "Verify", "A": 0 },
            { "subject": "Exceed", "A": 0 }
        ], 
        feedback: [],
        markdown_report: "Error generating report."
    };
  }
}