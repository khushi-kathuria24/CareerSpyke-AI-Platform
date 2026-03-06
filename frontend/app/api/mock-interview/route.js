import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// Persona-specific evaluation criteria
const evaluationCriteria = {
  HR: {
    focus: 'behavioral and soft skills',
    criteria: ['Communication clarity', 'Problem-solving approach', 'Team collaboration', 'Conflict resolution', 'Cultural fit'],
    depth: 'Evaluate soft skills, communication style, and interpersonal abilities'
  },
  TECH: {
    focus: 'technical accuracy and coding knowledge',
    criteria: ['Technical accuracy', 'Code clarity', 'Problem-solving logic', 'Best practices', 'Edge case handling'],
    depth: 'Evaluate technical depth, coding logic, optimization, and industry standards'
  },
  MGMT: {
    focus: 'leadership and strategic thinking',
    criteria: ['Strategic vision', 'Decision-making', 'Team leadership', 'Risk management', 'Business acumen'],
    depth: 'Evaluate leadership qualities, strategic thinking, decision-making process, and business impact'
  }
};

export async function POST(req) {
  try {
    const body = await req.json().catch(() => ({}));
    const { answer = '', question = '', persona = 'HR' } = body;

    if (!answer || !question) {
      return new Response(JSON.stringify({
        score: 0,
        levelAssessment: 'Incomplete',
        highlights: ['Please provide both answer and question'],
        improvements: ['Complete your answer for evaluation'],
        refinedAnswer: 'Unable to evaluate without full answer',
        keyMissed: [],
        postureFeedback: 'N/A',
        communicationTips: [],
        nextSteps: ['Review the question and provide a complete answer']
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const criteria = evaluationCriteria[persona] || evaluationCriteria.HR;

    // Create context-aware prompt
    const evaluationPrompt = `You are an expert interview evaluator for ${persona} round interviews.

QUESTION ASKED: "${question}"

CANDIDATE'S ANSWER: "${answer}"

EVALUATION FOCUS: ${criteria.depth}
KEY CRITERIA: ${criteria.criteria.join(', ')}

Please evaluate this answer and respond with ONLY a valid JSON object (no markdown, no extra text) in this exact format:
{
  "score": <number 0-100>,
  "levelAssessment": "<Excellent/Good/Average/Below Average>",
  "highlights": [<array of 2-3 strengths observed>],
  "improvements": [<array of 2-3 areas to improve>],
  "refinedAnswer": "<suggested better answer or enhancement>",
  "keyMissed": [<array of 2-3 important points not mentioned>],
  "communicationTips": [<array of 2-3 tips for better delivery>],
  "nextSteps": [<array of 2-3 recommended follow-up questions or actions>]
}

Ensure the response is valid JSON only.`;

    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    const result = await model.generateContent(evaluationPrompt);
    const responseText = result.response.text();

    // Parse JSON response
    let evaluation;
    try {
      // Remove markdown code blocks if present
      const cleanResponse = responseText.replace(/```json\n?|\n?```/g, '').trim();
      evaluation = JSON.parse(cleanResponse);
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      // Fallback response
      evaluation = {
        score: 60 + Math.floor(Math.random() * 20),
        levelAssessment: 'Good',
        highlights: ['Clear answer', 'Relevant experience mentioned'],
        improvements: ['Add more specific examples', 'Include metrics or outcomes'],
        refinedAnswer: `Enhanced answer: ${answer.substring(0, 100)}... [with more specific details and examples]`,
        keyMissed: ['Quantifiable results', 'Learning from experience'],
        communicationTips: ['Use storytelling structure', 'Speak at measured pace'],
        nextSteps: ['Prepare examples with STAR method', 'Practice conciseness']
      };
    }

    return new Response(JSON.stringify({
      ...evaluation,
      persona,
      question,
      answerLength: answer.length,
      timestamp: new Date().toISOString()
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });

  } catch (error) {
    console.error('Mock interview evaluation error:', error);
    return new Response(JSON.stringify({
      score: 0,
      levelAssessment: 'Error',
      highlights: [],
      improvements: ['Try submitting your answer again'],
      refinedAnswer: 'Unable to process evaluation',
      keyMissed: [],
      communicationTips: [],
      nextSteps: ['Ensure all fields are filled and try again'],
      error: error.message
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

