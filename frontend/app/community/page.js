import { useState, useEffect } from 'react'
import ResumePreview from '../../components/ResumePreview'
import { XMarkIcon } from '@heroicons/react/24/outline'
import { useRouter } from 'next/navigation'

export default function Community() {
  const [tab, setTab] = useState('faqs')
  const [selectedForum, setSelectedForum] = useState('general')
  const [selectedResume, setSelectedResume] = useState(null)
  const [inspirationSuccess, setInspirationSuccess] = useState(false)
  const router = useRouter()
  const [newPost, setNewPost] = useState('')
  const [postImage, setPostImage] = useState(null)
  const [postImagePreview, setPostImagePreview] = useState(null)
  const [showComments, setShowComments] = useState({})
  const [showSharePopup, setShowSharePopup] = useState(null)
  const [replyStates, setReplyStates] = useState({})
  const [postReplyStates, setPostReplyStates] = useState({})
  const [posts, setPosts] = useState({
    general: [
      {
        id: 1, author: 'Alex Kumar', role: 'Software Engineer', avatar: '👨‍💼', title: 'Tips for acing technical interviews', content: 'Practice DSA problems regularly and focus on problem-solving approach', likes: 234, comments: [
          { author: 'Sarah Lee', role: 'Student', avatar: '👩‍💼', text: 'Great tips! I started practicing on LeetCode and it really helped.' },
          { author: 'John Smith', role: 'Mentor', avatar: '👨‍💼', text: 'Also focus on explaining your thought process clearly during the interview.' }
        ], timestamp: '2 days ago'
      },
      {
        id: 2, author: 'Emma Wilson', role: 'Data Scientist', avatar: '👩‍💼', title: 'Best ML frameworks in 2025', content: 'PyTorch and TensorFlow are still leading. Also exploring newer frameworks...', likes: 189, comments: [
          { author: 'Mike Chen', role: 'Student', avatar: '👨‍💼', text: 'Have you tried JAX? It\'s gaining popularity for research.' },
          { author: 'Lisa Wong', role: 'AI Engineer', avatar: '👩‍💼', text: 'TensorFlow\'s ecosystem is unbeatable for production deployment.' }
        ], timestamp: '1 day ago'
      },
    ],
    internships: [
      {
        id: 1, author: 'John Doe', role: 'Full Stack Dev', avatar: '👨‍💼', title: 'Summer internship experiences', content: 'Share your internship journey and learnings with the community', likes: 156, comments: [
          { author: 'Emma Davis', role: 'Student', avatar: '👩‍💼', text: 'My first internship was at a startup and it was amazing learning experience!' },
          { author: 'Alex Kumar', role: 'HR', avatar: '👨‍💼', text: 'Internships are the best way to build practical skills and network.' }
        ], timestamp: '3 days ago'
      },
      {
        id: 2, author: 'Sarah Lee', role: 'Product Manager', avatar: '👩‍💼', title: 'How to prepare for PM internships?', content: 'What skills should I focus on for PM roles?', likes: 98, comments: [
          { author: 'James Wilson', role: 'PM Mentor', avatar: '👨‍💼', text: 'Focus on product thinking, user research, and data analysis skills.' },
          { author: 'Nina Patel', role: 'Student', avatar: '👩‍💼', text: 'I\'m doing a PM internship now and communication skills matter most!' }
        ], timestamp: '5 days ago'
      },
    ],
    projects: [
      {
        id: 1, author: 'Michael Chen', role: 'DevOps Engineer', avatar: '👨‍💼', title: 'Open source projects to contribute', content: 'Looking for beginner-friendly open source projects', likes: 212, comments: [
          { author: 'Rachel Green', role: 'Developer', avatar: '👩‍💼', text: 'Check out Good First Issues label on GitHub. Great starting point!' },
          { author: 'Tom Harris', role: 'Open Source Maintainer', avatar: '👨‍💼', text: 'Documentation improvements are always welcome and a good way to start.' }
        ], timestamp: '1 week ago'
      },
      {
        id: 2, author: 'Lisa Rodriguez', role: 'Frontend Dev', avatar: '👩‍💼', title: 'Building a portfolio project', content: 'How to choose the right project idea for your portfolio?', likes: 145, comments: [
          { author: 'David Kim', role: 'Student', avatar: '👨‍💼', text: 'Build something you\'re passionate about - employers can tell!' },
          { author: 'Sophie Turner', role: 'Tech Lead', avatar: '👩‍💼', text: 'Focus on solving a real problem rather than just following tutorials.' }
        ], timestamp: '1 week ago'
      },
    ],
    resources: [
      {
        id: 1, author: 'Alex Kumar', role: 'Software Engineer', avatar: '👨‍💼', title: 'Free learning resources compilation', content: 'Curated list of free courses and resources for all skills', likes: 423, comments: [
          { author: 'Maya Verma', role: 'Student', avatar: '👩‍💼', text: 'This list is amazing! Saved me so much money on courses.' },
          { author: 'Chris Johnson', role: 'Educator', avatar: '👩‍💼', text: 'MIT OpenCourseWare and freeCodeCamp are my go-to recommendations.' }
        ], timestamp: '2 days ago'
      },
      {
        id: 2, author: 'Emma Wilson', role: 'Data Scientist', avatar: '👩‍💼', title: 'Best coding practice platforms', content: 'LeetCode, HackerRank, CodeChef comparison guide', likes: 267, comments: [
          { author: 'Oliver Rodriguez', role: 'Competitive Programmer', avatar: '👨‍💼', text: 'I prefer CodeChef for its community. Great problems!' },
          { author: 'Jessica Lee', role: 'Interviewer', avatar: '👩‍💼', text: 'LeetCode premium is worth it for interview prep.' }
        ], timestamp: '4 days ago'
      },
      {
        id: 3, author: 'Saurabh Singh', role: 'Cloud Architect', avatar: '☁️', title: 'AWS Certification Path for 2025', content: 'Here is how I cleared AWS Solutions Architect in 3 months with free resources only.', likes: 512, comments: [
          { author: 'Vikram Rao', role: 'Student', avatar: '👨‍💻', text: 'Could you share the specific labs you used?' },
          { author: 'Anjali Sharma', role: 'DevOps Intern', avatar: '👩‍💻', text: 'Cant believe you did it in 3 months! Super inspiring.' }
        ], timestamp: '1 day ago'
      },
      { id: 4, author: 'Priya Verma', role: 'Frontend Lead', avatar: '🎨', title: 'Mastering CSS Grid & Flexbox', content: 'Stop using Bootstrap for everything. Learn layout basics for better career growth.', likes: 345, comments: [], timestamp: '5 hours ago' },
    ],
  })
  const [postLikes, setPostLikes] = useState({})
  const [expandedComments, setExpandedComments] = useState({})

  const forums = [
    { id: 'general', name: '💬 General Discussion', description: 'General topics and discussions' },
    { id: 'internships', name: '🎯 Internships', description: 'Internship experiences and advice' },
    { id: 'projects', name: '🚀 Projects', description: 'Portfolio and project discussions' },
    { id: 'resources', name: '📚 Resources', description: 'Learning resources and recommendations' },
  ]

  const polls = [
    { question: 'Best internship field in 2025?', options: ['Web Dev', 'AI/ML', 'Data Science', 'Cloud'], votes: [145, 234, 189, 98] },
    { question: 'Preferred interview format?', options: ['Virtual', 'In-person', 'Hybrid'], votes: [312, 189, 201] },
  ]

  const resumes = [
    {
      id: 1,
      name: 'John Doe',
      role: 'Full Stack Developer',
      rating: 4.8,
      atsScore: 85,
      skills: ['React', 'Node.js', 'MongoDB', 'AWS', 'Docker', 'TypeScript', 'GraphQL'],
      summary: 'Experienced Full Stack Developer with 5+ years of building scalable web applications. Proven track record of optimizing performance and leading development teams.',
      gaps: ['Could add more focus on mobile responsiveness', 'Missing recent certifications in cloud architecture'],
      strengths: ['Strong technical depth', 'Excellent architectural planning'],
      score: 88
    },
    {
      id: 2,
      name: 'Jane Smith',
      role: 'Data Analyst',
      rating: 4.6,
      atsScore: 82,
      skills: ['Python', 'SQL', 'Tableau', 'Pandas', 'PowerBI', 'Statistics', 'R'],
      summary: 'Detail-oriented Data Analyst specialized in transforming complex datasets into actionable business insights. Highly proficient in statistical modeling and visualization.',
      gaps: ['Could incorporate more machine learning project examples', 'Needs more focus on big data tools like Spark'],
      strengths: ['Advanced visualization skills', 'Strong statistical foundation'],
      score: 84
    },
    {
      id: 3,
      name: 'Mike Johnson',
      role: 'DevOps Engineer',
      rating: 4.9,
      atsScore: 91,
      skills: ['Kubernetes', 'Jenkins', 'Terraform', 'Ansible', 'Linux', 'Go', 'GCP'],
      summary: 'DevOps professional focused on automating CI/CD pipelines and managing cloud infrastructure at scale. Expert in Infrastructure as Code (IaC) and containerization.',
      gaps: ['Could highlight more security-focussed DevOps (DevSecOps) practices', 'Expand on monitoring tools like Prometheus/Grafana'],
      strengths: ['High automation proficiency', 'Expertise in cloud-native tools'],
      score: 93
    },
    {
      id: 4,
      name: 'Sarah Lee',
      role: 'Product Manager',
      rating: 4.7,
      atsScore: 88,
      skills: ['Product Strategy', 'Agile', 'User Research', 'A/B Testing', 'Roadmap Planning', 'Jira'],
      summary: 'Strategic Product Manager with a strong user-centric approach. Expert in translating user needs into technical requirements and leading cross-functional teams to launch successful products.',
      gaps: ['Provide more metrics on product-market fit', 'Focus more on technical documentation and PRDs'],
      strengths: ['Excellent stakeholder communication', 'Data-driven decision making'],
      score: 89
    },
    {
      id: 5,
      name: 'Alex Chen',
      role: 'ML Engineer',
      rating: 4.8,
      atsScore: 87,
      skills: ['PyTorch', 'Scikit-Learn', 'Natural Language Processing', 'Computer Vision', 'MLOps', 'C++'],
      summary: 'Machine Learning Engineer focused on developing and deploying production-grade AI models. Experienced in NLP, neural networks, and optimizing inference speeds.',
      gaps: ['Could add more details on model deployment pipelines', 'Describe data cleaning strategies more thoroughly'],
      strengths: ['Cutting-edge research knowledge', 'Strong mathematical background'],
      score: 90
    },
    {
      id: 6,
      name: 'Emma Wilson',
      role: 'UX Designer',
      rating: 4.5,
      atsScore: 80,
      skills: ['Figma', 'Adobe XD', 'Wireframing', 'Prototyping', 'User Testing', 'Design Systems', 'Micro-interactions'],
      summary: 'Creative UX Designer with a passion for building accessible and beautiful user experiences. Expert in user-centered design and rapid prototyping.',
      gaps: ['Should focus more on the "Why" behind design decisions', 'Expand on the case study results and ROI'],
      strengths: ['Visual storytelling excellence', 'Deep understanding of accessibility'],
      score: 82
    },
  ]

  const handleUseInspiration = () => {
    setInspirationSuccess(true)
    setTimeout(() => {
      setInspirationSuccess(false)
      setSelectedResume(null)
      router.push('/upload-resume')
    }, 2000)
  }

  const handleImageUpload = (e) => {
    const file = e.target.files[0]
    if (file) {
      setPostImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setPostImagePreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePostSubmit = () => {
    if (newPost.trim()) {
      const newPostObj = {
        id: posts[selectedForum].length + 1,
        author: 'You',
        role: 'Student',
        avatar: '👤',
        title: newPost.split('\n')[0],
        content: newPost,
        likes: 0,
        image: postImagePreview,
        comments: [],
        timestamp: 'now'
      }
      setPosts(prev => ({
        ...prev,
        [selectedForum]: [newPostObj, ...prev[selectedForum]]
      }))
      setNewPost('')
      setPostImage(null)
      setPostImagePreview(null)
    }
  }

  const handleAddReply = (postId, commentIdx, forum, replyText) => {
    if (replyText.trim()) {
      setPosts(prev => {
        const newPosts = JSON.parse(JSON.stringify(prev))
        const post = newPosts[forum].find(p => p.id === postId)
        if (!post.comments[commentIdx].replies) {
          post.comments[commentIdx].replies = []
        }
        post.comments[commentIdx].replies.push({
          author: 'You',
          role: 'Student',
          avatar: '👤',
          text: replyText
        })
        return newPosts
      })
      setReplyStates(prev => ({
        ...prev,
        [`${forum}-${postId}-${commentIdx}`]: ''
      }))
    }
  }

  const handlePostReply = (postId, forum, replyText) => {
    if (replyText.trim()) {
      setPosts(prev => {
        const newPosts = JSON.parse(JSON.stringify(prev))
        const post = newPosts[forum].find(p => p.id === postId)
        post.comments.push({
          author: 'You',
          role: 'Student',
          avatar: '👤',
          text: replyText,
          replies: []
        })
        return newPosts
      })
      setPostReplyStates(prev => ({
        ...prev,
        [`${forum}-${postId}`]: ''
      }))
    }
  }

  const toggleLike = (postId, forum) => {
    setPostLikes(prev => ({
      ...prev,
      [`${forum}-${postId}`]: !prev[`${forum}-${postId}`]
    }))
  }

  const handleShare = (postId, forum) => {
    setShowSharePopup(`${forum}-${postId}`)
    setTimeout(() => {
      setShowSharePopup(null)
    }, 2000)
  }

  const toggleComments = (postId, forum) => {
    setExpandedComments(prev => ({
      ...prev,
      [`${forum}-${postId}`]: !prev[`${forum}-${postId}`]
    }))
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50 to-purple-50 py-8'>
      <div className='max-w-6xl mx-auto px-4'>
        {/* Header */}
        <div className='mb-10 animate-fadeInUp'>
          <h1 className='text-4xl font-bold mb-2 text-slate-800'>
            <span className='gradient-text'>Community</span>
          </h1>
          <p className='text-slate-600'>Connect, learn, and grow with fellow students and alumni</p>
        </div>

        {/* Tabs */}
        <div className='flex gap-4 mb-8 flex-wrap'>
          {[
            { id: 'faqs', label: '💬 FAQs & Polls', icon: '📊' },
            { id: 'gallery', label: '📚 Resumes Gallery', icon: '📄' },
            { id: 'posts', label: '📢 Posts', icon: '💭' }
          ].map(item => (
            <button
              key={item.id}
              onClick={() => setTab(item.id)}
              className={`px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform ${tab === item.id
                ? 'btn-primary text-white shadow-lg scale-105'
                : 'card-gradient text-slate-700 hover:shadow-md'
                }`}
            >
              <span className='mr-2'>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>

        {/* FAQs & Polls Tab */}
        {tab === 'faqs' && (
          <div className='space-y-6 animate-fadeInUp'>
            {/* FAQs Section */}
            <div className='card-gradient rounded-2xl p-8 shadow-lg'>
              <h2 className='text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
                <span>❓</span> Community FAQs
              </h2>
              <div className='space-y-4'>
                {[
                  { q: 'How do I upload my resume?', a: 'Go to the Profile section and use the upload feature to add your resume PDF.' },
                  { q: 'Can I see other students\' resumes?', a: 'Yes, check the Resume Gallery to view and learn from other students\' profiles.' },
                  { q: 'How often are mock interviews updated?', a: 'New interview scenarios are added weekly based on current industry trends.' },
                  { q: 'How do I connect with alumni mentors?', a: 'Visit the Alumni Hub and send connection requests to mentors in your field of interest.' },
                ].map((faq, idx) => (
                  <div key={idx} className='p-4 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg border-l-4 border-indigo-500 hover:shadow-md transition-all duration-300'>
                    <p className='font-semibold text-slate-800 mb-2'>Q: {faq.q}</p>
                    <p className='text-slate-600 text-sm'>A: {faq.a}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Polls Section */}
            <div className='card-gradient rounded-2xl p-8 shadow-lg'>
              <h2 className='text-2xl font-bold text-slate-800 mb-6 flex items-center gap-2'>
                <span>📊</span> Community Polls
              </h2>
              <div className='space-y-8'>
                {polls.map((poll, idx) => (
                  <div key={idx} className='pb-6 border-b border-indigo-200 last:border-0'>
                    <h3 className='font-bold text-slate-800 mb-4 text-lg'>{poll.question}</h3>
                    <div className='space-y-3'>
                      {poll.options.map((option, optIdx) => {
                        const total = poll.votes.reduce((a, b) => a + b, 0)
                        const percentage = (poll.votes[optIdx] / total) * 100
                        return (
                          <div key={optIdx} className='flex items-center gap-3'>
                            <div className='flex-1'>
                              <div className='flex justify-between mb-1'>
                                <span className='text-sm font-semibold text-slate-700'>{option}</span>
                                <span className='text-sm text-indigo-600 font-bold'>{poll.votes[optIdx]} votes</span>
                              </div>
                              <div className='w-full bg-indigo-100 rounded-full h-2 overflow-hidden'>
                                <div
                                  className='bg-gradient-to-r from-indigo-500 to-purple-500 h-full transition-all duration-500'
                                  style={{ width: `${percentage}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className='text-xs text-slate-600 font-semibold'>{percentage.toFixed(1)}%</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Resumes Gallery Tab */}
        {tab === 'gallery' && (
          <div className='animate-fadeInUp'>
            <div className='mb-6'>
              <h2 className='text-2xl font-bold text-slate-800 mb-2'>📚 Resumes Gallery</h2>
              <p className='text-slate-600'>Explore and get inspired by other students\' resumes</p>
            </div>

            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {resumes.map((resume, idx) => (
                <div
                  key={resume.id}
                  className='card-gradient rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 animate-slideInLeft border border-indigo-100 hover:border-indigo-300'
                  style={{ animationDelay: `${idx * 0.05}s` }}
                >
                  <div className='flex items-start justify-between mb-4'>
                    <div>
                      <div className='w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-lg mb-3'>
                        {resume.name.charAt(0)}
                      </div>
                      <h3 className='font-bold text-slate-800 text-lg'>{resume.name}</h3>
                      <p className='text-sm text-indigo-600 font-semibold'>{resume.role}</p>
                    </div>
                    <div className='text-2xl'>📄</div>
                  </div>

                  <div className='flex items-center gap-1 mb-4'>
                    {[...Array(5)].map((_, i) => (
                      <span
                        key={i}
                        className={i < Math.round(resume.rating) ? 'text-yellow-400 text-lg' : 'text-gray-300 text-lg'}
                      >
                        ★
                      </span>
                    ))}
                    <span className='text-sm text-slate-600 ml-2'>({resume.rating})</span>
                  </div>

                  <button
                    onClick={() => setSelectedResume(resume)}
                    className='w-full btn-primary py-2 rounded-lg font-semibold text-sm transition-all duration-300'
                  >
                    View Resume
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Tab */}
        {tab === 'posts' && (
          <div className='animate-fadeInUp'>
            <div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
              {/* Forums Sidebar */}
              <div className='lg:col-span-1'>
                <div className='card-gradient rounded-2xl p-6 shadow-lg sticky top-20'>
                  <h3 className='text-lg font-bold text-slate-800 mb-4'>📋 Forums</h3>
                  <div className='space-y-2'>
                    {forums.map(forum => (
                      <button
                        key={forum.id}
                        onClick={() => setSelectedForum(forum.id)}
                        className={`w-full text-left p-3 rounded-lg transition-all duration-300 ${selectedForum === forum.id
                          ? 'bg-indigo-500 text-white font-semibold'
                          : 'hover:bg-indigo-50 text-slate-700'
                          }`}
                      >
                        <div className='text-sm font-semibold'>{forum.name}</div>
                        <div className='text-xs opacity-75 mt-1'>{forum.description}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Posts Area */}
              <div className='lg:col-span-3 space-y-6'>
                {/* Post Creation */}
                <div className='card-gradient rounded-2xl p-6 shadow-lg'>
                  <h3 className='text-lg font-bold text-slate-800 mb-4'>✍️ Create a Post</h3>
                  <textarea
                    value={newPost}
                    onChange={(e) => setNewPost(e.target.value)}
                    placeholder='Share your thoughts, questions, or experiences...'
                    className='w-full p-4 border-2 border-indigo-200 rounded-lg focus:border-indigo-500 focus:outline-none resize-none'
                    rows='4'
                  />

                  {/* Image Preview */}
                  {postImagePreview && (
                    <div className='mt-4 relative'>
                      <img
                        src={postImagePreview}
                        alt='Preview'
                        className='w-full h-40 object-cover rounded-lg'
                      />
                      <button
                        onClick={() => {
                          setPostImage(null)
                          setPostImagePreview(null)
                        }}
                        className='absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold hover:bg-red-600 transition-all'
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Image Upload and Post Button */}
                  <div className='mt-4 flex gap-3'>
                    <label className='flex-1 flex items-center justify-center gap-2 px-4 py-2 border-2 border-indigo-200 rounded-lg text-indigo-600 font-semibold cursor-pointer hover:bg-indigo-50 transition-all duration-300'>
                      <span>🖼️</span>
                      <span>Add Image</span>
                      <input
                        type='file'
                        accept='image/*'
                        onChange={handleImageUpload}
                        className='hidden'
                      />
                    </label>
                    <button
                      onClick={handlePostSubmit}
                      className='flex-1 btn-primary py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:shadow-lg'
                    >
                      Post
                    </button>
                  </div>
                </div>

                {/* Forum Title */}
                <div className='mb-4'>
                  <h2 className='text-2xl font-bold text-slate-800'>
                    {forums.find(f => f.id === selectedForum)?.name}
                  </h2>
                  <p className='text-slate-600 text-sm mt-1'>
                    {forums.find(f => f.id === selectedForum)?.description}
                  </p>
                </div>

                {/* Posts List */}
                <div className='space-y-4'>
                  {posts[selectedForum]?.map((post) => (
                    <div key={post.id} className='card-gradient rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 relative'>
                      {/* Post Header */}
                      <div className='flex items-start gap-4 mb-4'>
                        <div className='text-3xl'>{post.avatar}</div>
                        <div className='flex-1'>
                          <div className='flex items-center gap-2'>
                            <h3 className='font-bold text-slate-800'>{post.author}</h3>
                            <span className='text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full'>{post.role}</span>
                          </div>
                          <p className='text-xs text-slate-500 mt-1'>{post.timestamp}</p>
                        </div>
                      </div>

                      {/* Post Title and Content */}
                      <div className='mb-4'>
                        <h4 className='font-bold text-slate-800 text-lg mb-2'>{post.title}</h4>
                        <p className='text-slate-700 text-sm line-clamp-3'>{post.content}</p>
                        {post.image && (
                          <img
                            src={post.image}
                            alt='Post'
                            className='w-full h-48 object-cover rounded-lg mt-3'
                          />
                        )}
                      </div>

                      {/* Post Actions */}
                      <div className='flex items-center gap-6 pt-4 border-t border-indigo-200'>
                        <button
                          onClick={() => toggleLike(post.id, selectedForum)}
                          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 ${postLikes[`${selectedForum}-${post.id}`]
                            ? 'bg-red-100 text-red-600 font-semibold'
                            : 'text-slate-600 hover:bg-indigo-50'
                            }`}
                        >
                          <span className='text-lg'>❤️</span>
                          <span className='text-sm font-semibold'>{post.likes} Likes</span>
                        </button>
                        <button
                          onClick={() => toggleComments(post.id, selectedForum)}
                          className='flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 transition-all duration-300'
                        >
                          <span className='text-lg'>💬</span>
                          <span className='text-sm font-semibold'>{post.comments.length} Comments</span>
                        </button>
                        <button
                          onClick={() => {
                            setPostReplyStates(prev => ({
                              ...prev,
                              [`${selectedForum}-${post.id}-show`]: !prev[`${selectedForum}-${post.id}-show`]
                            }))
                          }}
                          className='flex items-center gap-2 px-4 py-2 rounded-lg text-slate-600 hover:bg-indigo-50 transition-all duration-300'
                        >
                          <span className='text-lg'>↩️</span>
                          <span className='text-sm font-semibold'>Reply</span>
                        </button>
                        <button
                          onClick={() => handleShare(post.id, selectedForum)}
                          className='ml-auto px-4 py-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-300 text-sm font-semibold relative'
                        >
                          Share
                          {showSharePopup === `${selectedForum}-${post.id}` && (
                            <div className='absolute bottom-full right-0 mb-2 bg-green-500 text-white px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap animate-bounce'>
                              ✓ Link Copied!
                            </div>
                          )}
                        </button>
                      </div>

                      {/* Post Reply Input */}
                      {postReplyStates[`${selectedForum}-${post.id}-show`] && (
                        <div className='mt-4 p-4 bg-indigo-50 rounded-lg space-y-3'>
                          <h5 className='font-semibold text-slate-800 text-sm'>Reply to this post</h5>
                          <textarea
                            value={postReplyStates[`${selectedForum}-${post.id}`] || ''}
                            onChange={(e) => setPostReplyStates(prev => ({
                              ...prev,
                              [`${selectedForum}-${post.id}`]: e.target.value
                            }))}
                            placeholder='Share your thoughts on this post...'
                            className='w-full p-3 border border-indigo-300 rounded-lg text-sm focus:outline-none focus:border-indigo-500'
                            rows='3'
                          />
                          <div className='flex gap-2'>
                            <button
                              onClick={() => handlePostReply(post.id, selectedForum, postReplyStates[`${selectedForum}-${post.id}`] || '')}
                              className='bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold text-sm hover:bg-indigo-700 transition-all'
                            >
                              Post Reply
                            </button>
                            <button
                              onClick={() => {
                                setPostReplyStates(prev => ({
                                  ...prev,
                                  [`${selectedForum}-${post.id}-show`]: false,
                                  [`${selectedForum}-${post.id}`]: ''
                                }))
                              }}
                              className='text-slate-600 px-4 py-2 hover:bg-indigo-100 rounded-lg transition-all text-sm font-semibold'
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Comments Section */}
                      {expandedComments[`${selectedForum}-${post.id}`] && (
                        <div className='mt-6 pt-6 border-t border-indigo-200 space-y-4'>
                          <h4 className='font-bold text-slate-800 mb-4'>Comments ({post.comments.length})</h4>
                          {post.comments.map((comment, idx) => (
                            <div key={idx} className='bg-indigo-50 p-4 rounded-lg'>
                              {/* Main Comment */}
                              <div className='flex gap-3'>
                                <div className='text-2xl'>{comment.avatar}</div>
                                <div className='flex-1'>
                                  <div className='flex items-center gap-2'>
                                    <span className='font-semibold text-slate-800'>{comment.author}</span>
                                    <span className='text-xs bg-blue-200 text-blue-700 px-2 py-0.5 rounded'>{comment.role}</span>
                                  </div>
                                  <p className='text-sm text-slate-700 mt-2'>{comment.text}</p>
                                  <button
                                    onClick={() => {
                                      setReplyStates(prev => ({
                                        ...prev,
                                        [`${selectedForum}-${post.id}-${idx}-show`]: !prev[`${selectedForum}-${post.id}-${idx}-show`]
                                      }))
                                    }}
                                    className='text-xs text-indigo-600 font-semibold mt-2 hover:text-indigo-700'
                                  >
                                    {replyStates[`${selectedForum}-${post.id}-${idx}-show`] ? 'Hide Replies' : 'Reply'} {comment.replies && comment.replies.length > 0 && `(${comment.replies.length})`}
                                  </button>
                                </div>
                              </div>

                              {/* Reply Input */}
                              {replyStates[`${selectedForum}-${post.id}-${idx}-show`] && (
                                <div className='mt-3 ml-8 space-y-2'>
                                  <textarea
                                    value={replyStates[`${selectedForum}-${post.id}-${idx}`] || ''}
                                    onChange={(e) => setReplyStates(prev => ({
                                      ...prev,
                                      [`${selectedForum}-${post.id}-${idx}`]: e.target.value
                                    }))}
                                    placeholder='Write a reply...'
                                    className='w-full p-2 border border-indigo-300 rounded text-sm focus:outline-none focus:border-indigo-500'
                                    rows='2'
                                  />
                                  <div className='flex gap-2'>
                                    <button
                                      onClick={() => handleAddReply(post.id, idx, selectedForum, replyStates[`${selectedForum}-${post.id}-${idx}`] || '')}
                                      className='text-xs bg-indigo-600 text-white px-3 py-1 rounded font-semibold hover:bg-indigo-700 transition-all'
                                    >
                                      Reply
                                    </button>
                                    <button
                                      onClick={() => {
                                        setReplyStates(prev => ({
                                          ...prev,
                                          [`${selectedForum}-${post.id}-${idx}-show`]: false,
                                          [`${selectedForum}-${post.id}-${idx}`]: ''
                                        }))
                                      }}
                                      className='text-xs text-slate-600 px-3 py-1 hover:bg-indigo-100 rounded transition-all'
                                    >
                                      Cancel
                                    </button>
                                  </div>
                                </div>
                              )}

                              {/* Nested Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className='mt-3 ml-8 space-y-2'>
                                  {comment.replies.map((reply, replyIdx) => (
                                    <div key={replyIdx} className='bg-white p-3 rounded border-l-2 border-indigo-300'>
                                      <div className='flex gap-2'>
                                        <div className='text-lg'>{reply.avatar}</div>
                                        <div className='flex-1'>
                                          <div className='flex items-center gap-2'>
                                            <span className='font-semibold text-slate-800 text-sm'>{reply.author}</span>
                                            <span className='text-xs bg-purple-200 text-purple-700 px-1.5 py-0.5 rounded'>{reply.role}</span>
                                          </div>
                                          <p className='text-xs text-slate-700 mt-1'>{reply.text}</p>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resume Preview Modal */}
      {selectedResume && (
        <div className='fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn'>
          <div className='relative w-full max-w-4xl max-h-[90vh] overflow-y-auto card-gradient rounded-3xl p-2 shadow-2xl animate-scaleIn'>
            <button
              onClick={() => setSelectedResume(null)}
              className='absolute top-4 right-4 p-2 bg-white/80 rounded-full hover:bg-red-50 text-slate-600 hover:text-red-500 transition-all z-10 shadow-sm'
            >
              <XMarkIcon className='w-6 h-6' />
            </button>
            <div className='p-2 md:p-6'>
              <ResumePreview data={selectedResume} />
            </div>
            <div className='p-6 pt-0 flex justify-end gap-3'>
              <button
                onClick={() => setSelectedResume(null)}
                className='px-6 py-2 rounded-xl font-semibold text-slate-600 hover:bg-slate-100 transition-all'
              >
                Close
              </button>
              <button
                onClick={handleUseInspiration}
                disabled={inspirationSuccess}
                className='btn-primary px-8 py-2 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center gap-2'
              >
                {inspirationSuccess ? (
                  <><span>✨</span> Template Copied!</>
                ) : (
                  <>Use as Inspiration</>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
