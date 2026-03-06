# 🛠️ AWS Deployment Walkthrough: Live Prototype

Follow these exact steps to host your **CareerSpyke** platform on AWS for free using your credits and Free Tier.

---

## 🏗️ Phase 1: Frontend (Next.js) on AWS Amplify
*Approx. 5 minutes*

1.  **Open AWS Console**: Go to [AWS Amplify](https://console.aws.amazon.com/amplify/home).
2.  **Create New App**: Click **"New App"** -> **"Host web app"**.
3.  **Connect GitHub**: Select **GitHub** and authorize.
4.  **Select Repo**: Choose `CareerSpyke-AI-Platform`.
5.  **Branch**: Select `main`.
6.  **Build Settings**: Amplify will auto-detect Next.js. 
    *   **IMPORTANT**: Click **"Advanced settings"** and add your `GEMINI_API_KEY` under **Environment variables**.
7.  **Save and Deploy**: Amplify will now build and provide a URL like `https://main.d1xxxx.amplifyapp.com`.

---

## ⚙️ Phase 2: Backend (Node.js) on AWS App Runner
*Approx. 10 minutes*

1.  **Go to App Runner**: Search for **AWS App Runner** in the console.
2.  **Create Service**: Click **"Create service"**.
3.  **Source**: Select **"Source code repository"**.
4.  **Connect GitHub**: Choose your repo again.
5.  **Deployment Settings**:
    *   **Deployment trigger**: Choose **Automatic** (so it updates when you push code).
6.  **Configure Build**:
    *   **Runtime**: Node.js 18.
    *   **Build command**: `cd backend && npm install`
    *   **Start command**: `cd backend && node server.js`
    *   **Port**: `5000`.
7.  **Environment Variables**: Add your `JWT_SECRET`, `DB_NAME`, etc.
8.  **Deploy**: Once finished, you'll get a URL like `https://xxxx.awsapprunner.com`. **Copy this!** update your Frontend's `BACKEND_URL` variable in Amplify with this new link.

---

## 🗄️ Phase 3: Database (PostgreSQL) on AWS RDS
*Optional: Use this to move away from SQLite*

1.  **Go to RDS**: Search for **RDS**.
2.  **Create Database**:
    *   **Engine**: PostgreSQL.
    *   **Templates**: Select **"Free Tier"** (CRITICAL).
    *   **Instance**: `db.t3.micro`.
    *   **Storage**: 20GB (Standard).
    *   **Connectivity**: Make sure to allow your App Runner service access via Security Groups.
3.  **Update Backend**: Update your Backend environment variables on App Runner to point to the RDS Endpoint.

---

## 🔍 Phase 4: AI Extraction with AWS Textract
*For the high-performance resume analysis*

1.  **IAM Role**: Go to **IAM** and create a user with `AmazonS3FullAccess` and `AmazonTextractFullAccess`.
2.  **Keys**: Generate an **Access Key ID** and **Secret Access Key**.
3.  **Integrate**: I can help you write the specific code to swap the current PDF parser for the AWS SDK call.

---

## 📈 Monitoring & Alerts (Stay Free!)

1.  **AWS Budgets**: Go to **Budgets** and create a "Zero Spend" budget.
2.  **GitHub CI/CD**: Every time you `git push`, AWS Amplify and App Runner will automatically update your live site!

> [!SUCCESS]
> **Your code is already pushed!** You can start with Phase 1 immediately by logging into your AWS Console.

---

### Final Project Status
- [x] Refactored Codebase
- [x] AWS Storage/Database Migration Plan
- [x] Professional README
- [x] GitHub Repository Initialized
- [x] Secrets Scanned & Cleaned
- [x] Push to GitHub Successful
- [ ] LIVE URL (Waiting for your Phase 1 & 2 completion)
