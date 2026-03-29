# 🎬 Netflix Clone — Full Stack

A production-grade Netflix clone built with React, Node.js, Express, MongoDB, and the TMDB API.

---

## 📁 Project Structure

```
netflix-clone/
├── backend/
│   ├── config/
│   │   └── db.js                  # MongoDB connection
│   ├── controllers/
│   │   ├── auth.controller.js     # signup, login, logout, getMe
│   │   ├── profile.controller.js  # CRUD profiles
│   │   ├── movie.controller.js    # TMDB proxy endpoints
│   │   ├── watchlist.controller.js
│   │   └── history.controller.js
│   ├── middleware/
│   │   ├── auth.middleware.js     # JWT protect middleware
│   │   └── validate.middleware.js # express-validator rules
│   ├── models/
│   │   ├── User.js                # bcrypt hashing, comparePassword
│   │   ├── Profile.js             # up to 5 per user
│   │   ├── Watchlist.js           # per-profile saved list
│   │   └── History.js             # per-profile watch progress
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── profile.routes.js
│   │   ├── movie.routes.js
│   │   ├── watchlist.routes.js
│   │   └── history.routes.js
│   ├── utils/
│   │   ├── jwt.utils.js           # token generation + cookie response
│   │   └── tmdb.utils.js          # axios TMDB client
│   ├── server.js                  # Express app entry point
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── common/
    │   │   │   └── SkeletonCard.jsx   # Skeleton loaders
    │   │   ├── layout/
    │   │   │   └── Navbar.jsx         # Sticky navbar, search, profile menu
    │   │   └── movie/
    │   │       ├── HeroBanner.jsx     # Auto-rotating hero + watchlist
    │   │       ├── MovieCard.jsx      # Hover card with play/info/list
    │   │       └── MovieRow.jsx       # Scrollable row with arrows
    │   ├── context/
    │   │   └── AuthContext.jsx        # Auth state, login/logout/profiles
    │   ├── hooks/
    │   │   ├── useMovies.js           # useMovies, useSearch, useInfiniteMovies
    │   │   └── useWatchlist.js        # toggle, isInWatchlist
    │   ├── pages/
    │   │   ├── LoginPage.jsx          # Auth form
    │   │   ├── SignupPage.jsx
    │   │   ├── ProfileSelectPage.jsx  # "Who's watching?" screen
    │   │   ├── ProfilePage.jsx        # Manage profiles (create/delete)
    │   │   ├── HomePage.jsx           # All movie rows + hero
    │   │   ├── MovieDetailPage.jsx    # Full detail: cast, trailer, similar
    │   │   ├── WatchPage.jsx          # Custom HTML5 video player
    │   │   ├── SearchPage.jsx         # Search + genre browse + infinite scroll
    │   │   └── MyListPage.jsx         # Watchlist, history, continue watching
    │   ├── services/
    │   │   └── api.js                 # Axios instance + all API methods
    │   ├── App.jsx                    # Routes + protected route guards
    │   ├── main.jsx
    │   └── index.css                  # Tailwind + custom Netflix styles
    ├── index.html
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## ⚙️ Environment Variables

### Backend (`backend/.env`)

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/netflixclone
JWT_SECRET=your_super_secret_jwt_key_here
JWT_EXPIRES_IN=7d
TMDB_API_KEY=your_tmdb_api_key_here
TMDB_BASE_URL=https://api.themoviedb.org/3
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend (`frontend/.env`)

```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Running Locally (Step by Step)

### Prerequisites
- Node.js 18+
- npm or yarn
- MongoDB Atlas account (free tier works)
- TMDB API key (free at https://www.themoviedb.org/settings/api)

---

### Step 1 — Clone and install

```bash
git clone <your-repo>
cd netflix-clone
```

**Backend:**
```bash
cd backend
npm install
cp .env.example .env
# Fill in your values in .env
```

**Frontend:**
```bash
cd ../frontend
npm install
cp .env.example .env
# Set VITE_API_URL=http://localhost:5000/api
```

---

### Step 2 — Get a TMDB API Key

1. Go to https://www.themoviedb.org/signup and create a free account
2. Visit https://www.themoviedb.org/settings/api
3. Request an API key (choose "Developer")
4. Copy the **API Key (v3 auth)** into `backend/.env` as `TMDB_API_KEY`

---

### Step 3 — Set up MongoDB Atlas

1. Go to https://cloud.mongodb.com → Create free cluster
2. Add a database user (username + password)
3. Whitelist IP: `0.0.0.0/0` for dev (or your specific IP)
4. Get the connection string: **Connect → Drivers → Node.js**
5. Paste into `backend/.env` as `MONGO_URI`

---

### Step 4 — Start the backend

```bash
cd backend
npm run dev
# ✅ MongoDB Connected
# 🚀 Server running on port 5000
```

---

### Step 5 — Start the frontend

```bash
cd frontend
npm run dev
# → http://localhost:5173
```

Open http://localhost:5173 in your browser.

---

## 🔌 Backend API Reference

### Auth
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | `/api/auth/signup` | Register new user | ❌ |
| POST | `/api/auth/login` | Login + set cookie | ❌ |
| POST | `/api/auth/logout` | Clear auth cookie | ✅ |
| GET | `/api/auth/me` | Get current user + profiles | ✅ |

### Profiles
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/profiles` | List all profiles for user |
| POST | `/api/profiles` | Create new profile (max 5) |
| PUT | `/api/profiles/:id` | Update profile |
| DELETE | `/api/profiles/:id` | Delete profile |

### Movies (TMDB Proxy)
| Method | Endpoint | Query Params |
|--------|----------|-------------|
| GET | `/api/movies/trending` | `type`, `window`, `page` |
| GET | `/api/movies/popular` | `type`, `page` |
| GET | `/api/movies/top-rated` | `type`, `page` |
| GET | `/api/movies/upcoming` | `page` |
| GET | `/api/movies/now-playing` | `page` |
| GET | `/api/movies/search` | `q`, `page` |
| GET | `/api/movies/genres` | `type` |
| GET | `/api/movies/genre/:genreId` | `type`, `page` |
| GET | `/api/movies/movie/:id` | — |
| GET | `/api/movies/tv/:id` | — |
| GET | `/api/movies/:id/videos` | `type` |

### Watchlist
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/watchlist?profileId=` | Get watchlist |
| POST | `/api/watchlist` | Add to watchlist |
| DELETE | `/api/watchlist/:movieId?profileId=` | Remove item |
| GET | `/api/watchlist/check/:movieId?profileId=` | Check if in list |

### History
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/history?profileId=` | Get watch history |
| POST | `/api/history` | Add/update entry (upsert) |
| DELETE | `/api/history/:movieId?profileId=` | Remove item |
| DELETE | `/api/history/clear?profileId=` | Clear all |

---

## 🗄️ Database Models

### User
```js
{ email, password (hashed), username, subscription, isActive, lastLogin }
```

### Profile
```js
{ user (ref), name, avatar, isKids, language, maturityRating, pin }
// Max 5 per user
```

### Watchlist
```js
{ profile (ref), user (ref), movieId, title, poster_path, backdrop_path,
  overview, vote_average, release_date, media_type, genre_ids, addedAt }
// Unique index: profile + movieId
```

### History
```js
{ profile (ref), user (ref), movieId, title, poster_path, backdrop_path,
  overview, vote_average, release_date, media_type, progress (0-100), 
  watchedAt, duration }
// Unique index: profile + movieId (upsert on re-watch)
```

---

## 🌐 Deployment

### Frontend → Vercel

1. Push your code to GitHub
2. Go to https://vercel.com → New Project → Import your repo
3. Set **Root Directory** to `frontend`
4. Set **Framework Preset** to Vite
5. Add Environment Variables:
   - `VITE_API_URL` = `https://your-backend.onrender.com/api`
6. Click **Deploy**

### Backend → Render

1. Go to https://render.com → New → Web Service
2. Connect your GitHub repo
3. Set **Root Directory** to `backend`
4. Set **Build Command**: `npm install`
5. Set **Start Command**: `node server.js`
6. Add all environment variables from `backend/.env`:
   - `MONGO_URI`, `JWT_SECRET`, `TMDB_API_KEY`, `NODE_ENV=production`
   - `CLIENT_URL` = your Vercel URL (e.g. `https://netflix-clone.vercel.app`)
7. Click **Create Web Service**

### MongoDB → Atlas (Production)
1. On your Atlas cluster → Network Access → Add your Render IP **or** allow `0.0.0.0/0`
2. The `MONGO_URI` you set in Render should be your Atlas connection string

### Post-Deployment Checklist
- [ ] Update `CLIENT_URL` in Render to your exact Vercel URL
- [ ] Update `VITE_API_URL` in Vercel to your exact Render URL
- [ ] Test signup → login → browse flow
- [ ] Verify cookies are set correctly (`sameSite: 'none'`, `secure: true` in production)

---

## ✨ Feature Summary

| Feature | Status |
|---------|--------|
| JWT auth (HTTP-only cookies) | ✅ |
| User signup & login | ✅ |
| Protected routes | ✅ |
| Multi-profile support (up to 5) | ✅ |
| Kids profile | ✅ |
| Hero banner (auto-rotating) | ✅ |
| Trending / Popular / Top Rated / Upcoming rows | ✅ |
| Movie & TV detail pages | ✅ |
| Cast display | ✅ |
| YouTube trailer embed | ✅ |
| Custom HTML5 video player | ✅ |
| Play/Pause/Seek/Volume/Fullscreen | ✅ |
| Keyboard shortcuts (Space, ←→, M, F) | ✅ |
| Watchlist (add/remove/check) | ✅ |
| Watch history with progress % | ✅ |
| Continue watching | ✅ |
| Search (debounced instant) | ✅ |
| Browse by genre | ✅ |
| Infinite scroll (genre pages) | ✅ |
| Skeleton loaders | ✅ |
| Lazy image loading | ✅ |
| IntersectionObserver section reveal | ✅ |
| Responsive mobile layout | ✅ |
| Netflix-style dark theme | ✅ |
| Input validation (frontend + backend) | ✅ |
| Global error handling | ✅ |

---

## 🔑 Security Notes

- Passwords hashed with **bcryptjs** (12 rounds)
- JWT stored in **HTTP-only cookies** (not accessible from JS)
- Token also sent as `Authorization: Bearer` header fallback
- CORS restricted to `CLIENT_URL` only
- Input validated with **express-validator** before hitting controllers
- Mongoose schemas enforce type-level validation

---

## 📝 Notes on Video Streaming

Real Netflix-style streaming requires licensed video content and a CDN. The `WatchPage` uses a **public domain sample video** (Big Buck Bunny) as a demo. A "Watch Trailer" button appears when TMDB provides a YouTube trailer key, embedding the actual trailer in an iframe.

To integrate real video:
- Use **Cloudflare Stream**, **Mux**, or **AWS MediaConvert + S3 + CloudFront**
- Store video URLs in your database linked to `movieId`
- Serve with signed URLs for access control
