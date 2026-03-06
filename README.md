# 🚀 CareerSpyke - AI-Powered Career Development Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.10-38B2AC)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4)](https://ai.google.dev/)
[![AWS Cloud](https://img.shields.io/badge/AWS-Cloud%20Native-FF9900)](https://aws.amazon.com/)

> **CareerSpyke** is an intelligent career platform designed to help students and professionals bridge the gap between education and employment. It leverages Google Gemini and AWS's robust infrastructure to provide real-time interview practice, resume optimization, and personalized learning roadmaps.

---

## 🌐 Live Deployment

| Service | URL |
| :--- | :--- |
| **Frontend (Amplify)** | [https://main.d265zqgu77nhyq.amplifyapp.com](https://main.d265zqgu77nhyq.amplifyapp.com) |
| **Backend (App Runner)** | [https://ixm3evwr8s.us-east-1.awsapprunner.com](https://ixm3evwr8s.us-east-1.awsapprunner.com) |
| **System Health Check** | [/api/health](https://ixm3evwr8s.us-east-1.awsapprunner.com/api/health) |

---

## ✨ Features

### 🎯 Interview Preparation
- **Mock Interviews**: Practice HR, Technical, and Management rounds with AI-driven feedback.
- **AI Feedback Engine**: Get real-time scores and improvement tips via Google Gemini.
- **Role-specific questions**: Tailored questions based on job description and seniority.

### 📄 Resume Optimization
- **AI-Powered Analysis**: Upload your resume for a structural and content-based critique.
- **High-Accuracy Extraction**: Utilizing **AWS Textract** for fast and reliable data identification.

### 🎓 Learning Tools
- **Code Explainer**: Break down complex programming concepts.
- **Learning Paths**: Personalized AI roadmaps based on your career goals.
- **SAKHA AI Assistant**: A 24/7 companion for your career questions.

---

## 🛠️ Tech Stack

### Frontend & Backend
- **Framework:** Next.js 14 (App Router) & Node.js (Express)
- **Styling:** Vanilla CSS & Tailwind CSS
- **Database:** PostgreSQL on **AWS RDS** (Production) / SQLite (Local)
- **Deployment:** **AWS Amplify** (Frontend) & **AWS App Runner** (Backend)
- **Storage:** **AWS S3** for resume storage.

---

## 🔑 Environment Variables

To run this project, you will need to add the following variables to your environment:

### Backend (.env)
```env
PORT=5000
JWT_SECRET=your_secret_key
GEMINI_API_KEY=your_google_ai_api_key
GOOGLE_CLIENT_ID=your_google_id
GOOGLE_CLIENT_SECRET=your_google_secret

# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=xxx
AWS_SECRET_ACCESS_KEY=xxx
AWS_S3_BUCKET_NAME=xxx

# Database (RDS)
RDS_HOSTNAME=your_rds_endpoint
RDS_PORT=5432
RDS_USERNAME=postgres
RDS_PASSWORD=your_password
RDS_DB_NAME=postgres
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_GEMINI_API_KEY=your_gemini_key
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your_google_id
# For production, point to your App Runner URL
NEXT_PUBLIC_BACKEND_URL=https://ixm3evwr8s.us-east-1.awsapprunner.com
```

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- AWS Account (with RDS, S3, Amplify, and App Runner setup)
- Google Cloud Project (for Sign-In)

### Quick Start
```bash
# Clone the repository
git clone https://github.com/khushi-kathuria24/CareerSpyke-AI-Platform.git
cd CareerSpyke-AI-Platform

# Frontend Setup
cd frontend && npm install && npm run dev

# Backend Setup (New Terminal)
cd backend && npm install && npm start
```

---

## 🤝 Team
**Built for the AI for Bharat Hackathon**  
NIIT University

---

## 📄 License
This project is licensed under the MIT License.
