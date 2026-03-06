import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

export async function POST(req) {
  try {
    const { role, currentSkills } = await req.json();

    if (!role || !role.trim()) {
      return Response.json(
        { error: "Role is required" },
        { status: 400 }
      );
    }

    const systemPrompt = `You are a career development expert. Create a detailed learning path for someone who wants to become a ${role}.

Current skills: ${currentSkills.length > 0 ? currentSkills.join(', ') : 'None specified'}

Provide a comprehensive learning roadmap in JSON format:
{
  "role": "${role}",
  "duration": "estimated time (e.g., 3-6 months)",
  "phases": [
    {
      "name": "Phase name (e.g., Foundation)",
      "duration": "time needed",
      "topics": ["topic 1", "topic 2", "topic 3"],
      "resources": ["resource 1", "resource 2", "resource 3"]
    }
  ],
  "projects": ["project 1", "project 2", "project 3", "project 4"]
}

Create 3 phases: Foundation, Intermediate, and Advanced.
Include 4-5 milestone projects.
Consider their current skills and suggest what they need to learn next.`;

    const model = genAI.getGenerativeModel({ model: "gemini-pro" });

    const result = await model.generateContent(systemPrompt);
    const response = result.response;
    const text = response.text();

    // Try to parse JSON from response
    let learningPath;
    try {
      // Remove markdown code blocks if present
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      learningPath = JSON.parse(cleanText);
    } catch (parseError) {
      // If JSON parsing fails, create a default structured response
      learningPath = {
        role: role,
        duration: "3-6 months",
        phases: [
          {
            name: "Foundation",
            duration: "4-6 weeks",
            topics: ["Core concepts", "Basic syntax", "Development environment setup"],
            resources: ["Official documentation", "Interactive tutorials", "Beginner courses"]
          },
          {
            name: "Intermediate",
            duration: "8-10 weeks",
            topics: ["Advanced patterns", "Best practices", "Framework mastery"],
            resources: ["Advanced courses", "Code challenges", "Technical blogs"]
          },
          {
            name: "Advanced",
            duration: "6-8 weeks",
            topics: ["System design", "Performance optimization", "Production deployment"],
            resources: ["Expert-level courses", "Open source projects", "Industry case studies"]
          }
        ],
        projects: [
          "Build a personal portfolio website",
          "Create a full-stack application",
          "Contribute to open source projects",
          "Deploy a production-ready application"
        ]
      };
    }

    return Response.json(
      {
        ...learningPath,
        success: true
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Learning Path API Error:", error);

    return Response.json(
      {
        error: "Failed to generate learning path",
        details: error.message,
        success: false
      },
      { status: 500 }
    );
  }
}
