import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const API_KEY = process.env.GEMINI_API_KEY || process.env.NEXT_PUBLIC_GEMINI_API_KEY || "";
const genAI = new GoogleGenerativeAI(API_KEY);

export async function POST(req) {
    try {
        const { code, language, action = 'run' } = await req.json();

        if (!code || !code.trim()) {
            return NextResponse.json({ error: "Code is required" }, { status: 400 });
        }

        if (!API_KEY) {
            return NextResponse.json({
                status: 'error',
                result: 'Compiler Error',
                message: 'API Key missing. Please configure GEMINI_API_KEY.'
            });
        }

        const systemPrompt = `You are an expert ${language} compiler and code reviewer.
If action is 'run':
  - Simulate the execution of the following code.
  - If there are syntax errors, describe them clearly.
  - If valid, show the expected output as it would appear in a terminal.
If action is 'check':
  - Evaluate the logic, efficiency, and edge-case handling of the code.
  - Rate it as "Success", "Partial Success", or "Error".
  - Provide a brief, professional summary of the code quality.

Language: ${language}
Action: ${action}
    `;

        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const result = await model.generateContent(`${systemPrompt}\n\nCode to analyze:\n\`\`\`${language}\n${code}\n\`\`\``);
        const response = await result.response;
        const text = response.text();

        // Parse the AI response into a structured format
        // We'll ask the AI to provide a specific format in the prompt to make parsing easier, but for now we'll just wrap the text.

        return NextResponse.json({
            status: action === 'check' ? 'success' : 'success',
            result: action === 'check' ? 'Code Analysis Complete' : 'Execution Successful',
            message: text
        });

    } catch (error) {
        console.error("Compiler API Error:", error);
        return NextResponse.json({
            status: 'error',
            result: 'System Error',
            message: 'Failed to connect to the compilation engine. Please try again.'
        }, { status: 500 });
    }
}
