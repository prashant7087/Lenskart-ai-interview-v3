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

// 'use server'

// import { GoogleGenerativeAI } from "@google/generative-ai";

// // --- ⚠️ HARDCODED KEY FOR DEBUGGING ---
// const API_KEY = "AIzaSyD8oX831-cFAIs_wi621d4FjfFJqF4h5Vo"; 

// const genAI = new GoogleGenerativeAI(API_KEY);

// // We use 1.5 Flash. It is fast, stable, and works with your key type.
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// // --- 1. CHAT LOGIC (The Agitated Customer) ---
// export async function getAIResponse(userText: string, history: any[]) {
//   const systemInstruction = `
//     You are a Lenskart Training Bot playing the role of an Agitated Customer.
//     The Staff Member (User) is trying to calm you down.
    
//     Your Behavior:
//     - Start upset about your glasses being wrong (wrong power or frame).
//     - If they apologize and offer a solution, calm down slightly.
//     - If they offer a voucher or take ownership ("Personally handle"), be happy.
//     - Keep responses SHORT (max 1-2 sentences).
//     - Speak naturally.
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
//     console.error("AI Chat Error:", error);
//     return { success: false, text: "I am having trouble hearing you. Can you repeat?" };
//   }
// }

// // --- 2. ANALYSIS LOGIC (The Scorecard) ---
// export async function generateAnalysis(history: any[]) {
//   const prompt = `
//     Analyze this roleplay transcript for Lenskart Staff Training.
//     TRANSCRIPT: ${JSON.stringify(history)}

//     Generate a STRICT JSON object with this EXACT structure (no markdown, just JSON):
//     {
//       "overallScore": number (0-100),
//       "summary": "A short paragraph summarizing the candidate's performance.",
//       "radarChart": [
//         { "subject": "Empathy", "A": number (1-10) },
//         { "subject": "Ownership", "A": number (1-10) },
//         { "subject": "Solution", "A": number (1-10) },
//         { "subject": "Tone", "A": number (1-10) },
//         { "subject": "Closing", "A": number (1-10) }
//       ],
//       "feedback": [
//         {
//           "title": "Empathy & Apology",
//           "score": number (1-10),
//           "status": "Needs Improvement" | "Good" | "Excellent",
//           "details": "Specific feedback on their empathy statement."
//         },
//         {
//           "title": "Taking Ownership",
//           "score": number (1-10),
//           "status": "Needs Improvement" | "Good" | "Excellent",
//           "details": "Did they use phrases like 'Personally handle'?"
//         },
//         {
//           "title": "Solution Accuracy",
//           "score": number (1-10),
//           "status": "Needs Improvement" | "Good" | "Excellent",
//           "details": "Did they offer to recheck power/frame?"
//         },
//         {
//             "title": "Customer Delight",
//             "score": number (1-10),
//             "status": "Needs Improvement" | "Good" | "Excellent",
//             "details": "Did they offer a voucher/compensation?"
//         },
//         {
//             "title": "Communication Tone",
//             "score": number (1-10),
//             "status": "Needs Improvement" | "Good" | "Excellent",
//             "details": "Was the tone calm, professional, and polite?"
//         }
//       ]
//     }
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
//     // Cleanup JSON
//     const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
//     return JSON.parse(cleanJson);
//   } catch (error) {
//     console.error("Analysis Error:", error);
//     // Return safe fallback to prevent crash
//     return {
//         overallScore: 0,
//         summary: "Could not generate report due to network issue.",
//         radarChart: [],
//         feedback: [] 
//     };
//   }
// }

// 'use server'

// import { GoogleGenerativeAI } from "@google/generative-ai";

// // ⚠️ KEEP YOUR KEY (This is the one that works for you)
// const API_KEY = "AIzaSyD8oX831-cFAIs_wi621d4FjfFJqF4h5Vo"; 

// const genAI = new GoogleGenerativeAI(API_KEY);
// const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// // --- 1. CHAT LOGIC (The Agitated Customer) ---
// export async function getAIResponse(userText: string, history: any[]) {
  
//   // We randomly pick an issue for the AI to complain about each time
//   const issues = [
//     "Wrong Product: I ordered Blue Ray lenses but got normal ones.",
//     "Delay: You promised delivery yesterday, tracking shows nothing!",
//     "Lens Issue: My vision is blurry with these new glasses.",
//     "Quality: There is a scratch on the lens and I just opened the box!",
//     "Service: Your customer care was very rude to me.",
//     "Warranty: You are refusing my warranty claim!"
//   ];
//   const selectedIssue = issues[Math.floor(Math.random() * issues.length)];

//   const systemInstruction = `
//     You are a Lenskart Customer who is AGITATED.
//     Your specific issue is: "${selectedIssue}"
    
//     The User is a Store Staff member.
    
//     YOUR BEHAVIOR:
//     - Start the conversation by stating your issue angrily.
//     - If the User follows the "Lenskart Empathy Script" (Apologizes, says "Problem genuine hai", takes Ownership "Personally handle"), then CALM DOWN.
//     - If they offer a solution (Recheck/Rectify), agree.
//     - If they offer a voucher at the end, be happy.
    
//     - Keep responses SHORT (1-2 sentences). Spoken style.
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
//   } catch (error: any) {
//     // Handle 503 gracefully
//     if (error.message?.includes("503")) {
//         return { success: false, text: "I am listening... (Server busy, please continue)" };
//     }
//     return { success: false, text: "Can you repeat that?" };
//   }
// }

// // --- 2. ANALYSIS LOGIC (The Detailed Report) ---
// export async function generateAnalysis(history: any[]) {
//   const prompt = `
//     Analyze this Lenskart Staff Roleplay transcript.
//     TRANSCRIPT: ${JSON.stringify(history)}

//     EVALUATION SCRIPT (The User MUST follow this):
//     1. Greet & Ask Issue ("Kya issue face kr rahe hai?")
//     2. Empathy ("Problem bilkul genuine hai", "Sorry")
//     3. Ownership ("Main personally handle karunga")
//     4. Solution ("Turant check karta hoon", "Right lenses banwa denge")
//     5. Closing ("Voucher", "Value you")

//     OUTPUT STRICT JSON ONLY:
//     {
//       "overallScore": number (0-100),
//       "summary": "Short summary of performance.",
//       "radarChart": [
//         { "subject": "Empathy", "A": number (1-10) },
//         { "subject": "Ownership", "A": number (1-10) },
//         { "subject": "Solutioning", "A": number (1-10) },
//         { "subject": "Politeness", "A": number (1-10) },
//         { "subject": "Closing", "A": number (1-10) }
//       ],
//       "feedback": [
//         { "title": "Greeting & Empathy", "score": number (1-10), "status": "Needs Improvement" | "Good" | "Excellent", "details": "Did they validate the customer's anger?" },
//         { "title": "Taking Ownership", "score": number (1-10), "status": "Needs Improvement" | "Good" | "Excellent", "details": "Did they use the phrase 'Personally handle'?" },
//         { "title": "Providing Solution", "score": number (1-10), "status": "Needs Improvement" | "Good" | "Excellent", "details": "Did they offer to recheck/replace?" },
//         { "title": "Closing & Delight", "score": number (1-10), "status": "Needs Improvement" | "Good" | "Excellent", "details": "Did they offer the voucher?" }
//       ],
//       "markdown_report": "#### Evaluation of Candidate's Performance\n\nThe candidate [did/did not] follow the standard Lenskart script...\n\n#### Section A: Empathy\n- [Specific feedback points]\n\n#### Section B: Ownership\n- [Specific feedback points]\n\n#### Overall Recommendation\n- [Hired/Retrain]"
//     }
//   `;

//   try {
//     const result = await model.generateContent(prompt);
//     const text = result.response.text();
//     const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
//     return JSON.parse(cleanJson);
//   } catch (error) {
//     return { overallScore: 0, radarChart: [], feedback: [], markdown_report: "Analysis failed." };
//   }
// }

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