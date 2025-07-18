## 💸 Smart Expense Tracker for College Events

A solo-built, AI-powered event budget management system designed for college fests, cultural programs, symposiums, and departmental events. Built during a 24-hour hackathon.

---

## 🚀 Project Overview

Student-led events often suffer from poor budget management, overspending, and lack of documentation. This smart tracker helps:

* Plan ideal category-wise budget allocations using AI logic
* Log expenses in real-time with full Supabase backend sync
* Notify users of budget breaches
* Analyze category spend via charts
* Export summary reports as PDF

---

## 🌟 Features

| Feature                    | Description                                                             |
| -------------------------- | ----------------------------------------------------------------------- |
| 🧠 **AI Budget Planner**   | Smart allocation using preset event logic (e.g. food, logistics, decor) |
| 📊 **Analytics Dashboard** | Interactive charts to monitor category-wise spend                       |
| 🔔 **Notifications**       | Real-time alerts when crossing limits                                   |
| 🌗 **Dark Mode Toggle**    | Seamless toggle UI for accessibility                                    |
| 📄 **PDF Export**          | One-click export of expense reports                                     |
| 📱 **Mobile Responsive**   | Optimized for all screen sizes                                          |

---

## 🛠 Tech Stack

| Layer          | Tool                                       |
| -------------- | ------------------------------------------ |
| ⚙️ Backend     | Supabase (PostgreSQL + Auth + RLS)         |
| 🖼 Frontend    | Lovable + Cursor (React + Tailwind + Vite) |
| 📦 Hosting     | Vercel (with GitHub Actions CI/CD)         |
| 📁 File Export | jsPDF for generating PDFs                  |

---

## 🔐 Security

* 🔒 Supabase **Row-Level Security** ensures only authenticated users can access their data.
* Secure Sign-Up + Login flow with email confirmation.

---

## 📽️ Demo

### 🔗 [Live Project Preview](https://dd99dde1-cb8e-4e48-a3bf-f6799ac052eb.lovableproject.com/dashboard)

### 🎥 [Demo Video](_link_to_video_if_uploaded_)

---

## 📸 Screenshots

> 📷 Add screenshots of:
>
> * Dashboard
> * AI Planner view
> * Analytics chart
> * Dark mode
> * PDF export in action

---

## 🧑‍💻 Developer

**Name:** Sidaarth K
**Role:** Solo Developer
**College:** Sathyabama Institute of Science & Technology
**Track:** CSE, FinTech + AI/ML enthusiast

---

## 📝 How to Run Locally

```bash
git clone https://github.com/yourusername/smart-expense-tracker.git
cd smart-expense-tracker
npm install
npm run dev
```

> Setup Supabase `.env` with public URL & anon key
