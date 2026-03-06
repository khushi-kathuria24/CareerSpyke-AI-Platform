'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    userType: 'student'
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('')

      const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || '';
      const registerUrl = backendUrl ? `${backendUrl.replace(/\/$/, '')}/api/auth/register` : '/api/auth/register';

      const res = await fetch(registerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.message || 'Registration failed')
      }

      setSuccess(true)
      setTimeout(() => {
        router.push('/login')
      }, 2000)

    } catch (err) {
      setError(err.message)
      console.error('Registration error:', err)
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
          <p className='text-slate-600 text-sm font-medium'>Create your account</p>
          <p className='text-slate-500 text-xs mt-1'>Welcome! Please fill in the details to get started.</p>
        </div>

        {error && (
          <div className='bg-red-50 text-red-500 p-3 rounded-lg text-sm mb-4 border border-red-100'>
            {error}
          </div>
        )}

        {success && (
          <div className='bg-green-50 text-green-500 p-3 rounded-lg text-sm mb-4 border border-green-100'>
            Registration successful! Redirecting to login...
          </div>
        )}

        {/* Signup Form */}
        <form className='space-y-4' onSubmit={handleSubmit}>
          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>User Type</label>
            <div className='flex gap-3'>
              <label className={`flex-1 flex items-center justify-center px-3 py-2 border-2 rounded-lg cursor-pointer transition-all ${formData.userType === 'student' ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                <input
                  type='radio'
                  name='userType'
                  value='student'
                  className='hidden'
                  checked={formData.userType === 'student'}
                  onChange={handleChange}
                />
                <span className={`text-sm font-medium ${formData.userType === 'student' ? 'text-orange-700' : 'text-slate-700'}`}>Student</span>
              </label>
              <label className={`flex-1 flex items-center justify-center px-3 py-2 border-2 rounded-lg cursor-pointer transition-all ${formData.userType === 'expert' ? 'border-orange-500 bg-orange-50' : 'border-slate-300 hover:bg-slate-50'}`}>
                <input
                  type='radio'
                  name='userType'
                  value='expert'
                  className='hidden'
                  checked={formData.userType === 'expert'}
                  onChange={handleChange}
                />
                <span className={`text-sm font-medium ${formData.userType === 'expert' ? 'text-orange-700' : 'text-slate-700'}`}>Expert</span>
              </label>
            </div>
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Full name</label>
            <input
              name='name'
              className='w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 placeholder-slate-400'
              placeholder='Enter your full name'
              type='text'
              value={formData.name}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Email address</label>
            <input
              name='email'
              className='w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 placeholder-slate-400'
              placeholder='Enter your email address'
              type='email'
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <div>
            <label className='block text-sm font-medium text-slate-700 mb-2'>Password</label>
            <input
              name='password'
              className='w-full px-4 py-3 border-2 border-slate-300 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all duration-300 placeholder-slate-400'
              placeholder='Enter your password'
              type='password'
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
            />
          </div>

          <label className='flex items-center gap-2 text-slate-700'>
            <input type='checkbox' className='w-4 h-4 rounded border-slate-300' required disabled={loading} />
            <span className='text-sm'>I agree to the Terms of Service and Privacy Policy</span>
          </label>

          <button
            type='submit'
            disabled={loading}
            className={`w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-semibold transition-all duration-300 flex items-center justify-center gap-2 ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
          >
            {loading ? (
              <>
                <div className='w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin'></div>
                Creating Account...
              </>
            ) : 'Create Account'}
          </button>
        </form>

        {/* Footer Links */}
        <div className='text-center mt-6'>
          <p className='text-slate-600 text-sm'>
            Already have an account? <a href='/login' className='text-orange-500 font-semibold hover:text-orange-600 transition-colors'>Sign in</a>
          </p>
        </div>

        {/* Security Info */}
        <div className='mt-6 pt-6 border-t border-slate-200 text-center text-xs text-slate-500'>
          <p>By signing up you agree to CareerSpyke's Terms of Service and Privacy Policy. Your privacy is our top priority. Learn more about the steps we take to protect it.</p>
        </div>
      </div>
    </div>
  )
}
