# 🎵 MoodyO - Mood-Based Audio Player

A beautiful, interactive mood-based music player with admin panel and MongoDB integration.

## 🚀 How to Run This Project

### Prerequisites
- **Node.js** (version 18 or higher)
- **MongoDB Atlas** account (free tier available)
- **npm** or **yarn** package manager

### Quick Start

1. **Clone and Install Dependencies:**
   ```bash
   git clone <your-repo-url>
   cd moodyo
   npm install
   cd server && npm install && cd ..
   ```

2. **Set up Environment (.env.local):**
   Create `.env.local` file in the root directory:
   ```
   MONGODB_URI=mongodb+srv://EeshanRohith:Rohith%40123@cluster0.mh1d1hz.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
   ```
   > **Note:** Replace with your actual MongoDB Atlas connection string.

3. **Configure MongoDB Atlas:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com)
   - Network Access → Add IP Address → Add your current IP Address (or 0.0.0.0/0 for all IPs)

4. **Start the Servers:**
   ```bash
   # Terminal 1 - Next.js Frontend (port 9002)
   npm run dev

   # Terminal 2 - Express Backend (port 3000)
   cd server && npm start
   ```

### 🎯 Access URLs

- **Main Website:** http://localhost:9002
- **Admin Panel:** http://localhost:9002/admin
- **API Server:** http://localhost:3000

## 📊 Features

### User Features
- 🎨 Beautiful mood-based UI with dynamic themes
- 🎵 7 pre-loaded songs across 4 mood categories
- 🎶 Real-time audio playback with controls
- ❤️ Like/favorite songs
- 📱 Responsive design for all devices

### Admin Features
- ➕ Add new songs for different moods
- ✏️ Edit existing songs (title, artist, URL, mood)
- 🗑️ Delete songs
- 🔍 View all songs in organized dashboard
- ✅ Real-time database updates

## 🎼 Current Song Collection

### Happy Mood (1 song)
- Chuttamalle (From Devara) - Devara-NTR, Janhvi Kapoor

### Joyful Mood (2 songs)
- Vande Mataram - Daler Mehndi, Udit Narayan
- Aao Milake Gaayein - Shadab Faridi, Altamash Faridi

### Sad Mood (2 songs)
- Kaise Hua - Vishal Mishra
- Tujse Pyaar Karoon - Javed Akhtar & Nayyara Noor

### Depression Mood (2 songs)
- O Sathi Mere - Pritam Chakraborty & Arijit Singh
- Waiting for You - Arshad Muhammad

## 🛠️ Tech Stack

- **Frontend:** Next.js 15, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Express.js
- **Database:** MongoDB Atlas
- **Animation:** GSAP, ScrollTrigger
- **UI Components:** SHADCN/ui
- **Icons:** Lucide React

## 📝 API Endpoints

### Admin Endpoints
- `GET /api/admin/songs` - Get all songs
- `POST /api/admin/songs` - Add new song
- `PUT /api/admin/songs/[id]` - Update song
- `DELETE /api/admin/songs/[id]` - Delete song

### User Endpoints
- `GET /api/songs/happy` - Get happy songs
- `GET /api/songs/joyful` - Get joyful songs
- `GET /api/songs/sad` - Get sad songs
- `GET /api/songs/depression` - Get depression songs

## 🎨 UI Themes

Each mood has its own color scheme and background:
- **Happy:** Bright yellows and oranges
- **Joyful:** Vibrant pinks and purples
- **Sad:** Calm blues and grays
- **Depression:** Dark, ambient themes

## 🚧 Development

### Project Structure
```
moodyo/
├── src/                    # Next.js frontend
│   ├── app/               # App Router pages
│   │   ├── admin/        # Admin panel
│   │   ├── api/          # API routes
│   │   └── page.tsx      # Main homepage
│   ├── components/       # Reusable components
│   ├── ai/              # AI flows (mood/image generation)
│   └── lib/             # Utilities
├── server/               # Express backend
│   ├── index.js         # Server entry point
│   ├── models/          # MongoDB models
│   └── package.json     # Server dependencies
└── client/              # Angular client (alternative)
```

### Scripts
- `npm run dev` - Start Next.js development server
- `npm run build` - Build for production
- `cd server && npm start` - Start Express server

## 📄 License

Made with ❤️ by Bouroju Akshay

**Email:** 23eg106b12@anurag.edu.in
