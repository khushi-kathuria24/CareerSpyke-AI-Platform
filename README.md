# 🚀 CareerSpyke - AI-Powered Career Development Platform

[![Next.js](https://img.shields.io/badge/Next.js-14.1.0-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.2.0-blue)](https://reactjs.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.10-38B2AC)](https://tailwindcss.com/)
[![Google Gemini](https://img.shields.io/badge/Google-Gemini%20AI-4285F4)](https://ai.google.dev/)
[![AWS Cloud](https://img.shields.io/badge/AWS-Cloud%20Native-FF9900)](https://aws.amazon.com/)

> **CareerSpyke** is an intelligent career platform designed to help students and professionals bridge the gap between education and employment. It leverages Google Gemini and AWS's robust infrastructure to provide real-time interview practice, resume optimization, and personalized learning roadmaps.

---

## ✨ Features

### 🎯 Interview Preparation
- **Mock Interviews**: Practice HR, Technical, and Management rounds with AI-driven feedback.
- **Live Interview Analysis**: (Coming Soon) Real-time evaluation of body language and speech rhythm using **AWS Rekognition**.
- **Persona-Based Evaluation**: Role-specific feedback (HR / Tech Lead / Managerial).

### 📄 Resume Optimization
- **AI-Powered Analysis**: Upload your resume for a structural and content-based critique.
- **ATS Optimization**: Direct matching against job descriptions for better visibility.
- **High-Accuracy Extraction**: Utilizing **AWS Textract** for structured data identification.

### 🎓 Learning Tools
- **Code Explainer**: Break down complex programming concepts.
- **Learning Paths**: Personalized AI roadmaps based on your career goals.
- **SAKHA AI Assistant**: A 24/7 companion for your career questions.

---

## 🛠️ Tech Stack

### Frontend & Backend
- **Framework:** Next.js 14.1.0 & Node.js (Express)
- **Styling:** Tailwind CSS 3.4.10
- **Database:** PostgreSQL on **AWS RDS** (Development: SQLite)
- **Storage:** **AWS S3** for resumes and profile assets.

### AI Engine
- **Provider:** Google Generative AI (Gemini 1.5 Flash)
- **OCR/Document:** **AWS Textract**
- **Media Analysis:** **AWS Rekognition** & **AWS Transcribe**

---

## ☁️ AWS Cloud-Native Infrastructure

Following our **AWS Free Tier Strategy**, CareerSpyke is built for maximum scalability with zero out-of-pocket costs:

| Component | AWS Service | Why |
| :--- | :--- | :--- |
| **Hosting (Frontend)** | **AWS Amplify** | CI/CD linked directly to GitHub. |
| **Hosting (Backend)** | **AWS App Runner** | Managed container-service for easy scaling. |
| **Database** | **AWS RDS** | Secure, managed PostgreSQL backups. |
| **Storage** | **AWS S3** | Durable, multi-region file availability. |

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- Google Gemini API Key
- AWS Account (with Free Tier and Credits)

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
**CareerSpyke Dev Team**  
Built for the **AI for Bharat Hackathon**  
NIIT University

---

## 📄 License
This project is licensed under the MIT License.
