import { NextResponse } from 'next/server';

export async function POST(request) {
    try {
        const body = await request.json();
        const { email, password, name } = body;

        if (!email || !password || !name) {
            return NextResponse.json(
                { error: 'Name, email, and password are required' },
                { status: 400 }
            );
        }

        // Forward to backend API
        const response = await fetch(`${process.env.BACKEND_URL || 'http://localhost:5000'}/api/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password })
        });

        if (!response.ok) {
            const error = await response.json();
            return NextResponse.json(error, { status: response.status });
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Registration API error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
