# Smart Todo App

A full-stack task management application built using **React, Vite, Tailwind CSS, and Supabase**.  
It allows users to securely manage their daily tasks with authentication, real-time database integration, and a clean UI.

---

## ✨ Features

- 🔐 **User Authentication**  
  Secure signup and login using Supabase Auth  

- ✅ **Task Management (CRUD)**  
  - Add tasks  
  - Delete tasks  
  - View tasks in real-time  

- 📊 **Dashboard UI**  
  Simple and responsive interface for managing tasks  

- 🔒 **Row-Level Security (RLS)**  
  Users can only access their own data  

- ⚡ **Fast & Responsive UI**  
  Built with React + Tailwind CSS  

---

## 🚀 Tech Stack

| Layer      | Technology                          |
|------------|------------------------------------|
| Frontend   | React, Vite, Tailwind CSS          |
| Backend    | Supabase (Auth + PostgreSQL DB)    |
| Deployment | Vercel                             |

---

## 📁 Project Structure
src/
components/ # UI components (TaskCard, AddTask, Navbar)
pages/ # Login, Dashboard
utils/ # Supabase client setup
App.tsx # Main app logic
main.tsx # Entry point


---

## ⚙️ Setup

### 1. Clone the repository

```bash
git clone https://github.com/YOUR_USERNAME/smart-todo.git
cd smart-todo
2. Install dependencies
npm install
3. Configure environment variables
Create a .env.local file:

VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key
4. Run the application
npm run dev
🌐 Deployment
The application is deployed using Vercel.

👉 Live Demo:


📌 Future Improvements
Task editing functionality

Task completion tracking

AI-based task suggestions

👤 Author
Gayathri Betha


