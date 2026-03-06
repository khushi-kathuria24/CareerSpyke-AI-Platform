"use client"
import { useState } from 'react'
import DashboardCard from '../../components/DashboardCard'
import ChatBox from '@/components/ChatBox'
import axios from 'axios'

export default function Dashboard() {
  const [openChat, setOpenChat] = useState(false)
  const [expandedChat, setExpandedChat] = useState(false)
  const [selectedDialog, setSelectedDialog] = useState(null)
  const [selectedCourses, setSelectedCourses] = useState([])
  const [selectedInterviewType, setSelectedInterviewType] = useState(null)
  const [selectedSkills, setSelectedSkills] = useState([])
  const [savedCourses, setSavedCourses] = useState([])
  const [savedSkills, setSavedSkills] = useState([])
  const [friendSearchQuery, setFriendSearchQuery] = useState('')
  const [showFriendList, setShowFriendList] = useState(false)
  const [showCodeCompiler, setShowCodeCompiler] = useState(false)
  const [code, setCode] = useState('')
  const [language, setLanguage] = useState('javascript')
  const [codeOutput, setCodeOutput] = useState(null)
  const [isRunning, setIsRunning] = useState(false)

  // Courses list with details
  const coursesList = [
    { code: 'MAT101', name: 'Calculus' },
    { code: 'CS111', name: 'Python' },
    { code: 'MGT100', name: 'Management' },
    { code: 'EL102', name: 'Digital Logic Circuit' },
    { code: 'PHY201', name: 'Physics' },
    { code: 'ENG102', name: 'Communication Skills' },
    { code: 'CHEM102', name: 'Chemistry' },
    { code: 'BIO103', name: 'Bioinformatics' }
  ]

  // Interview history data
  const interviewHistory = {
    ai: [
      { id: 1, date: '2024-11-10', duration: '45 mins', score: 7.5, feedback: 'Good communication skills' },
      { id: 2, date: '2024-11-05', duration: '30 mins', score: 6.8, feedback: 'Work on technical depth' },
      { id: 3, date: '2024-10-28', duration: '50 mins', score: 8.2, feedback: 'Excellent problem solving' },
    ],
    expert: [
      { id: 1, date: '2024-11-08', interviewer: 'John Smith', role: 'Tech Lead', feedback: 'Strong foundation' },
      { id: 2, date: '2024-10-20', interviewer: 'Sarah Johnson', role: 'HR Manager', feedback: 'Great fit for role' },
    ]
  }

  // Friends data
  const friendsList = [
    { id: 1, name: 'Alex Kumar', role: 'Software Engineer', skills: ['Python', 'React', 'SQL'], avatar: '👨‍💼' },
    { id: 2, name: 'Emma Wilson', role: 'Data Scientist', skills: ['Python', 'ML', 'R'], avatar: '👩‍💼' },
    { id: 3, name: 'Michael Chen', role: 'DevOps Engineer', skills: ['Kubernetes', 'Docker', 'AWS'], avatar: '👨‍💼' },
    { id: 4, name: 'Lisa Rodriguez', role: 'Product Manager', skills: ['Product Design', 'Analytics'], avatar: '👩‍💼' },
  ]

  // Skills list
  const skillsList = ['Python Programming', 'SQL', 'MongoDB', 'MATLAB', 'Machine Learning', 'SRE', 'Docker', 'AWS', 'JavaScript', 'React', 'Node.js', 'Git']

  const toggleCourse = (courseCode) => {
    setSelectedCourses(prev =>
      prev.includes(courseCode) ? prev.filter(c => c !== courseCode) : [...prev, courseCode]
    )
  }

  const toggleSkill = (skill) => {
    setSelectedSkills(prev =>
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    )
  }

  const saveCourses = () => {
    if (selectedCourses.length > 0) {
      setSavedCourses(selectedCourses)
      setSelectedCourses([])
      setSelectedDialog(null)
    }
  }

  const saveSkills = () => {
    setSavedSkills(selectedSkills)
    setSelectedSkills([])
    setSelectedDialog(null)
  }

  const removeCourse = (course) => {
    setSavedCourses(prev => prev.filter(c => c !== course))
  }

  const filteredFriends = friendsList.filter(friend =>
    friend.name.toLowerCase().includes(friendSearchQuery.toLowerCase()) ||
    friend.role.toLowerCase().includes(friendSearchQuery.toLowerCase())
  )

  const closeDialog = () => {
    setSelectedDialog(null)
    setSelectedCourses([])
    setSelectedInterviewType(null)
    setShowFriendList(false)
  }

  const handleRunCode = async () => {
    if (!code.trim()) return
    setIsRunning(true)
    setCodeOutput(null)

    try {
      const res = await axios.post('/api/code-compiler', {
        code,
        language,
        action: 'run'
      })

      setCodeOutput({
        status: res.data.status || 'success',
        result: res.data.result || 'Execution Complete',
        message: res.data.message
      })
    } catch (error) {
      console.error(error)
      setCodeOutput({
        status: 'error',
        result: 'Compilation Error',
        message: 'The compilation engine is currently busy. Please try again in a few seconds.'
      })
    } finally {
      setIsRunning(false)
    }
  }

  const handleCheckResult = async () => {
    if (!code.trim()) return
    setIsRunning(true) // Re-use isRunning for loading state
    setCodeOutput(null)

    try {
      const res = await axios.post('/api/code-compiler', {
        code,
        language,
        action: 'check'
      })

      setCodeOutput({
        status: res.data.status || 'success',
        result: res.data.result || 'Analysis Complete',
        message: res.data.message
      })
    } catch (error) {
      console.error(error)
      setCodeOutput({
        status: 'error',
        result: 'Verification Failed',
        message: 'Could not connect to the logic verification engine. Please check your internet connection.'
      })
    } finally {
      setIsRunning(false)
    }
  }

  // Dialog overlay
  const DialogOverlay = ({ onClose, children }) => (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4'>
      <div className='bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[80vh] overflow-y-auto animate-slideInUp'>
        <div className='sticky top-0 bg-white border-b border-slate-200 p-6 flex justify-between items-center'>
          <h2 className='text-2xl font-bold text-slate-800'>{children[0]}</h2>
          <button onClick={onClose} className='text-2xl text-slate-600 hover:text-slate-800'>✕</button>
        </div>
        <div className='p-6'>
          {children[1]}
        </div>
      </div>
    </div>
  )

  return (
    <div className='min-h-screen bg-gradient-to-br from-white via-[#fff7f7] to-[#fff5f5] py-8'>
      <div className='max-w-7xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-12 animate-fadeInUp'>
          <h1 className='text-4xl font-bold mb-2 text-slate-800'>
            <span className='gradient-text'>Your Dashboard</span>
          </h1>
          <p className='text-slate-600'>Welcome back! Here's what you can do today.</p>
        </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-4 gap-4 mb-8'>
          {[
            { icon: '📚', label: 'Courses', value: savedCourses.length, key: 'courses' },
            { icon: '🎯', label: 'Interviews', value: '5', key: 'interviews' },
            { icon: '👥', label: 'Connections', value: '4', key: 'connections' },
            { icon: '📊', label: 'Skills', value: savedSkills.length, key: 'skills' },
          ].map((stat, idx) => (
            <div
              key={idx}
              onClick={() => setSelectedDialog(stat.key)}
              className='card-gradient rounded-xl p-6 text-center animate-fadeInUp cursor-pointer hover:shadow-lg hover:scale-105 transition-all duration-200'
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              <div className='text-3xl mb-2'>{stat.icon}</div>
              <p className='text-slate-600 text-sm'>{stat.label}</p>
              <p className='text-2xl font-bold text-red-600'>{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Dialogs */}

        {/* Courses Dialog */}
        {selectedDialog === 'courses' && (
          <DialogOverlay onClose={closeDialog}>
            <span>📚 Select Courses</span>
            <div className='space-y-3'>
              {coursesList.map(course => (
                <label key={course.code} className='flex items-center p-4 border-2 border-slate-200 rounded-lg cursor-pointer hover:border-orange-500 hover:bg-orange-50 transition-all'>
                  <input
                    type='checkbox'
                    checked={selectedCourses.includes(course.code)}
                    onChange={() => toggleCourse(course.code)}
                    className='w-5 h-5 cursor-pointer'
                  />
                  <div className='ml-3'>
                    <p className='font-semibold text-slate-800'>{course.code}</p>
                    <p className='text-sm text-slate-600'>{course.name}</p>
                  </div>
                </label>
              ))}
              {selectedCourses.length > 0 && (
                <div className='mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg'>
                  <p className='text-green-700 font-semibold'>✓ Selected {selectedCourses.length} course(s)</p>
                  <p className='text-sm text-green-600'>{selectedCourses.join(', ')}</p>
                </div>
              )}
              <button
                onClick={saveCourses}
                disabled={selectedCourses.length === 0}
                className='w-full mt-4 p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors'
              >
                Save Courses
              </button>
            </div>
          </DialogOverlay>
        )}

        {/* Interviews Dialog */}
        {selectedDialog === 'interviews' && (
          <DialogOverlay onClose={closeDialog}>
            <span>🎯 Interview History</span>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                {[
                  { type: 'ai', title: '🤖 AI Interviews', count: interviewHistory.ai.length },
                  { type: 'expert', title: '👨‍💼 Expert Interviews', count: interviewHistory.expert.length }
                ].map(option => (
                  <button
                    key={option.type}
                    onClick={() => setSelectedInterviewType(option.type)}
                    className={`p-4 rounded-lg border-2 transition-all ${selectedInterviewType === option.type
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-slate-200 hover:border-orange-300'
                      }`}
                  >
                    <div className='text-2xl mb-2'>{option.title.split(' ')[0]}</div>
                    <p className='font-semibold text-slate-700'>{option.title.split(' ').slice(1).join(' ')}</p>
                    <p className='text-sm text-slate-600'>{option.count} interviews</p>
                  </button>
                ))}
              </div>

              {selectedInterviewType && (
                <div className='space-y-3 mt-6'>
                  <h3 className='font-bold text-lg text-slate-800'>Interview History</h3>
                  {selectedInterviewType === 'ai' ? (
                    interviewHistory.ai.map((interview, idx) => (
                      <div key={idx} className='p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow'>
                        <div className='flex justify-between items-start'>
                          <div>
                            <p className='font-semibold text-slate-800'>📅 {interview.date}</p>
                            <p className='text-sm text-slate-600'>Duration: {interview.duration}</p>
                            <p className='text-sm text-slate-600 mt-1'>Score: <span className='font-bold text-orange-600'>{interview.score}/10</span></p>
                            <p className='text-sm text-slate-700 mt-2'>💬 {interview.feedback}</p>
                          </div>
                        </div>
                      </div>
                    ))
                  ) : (
                    interviewHistory.expert.map((interview, idx) => (
                      <div key={idx} className='p-4 border border-slate-200 rounded-lg hover:shadow-md transition-shadow'>
                        <div>
                          <p className='font-semibold text-slate-800'>📅 {interview.date}</p>
                          <p className='text-sm text-slate-600'>Interviewer: <span className='font-semibold'>{interview.interviewer}</span></p>
                          <p className='text-sm text-slate-600'>Role: {interview.role}</p>
                          <p className='text-sm text-slate-700 mt-2'>💬 {interview.feedback}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </DialogOverlay>
        )}

        {/* Connections Dialog */}
        {selectedDialog === 'connections' && !showFriendList && (
          <DialogOverlay onClose={closeDialog}>
            <span>👥 TOP Connections</span>
            <div className='space-y-4'>
              <div className='grid grid-cols-2 gap-4'>
                {friendsList.slice(0, 2).map(friend => (
                  <div key={friend.id} className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-lg'>
                    <div className='text-4xl mb-2'>{friend.avatar}</div>
                    <p className='font-bold text-slate-800'>{friend.name}</p>
                    <p className='text-sm text-slate-600 mb-3'>{friend.role}</p>
                    <div className='flex flex-wrap gap-2'>
                      {friend.skills.map(skill => (
                        <span key={skill} className='text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full'>
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setShowFriendList(true)}
                className='w-full p-4 border-2 border-dashed border-orange-300 rounded-lg hover:bg-orange-50 transition-colors mt-4'
              >
                <p className='text-orange-600 font-semibold'>👥 View Friend List ({friendsList.length})</p>
                <p className='text-sm text-orange-600'>Click to see all your connections</p>
              </button>
            </div>
          </DialogOverlay>
        )}

        {/* Friend List Dialog */}
        {selectedDialog === 'connections' && showFriendList && (
          <DialogOverlay onClose={closeDialog}>
            <span>👥 Your Friend List</span>
            <div className='space-y-4'>
              <div className='relative'>
                <input
                  type='text'
                  placeholder='Search friends by name or role...'
                  value={friendSearchQuery}
                  onChange={(e) => setFriendSearchQuery(e.target.value)}
                  className='w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:outline-none focus:border-orange-500 transition-colors'
                />
                <span className='absolute right-3 top-3 text-slate-400'>🔍</span>
              </div>

              <div className='space-y-3'>
                {filteredFriends.length > 0 ? (
                  filteredFriends.map(friend => (
                    <div key={friend.id} className='p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-indigo-200 rounded-lg hover:shadow-md transition-shadow'>
                      <div className='flex items-start justify-between'>
                        <div className='flex-1'>
                          <div className='flex items-center gap-3'>
                            <span className='text-3xl'>{friend.avatar}</span>
                            <div>
                              <p className='font-bold text-slate-800'>{friend.name}</p>
                              <p className='text-sm text-slate-600'>{friend.role}</p>
                            </div>
                          </div>
                          <div className='flex flex-wrap gap-2 mt-3'>
                            {friend.skills.map(skill => (
                              <span key={skill} className='text-xs bg-indigo-200 text-indigo-800 px-2 py-1 rounded-full'>
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                        <button className='px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-semibold transition-colors'>
                          Connect
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className='p-6 text-center text-slate-600'>
                    <p className='text-lg'>No friends found matching "{friendSearchQuery}"</p>
                  </div>
                )}
              </div>

              <button
                onClick={() => setShowFriendList(false)}
                className='w-full p-3 border-2 border-slate-300 rounded-lg hover:bg-slate-50 text-slate-700 font-semibold transition-colors'
              >
                ← Back to Overview
              </button>
            </div>
          </DialogOverlay>
        )}

        {/* Skills Dialog */}
        {selectedDialog === 'skills' && (
          <DialogOverlay onClose={closeDialog}>
            <span>📊 Select Your Skills</span>
            <div className='space-y-3'>
              <p className='text-slate-600 mb-4'>Select the skills you have or want to develop</p>
              <div className='grid grid-cols-2 gap-3'>
                {skillsList.map(skill => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className={`p-3 rounded-lg border-2 font-semibold transition-all ${selectedSkills.includes(skill)
                        ? 'border-orange-500 bg-orange-50 text-orange-700'
                        : 'border-slate-200 text-slate-700 hover:border-orange-300'
                      }`}
                  >
                    {selectedSkills.includes(skill) ? '✓ ' : ''}{skill}
                  </button>
                ))}
              </div>
              {selectedSkills.length > 0 && (
                <div className='mt-6 p-4 bg-green-50 border-2 border-green-200 rounded-lg'>
                  <p className='text-green-700 font-semibold'>✓ Selected {selectedSkills.length} skills</p>
                  <p className='text-sm text-green-600'>{selectedSkills.join(', ')}</p>
                </div>
              )}
              <button
                onClick={saveSkills}
                disabled={selectedSkills.length === 0}
                className='w-full mt-4 p-3 bg-orange-500 hover:bg-orange-600 disabled:bg-slate-300 text-white font-semibold rounded-lg transition-colors'
              >
                Save Skills
              </button>
            </div>
          </DialogOverlay>
        )}

        {/* Main Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <DashboardCard
            href='/profile'
            title='Profile & Resume'
            icon='📄'
          >
            Manage your profile, upload resumes and showcase your achievements
          </DashboardCard>
          <DashboardCard
            href='/community'
            title='Community'
            icon='💬'
          >
            Connect with peers, join forums, participate in polls and discussions
          </DashboardCard>
          <DashboardCard
            href='/interview'
            title='Mock Interviews'
            icon='🎙️'
          >
            Practice interviews with AI, get instant feedback and improve your skills
          </DashboardCard>
        </div>

        {/* Learning Tools Section */}
        <div className='mb-8'>
          <h2 className='text-2xl font-bold text-slate-800 mb-4'>🎓 Learning & Productivity Tools</h2>
          <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
            <DashboardCard
              href='/code-explainer'
              title='Code Explainer'
              icon='💡'
            >
              Paste any code and get AI-powered explanations with step-by-step breakdown
            </DashboardCard>
            <DashboardCard
              href='/concept-explainer'
              title='Concept Simplifier'
              icon='🎓'
            >
              Break down complex technical concepts into simple, easy-to-understand explanations
            </DashboardCard>
            <DashboardCard
              href='/learning-path'
              title='Learning Path'
              icon='🗺️'
            >
              Get personalized roadmaps based on your goals and current skill level
            </DashboardCard>
          </div>
        </div>

        {/* Chat Widget */}
        <div className='fixed bottom-56 right-6 flex flex-col items-end gap-2 z-40'>
          <button
            onClick={() => setOpenChat(v => !v)}
            className='text-sm font-semibold text-red-600 hover:text-red-700 transition-colors'
          >
            SAKHA?
          </button>
          <button
            onClick={() => setOpenChat(v => !v)}
            className='w-16 h-16 rounded-full btn-primary shadow-2xl flex items-center justify-center text-2xl hover:scale-110 transition-transform duration-300 animate-bounce-subtle'
          >
            💬
          </button>
        </div>

        {openChat && (
          <div className='fixed bottom-80 right-6 w-full max-w-md animate-slideInRight'>
            <ChatBox
              isExpanded={expandedChat}
              onExpand={() => setExpandedChat(true)}
              onClose={() => { setExpandedChat(false); setOpenChat(false); }}
            />
          </div>
        )}

        {/* Footer with Challenge Yourself */}
        <footer className='fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-500 to-orange-600 shadow-lg'>
          <div className='max-w-7xl mx-auto px-6 py-6 flex items-center justify-between'>
            <div className='text-white'>
              <h3 className='text-lg font-bold'>Ready to Test Your Skills?</h3>
              <p className='text-sm text-orange-100'>Practice coding problems and get instant feedback</p>
            </div>
            <button
              onClick={() => setShowCodeCompiler(true)}
              className='bg-white text-orange-600 font-bold py-3 px-8 rounded-lg hover:bg-orange-50 transition-colors shadow-lg'
            >
              🚀 Challenge Yourself
            </button>
          </div>
        </footer>

        {/* Code Compiler Modal */}
        {showCodeCompiler && (
          <div className='fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50'>
            <div className='bg-white rounded-none shadow-2xl w-screen h-screen overflow-hidden flex flex-col animate-slideInUp'>
              {/* Header */}
              <div className='bg-white border-b border-slate-200 p-6 flex justify-between items-center'>
                <div>
                  <h2 className='text-3xl font-bold text-slate-900'>Challenge Yourself</h2>
                  <p className='text-slate-500 text-sm'>Write, test, and verify your code</p>
                </div>
                <button
                  onClick={() => {
                    setShowCodeCompiler(false)
                    setCode('')
                    setCodeOutput(null)
                  }}
                  className='text-3xl hover:text-orange-500 transition-colors text-slate-600'
                >
                  ✕
                </button>
              </div>

              {/* Main Content */}
              <div className='flex-1 flex overflow-hidden'>
                {/* Code Editor Section */}
                <div className='flex-1 flex flex-col bg-white'>
                  {/* Language Selector */}
                  <div className='bg-white border-b border-slate-200 p-4'>
                    <label className='text-sm font-semibold text-slate-700 block mb-2'>Select Language</label>
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className='w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500'
                    >
                      <option value='javascript'>JavaScript</option>
                      <option value='python'>Python</option>
                      <option value='java'>Java</option>
                      <option value='cpp'>C++</option>
                      <option value='golang'>Go</option>
                    </select>
                  </div>

                  {/* Code Editor */}
                  <div className='flex-1 flex flex-col'>
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      placeholder='Write your code here...'
                      className='flex-1 p-6 font-mono text-base border-0 focus:outline-none resize-none bg-slate-50 text-slate-800'
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className='bg-white border-t border-slate-200 p-6 flex gap-3'>
                    <button
                      onClick={handleRunCode}
                      disabled={!code.trim() || isRunning}
                      className='flex-1 bg-green-500 hover:bg-green-600 disabled:bg-slate-300 text-white font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg'
                    >
                      <span>{isRunning ? '⏳' : '▶️'}</span>
                      {isRunning ? 'Running...' : 'Run Code'}
                    </button>
                    <button
                      onClick={handleCheckResult}
                      className='flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-4 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 text-lg'
                    >
                      <span>✓</span>
                      Check Result
                    </button>
                  </div>
                </div>

                {/* Output Section */}
                <div className='w-2/5 flex flex-col bg-white border-l border-slate-200'>
                  <div className='bg-white border-b border-slate-200 p-6'>
                    <h3 className='font-bold text-slate-800 text-lg'>Output</h3>
                  </div>
                  <div className='flex-1 overflow-y-auto p-6'>
                    {codeOutput ? (
                      <div className={`p-6 rounded-lg border-2 ${codeOutput.status === 'success' ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'}`}>
                        <p className={`font-bold mb-3 text-lg ${codeOutput.status === 'success' ? 'text-green-800' : 'text-red-800'}`}>
                          {codeOutput.status === 'success' ? '✅ ' : '❌ '}
                          {codeOutput.result}
                        </p>
                        <p className={`text-base ${codeOutput.status === 'success' ? 'text-green-700' : 'text-red-700'}`}>
                          {codeOutput.message}
                        </p>
                      </div>
                    ) : (
                      <div className='text-center text-slate-500 py-16'>
                        <p className='text-base'>Run your code to see output here</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

