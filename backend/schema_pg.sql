-- Users Table (Authentication & Signup)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  name TEXT NOT NULL,
  password TEXT NOT NULL,
  profile_picture TEXT,
  auth_provider TEXT DEFAULT 'email' CHECK(auth_provider IN ('email', 'google')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User Profile (Profile Page - Profile Analysis Results)
CREATE TABLE IF NOT EXISTS user_profiles (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL UNIQUE,
  bio TEXT,
  skills TEXT, -- JSON format for array of skills
  experience_level TEXT,
  headline TEXT,
  profile_analysis_score INTEGER,
  profile_analysis_feedback TEXT, -- Store profile analysis results
  profile_completion_percentage INTEGER,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Dashboard Courses
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  course_name TEXT NOT NULL,
  course_description TEXT,
  progress_percentage INTEGER DEFAULT 0,
  duration_hours INTEGER,
  start_date TIMESTAMP,
  completion_date TIMESTAMP,
  status TEXT DEFAULT 'in-progress' CHECK(status IN ('not-started', 'in-progress', 'completed')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Dashboard Skills
CREATE TABLE IF NOT EXISTS skills (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  skill_name TEXT NOT NULL,
  proficiency_level TEXT DEFAULT 'beginner' CHECK(proficiency_level IN ('beginner', 'intermediate', 'advanced', 'expert')),
  endorsements INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Dashboard Connections
CREATE TABLE IF NOT EXISTS connections (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  connection_user_id INTEGER NOT NULL,
  connection_name TEXT NOT NULL,
  connection_email TEXT,
  connection_status TEXT DEFAULT 'pending' CHECK(connection_status IN ('pending', 'connected', 'blocked')),
  connected_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (connection_user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Interviews (Dashboard - Scheduled & Taken)
CREATE TABLE IF NOT EXISTS interviews (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  interview_title TEXT NOT NULL,
  interview_type TEXT DEFAULT 'mock' CHECK(interview_type IN ('technical', 'hr', 'mock', 'scheduled')),
  interview_date TIMESTAMP,
  duration_minutes INTEGER,
  interviewer_name TEXT,
  company_name TEXT,
  status TEXT DEFAULT 'scheduled' CHECK(status IN ('scheduled', 'completed', 'cancelled', 'rescheduled')),
  score INTEGER,
  feedback TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Mock AI Interview Answers (Store user responses from mock interviews)
CREATE TABLE IF NOT EXISTS interview_responses (
  id SERIAL PRIMARY KEY,
  interview_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  question_number INTEGER,
  question_text TEXT,
  answer_text TEXT,
  audio_file_path TEXT, -- Store path to recorded audio
  ai_feedback TEXT,
  answer_score INTEGER,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (interview_id) REFERENCES interviews(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Community Posts
CREATE TABLE IF NOT EXISTS posts (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  content TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Community Comments (Save comments on posts)
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  comment_text TEXT NOT NULL,
  likes_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Resumes (File uploads)
CREATE TABLE IF NOT EXISTS resumes (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL,
  file_path TEXT NOT NULL,
  file_name TEXT NOT NULL,
  uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_user_id ON user_profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_courses_user_id ON courses(user_id);
CREATE INDEX IF NOT EXISTS idx_skills_user_id ON skills(user_id);
CREATE INDEX IF NOT EXISTS idx_connections_user_id ON connections(user_id);
CREATE INDEX IF NOT EXISTS idx_interviews_user_id ON interviews(user_id);
CREATE INDEX IF NOT EXISTS idx_interview_responses_user_id ON interview_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id);
