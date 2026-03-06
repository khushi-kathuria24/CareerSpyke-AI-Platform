'use client'
import { useState, useRef } from 'react'
import axios from 'axios'

const FAQS = [
  {
    question: 'How do I upload my resume?',
    answer: 'Go to the Resume Upload section in your dashboard. Click "Upload Resume", select your PDF file, and submit.'
  },
  {
    question: 'How can I practice mock interviews?',
    answer: 'Visit the Mock Interview section and select from various interview personas. You can record your responses and get AI feedback.'
  },
  {
    question: 'How do I connect with alumni?',
    answer: 'Navigate to the Alumni Hub where you can view mentorship opportunities, join discussions, and connect with experienced professionals.'
  },
  {
    question: 'What internship opportunities are available?',
    answer: 'Check the Dashboard for curated internship listings based on your profile and preferences.'
  },
  {
    question: 'How does the feedback system work?',
    answer: 'After each mock interview, our AI provides detailed feedback on communication, technical skills, and overall performance.'
  },
]

export default function ChatBox({ isExpanded = false, onExpand, onClose }) {
  const [messages, setMessages] = useState([{
    from: 'bot',
    text: 'Hi! I\'m SAKHA, your AI Career Architect. I can now analyze your attached resumes and provide precise professional guidance. What career goal should we build today?'
  }])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [showFAQ, setShowFAQ] = useState(true)
  const [expandedFAQ, setExpandedFAQ] = useState(null)
  const [uploadedFiles, setUploadedFiles] = useState([])
  const fileInputRef = useRef(null)

  async function send() {
    if (!input.trim()) return
    const userMsg = { from: 'user', text: input }
    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)
    setShowFAQ(false)
    try {
      const response = await fetch('/api/gemini-chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: input,
          context: 'Career Architect consultation',
          files: uploadedFiles
        })
      })

      const data = await response.json()

      if (data.answer) {
        setMessages(m => [...m, { from: 'bot', text: data.answer }])
      } else {
        throw new Error('No answer received')
      }
    } catch (e) {
      console.error(e)
      const fallback = "I'm having a brief connection issue, but don't let that stop you! As your mentor, I recommend reviewing your resume's 'Quantifiable Achievements' section while I reconnect. I'll be back in a moment!"
      setMessages(m => [...m, { from: 'bot', text: fallback }])
    } finally {
      setLoading(false)
    }
  }

  const handleFAQClick = (answer) => {
    const botMsg = { from: 'bot', text: answer }
    setMessages(m => [...m, botMsg])
    setShowFAQ(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      send()
    }
  }

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || [])
    files.forEach(file => {
      setUploadedFiles(prev => [...prev, { name: file.name, size: file.size }])
    })
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeFile = (idx) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== idx))
  }

  // Compact mode
  if (!isExpanded) {
    return (
      <div className='w-full max-w-sm animate-fadeInUp'>
        <div className='card-gradient rounded-2xl shadow-2xl overflow-hidden'>
          {/* Header */}
          <div className='bg-gradient-to-r from-primary to-primary-dark p-4 text-white flex items-center justify-between'>
            <h2 className='text-xl font-bold'>SAKHA</h2>
            <button
              onClick={onExpand}
              className='text-white hover:scale-110 transition-transform text-lg'
              title='Expand'
            >
              ⬆️
            </button>
          </div>

          {/* Chat Area - Compact */}
          <div className='h-64 overflow-y-auto p-4 space-y-3 bg-gradient-to-b from-slate-50 to-white'>
            {messages.slice(-4).map((m, i) => (
              <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
                <div className={`max-w-xs px-3 py-2 rounded-lg text-sm ${m.from === 'user'
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-none'
                  : 'bg-white border-2 border-red-100 text-slate-700 rounded-bl-none'
                  }`}>
                  <p className='break-words'>{m.text}</p>
                </div>
              </div>
            ))}
            {loading && (
              <div className='flex justify-start'>
                <div className='bg-white border-2 border-red-100 px-3 py-2 rounded-lg rounded-bl-none'>
                  <div className='flex gap-1'>
                    <div className='w-2 h-2 bg-red-500 rounded-full animate-bounce'></div>
                    <div className='w-2 h-2 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                    <div className='w-2 h-2 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input Area - Compact */}
          <div className='p-3 bg-white border-t border-red-100'>
            <div className='flex gap-2 items-center'>
              <div className='flex-1 flex gap-2'>
                <input
                  className='flex-1 p-2 text-sm border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-500 transition-all placeholder-slate-400'
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder='Ask SAKHA...'
                  disabled={loading}
                />
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className='p-2 border-2 border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-all transition-transform active:scale-95'
                  title='Attach Resume/Files'
                >
                  📎
                </button>
              </div>
              <button
                onClick={send}
                disabled={loading || !input.trim()}
                className='btn-primary px-4 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 h-full'
              >
                Send
              </button>
            </div>
            {uploadedFiles.length > 0 && (
              <div className='mt-2 flex flex-wrap gap-1'>
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className='bg-red-50 border border-red-100 px-2 py-1 rounded text-[10px] text-red-700 flex items-center gap-1'>
                    <span className='truncate max-w-[80px]'>{file.name}</span>
                    <button onClick={() => removeFile(idx)} className='hover:text-red-900'>✕</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Expanded full-page mode
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeInUp'>
      <div className='bg-white rounded-2xl shadow-2xl w-full max-w-2xl h-screen max-h-screen md:max-h-[90vh] flex flex-col overflow-hidden'>
        {/* Header */}
        <div className='bg-gradient-to-r from-primary to-primary-dark p-6 text-white flex items-center justify-between flex-shrink-0'>
          <div>
            <h2 className='text-3xl font-bold'>SAKHA</h2>
            <p className='text-indigo-100 text-sm mt-1'>Your AI Career Assistant</p>
          </div>
          <button
            onClick={onClose}
            className='text-white hover:scale-110 transition-transform text-2xl'
            title='Close'
          >
            ✕
          </button>
        </div>

        {/* Chat Area - Expanded */}
        <div className='flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-slate-50 to-white'>
          {messages.map((m, i) => (
            <div key={i} className={`flex ${m.from === 'user' ? 'justify-end' : 'justify-start'} animate-fadeInUp`}>
              <div className={`max-w-md lg:max-w-lg px-4 py-3 rounded-2xl ${m.from === 'user'
                ? 'bg-gradient-to-r from-red-500 to-red-600 text-white rounded-br-none shadow-md'
                : 'bg-white border-2 border-red-100 text-slate-700 rounded-bl-none shadow-md'
                }`}>
                <p className='text-sm break-words'>{m.text}</p>
              </div>
            </div>
          ))}
          {loading && (
            <div className='flex justify-start'>
              <div className='bg-white border-2 border-red-100 px-4 py-3 rounded-2xl rounded-bl-none shadow-md'>
                <div className='flex gap-2'>
                  <div className='w-2 h-2 bg-red-500 rounded-full animate-bounce'></div>
                  <div className='w-2 h-2 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                  <div className='w-2 h-2 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* FAQ Section */}
        {showFAQ && messages.length === 1 && (
          <div className='px-6 py-4 bg-gradient-to-r from-white to-[#fff7f7] border-t border-red-100 max-h-32 overflow-y-auto'>
            <h3 className='text-sm font-semibold text-slate-700 mb-3'>Frequently Asked Questions</h3>
            <div className='space-y-2'>
              {FAQS.map((faq, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setExpandedFAQ(expandedFAQ === idx ? null : idx)
                    handleFAQClick(faq.answer)
                  }}
                  className='w-full text-left p-3 bg-white hover:bg-red-50 rounded-lg border border-red-200 transition-all text-sm hover:shadow-md'
                >
                  <p className='font-medium text-slate-700 flex items-center justify-between'>
                    <span>{faq.question}</span>
                    <span className='text-red-600'>→</span>
                  </p>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Uploaded Files Section */}
        {uploadedFiles.length > 0 && (
          <div className='px-6 py-3 bg-slate-100 border-t border-slate-200 max-h-24 overflow-y-auto'>
            <p className='text-xs font-semibold text-slate-600 mb-2'>Attached Files:</p>
            <div className='space-y-1'>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} className='flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-xs'>
                  <span className='text-slate-700 truncate'>📎 {file.name}</span>
                  <button
                    onClick={() => removeFile(idx)}
                    className='text-red-500 hover:text-red-700 font-semibold'
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Input Area - Expanded */}
        <div className='p-6 bg-white border-t border-red-100 flex-shrink-0'>
          <div className='flex gap-3 mb-3'>
            <input
              className='flex-1 p-3 border-2 border-red-200 rounded-xl focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all placeholder-slate-400'
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder='Ask SAKHA anything about internships, interviews, courses...'
              disabled={loading}
            />
            <button
              onClick={send}
              disabled={loading || !input.trim()}
              className='btn-primary px-6 py-3 rounded-xl font-semibold disabled:opacity-50 disabled:cursor-not-allowed'
            >
              Send
            </button>
          </div>
          <div className='flex gap-2'>
            <input
              ref={fileInputRef}
              type='file'
              multiple
              onChange={handleFileUpload}
              className='hidden'
              accept='.pdf,.doc,.docx,.txt,.jpg,.jpeg,.png'
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className='px-4 py-2 border-2 border-red-200 text-red-600 rounded-lg font-semibold hover:bg-red-50 transition-all text-sm flex items-center gap-2'
            >
              📎 Attach File
            </button>
            <p className='text-xs text-slate-500 flex items-center'>Tip: Attach PDFs, documents, or images</p>
          </div>
        </div>
      </div>
    </div>
  )
}

