import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req) {
  try {
    const { message, context = '', files = [] } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    if (!API_KEY) {
      console.error("Gemini API Key is missing");
      return NextResponse.json({ error: "API configuration error. Please check your environment variables." }, { status: 500 });
    }

    const fileList = files.length > 0 ? `\n\nAttached Files: ${files.map(f => f.name).join(', ')}` : '';

    // System prompt to guide SAKHA as a career assistant
    const systemPrompt = `You are SAKHA, the elite AI Career Architect for CareerSpyke. Your mission is to empower students and professionals with precise, high-impact career guidance.

DOMAIN-SPECIFIC EXPERTISE:
1. **Resumes & CVs**: Focus on Applicant Tracking Systems (ATS) optimization, quantifiable achievements, and strategic formatting. Advise on structure (Summary, Skills, Experience, Education).
2. **Interview Prep**: Expert in STAR (Situation, Task, Action, Result) method for behavioral questions. Technical prep for SDE roles, Product roles, and Data roles.
3. **Internships & Jobs**: Strategies for cold emailing, LinkedIn networking, and portfolio building.
4. **Learning Paths**: Recommendations for high-value certifications (Microsoft, AWS, Google) and core subject mastery (DSA, System Design).

TONE & STYLE:
- Professional yet encouraging mentor.
- Use structured formatting (bullet points, bold text).
- Be actionable: "Instead of 'I did X', say 'I achieved Y by doing X, resulting in Z% improvement'."
- Acknowledge any attached files if mentioned.

CONSTRAINTS:
- Do not provide generic boilerplate advice.
- Keep responses concise but impactful.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    // Combine system prompt with user message
    const fullMessage = `${systemPrompt}\n\nUser Question: ${message}${fileList}`;

    const result = await model.generateContent(fullMessage);
    const response = await result.response;
    const text = response.text();

    return NextResponse.json({
      answer: text,
      success: true
    });

  } catch (error) {
    console.error("Gemini API Error in SAKHA:", error);

    // Provide a helpful fallback that looks like SAKHA is still helping
    const fallbackMessage = "I apologize, but I'm having a brief technical hiccup while connecting to my knowledge base. However, as your career mentor, I recommend double-checking your career path goals or refining your resume's summary section while I reconnect!";

    return NextResponse.json({
      answer: fallbackMessage,
      error: error.message,
      success: false
    }, { status: 200 }); // Status 200 to allow the fallback message to be displayed
  }
}
