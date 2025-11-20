// 'use server'

// import { GoogleGenerativeAI } from "@google/generative-ai";

// const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// // --- 1. CHAT LOGIC (The Trainer/Customer) ---
// export async function getAIResponse(userText: string, history: any[]) {
//   const systemInstruction = `
//     You are a Lenskart Training Manager roleplaying with a store staff member. 
//     SCENARIO: The staff member (user) is trying to calm down an agitated customer (you).
    
//     THE USER'S SCRIPT GOAL:
//     1. Greet & Ask Issue ("Sir, aap kya issue face kr rahe hai...")
//     2. Empathize & Apologize ("Problem bilkul genuine hai", "Personally handle karunga")
//     3. Offer Solution ("Check karta hoon", "Right lenses banwa denge")
//     4. Close & Delight ("Voucher", "Value you")

//     YOUR ROLE:
//     - Act as the customer briefly if they ask you something.
//     - Or just listen and encourage them to continue the script.
//     - Keep responses SHORT.
//   `;
  
//   try {
//     const chat = model.startChat({
//       history: history.map(msg => ({
//         role: msg.role === 'ai' ? 'model' : 'user',
//         parts: [{ text: msg.text }]
//       })),
//       systemInstruction: { role: 'system', parts: [{ text: systemInstruction }]}
//     });

//     const result = await chat.sendMessage(userText);
//     return { success: true, text: result.response.text() };
//   } catch (error) {
//     console.error(error);
//     return { success: false, text: "Technical glitch. Please continue..." };
//   }
// }

// // --- 2. ANALYSIS LOGIC (Grading the Hinglish Script) ---
// export async function generateAnalysis(history: any[]) {
//   const prompt = `
//     Analyze this Lenskart Staff roleplay transcript. The user spoke in Hinglish.
    
//     TRANSCRIPT:
//     ${JSON.stringify(history)}

//     COMPARE AGAINST THIS EXACT SCRIPT:
//     1. **Empathy & Apology**: Did they say "Problem bilkul genuine hai", "Completely understand", or "Sorry"?
//     2. **Ownership**: Did they say "Personally handle karunga" or "Humari zimmedari hai"?
//     3. **Solution**: Did they mention checking the "Wrong Frame / Power" and fixing it ("Turant recheck", "Perfect banake")?
//     4. **Closing & Delight**: Did they offer a "Voucher" or say "Value you"?
//     5. **Tone**: Was the tone calm and professional?

//     OUTPUT STRICT JSON ONLY (No markdown):
//     {
//       "overallScore": number,
//       "radarChart": [
//         { "subject": "Empathy", "A": score },
//         { "subject": "Ownership", "A": score },
//         { "subject": "Solution", "A": score },
//         { "subject": "Closing/Voucher", "A": score },
//         { "subject": "Tone", "A": score }
//       ],
//       "feedback": [
//         { "title": "Empathy & Apology", "score": number, "status": "Needs Improvement" | "Good" | "Excellent", "details": "Feedback on specific Hindi/English phrases used" },
//         { "title": "Taking Ownership", "score": number, "status": "Needs Improvement" | "Good" | "Excellent", "details": "Feedback on 'Personally handle' aspect" },
//         { "title": "Solution Accuracy", "score": number, "status": "Needs Improvement" | "Good" | "Excellent", "details": "Did they mention Frame/Power mismatch?" },
//         { "title": "Customer Delight", "score": number, "status": "Needs Improvement" | "Good" | "Excellent", "details": "Did they offer the Voucher?" },
//         { "title": "Professional Tone", "score": number, "status": "Needs Improvement" | "Good" | "Excellent", "details": "General speaking style feedback" }
//       ]
//     }
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
//     const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
//     return JSON.parse(cleanJson);
//   } catch (error) {
//     console.error("Analysis Error:", error);
//     return null;
//   }
// }

'use server'

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// Use the stable model to avoid 404 errors
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// --- 1. CHAT LOGIC ---
export async function getAIResponse(userText: string, history: any[]) {
  const systemInstruction = `
    You are a Lenskart Training Bot playing the role of an Agitated Customer.
    The Staff Member (User) is trying to calm you down.
    
    Your Behavior:
    - Start upset about your glasses being wrong.
    - If they apologize and offer a solution, calm down slightly.
    - If they offer a voucher or take ownership ("Personally handle"), be happy.
    - Keep responses SHORT (max 2 sentences).
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
  } catch (error) {
    console.error(error);
    return { success: false, text: "Technical glitch. Please continue..." };
  }
}

// --- 2. ANALYSIS LOGIC (Updated for New Dashboard) ---
export async function generateAnalysis(history: any[]) {
  const prompt = `
    Analyze this roleplay transcript for Lenskart Staff Training.
    TRANSCRIPT: ${JSON.stringify(history)}

    Generate a STRICT JSON object with this EXACT structure (no markdown):
    {
      "overallScore": number (0-100),
      "summary": "A short paragraph summarizing the candidate's performance.",
      "radarChart": [
        { "subject": "Empathy", "A": number (1-10) },
        { "subject": "Ownership", "A": number (1-10) },
        { "subject": "Solution", "A": number (1-10) },
        { "subject": "Tone", "A": number (1-10) },
        { "subject": "Closing", "A": number (1-10) }
      ],
      "feedback": [
        {
          "title": "Empathy & Apology",
          "score": number (1-10),
          "status": "Needs Improvement" | "Good" | "Excellent",
          "details": "Specific feedback on their empathy statement."
        },
        {
          "title": "Taking Ownership",
          "score": number (1-10),
          "status": "Needs Improvement" | "Good" | "Excellent",
          "details": "Did they use phrases like 'Personally handle'?"
        },
        {
          "title": "Solution Accuracy",
          "score": number (1-10),
          "status": "Needs Improvement" | "Good" | "Excellent",
          "details": "Did they offer to recheck power/frame?"
        },
        {
            "title": "Customer Delight",
            "score": number (1-10),
            "status": "Needs Improvement" | "Good" | "Excellent",
            "details": "Did they offer a voucher/compensation?"
        },
        {
            "title": "Communication Tone",
            "score": number (1-10),
            "status": "Needs Improvement" | "Good" | "Excellent",
            "details": "Was the tone calm, professional, and polite?"
        }
      ]
    }
  `;

  try {
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    // Cleanup JSON
    const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanJson);
  } catch (error) {
    console.error("Analysis Error:", error);
    // Return a safe fallback if AI fails, to prevent the app from crashing
    return {
        overallScore: 0,
        summary: "Analysis failed. Please try again.",
        radarChart: [],
        feedback: [] 
    };
  }
}