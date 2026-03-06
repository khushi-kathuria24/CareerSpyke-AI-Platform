'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const { login } = useAuth()

  // Initialize Google Sign-In
  useEffect(() => {
    const initializeGoogleSignIn = () => {
      if (typeof window !== 'undefined' && window.google) {
        google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          callback: handleGoogleSignIn
        })
        google.accounts.id.renderButton(
          document.getElementById('google-signin-button'),
          {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: 'signin'
          }
        )
      }
    }

    // Load Google Sign-In script
    const script = document.createElement('script')
    script.src = 'https://accounts.google.com/gsi/client'
    script.async = true
    script.defer = true
    script.onload = initializeGoogleSignIn
    document.head.appendChild(script)

    return () => {
      const existingScript = document.querySelector('script[src="https://accounts.google.com/gsi/client"]')
      if (existingScript) {
        existingScript.remove()
      }
    }
  }, [])

  const handleGoogleSignIn = async (response) => {
    try {
      setLoading(true)
      setError('')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const googleSigninUrl = backendUrl ? `${backendUrl.replace(/\/$/, '')}/api/auth/google-signin` : '/api/auth/google-signin';

      // Send token to your backend
      const res = await fetch(googleSigninUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: response.credential })
      })

      if (!res.ok) throw new Error('Google sign-in failed')

      const data = await res.json()

      // Use auth context to save login
      login(data.token, data.user)

      router.push('/')
    } catch (err) {
      setError(err.message || 'Failed to sign in with Google')
      console.error('Google Sign-In error:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleEmailLogin = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const loginUrl = backendUrl ? `${backendUrl.replace(/\/$/, '')}/api/auth/login` : '/api/auth/login';

      console.log('Attempting login via:', loginUrl);

      const res = await fetch(loginUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      if (!res.ok) {
        const error = await res.json()
        throw new Error(error.message || 'Login failed')
      }

      const data = await res.json()

      // Use auth context to save login
      login(data.token, data.user)

      router.push('/')
    } catch (err) {
      setError(err.message || 'Failed to login')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen flex items-center justify-center bg-white p-4'>
      <div className='w-full max-w-md card-gradient rounded-2xl shadow-2xl p-8 animate-fadeInUp'>
        {/* Header */}
        <div className='text-center mb-8'>
          <h1 className='text-3xl font-bold text-orange-500 mb-2'>CareerSpyke</h1>
          <p className='text-slate-600 text-sm font-medium'>Sign in to your account</p>
          <p className='text-slate-500 text-xs mt-1'>Welcome! Please fill in the details to get started.</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className='mb-4 p-3 bg-red-50 border-2 border-red-300 rounded-lg text-red-700 text-sm'>
            {error}
          </div>
        )}

        {/* Google Sign-In Button */}
        <div className='mb-6' id='google-signin-button'></div>

        {/* Divider */}
        <div className='relative mb-6'>
          <div className='absolute inset-0 flex items-center'>
            <div className='w-full border-t border-slate-300'></div>
          </div>
          <div className='relative flex justify-center text-sm'>
            <span className='px-2 bg-white text-slate-500'>or</span>
          </div>
        </div>

        {/* Login Form */}
        <form onSubmit={handleEmailLogin} className='space-y-4'>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Email address</label>
            <input
              className='w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 placeholder-slate-400'
              placeholder='Enter your email address'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Password</label>
            <input
              className='w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 placeholder-slate-400'
              placeholder='Enter your password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type='submit'
            disabled={loading}
            className='w-full bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white py-3 rounded-lg font-semibold transition-all duration-300'
          >
            {loading ? 'Signing in...' : 'Continue'}
          </button>
        </form>

        {/* Footer Links */}
        <div className='text-center mt-6'>
          <p className='text-slate-600 text-sm'>
            Don't have an account? <a href='/register' className='text-orange-500 font-semibold hover:text-orange-600 transition-colors'>Sign up</a>
          </p>
        </div>

        {/* Security Info */}
        <div className='mt-6 pt-6 border-t border-slate-200 text-center text-xs text-slate-500'>
          <p>By signing up you agree to Final Round's Terms of Service and Privacy Policy. Your privacy is our top priority. Learn more about the steps we take to protect it.</p>
        </div>
      </div>
    </div>
  )
}
