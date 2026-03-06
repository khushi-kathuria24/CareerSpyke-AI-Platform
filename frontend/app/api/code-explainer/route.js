import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { code, language, difficulty } = await req.json();

    if (!code || !code.trim()) {
      return Response.json(
        { error: "Code is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a code explanation expert. Analyze the provided ${language} code and provide:
1. A brief overview of what the code does
2. Line-by-line or section-by-section breakdown
3. Suggestions for improvement

Explanation level: ${difficulty}

Format your response as JSON with this structure:
{
  "overview": "Brief description of what the code does",
  "breakdown": [
    {"line": "code snippet", "explanation": "what it does"}
  ],
  "suggestions": ["suggestion 1", "suggestion 2"]
}

Be clear, concise, and educational. Adjust complexity based on the ${difficulty} level.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const prompt = `${systemPrompt}\n\nCode to explain:\n\`\`\`${language}\n${code}\n\`\`\``;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    // Try to parse JSON from response
    let explanation;
    try {
      const jsonStart = responseText.indexOf('{');
      const jsonEnd = responseText.lastIndexOf('}') + 1;
      const cleanJSON = responseText.substring(jsonStart, jsonEnd);
      explanation = JSON.parse(cleanJSON);
    } catch (parseError) {
      console.error('Code explanation parse error:', parseError, 'Raw:', responseText);
      // If JSON parsing fails, create structured response from text
      explanation = {
        overview: responseText.split('\n')[0] || "Code analysis completed",
        breakdown: [
          { line: "Full code", explanation: responseText }
        ],
        suggestions: ["Review the explanation above for insights"]
      };
    }

    return Response.json(
      {
        ...explanation,
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Code Explainer API Error:", error);

    return Response.json(
      {
        error: "Failed to explain code",
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}
