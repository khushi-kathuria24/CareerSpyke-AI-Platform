import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

// Verify API Key existence from multiple potential env sources
const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req) {
  try {
    const body = await req.json();
    const { message, context = '', files = [] } = body;

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!API_KEY) {
      console.error("CRITICAL: Gemini API Key is missing in Environment Variables");
      return NextResponse.json({
        answer: "I'm SAKHA, your Career Architect. I'm currently missing my API configuration. Please ensure the GEMINI_API_KEY is set in the environment settings.",
        success: false
      }, { status: 200 });
    }

    const fileContext = files.length > 0
      ? `\n\n[USER ATTACHMENTS]: The user has attached the following files: ${files.map(f => f.name).join(', ')}. Please acknowledge these and provide guidance based on them if relevant.`
      : '';

    // Advanced Domain-Specific System Prompt
    const systemPrompt = `You are SAKHA (v2.0), the elite AI Career Architect for the CareerSpyke platform. Your sole purpose is to provide highly technical, domain-specific, and surgically precise career engineering advice.

CORE KNOWLEDGE DOMAINS:
1. **Resume Engineering (ATS-First)**:
   - Advise on 1-page standard formatting.
   - Demand "Quantifiable Achievements" (e.g., "$1.2M saved", "45% latency reduction").
   - Keyword optimization for Applicant Tracking Systems.
2. **Interview Warfare (STAR Method)**:
   - Coach users on the STAR (Situation, Task, Action, Result) framework.
   - Technical deep-dives for SDE, Data science, and Product management.
   - Behavioral rounding and HR strategy.
3. **Strategic Networking**:
   - LinkedIn optimization and cold-outreach templates.
   - Personal branding for the "Hidden Job Market."
4. **Learning Roadmaps**:
   - Precise paths for MERN, Cloud (AWS/Azure), DevSecOps, and AI/ML.

TONE & BEHAVIOR:
- Professional, high-status mentor.
- Use bolding, bullet points, and headers for elite readability.
- If the user asks general questions, bring them back to their professional career goals.
- If files are attached, you MUST mention them.

Current Context: ${context}`;

    // Try primary model (1.5 Flash is fastest and very robust)
    let model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const fullMessage = `${systemPrompt}\n\n[USER QUESTION]: ${message}${fileContext}`;

    try {
      const result = await model.generateContent(fullMessage);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({
        answer: text,
        success: true
      });
    } catch (modelError) {
      console.warn("Primary model (1.5-flash) failed, attempting fallback to gemini-pro", modelError);

      // Fallback to gemini-pro
      const fallbackModel = genAI.getGenerativeModel({ model: "gemini-pro" });
      const result = await fallbackModel.generateContent(fullMessage);
      const response = await result.response;
      const text = response.text();

      return NextResponse.json({
        answer: text,
        success: true
      });
    }

  } catch (error) {
    console.error("FATAL: Gemini API Error in SAKHA:", error);

    const disasterFallback = "I'm SAKHA, your Career Architect. I'm having trouble reaching my neural core right now. This usually happens due to heavy platform load or API limits. While I reconnect, check the 'Resumes Gallery' for inspiration or try your question again in 30 seconds!";

    return NextResponse.json({
      answer: disasterFallback,
      error: error.message,
      success: false
    }, { status: 200 });
  }
}
