'use client'
import { useState, useRef, useEffect } from 'react'
import axios from 'axios'
import ChatBox from '@/components/ChatBox'

export default function MockInterview() {
  const [persona, setPersona] = useState('HR')
  const [interviewMode, setInterviewMode] = useState('textual') // 'textual' or 'ai'
  const [response, setResponse] = useState('')
  const [transcript, setTranscript] = useState(null)
  const [loading, setLoading] = useState(false)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [cameraPermission, setCameraPermission] = useState(null)
  const [micPermission, setMicPermission] = useState(null)
  const [showPermissionDialog, setShowPermissionDialog] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [speechText, setSpeechText] = useState('')
  const [conversationHistory, setConversationHistory] = useState([])
  const [showSummaryPopup, setShowSummaryPopup] = useState(false)

  // Refs for camera and speech recognition
  const videoRef = useRef(null)
  const streamRef = useRef(null)
  const recognitionRef = useRef(null)
  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const canvasRef = useRef(null)

  const personas = [
    { id: 'HR', label: 'HR Round', description: 'Behavioral & soft skills' },
    { id: 'TECH', label: 'Technical Round', description: 'Coding & problem solving' },
    { id: 'MGMT', label: 'Management', description: 'Leadership & strategy' },
  ]

  // Different questions for each round
  const questionsByRound = {
    HR: [
      'Tell me about yourself and your career aspirations.',
      'Why do you want to join our company?',
      'How do you handle stress and conflicts in the workplace?',
      'Tell me about a time you failed and what you learned.',
      'What are your salary expectations?'
    ],
    TECH: [
      'Write code to solve this problem: Find the longest substring without repeating characters.',
      'Explain your approach to debugging complex code.',
      'Design a system architecture for a large-scale application.',
      'What design patterns have you used in your projects?',
      'How do you optimize database queries?'
    ],
    MGMT: [
      'Describe a time you led a team through a challenging project.',
      'How would you handle a conflict between team members?',
      'What is your leadership philosophy?',
      'Tell me about your experience with strategic planning.',
      'How do you mentor and develop your team members?'
    ]
  }

  const currentQuestion = questionsByRound[persona][currentQuestionIndex]

  async function runInterview() {
    if (!response.trim()) return
    setLoading(true)
    try {
      const res = await axios.post('/api/mock-interview', {
        answer: response,
        persona,
        question: currentQuestion
      })
      setTranscript(res.data)
      setConversationHistory(prev => [
        ...prev,
        { type: 'question', text: currentQuestion },
        { type: 'answer', text: response },
        { type: 'feedback', data: res.data }
      ])
    } catch (e) {
      console.error(e)
      setTranscript({
        score: 0,
        levelAssessment: 'Error',
        highlights: ['Please try again'],
        improvements: ['Connection issue - retrying recommended'],
        refinedAnswer: 'Unable to process at this time',
        communicationTips: [],
        nextSteps: ['Reload page and try again'],
        keyMissed: []
      })
      setConversationHistory(prev => [
        ...prev,
        { type: 'question', text: currentQuestion },
        { type: 'answer', text: response }
      ])
    } finally {
      setLoading(false)
    }
  }

  const captureVideoFrame = () => {
    if (videoRef.current && canvasRef.current && videoRef.current.videoWidth > 0) {
      const ctx = canvasRef.current.getContext('2d')

      // Resizing logic for faster AI analysis
      const maxDim = 640;
      let width = videoRef.current.videoWidth;
      let height = videoRef.current.videoHeight;

      if (width > height) {
        if (width > maxDim) {
          height = Math.round((height * maxDim) / width);
          width = maxDim;
        }
      } else {
        if (height > maxDim) {
          width = Math.round((width * maxDim) / height);
          height = maxDim;
        }
      }

      canvasRef.current.width = width;
      canvasRef.current.height = height;
      ctx.drawImage(videoRef.current, 0, 0, width, height);
      return canvasRef.current.toDataURL('image/jpeg', 0.8);
    }
    return null
  }

  const submitLiveInterview = async () => {
    if (!speechText.trim() || speechText === 'Listening...') {
      alert('Please provide your answer. Say something or type it in.')
      return
    }

    setLoading(true)
    try {
      const videoFrame = captureVideoFrame()
      console.log('Capturing frame, size:', videoFrame ? videoFrame.length : 0);

      const res = await axios.post('/api/live-interview-analysis', {
        voiceTranscript: speechText,
        videoFrame: videoFrame,
        persona,
        question: currentQuestion,
        cameraAvailable: !!videoFrame
      })

      setTranscript(res.data)
      setConversationHistory(prev => [
        ...prev,
        { type: 'question', text: currentQuestion },
        { type: 'answer', text: speechText },
        { type: 'feedback', data: res.data, hasVideo: !!videoFrame }
      ])

      setSpeechText('')
    } catch (e) {
      console.error('Submission error details:', e.response?.data || e.message);
      const errorMsg = e.response?.data?.error || e.message || 'unknown error';
      alert(`Error analyzing interview: ${errorMsg}. Please try again.`);
    } finally {
      setLoading(false)
    }
  }

  const handleRequestPermissions = async () => {
    let camerGranted = false
    let micGranted = false

    // Request camera permission
    try {
      const cameraStream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: 'user'
        }
      })
      setCameraPermission(true)
      camerGranted = true

      if (videoRef.current) {
        videoRef.current.srcObject = cameraStream
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.error('Error playing video:', e))
        }
        streamRef.current = cameraStream
      }
    } catch (e) {
      setCameraPermission(false)
      console.error('Camera permission denied:', e)
    }

    // Request microphone permission
    try {
      const micStream = await navigator.mediaDevices.getUserMedia({ audio: true })
      setMicPermission(true)
      micGranted = true

      // Keep mic stream active for recording
      if (streamRef.current && streamRef.current.getVideoTracks().length > 0) {
        const audioTracks = micStream.getAudioTracks()
        audioTracks.forEach(track => streamRef.current.addTrack(track))
      } else {
        streamRef.current = micStream
      }
    } catch (e) {
      setMicPermission(false)
      console.error('Microphone permission denied:', e)
    }

    // Only close dialog if at least one permission was granted
    if (camerGranted || micGranted) {
      setShowPermissionDialog(false)
    }
  }

  const initializeSpeechRecognition = () => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = true
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onstart = () => {
          setSpeechText(prev => prev === '' ? 'Listening...' : prev)
        }

        recognitionRef.current.onresult = (event) => {
          let finalTranscript = ''
          let interimTranscript = ''

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' '
            } else {
              interimTranscript += transcript
            }
          }

          if (finalTranscript) {
            setSpeechText(prev => {
              const updated = (prev.replace(/Listening\.\.\./, '').trim() + ' ' + finalTranscript.trim()).trim()
              return updated
            })
          } else if (interimTranscript && event.results.length > 0) {
            // Show interim results only if we have final content
            setSpeechText(prev => {
              if (prev.includes('Listening')) {
                return interimTranscript
              }
              return prev
            })
          }
        }

        recognitionRef.current.onerror = (event) => {
          console.error('Speech recognition error:', event.error)
          // Don't show error messages to user, just silently retry
          if (event.error === 'network' || event.error === 'no-speech') {
            // Silently handle network errors without showing message
            if (isRecording && recognitionRef.current) {
              try {
                recognitionRef.current.start()
              } catch (e) {
                console.error('Error restarting after network error:', e)
              }
            }
          }
        }

        recognitionRef.current.onend = () => {
          // Auto-restart if recording was not manually stopped
          if (isRecording && recognitionRef.current) {
            try {
              recognitionRef.current.start()
            } catch (e) {
              console.error('Error restarting recognition:', e)
            }
          }
        }
      }
    }
  }

  useEffect(() => {
    initializeSpeechRecognition()
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop())
      }
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])

  // Ensure video plays when it becomes available
  useEffect(() => {
    if (videoRef.current && streamRef.current && cameraPermission) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
      }
      videoRef.current.play().catch(e => {
        console.error('Error auto-playing video:', e)
      })
    }
  }, [cameraPermission, interviewMode])

  // Close permission dialog and show camera when both permissions are checked
  useEffect(() => {
    if (showPermissionDialog && (cameraPermission === true || micPermission === true)) {
      setShowPermissionDialog(false)
    }
  }, [cameraPermission, micPermission, showPermissionDialog])

  const handleStartRecording = () => {
    setIsRecording(true)
    setSpeechText('')
    if (recognitionRef.current) {
      try {
        recognitionRef.current.start()
      } catch (e) {
        console.error('Error starting recognition:', e)
      }
    }
  }

  const handleStopRecording = () => {
    setIsRecording(false)
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questionsByRound[persona].length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
      setResponse('')
      setTranscript(null)
      setSpeechText('')
    }
  }

  const handlePersonaChange = (newPersona) => {
    setPersona(newPersona)
    setCurrentQuestionIndex(0)
    setTranscript(null)
    setResponse('')
    setSpeechText('')
    setConversationHistory([])
    setInterviewMode('textual')
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-[#fff7f7] to-[#fff5f5] py-8'>
      <div className='max-w-5xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-10 animate-fadeInUp'>
          <h1 className='text-4xl font-bold mb-2 text-slate-800'>
            <span className='gradient-text'>Mock Interview</span>
          </h1>
          <p className='text-slate-600'>Practice interviews with AI and get instant feedback on your performance</p>
        </div>

        <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
          {/* Sidebar - Persona Selection (Hidden in Live AI Interview) */}
          {interviewMode !== 'ai' && (
            <div className='lg:col-span-1'>
              <div className='card-gradient rounded-2xl p-6 sticky top-24'>
                <h2 className='font-bold text-slate-800 mb-4'>Choose Persona</h2>
                <div className='space-y-3'>
                  {personas.map(p => (
                    <button
                      key={p.id}
                      onClick={() => handlePersonaChange(p.id)}
                      className={`w-full p-4 rounded-lg transition-all duration-300 text-left border-2 ${persona === p.id
                        ? 'border-primary bg-blue-50'
                        : 'border-blue-200 hover:border-blue-300'
                        }`}
                    >
                      <p className='font-semibold text-slate-800 text-sm'>{p.label}</p>
                      <p className='text-xs text-slate-600 mt-1'>{p.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Main Interview Area */}
          <div className={`${interviewMode === 'ai' ? 'lg:col-span-4' : 'lg:col-span-3'} space-y-6`}>
            {/* Interview Mode Toggle */}
            <div className='card-gradient rounded-2xl p-6 shadow-lg animate-slideInRight'>
              <div className='flex items-center justify-between'>
                <h3 className='font-bold text-slate-800'>Interview Mode</h3>
                <div className='flex gap-2 bg-slate-100 p-1 rounded-lg'>
                  <button
                    onClick={() => setInterviewMode('textual')}
                    className={`px-4 py-2 rounded font-semibold text-sm transition-all ${interviewMode === 'textual'
                      ? 'bg-white text-primary shadow'
                      : 'text-slate-600 hover:text-slate-800'
                      }`}
                  >
                    Textual
                  </button>
                  <button
                    onClick={() => {
                      setInterviewMode('ai')
                      setShowPermissionDialog(true)
                    }}
                    className={`px-4 py-2 rounded font-semibold text-sm transition-all ${interviewMode === 'ai'
                      ? 'bg-white text-primary shadow'
                      : 'text-slate-600 hover:text-slate-800'
                      }`}
                  >
                    Live AI Interview
                  </button>
                </div>
              </div>
            </div>

            {/* Permission Dialog for AI Interview */}
            {interviewMode === 'ai' && showPermissionDialog && (
              <div className='card-gradient rounded-2xl p-8 shadow-lg animate-slideInRight border-2 border-primary'>
                <div className='mb-6'>
                  <h3 className='text-xl font-bold text-slate-800 mb-4'>🎥 Camera & 🎙️ Microphone Access</h3>
                  <p className='text-slate-600 mb-6'>We need access to your camera and microphone for the live AI interview. Please allow both permissions for the best experience, or just microphone for audio-only mode.</p>
                </div>

                <div className='space-y-4 mb-8'>
                  <div className='flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-300'>
                    <div>
                      <p className='font-semibold text-slate-800'>🎥 Camera</p>
                      <p className='text-xs text-slate-600'>For video recording and posture feedback</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${cameraPermission === true ? 'bg-green-100 text-green-800' :
                      cameraPermission === false ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {cameraPermission === true ? '✓ Granted' : cameraPermission === false ? '✗ Denied' : 'Click to Request'}
                    </span>
                  </div>

                  <div className='flex items-center justify-between p-4 bg-blue-50 rounded-lg border-2 border-blue-300'>
                    <div>
                      <p className='font-semibold text-slate-800'>🎙️ Microphone</p>
                      <p className='text-xs text-slate-600'>For audio recording and voice analysis</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${micPermission === true ? 'bg-green-100 text-green-800' :
                      micPermission === false ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                      {micPermission === true ? '✓ Granted' : micPermission === false ? '✗ Denied' : 'Click to Request'}
                    </span>
                  </div>
                </div>

                <div className='flex gap-3'>
                  <button
                    onClick={handleRequestPermissions}
                    className='flex-1 btn-primary py-3 rounded-lg font-semibold hover:shadow-lg transition-all'
                  >
                    ✓ Grant Permissions
                  </button>
                  <button
                    onClick={() => setInterviewMode('textual')}
                    className='flex-1 bg-slate-200 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-300 transition-all'
                  >
                    Use Textual Mode
                  </button>
                </div>
              </div>
            )}

            {/* Interview Card - Only show Textual Mode */}
            {interviewMode === 'textual' && (
              <div className='card-gradient rounded-2xl p-8 shadow-lg animate-slideInRight'>
                {/* Interviewer Section */}
                <div className='mb-8 pb-8 border-b border-indigo-200'>
                  <div className='flex items-start gap-4 mb-4'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl animate-bounce'>
                      AI
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-bold text-slate-800'>AI Interviewer</h3>
                      <p className='text-sm text-slate-600'>Question {currentQuestionIndex + 1} of {questionsByRound[persona].length}</p>
                    </div>
                  </div>
                  <div className='bg-gradient-to-r from-white to-[#fff7f7] rounded-lg p-4 border border-red-100'>
                    <p className='text-slate-800'>{currentQuestion}</p>
                  </div>
                </div>

                {/* Response Input */}
                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-slate-700 mb-3'>Your Answer</label>
                  <textarea
                    value={response}
                    onChange={e => setResponse(e.target.value)}
                    rows={5}
                    className='w-full px-4 py-3 border-2 border-red-200 rounded-lg focus:outline-none focus:border-red-500 focus:ring-2 focus:ring-red-200 transition-all duration-300 placeholder-slate-400 resize-none'
                    placeholder='Type your response here... (Be genuine and detailed)'
                    disabled={loading}
                  />
                  <div className='mt-2 flex justify-between items-center'>
                    <p className='text-xs text-slate-500'>{response.length} characters</p>
                    <button
                      onClick={runInterview}
                      disabled={loading || !response.trim()}
                      className='btn-primary px-6 py-2 rounded-lg font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed'
                    >
                      {loading ? 'Evaluating...' : 'Submit Answer'}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* AI Interview Mode Content */}
            {interviewMode === 'ai' && (cameraPermission || micPermission) && (
              <div className='card-gradient rounded-2xl p-8 shadow-lg animate-slideInRight'>
                {/* Interviewer Section */}
                <div className='mb-8 pb-8 border-b border-indigo-200'>
                  <div className='flex items-start gap-4 mb-4'>
                    <div className='w-12 h-12 rounded-full bg-gradient-to-br from-primary to-primary-dark flex items-center justify-center text-white font-bold text-xl animate-bounce'>
                      AI
                    </div>
                    <div className='flex-1'>
                      <h3 className='font-bold text-slate-800'>Live AI Interviewer</h3>
                      <p className='text-sm text-slate-600'>Question {currentQuestionIndex + 1} of {questionsByRound[persona].length}</p>
                    </div>
                  </div>
                  <div className='bg-gradient-to-r from-white to-[#fff7f7] rounded-lg p-4 border border-red-100'>
                    <p className='text-slate-800'>{currentQuestion}</p>
                  </div>
                </div>

                {/* Video/Audio Preview Box */}
                <div className='mb-6 p-6 bg-slate-900 rounded-lg border-4 border-red-500 min-h-96 flex items-center justify-center overflow-hidden relative shadow-2xl'>
                  {cameraPermission ? (
                    <div className='w-full h-full relative'>
                      <video
                        ref={videoRef}
                        autoPlay
                        playsInline
                        muted
                        className='w-full h-full object-cover rounded-lg'
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      <div className='absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded-full text-sm font-bold flex items-center gap-2 shadow-lg'>
                        <span className='animate-pulse'>●</span> Recording Live
                      </div>
                      <canvas ref={canvasRef} style={{ display: 'none' }} />
                    </div>
                  ) : (
                    <div className='text-center py-20'>
                      <p className='text-white text-2xl font-bold mb-4'>🎤 Microphone Ready</p>
                      <p className='text-slate-300 text-base'>Audio-only interview mode</p>
                      <p className='text-slate-400 text-sm mt-4'>Your voice will be analyzed for tone and clarity</p>
                    </div>
                  )}
                </div>

                {/* Speech-to-Text Box */}
                <div className='mb-6'>
                  <label className='block text-sm font-semibold text-slate-700 mb-3'>Speech Recognition - Live Transcription</label>
                  <div className='w-full px-4 py-4 border-2 border-indigo-200 rounded-lg bg-white min-h-24 max-h-40 overflow-y-auto'>
                    {isRecording ? (
                      <div>
                        <p className='text-slate-800 mb-2'>{speechText || 'Listening...'}</p>
                        <div className='flex gap-1 items-center'>
                          <span className='text-slate-500 text-xs'>🎙️</span>
                          <div className='flex gap-1'>
                            <div className='w-1 h-3 bg-red-500 rounded-full animate-bounce'></div>
                            <div className='w-1 h-3 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '0.1s' }}></div>
                            <div className='w-1 h-3 bg-red-500 rounded-full animate-bounce' style={{ animationDelay: '0.2s' }}></div>
                          </div>
                        </div>
                      </div>
                    ) : speechText ? (
                      <p className='text-slate-800'>{speechText}</p>
                    ) : (
                      <p className='text-slate-500 text-sm italic'>Your speech will be transcribed here as you speak...</p>
                    )}
                  </div>
                </div>

                {/* Recording Controls - Unified Video + Voice */}
                <div className='flex gap-3 mb-6'>
                  <button
                    onClick={handleStartRecording}
                    disabled={isRecording}
                    className='flex-1 bg-gradient-to-r from-red-500 to-red-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:from-red-600 hover:to-red-700 transition-all shadow-lg flex items-center justify-center gap-2'
                  >
                    <span className='text-xl'>🎥</span>
                    <span>Start Recording (Video + Voice)</span>
                  </button>
                  <button
                    onClick={handleStopRecording}
                    disabled={!isRecording}
                    className='flex-1 bg-slate-600 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-700 transition-all shadow-lg flex items-center justify-center gap-2'
                  >
                    <span className='text-xl'>⏹️</span>
                    <span>Stop Recording</span>
                  </button>
                </div>

                {/* Submit Live Interview with Analysis */}
                <div className='flex gap-3 mb-6'>
                  <button
                    onClick={submitLiveInterview}
                    disabled={!speechText.trim() || loading}
                    className='flex-1 btn-primary py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2'
                  >
                    {loading ? (
                      <>
                        <span className='animate-spin'>⚙️</span>
                        <span>Analyzing...</span>
                      </>
                    ) : (
                      <>
                        <span>📊</span>
                        <span>Submit & Get AI Feedback</span>
                      </>
                    )}
                  </button>
                  <button
                    onClick={handleNextQuestion}
                    disabled={!transcript}
                    className='flex-1 bg-slate-500 text-white py-3 rounded-lg font-semibold disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-600 transition-all flex items-center justify-center gap-2'
                  >
                    <span>➡️</span>
                    <span>{currentQuestionIndex < questionsByRound[persona].length - 1 ? 'Next Question' : 'Complete'}</span>
                  </button>
                </div>
              </div>
            )}

            {/* Feedback Section - AI Interview Mode with Video + Voice Analysis */}
            {interviewMode === 'ai' && transcript && (
              <div className='card-gradient rounded-2xl p-8 shadow-lg animate-fadeInUp'>
                <h2 className='text-2xl font-bold text-slate-800 mb-6'>Live Interview Feedback - {persona} Round</h2>

                {/* Level Assessment */}
                <div className='mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg'>
                  <p className='text-sm text-slate-600'>Performance Level</p>
                  <p className='text-3xl font-bold text-blue-600'>{transcript.levelAssessment || 'Good'}</p>
                </div>

                {/* Score */}
                <div className='mb-8'>
                  <div className='flex items-end gap-6 mb-4'>
                    <div className='flex items-center'>
                      <div className='relative w-32 h-32'>
                        <svg className='w-full h-full transform -rotate-90' style={{ filter: 'drop-shadow(0 0 10px rgba(248,113,113,0.16))' }}>
                          <circle cx='64' cy='64' r='56' fill='none' stroke='#e5e7eb' strokeWidth='4' />
                          <circle
                            cx='64' cy='64' r='56' fill='none' stroke='url(#gradient)' strokeWidth='4'
                            strokeDasharray={`${(transcript.score || 0) * 351.68 / 100} 351.68`}
                            strokeLinecap='round'
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                          />
                          <defs>
                            <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                              <stop offset='0%' stopColor='#f87171' />
                              <stop offset='100%' stopColor='#ef4444' />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='text-center'>
                            <p className='text-3xl font-bold text-red-600'>{transcript.score || 0}</p>
                            <p className='text-xs text-slate-600'>/100</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className='flex-1'>
                      <p className='text-slate-700 font-semibold text-lg'>Overall Performance</p>
                      <p className='text-sm text-slate-600 mt-2'>
                        {(transcript.score || 0) >= 85 ? '🌟 Excellent performance! You demonstrated strong communication and presence.' : (transcript.score || 0) >= 75 ? '👍 Good job! Keep refining your responses.' : (transcript.score || 0) >= 65 ? '📈 Satisfactory - There is room for improvement.' : '💪 Keep practicing! Focus on the areas below.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Voice Tone Analysis */}
                {transcript.voiceToneFeedback && transcript.voiceToneFeedback !== 'N/A' && (
                  <div className='mb-8 pb-8 border-b border-purple-100'>
                    <h3 className='font-bold text-slate-800 mb-4'>🎙️ Voice & Tone Analysis</h3>
                    <div className='bg-purple-50 border border-purple-200 rounded-lg p-4'>
                      <p className='text-slate-700 text-sm leading-relaxed'>{transcript.voiceToneFeedback}</p>
                    </div>
                  </div>
                )}

                {/* Body Language Feedback */}
                {transcript.bodyLanguageFeedback && transcript.bodyLanguageFeedback !== 'N/A' && (
                  <div className='mb-8 pb-8 border-b border-indigo-100'>
                    <h3 className='font-bold text-slate-800 mb-4'>💪 Body Language & Presence</h3>
                    <div className='bg-indigo-50 border border-indigo-200 rounded-lg p-4'>
                      <p className='text-slate-700 text-sm leading-relaxed'>{transcript.bodyLanguageFeedback}</p>
                    </div>

                    {/* Video Analysis Details */}
                    {transcript.videoAnalysis && (
                      <div className='mt-4 grid grid-cols-2 gap-3'>
                        {transcript.videoAnalysis.confidence && (
                          <div className='bg-white p-3 rounded border border-indigo-100'>
                            <p className='text-xs font-semibold text-slate-600 mb-1'>Confidence Level</p>
                            <p className='text-sm text-indigo-600 font-bold'>{transcript.videoAnalysis.confidence}</p>
                          </div>
                        )}
                        {transcript.videoAnalysis.eyeContact && (
                          <div className='bg-white p-3 rounded border border-indigo-100'>
                            <p className='text-xs font-semibold text-slate-600 mb-1'>Eye Contact</p>
                            <p className='text-sm text-indigo-600 font-bold'>{transcript.videoAnalysis.eyeContact}</p>
                          </div>
                        )}
                        {transcript.videoAnalysis.posture && (
                          <div className='bg-white p-3 rounded border border-indigo-100'>
                            <p className='text-xs font-semibold text-slate-600 mb-1'>Posture</p>
                            <p className='text-sm text-indigo-600 font-bold'>{transcript.videoAnalysis.posture}</p>
                          </div>
                        )}
                        {transcript.videoAnalysis.overallPresence && (
                          <div className='bg-white p-3 rounded border border-indigo-100'>
                            <p className='text-xs font-semibold text-slate-600 mb-1'>Overall Presence</p>
                            <p className='text-sm text-indigo-600 font-bold'>{transcript.videoAnalysis.overallPresence}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Highlights */}
                <div className='mb-8 pb-8 border-b border-red-100'>
                  <h3 className='font-bold text-slate-800 mb-4'>✅ What You Did Well</h3>
                  <div className='space-y-2'>
                    {transcript.highlights?.map((h, i) => (
                      <div key={i} className='flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeInUp'>
                        <span className='text-green-600 text-lg'>•</span>
                        <span className='text-slate-700 text-sm'>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                {transcript.improvements && transcript.improvements.length > 0 && (
                  <div className='mb-8 pb-8 border-b border-yellow-100'>
                    <h3 className='font-bold text-slate-800 mb-4'>📈 Areas to Improve</h3>
                    <div className='space-y-2'>
                      {transcript.improvements.map((imp, i) => (
                        <div key={i} className='flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                          <span className='text-yellow-600 text-lg'>•</span>
                          <span className='text-slate-700 text-sm'>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Points Missed */}
                {transcript.keyMissed && transcript.keyMissed.length > 0 && (
                  <div className='mb-8 pb-8 border-b border-orange-100'>
                    <h3 className='font-bold text-slate-800 mb-4'>🎯 Key Points Missed</h3>
                    <div className='space-y-2'>
                      {transcript.keyMissed.map((key, i) => (
                        <div key={i} className='flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                          <span className='text-orange-600 text-lg'>•</span>
                          <span className='text-slate-700 text-sm'>{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refined Answer */}
                <div className='mb-8'>
                  <h3 className='font-bold text-slate-800 mb-4'>💡 Refined / Enhanced Answer</h3>
                  <div className='bg-gradient-to-r from-white to-[#fff7f7] rounded-lg p-4 border border-red-100'>
                    <p className='text-slate-700 text-sm leading-relaxed whitespace-pre-wrap'>{transcript.refinedAnswer}</p>
                  </div>
                </div>

                {/* Communication Tips */}
                {transcript.communicationTips && transcript.communicationTips.length > 0 && (
                  <div className='mb-8'>
                    <h3 className='font-bold text-slate-800 mb-4'>🗣️ Communication Tips</h3>
                    <div className='space-y-2'>
                      {transcript.communicationTips.map((tip, i) => (
                        <div key={i} className='flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                          <span className='text-blue-600 text-lg'>•</span>
                          <span className='text-slate-700 text-sm'>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {transcript.nextSteps && transcript.nextSteps.length > 0 && (
                  <div className='mb-8'>
                    <h3 className='font-bold text-slate-800 mb-4'>🚀 Next Steps for Improvement</h3>
                    <div className='space-y-2'>
                      {transcript.nextSteps.map((step, i) => (
                        <div key={i} className='flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg'>
                          <span className='text-purple-600 text-lg font-bold'>{i + 1}.</span>
                          <span className='text-slate-700 text-sm'>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Navigation Buttons */}
                <div className='flex gap-3'>
                  <button
                    onClick={handleNextQuestion}
                    className='flex-1 btn-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 animate-pulse-glow'
                  >
                    <span>{currentQuestionIndex < questionsByRound[persona].length - 1 ? '➡️ Next Question' : '🎉 Interview Complete'}</span>
                  </button>
                  <button
                    onClick={() => {
                      setTranscript(null)
                      setSpeechText('')
                      setIsRecording(false)
                    }}
                    className='flex-1 bg-slate-300 text-slate-800 py-3 rounded-lg font-semibold hover:bg-slate-400 transition-all'
                  >
                    🔄 Retry This Question
                  </button>
                </div>
              </div>
            )}
            {interviewMode === 'textual' && transcript && (
              <div className='card-gradient rounded-2xl p-8 shadow-lg animate-fadeInUp'>
                <h2 className='text-2xl font-bold text-slate-800 mb-6'>Your Feedback - {persona} Round</h2>

                {/* Level Assessment */}
                <div className='mb-8 p-4 bg-blue-50 border-2 border-blue-200 rounded-lg'>
                  <p className='text-sm text-slate-600'>Performance Level</p>
                  <p className='text-2xl font-bold text-blue-600'>{transcript.levelAssessment || 'Good'}</p>
                </div>

                {/* Score */}
                <div className='mb-8'>
                  <div className='flex items-end gap-4 mb-4'>
                    <div className='flex items-center'>
                      <div className='relative w-24 h-24'>
                        <svg className='w-full h-full transform -rotate-90' style={{ filter: 'drop-shadow(0 0 10px rgba(248,113,113,0.16))' }}>
                          <circle cx='48' cy='48' r='40' fill='none' stroke='#e5e7eb' strokeWidth='4' />
                          <circle
                            cx='48' cy='48' r='40' fill='none' stroke='url(#gradient)' strokeWidth='4'
                            strokeDasharray={`${(transcript.score || 0) * 251.2 / 100} 251.2`}
                            strokeLinecap='round'
                            style={{ transition: 'stroke-dasharray 0.5s ease' }}
                          />
                          <defs>
                            <linearGradient id='gradient' x1='0%' y1='0%' x2='100%' y2='100%'>
                              <stop offset='0%' stopColor='#f87171' />
                              <stop offset='100%' stopColor='#ef4444' />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <div className='text-center'>
                            <p className='text-2xl font-bold text-red-600'>{transcript.score || 0}</p>
                            <p className='text-xs text-slate-600'>/100</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div>
                      <p className='text-slate-700 font-semibold'>Performance Score</p>
                      <p className='text-sm text-slate-600 mt-1'>
                        {(transcript.score || 0) >= 80 ? 'Excellent performance!' : (transcript.score || 0) >= 70 ? 'Good effort!' : (transcript.score || 0) >= 60 ? 'Satisfactory, room for improvement' : 'Needs more preparation'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Highlights */}
                <div className='mb-8 pb-8 border-b border-red-100'>
                  <h3 className='font-bold text-slate-800 mb-4'>✅ What You Did Well</h3>
                  <div className='space-y-2'>
                    {transcript.highlights?.map((h, i) => (
                      <div key={i} className='flex items-start gap-3 p-3 bg-green-50 border border-green-200 rounded-lg animate-fadeInUp'>
                        <span className='text-green-600 text-lg'>•</span>
                        <span className='text-slate-700 text-sm'>{h}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Improvements */}
                {transcript.improvements && transcript.improvements.length > 0 && (
                  <div className='mb-8 pb-8 border-b border-yellow-100'>
                    <h3 className='font-bold text-slate-800 mb-4'>📈 Areas to Improve</h3>
                    <div className='space-y-2'>
                      {transcript.improvements.map((imp, i) => (
                        <div key={i} className='flex items-start gap-3 p-3 bg-yellow-50 border border-yellow-200 rounded-lg'>
                          <span className='text-yellow-600 text-lg'>•</span>
                          <span className='text-slate-700 text-sm'>{imp}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Key Points Missed */}
                {transcript.keyMissed && transcript.keyMissed.length > 0 && (
                  <div className='mb-8 pb-8 border-b border-orange-100'>
                    <h3 className='font-bold text-slate-800 mb-4'>🎯 Key Points Missed</h3>
                    <div className='space-y-2'>
                      {transcript.keyMissed.map((key, i) => (
                        <div key={i} className='flex items-start gap-3 p-3 bg-orange-50 border border-orange-200 rounded-lg'>
                          <span className='text-orange-600 text-lg'>•</span>
                          <span className='text-slate-700 text-sm'>{key}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Refined Answer */}
                <div className='mb-8'>
                  <h3 className='font-bold text-slate-800 mb-4'>💡 Refined / Enhanced Answer</h3>
                  <div className='bg-gradient-to-r from-white to-[#fff7f7] rounded-lg p-4 border border-red-100'>
                    <p className='text-slate-700 text-sm leading-relaxed whitespace-pre-wrap'>{transcript.refinedAnswer}</p>
                  </div>
                </div>

                {/* Communication Tips */}
                {transcript.communicationTips && transcript.communicationTips.length > 0 && (
                  <div className='mb-8'>
                    <h3 className='font-bold text-slate-800 mb-4'>🗣️ Communication Tips</h3>
                    <div className='space-y-2'>
                      {transcript.communicationTips.map((tip, i) => (
                        <div key={i} className='flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg'>
                          <span className='text-blue-600 text-lg'>•</span>
                          <span className='text-slate-700 text-sm'>{tip}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Steps */}
                {transcript.nextSteps && transcript.nextSteps.length > 0 && (
                  <div className='mb-8'>
                    <h3 className='font-bold text-slate-800 mb-4'>🚀 Next Steps</h3>
                    <div className='space-y-2'>
                      {transcript.nextSteps.map((step, i) => (
                        <div key={i} className='flex items-start gap-3 p-3 bg-purple-50 border border-purple-200 rounded-lg'>
                          <span className='text-purple-600 text-lg'>{i + 1}.</span>
                          <span className='text-slate-700 text-sm'>{step}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Next Action */}
                <button
                  onClick={handleNextQuestion}
                  className='w-full btn-primary py-3 rounded-lg font-semibold flex items-center justify-center gap-2 animate-pulse-glow'
                >
                  <span>{currentQuestionIndex < questionsByRound[persona].length - 1 ? '➡️ Next Question' : '🎉 Interview Complete'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Summary Popup - AI Interview Mode */}
        {showSummaryPopup && (
          <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeInUp'>
            <div className='card-gradient rounded-2xl p-8 shadow-2xl max-w-2xl w-full max-h-96 overflow-y-auto'>
              <div className='flex items-center justify-between mb-6'>
                <h2 className='text-2xl font-bold text-slate-800'>Interview Summary</h2>
                <button
                  onClick={() => setShowSummaryPopup(false)}
                  className='text-2xl text-slate-400 hover:text-slate-600 cursor-pointer'
                >
                  ✕
                </button>
              </div>

              <div className='space-y-4 mb-6'>
                {conversationHistory.length > 0 ? (
                  conversationHistory.map((item, idx) => (
                    <div key={idx} className={`p-4 rounded-lg ${item.type === 'question'
                      ? 'bg-blue-50 border border-blue-200'
                      : 'bg-green-50 border border-green-200'
                      }`}>
                      <p className='text-xs font-semibold text-slate-600 mb-1'>
                        {item.type === 'question' ? '❓ Question' : '✅ Your Answer'}
                      </p>
                      <p className='text-slate-800'>{item.text}</p>
                    </div>
                  ))
                ) : (
                  <p className='text-slate-600 text-center py-4'>No conversation history yet. Start the interview to see the summary.</p>
                )}
              </div>

              {conversationHistory.length > 0 && (
                <div className='bg-slate-50 p-4 rounded-lg border border-slate-200 mb-6'>
                  <h3 className='font-bold text-slate-800 mb-3'>AI Summary</h3>
                  <p className='text-slate-700 text-sm leading-relaxed'>
                    You demonstrated good communication skills in this round. Consider adding more specific examples and metrics to strengthen your responses. Overall performance was solid with room for improvement in depth of answers.
                  </p>
                </div>
              )}

              <button
                onClick={() => setShowSummaryPopup(false)}
                className='w-full btn-primary py-2 rounded-lg font-semibold'
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

