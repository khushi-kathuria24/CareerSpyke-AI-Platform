import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { message, context = '', files = [] } = await req.json();

    if (!message || !message.trim()) {
      return Response.json(
        { error: "Message is required" },
        { status: 400 }
      );
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
- Professional yet encouraging (like a high-level mentor).
- Use structured formatting (bullet points, bold text) for readability.
- Be actionable: "Instead of 'I did X', say 'I achieved Y by doing X, resulting in Z% improvement'."
- If a user provides a file name, acknowledge it and ask how you can help process its contents.

CONSTRAINTS:
- Do not provide generic boilerplate advice.
- If you're unsure, ask clarifying questions about their target industry or experience level.`;

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Combine system prompt with user message
    const fullMessage = `${systemPrompt}\n\nUser Question: ${message}${fileList}`;

    const result = await model.generateContent(fullMessage);
    const response = result.response;
    const text = response.text();

    return Response.json(
      {
        answer: text,
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Gemini API Error:", error);

    return Response.json(
      {
        error: "Failed to get response from AI assistant",
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}
