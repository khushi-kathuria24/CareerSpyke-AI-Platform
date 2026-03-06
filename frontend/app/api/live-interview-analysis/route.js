import { GoogleGenerativeAI } from '@google/generative-ai';

// Evaluation criteria for different personas
const evaluationCriteria = {
  HR: {
    focus: 'behavioral and soft skills',
    criteria: ['Communication clarity', 'Problem-solving approach', 'Team collaboration', 'Conflict resolution', 'Cultural fit'],
    depth: 'Evaluate soft skills, communication style, interpersonal abilities, and body language'
  },
  TECH: {
    focus: 'technical accuracy and coding knowledge',
    criteria: ['Technical accuracy', 'Code clarity', 'Problem-solving logic', 'Best practices', 'Edge case handling'],
    depth: 'Evaluate technical depth, coding logic, optimization, industry standards, and presentation clarity'
  },
  MGMT: {
    focus: 'leadership and strategic thinking',
    criteria: ['Strategic vision', 'Decision-making', 'Team leadership', 'Risk management', 'Business acumen'],
    depth: 'Evaluate leadership qualities, strategic thinking, decision-making process, and business impact'
  }
};

export async function POST(req) {
  const apiKey = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return new Response(JSON.stringify({
      error: 'GEMINI_API_KEY is missing. Please add it to your environment variables.'
    }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }

  const genAI = new GoogleGenerativeAI(apiKey);

  try {
    const body = await req.json().catch(() => ({}));
    const {
      voiceTranscript = '',
      videoFrame = null,
      question = '',
      persona = 'HR',
      cameraAvailable = false
    } = body;

    if (!voiceTranscript || !question) {
      return new Response(JSON.stringify({
        score: 0,
        levelAssessment: 'Incomplete',
        highlights: ['Please provide both voice response and question'],
        improvements: ['Complete your answer for evaluation'],
        refinedAnswer: 'Unable to evaluate without full response',
        keyMissed: [],
        bodyLanguageFeedback: 'N/A',
        voiceToneFeedback: 'N/A',
        communicationTips: [],
        nextSteps: ['Review the question and provide a complete answer'],
        videoAnalysis: null
      }), { status: 400, headers: { 'Content-Type': 'application/json' } });
    }

    const criteria = evaluationCriteria[persona] || evaluationCriteria.HR;

    // Build the prompt for Gemini
    let evaluationPrompt = `You are an expert ${persona} round interview evaluator with expertise in analyzing both verbal responses and visual cues.

PERSONA TYPE: ${persona}
EVALUATION FOCUS: ${criteria.focus}
EVALUATION CRITERIA: ${criteria.criteria.join(', ')}

INTERVIEW QUESTION ASKED: "${question}"

CANDIDATE'S VOICE RESPONSE (Transcribed): "${voiceTranscript}"

ANALYSIS REQUIREMENTS:
${cameraAvailable ? '1. Analyze the video frame for body language, eye contact, confidence, posture, and facial expressions\n2. Analyze voice tone, pace, clarity, and confidence from the transcription\n3. Cross-reference verbal and non-verbal communication' : '1. Focus on voice tone, pace, clarity, and confidence from the transcription\n2. Analyze the depth and quality of the response'}

Please provide a comprehensive evaluation including:

1. OVERALL SCORE (0-100): Based on content quality, communication style, and delivery
2. LEVEL ASSESSMENT: "Beginner" / "Intermediate" / "Good" / "Excellent" / "Outstanding"
3. HIGHLIGHTS (3-4 points): What the candidate did well
4. IMPROVEMENTS (3-4 points): Areas for improvement
5. KEY POINTS MISSED (1-3 points): Important information that wasn't covered
6. BODY LANGUAGE FEEDBACK (if video available): Posture, eye contact, confidence level, facial expressions
7. VOICE TONE FEEDBACK: Clarity, pace, confidence, professionalism in delivery
8. COMMUNICATION TIPS (3-5 tips): Specific ways to improve communication
9. REFINED ANSWER: A better version of the answer that incorporates best practices
10. NEXT STEPS (2-3 steps): What to focus on for next time

Format your response as JSON with these exact keys:
{
  "score": <number 0-100>,
  "levelAssessment": "<string>",
  "highlights": [<array of strings>],
  "improvements": [<array of strings>],
  "keyMissed": [<array of strings>],
  "bodyLanguageFeedback": "<string or 'N/A if no video'>",
  "voiceToneFeedback": "<string>",
  "communicationTips": [<array of strings>],
  "refinedAnswer": "<string>",
  "nextSteps": [<array of strings>],
  "videoAnalysis": ${cameraAvailable ? '{"confidence": <number>, "posture": "<string>", "eyeContact": "<string>", "overallPresence": "<string>"}' : 'null'}
}`;

    const modelName = cameraAvailable ? 'gemini-1.5-flash' : 'gemini-pro';
    const model = genAI.getGenerativeModel({ model: modelName });

    // If video is available, add it to the prompt with vision capabilities
    let generationConfig = {
      responseMimeType: 'application/json'
    };

    let contentParts = [];

    if (videoFrame && cameraAvailable) {
      // Prepare video frame for Gemini Vision API
      try {
        const base64Data = videoFrame.split(',')[1];
        contentParts = [
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: base64Data
            }
          },
          {
            text: evaluationPrompt
          }
        ];
      } catch (err) {
        console.error('Frame processing error:', err);
        cameraAvailable = false;
        contentParts = [{ text: evaluationPrompt }];
      }
    } else {
      contentParts = [
        {
          text: evaluationPrompt
        }
      ];
    }

    const result = await model.generateContent({
      contents: [
        {
          parts: contentParts
        }
      ],
      generationConfig
    });

    const responseText = result.response.text();

    // Parse the JSON response from Gemini
    let feedback;
    try {
      feedback = JSON.parse(responseText);
    } catch (e) {
      console.error('Error parsing Gemini response:', e);
      // Fallback: extract JSON from response if it contains extra text
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        feedback = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('Failed to parse Gemini response as JSON');
      }
    }

    return new Response(JSON.stringify(feedback), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Live Interview Analysis Error:', error);

    return new Response(JSON.stringify({
      score: 0,
      levelAssessment: 'Error',
      highlights: ['Please try again'],
      improvements: ['Connection issue - retrying recommended'],
      refinedAnswer: 'Unable to process at this time',
      keyMissed: [],
      bodyLanguageFeedback: 'Error',
      voiceToneFeedback: 'Error',
      communicationTips: [],
      nextSteps: ['Reload page and try again'],
      videoAnalysis: null,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
