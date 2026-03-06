import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const { token } = body;

    // Clean URL: remove trailing slash if exists
    let backendBaseUrl = (process.env.BACKEND_URL || 'http://localhost:5000').replace(/\/$/, '');
    const targetUrl = `${backendBaseUrl}/api/auth/google-signin`;

    console.log('Proxying google-signin to:', targetUrl);

    if (!token) {
      return NextResponse.json(
        { message: 'Token is required' },
        { status: 400 }
      );
    }

    // Forward to backend API
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token }),
      cache: 'no-store'
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(data, { status: response.status });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Google Sign-In Proxy Error:', error);
    return NextResponse.json(
      { message: 'Connection to backend failed' },
      { status: 500 }
    );
  }
}
