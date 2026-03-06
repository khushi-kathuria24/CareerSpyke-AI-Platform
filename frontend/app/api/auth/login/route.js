import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Clean URL: remove trailing slash if exists
    let backendBaseUrl = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const targetUrl = `${backendBaseUrl}/api/auth/login`;

    console.log('Proxying login to:', targetUrl);

    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Forward to backend API
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Login Proxy Error:', error);
    return NextResponse.json(
      { message: 'Connection to backend failed' },
      { status: 500 }
    );
  }
}
