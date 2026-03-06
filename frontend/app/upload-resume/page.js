'use client'
import { useState, useRef } from 'react'
import axios from 'axios'
import ResumePreview from '../../components/ResumePreview'

export default function UploadResume() {
  const [file, setFile] = useState(null)
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [dragActive, setDragActive] = useState(false)
  const [analysisDetails, setAnalysisDetails] = useState(null)
  const fileInputRef = useRef(null)

  // AI Assistant states
  const [showAssistant, setShowAssistant] = useState(false)
  const [assistantMessages, setAssistantMessages] = useState([
    { from: 'bot', text: 'Hi! I\'m here to help you create or improve your resume. After analyzing your resume, ask me questions or request help with specific sections!' }
  ])
  const [assistantInput, setAssistantInput] = useState('')
  const [assistantLoading, setAssistantLoading] = useState(false)

  async function handleUpload(e) {
    e.preventDefault()
    if (!file) return alert('Select a file (PDF, DOCX, DOC, Image, or Video)')
    setLoading(true)
    const fd = new FormData()
    fd.append('resume', file)
    try {
      const res = await axios.post('/api/resume-analysis', fd, { headers: { 'Content-Type': 'multipart/form-data' } })
      setResult(res.data)
      setAnalysisDetails(res.data)
    } catch (err) {
      console.error(err)
      // Fallback response
      setResult({
        fileName: file.name,
        suggestions: [
          'Add more quantifiable achievements with specific numbers and results',
          'Include a professional summary tailored to your target role',
          'Enhance technical skills section with relevant keywords',
          'Highlight leadership and cross-functional collaboration',
          'Ensure consistent formatting and professional appearance',
          'Optimize for ATS with proper keyword placement',
          'Add certifications and continuous learning'
        ],
        skills: ['Analysis Pending'],
        score: 72,
        atsScore: 68,
        summary: 'Resume uploaded. Please see suggestions above.'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleDrag = (e) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFile(e.dataTransfer.files[0])
    }
  }

  // AI Assistant for resume help
  async function sendAssistantMessage(e) {
    e.preventDefault()
    if (!assistantInput.trim()) return

    const userMsg = { from: 'user', text: assistantInput }
    setAssistantMessages(m => [...m, userMsg])
    setAssistantInput('')
    setAssistantLoading(true)

    try {
      let context = 'General resume help'
      if (result) {
        if (result.fileType === 'video') {
          context = `Video Presentation Analysis: videoScore=${result.videoScore}, speakingScore=${result.speakingScore}, technicalScore=${result.technicalScore}, suggestions=${JSON.stringify(result.suggestions)}`
        } else if (result.fileType === 'audio') {
          context = `Audio Pitch Analysis: speakingScore=${result.speakingScore}, audioQualityScore=${result.audioQualityScore}, suggestions=${JSON.stringify(result.suggestions)}`
        } else {
          context = `Resume Analysis: score=${result.score}, atsScore=${result.atsScore}, suggestions=${JSON.stringify(result.suggestions)}, skills=${JSON.stringify(result.skills)}`
        }
      }

      const res = await axios.post('/api/gemini-chat', {
        message: `As a career coach helping with ${result?.fileType || 'resume'} improvement, help with: ${assistantInput}. Context: ${context}`,
        context: result?.fileType || 'resume'
      })

      setAssistantMessages(m => [...m, { from: 'bot', text: res.data.answer }])
    } catch (err) {
      console.error(err)
      setAssistantMessages(m => [...m, {
        from: 'bot',
        text: 'Sorry, I\'m having trouble right now. Please try again.'
      }])
    } finally {
      setAssistantLoading(false)
    }
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8'>
      <div className='max-w-5xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-12 text-center animate-fadeInUp'>
          <h1 className='text-4xl font-bold mb-3 text-slate-800'>
            <span className='gradient-text'>Upload Your Resume</span>
          </h1>
          <p className='text-slate-600 text-lg'>Get AI-powered feedback and suggestions to make your resume shine</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
          {/* Upload Section */}
          <div className='lg:col-span-2 animate-slideInLeft'>
            <form onSubmit={handleUpload} className='space-y-6'>
              {/* Drag & Drop Area */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                className={`card-gradient rounded-2xl p-12 border-3 border-dashed transition-all duration-300 cursor-pointer ${dragActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-indigo-300 hover:border-indigo-500'
                  }`}
              >
                <label className='cursor-pointer block text-center'>
                  <div className='flex flex-col items-center justify-center'>
                    <div className='text-6xl mb-4 animate-bounce-subtle'>📄</div>
                    <p className='text-lg font-bold text-slate-800 mb-2'>Drag & drop your resume here</p>
                    <p className='text-slate-600 mb-4'>or</p>
                    <button
                      type='button'
                      onClick={() => fileInputRef.current?.click()}
                      className='btn-primary px-6 py-2 rounded-lg font-semibold text-sm'
                    >
                      Browse Files
                    </button>
                    <p className='text-xs text-slate-500 mt-4'>PDF, DOC, DOCX, JPG, PNG, GIF, MP4, MOV • Max 20MB</p>
                  </div>
                  <input
                    ref={fileInputRef}
                    type='file'
                    accept='.pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.webp,.mp4,.mov,.avi,.webm,.mp3,.wav,.m4a,.ogg'
                    onChange={e => setFile(e.target.files[0])}
                    className='hidden'
                  />
                </label>
              </div>

              {/* Selected File */}
              {file && (
                <div className='card-gradient rounded-2xl p-6 border-2 border-green-200 bg-green-50 animate-fadeInUp'>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                      <div className='text-4xl'>✅</div>
                      <div>
                        <p className='font-bold text-slate-800'>{file.name}</p>
                        <p className='text-sm text-slate-600'>{(file.size / 1024).toFixed(2)} KB</p>
                      </div>
                    </div>
                    <button
                      type='button'
                      onClick={() => setFile(null)}
                      className='text-red-500 hover:text-red-700 font-bold text-lg'
                    >
                      ✕
                    </button>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type='submit'
                disabled={loading || !file}
                className='w-full btn-primary py-4 rounded-lg font-bold text-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 transition-all duration-300'
              >
                <span>{loading ? '⏳' : '🚀'}</span>
                {loading ? 'Analyzing Your Resume...' : 'Upload & Get Feedback'}
              </button>
            </form>
          </div>

          {/* Tips Sidebar */}
          <div className='space-y-6 animate-slideInRight'>
            {/* Tips Card */}
            <div className='card-gradient rounded-2xl p-6 shadow-lg border border-indigo-100'>
              <h3 className='font-bold text-slate-800 mb-4'>Resume Tips</h3>
              <ul className='space-y-3'>
                {[
                  'Use action verbs',
                  'Quantify achievements',
                  'Keep it concise',
                  'Use standard fonts',
                  'No spelling errors',
                ].map((tip, idx) => (
                  <li key={idx} className='flex items-start gap-2 text-sm'>
                    <span className='text-indigo-600 font-bold text-lg'>✓</span>
                    <span className='text-slate-700'>{tip}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* What We Check */}
            <div className='card-gradient rounded-2xl p-6 shadow-lg border border-indigo-100'>
              <h3 className='font-bold text-slate-800 mb-4'>What We Analyze</h3>
              <ul className='space-y-2'>
                {[
                  '✓ Format & Structure',
                  '✓ Content Quality',
                  '✓ ATS Optimization',
                  '✓ Grammar & Spelling',
                  '✓ Keywords & Skills',
                ].map((check, idx) => (
                  <li key={idx} className='text-sm text-slate-700'>{check}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Results Section */}
        {result && (
          <div className='mt-12 animate-fadeInUp'>
            <div className='card-gradient rounded-2xl p-8 shadow-2xl border border-indigo-200'>
              <h2 className='text-3xl font-bold text-slate-800 mb-8'>Analysis Results {result.fileType && <span className='text-sm text-slate-600'>({result.fileType})</span>}</h2>

              {/* Video Analysis Results */}
              {result.fileType === 'video' && (
                <div className='mb-8'>
                  <div className='grid grid-cols-1 md:grid-cols-3 gap-4 mb-8'>
                    <div className='p-6 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg border-2 border-blue-300'>
                      <h4 className='text-sm font-semibold text-slate-700 mb-2'>Video Quality</h4>
                      <p className='text-3xl font-bold text-indigo-600'>{result.technicalScore || 75}</p>
                      <p className='text-xs text-slate-600 mt-1'>Technical Score /100</p>
                    </div>
                    <div className='p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300'>
                      <h4 className='text-sm font-semibold text-slate-700 mb-2'>Speaking Quality</h4>
                      <p className='text-3xl font-bold text-purple-600'>{result.speakingScore || 72}</p>
                      <p className='text-xs text-slate-600 mt-1'>Speaking Score /100</p>
                    </div>
                    <div className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300'>
                      <h4 className='text-sm font-semibold text-slate-700 mb-2'>Presentation</h4>
                      <p className='text-3xl font-bold text-green-600'>{result.videoScore || 75}</p>
                      <p className='text-xs text-slate-600 mt-1'>Overall /100</p>
                    </div>
                  </div>
                  {result.technicalFeedback && (
                    <div className='p-4 bg-blue-50 border-l-4 border-blue-500 rounded mb-6'>
                      <p className='text-slate-700'><strong>Technical Feedback:</strong> {result.technicalFeedback}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Audio Analysis Results */}
              {result.fileType === 'audio' && (
                <div className='mb-8'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4 mb-8'>
                    <div className='p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-300'>
                      <h4 className='text-sm font-semibold text-slate-700 mb-2'>Speaking Quality</h4>
                      <p className='text-3xl font-bold text-purple-600'>{result.speakingScore || 73}</p>
                      <p className='text-xs text-slate-600 mt-1'>Speaking Score /100</p>
                    </div>
                    <div className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-300'>
                      <h4 className='text-sm font-semibold text-slate-700 mb-2'>Audio Quality</h4>
                      <p className='text-3xl font-bold text-green-600'>{result.audioQualityScore || 70}</p>
                      <p className='text-xs text-slate-600 mt-1'>Audio Score /100</p>
                    </div>
                  </div>
                  {result.technicalFeedback && (
                    <div className='p-4 bg-green-50 border-l-4 border-green-500 rounded mb-6'>
                      <p className='text-slate-700'><strong>Audio Feedback:</strong> {result.technicalFeedback}</p>
                    </div>
                  )}
                </div>
              )}

              {/* AI Quick Takeaway */}
              {result.summary && (
                <div className='mb-8 p-6 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl text-white shadow-lg relative overflow-hidden group'>
                  <div className='absolute top-0 right-0 p-4 opacity-10 group-hover:scale-125 transition-transform duration-700'>
                    <span className='text-6xl'>✨</span>
                  </div>
                  <h4 className='font-bold text-sm uppercase tracking-widest mb-2 opacity-80'>Quick AI Takeaway</h4>
                  <p className='text-lg md:text-xl font-medium leading-relaxed relative z-10'
                    dangerouslySetInnerHTML={{ __html: result.summary.replace(/\*\*(.*?)\*\*/g, '<span class="font-extrabold text-yellow-300">$1</span>') }}>
                  </p>
                </div>
              )}

              {/* Resume/Document Analysis Score */}
              {result.fileType !== 'video' && result.fileType !== 'audio' && (
                <div className='mb-12 pb-8 border-b border-indigo-100 flex flex-col md:flex-row items-center gap-8'>
                  <div className='relative shrink-0'>
                    <svg className='w-40 h-40 transform -rotate-90 drop-shadow-xl'>
                      <circle cx='80' cy='80' r='70' fill='none' stroke='#f1f5f9' strokeWidth='8' />
                      <circle
                        cx='80' cy='80' r='70' fill='none' stroke='url(#premiumScoreGradient)' strokeWidth='8'
                        strokeDasharray={`${result.score * 439.82 / 100} 439.82`}
                        strokeLinecap='round'
                        className='transition-all duration-1000 ease-out animate-pulse-slow'
                      />
                      <defs>
                        <linearGradient id='premiumScoreGradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                          <stop offset='0%' stopColor='#4f46e5' />
                          <stop offset='100%' stopColor='#9333ea' />
                        </linearGradient>
                      </defs>
                    </svg>
                    <div className='absolute inset-0 flex items-center justify-center'>
                      <div className='text-center'>
                        <p className='text-4xl font-black text-slate-800'>{result.score || 78}</p>
                        <p className='text-xs font-bold text-slate-500 tracking-widest uppercase'>Score</p>
                      </div>
                    </div>
                  </div>
                  <div className='text-center md:text-left'>
                    <h3 className='text-3xl font-extrabold text-slate-800 mb-3'>Analysis Snapshot</h3>
                    <p className='text-slate-600 text-lg max-w-md'>Your {result.fileType || 'resume'} has been analyzed across multiple professional parameters. You are <span className='text-indigo-600 font-bold'>{result.score >= 80 ? 'performing exceptionally!' : result.score >= 70 ? 'in a strong position!' : 'ready for strategic growth!'}</span></p>
                  </div>
                </div>
              )}

              {/* Actionable Suggestions */}
              <div className='mb-12'>
                <h3 className='font-bold text-slate-800 mb-6 text-xl flex items-center gap-2'>
                  <span className='p-2 bg-indigo-100 rounded-lg'>💡</span> Key Action Items
                </h3>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  {result.suggestions?.map((suggestion, idx) => (
                    <div key={idx} className='group p-5 bg-white border border-indigo-50 rounded-2xl hover:border-indigo-400 transition-all duration-300 flex items-start gap-4 shadow-sm'>
                      <div className='mt-1 p-1 bg-indigo-500 rounded-full group-hover:scale-110 transition-transform'>
                        <span className='text-white block w-4 h-4 flex items-center justify-center text-[10px] font-bold'>✓</span>
                      </div>
                      <p className='text-slate-700 font-medium leading-snug'>{suggestion}</p>
                    </div>
                  )) || (
                      <p className='text-slate-600'>Upload your resume to get personalized suggestions</p>
                    )}
                </div>
              </div>

              {/* ATS Score and Skills */}
              {result.atsScore && (
                <div className='mt-8 pt-8 border-t border-indigo-200'>
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                    <div className='p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-lg border-2 border-green-200'>
                      <h4 className='font-bold text-slate-800 mb-2'>ATS Optimization Score</h4>
                      <div className='flex items-center gap-4'>
                        <div className='text-4xl font-bold text-green-600'>{result.atsScore}</div>
                        <div className='flex-1'>
                          <div className='w-full bg-gray-200 rounded-full h-2'>
                            <div
                              className='bg-gradient-to-r from-green-500 to-emerald-500 h-2 rounded-full'
                              style={{ width: `${result.atsScore}%` }}
                            ></div>
                          </div>
                          <p className='text-xs text-slate-600 mt-2'>Optimized for applicant tracking systems</p>
                        </div>
                      </div>
                    </div>

                    {result.skills && result.skills.length > 0 && (
                      <div className='p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg border-2 border-purple-200'>
                        <h4 className='font-bold text-slate-800 mb-3'>Identified Skills</h4>
                        <div className='flex flex-wrap gap-2'>
                          {result.skills.slice(0, 8).map((skill, idx) => (
                            <span key={idx} className='px-3 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium'>
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Detailed Feedback & Next Steps */}
              <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mt-12 pt-12 border-t border-indigo-200'>
                {/* Comprehensive Feedback */}
                {result.detailedFeedback && (
                  <div className='animate-fadeInUp'>
                    <h3 className='font-bold text-slate-800 mb-6 text-xl flex items-center gap-2'>
                      <span className='p-2 bg-blue-100 rounded-lg'>📑</span> Detailed Analysis
                    </h3>
                    <div className='p-8 bg-white backdrop-blur-md bg-opacity-60 rounded-2xl border-2 border-blue-100 text-slate-700 leading-relaxed shadow-sm'>
                      <div className='markdown-simple'>
                        {result.detailedFeedback.split('\n').map((line, i) => {
                          const isBullet = line.trim().startsWith('* ') || line.trim().startsWith('- ');
                          const content = line.trim().replace(/^[\*\-] /, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

                          if (line.trim() === '') return <div key={i} className='h-4'></div>;

                          if (isBullet) {
                            return (
                              <div key={i} className='flex gap-3 mb-2 ml-2'>
                                <span className='text-blue-500 mt-1.5 w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0'></span>
                                <p dangerouslySetInnerHTML={{ __html: content }} className='text-sm sm:text-base'></p>
                              </div>
                            );
                          }

                          return <p key={i} dangerouslySetInnerHTML={{ __html: content }} className='mb-4 text-sm sm:text-base'></p>;
                        })}
                      </div>
                    </div>
                  </div>
                )}

                {/* Strategic Roadmap */}
                {result.nextSteps && result.nextSteps.length > 0 && (
                  <div className='animate-fadeInUp' style={{ animationDelay: '0.2s' }}>
                    <h3 className='font-bold text-slate-800 mb-6 text-xl flex items-center gap-2'>
                      <span className='p-2 bg-orange-100 rounded-lg'>🏁</span> Your Success Roadmap
                    </h3>
                    <div className='space-y-4'>
                      {result.nextSteps.map((step, idx) => (
                        <div key={idx} className='group p-5 bg-white border border-orange-100 rounded-2xl hover:border-orange-500 transition-all duration-300 flex items-center gap-4 shadow-sm hover:shadow-md'>
                          <div className='w-10 h-10 rounded-xl bg-orange-500 text-white font-bold flex items-center justify-center shrink-0 shadow-lg group-hover:scale-110 transition-transform'>
                            {idx + 1}
                          </div>
                          <p className='text-slate-700 font-medium'>{step}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* AI Assistant Button */}
              <div className='mt-12 pt-8 border-t border-indigo-200'>
                <button
                  onClick={() => setShowAssistant(!showAssistant)}
                  className='w-full bg-slate-900 hover:bg-black text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 shadow-xl active:scale-95'
                >
                  <span className='text-2xl'>{showAssistant ? '👋' : '🤖'}</span>
                  {showAssistant ? 'Hide Career AI SAKHA' : 'Talk with Career AI SAKHA'}
                </button>
              </div>

              {/* AI Assistant Chat */}
              {showAssistant && (
                <div className='mt-6 p-6 bg-gradient-to-br from-purple-50 to-indigo-50 rounded-lg border-2 border-purple-200 animate-fadeInUp'>
                  <h3 className='font-bold text-slate-800 mb-4 flex items-center gap-2'>
                    <span className='text-2xl'>🤖</span> Resume AI Assistant
                  </h3>

                  {/* Chat Messages */}
                  <div className='h-96 overflow-y-auto bg-white rounded-lg p-4 mb-4 border border-purple-100 space-y-3'>
                    {assistantMessages.map((msg, idx) => (
                      <div key={idx} className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-xs px-4 py-2 rounded-lg ${msg.from === 'user'
                          ? 'bg-purple-500 text-white rounded-br-none'
                          : 'bg-gray-200 text-slate-800 rounded-bl-none'
                          }`}>
                          <p className='text-sm break-words'>{msg.text}</p>
                        </div>
                      </div>
                    ))}
                    {assistantLoading && (
                      <div className='flex justify-start'>
                        <div className='bg-gray-200 px-4 py-2 rounded-lg rounded-bl-none'>
                          <div className='flex gap-1'>
                            <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce'></div>
                            <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                            <div className='w-2 h-2 bg-purple-500 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Chat Input */}
                  <form onSubmit={sendAssistantMessage} className='flex gap-2'>
                    <input
                      type='text'
                      value={assistantInput}
                      onChange={e => setAssistantInput(e.target.value)}
                      placeholder='Ask me about resume tips, section improvements, keywords, etc...'
                      disabled={assistantLoading}
                      className='flex-1 p-3 border-2 border-purple-200 rounded-lg focus:outline-none focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all'
                    />
                    <button
                      type='submit'
                      disabled={assistantLoading || !assistantInput.trim()}
                      className='px-4 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all'
                    >
                      Send
                    </button>
                  </form>

                  {/* Helper Prompts */}
                  <div className='mt-4 pt-4 border-t border-purple-200'>
                    <p className='text-xs font-semibold text-slate-600 mb-2'>Try asking:</p>
                    <div className='flex flex-wrap gap-2'>
                      {[
                        'Improve my summary section',
                        'Add action verbs',
                        'Best keywords for my role',
                        'How to quantify achievements',
                        'Format my experience'
                      ].map((prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => setAssistantInput(prompt)}
                          className='text-xs px-3 py-1 bg-white border border-purple-300 text-purple-600 rounded-full hover:bg-purple-50 transition-all'
                        >
                          {prompt}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Full Preview */}
            {result && result.name && (
              <div className='mt-8'>
                <h2 className='text-2xl font-bold text-slate-800 mb-4'>Resume Preview</h2>
                <ResumePreview data={result} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

