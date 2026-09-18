# DevTinder

A swipe-based matchmaking platform for developers to find collaborators — built as a full-stack
portfolio project covering real-time communication, authentication (including OAuth), caching,
and containerized deployment.

## Tech stack

| Layer          | Technology                                                             |
|----------------|-------------------------------------------------------------------------|
| Frontend       | React 18, TypeScript, Vite, Tailwind CSS, React Router                 |
| Backend        | Node.js, Express                                                       |
| Database       | MongoDB (Mongoose)                                                      |
| Cache          | Redis (swipe-feed caching, with graceful fallback if unavailable)      |
| Real-time      | Socket.io (live chat, typing indicators, instant match notifications)  |
| Auth           | JWT (email/password) + Google OAuth (Google Identity Services)         |
| Deployment     | Docker, Docker Compose                                                 |

## Features

- **Swipe deck** — browse developer profiles one at a time, like or pass
- **Skill-aware feed** — candidates who share at least one skill with you are surfaced first
- **Mutual matching** — when two users like each other, a match is created automatically and
  both are notified in real time if they're online
- **Real-time chat** — Socket.io-backed messaging per match, with typing indicators and
  persisted history
- **Profiles** — name, role, bio, skills, location, photo
- **Auth** — register/login with email + password, or sign in with Google

## Project structure

```
devtinder/
├── backend/            Express API + Socket.io server
│   ├── src/
│   │   ├── config/     MongoDB + Redis connections
│   │   ├── models/     User, Swipe, Match, Message
│   │   ├── controllers/
│   │   ├── routes/
│   │   ├── middleware/ JWT auth, error handling
│   │   ├── sockets/    Real-time chat + match notifications
│   │   └── utils/      Token generation, demo data seeding
│   └── server.js
├── frontend/           React + TypeScript client
│   └── src/
│       ├── api/        Axios calls per resource
│       ├── context/    Auth state (JWT persistence)
│       ├── hooks/       Shared Socket.io connection
│       ├── components/ Navbar, SwipeCard, MatchModal, ProtectedRoute
│       └── pages/       Login, Register, Discover, Matches, ChatRoom, Profile
└── docker-compose.yml
```

## Running locally (without Docker)

You'll need Node.js 18+, MongoDB, and Redis running locally (or point the `.env` files at
hosted instances — MongoDB Atlas and Upstash/Redis Cloud both have free tiers).

**1. Backend**

```bash
cd backend
cp .env.example .env    # then fill in JWT_SECRET, and GOOGLE_CLIENT_ID if using Google sign-in
npm install
npm run seed             # optional: adds a few demo profiles so the feed isn't empty
npm run dev
```

**2. Frontend**

```bash
cd frontend
cp .env.example .env
npm install
npm run dev
```

Visit `http://localhost:5173`.

## Running with Docker Compose

```bash
docker compose up --build
```

This starts MongoDB, Redis, the backend (`:5000`), and the frontend (`:4173`) together. If you
want Google sign-in to work inside Docker, export `GOOGLE_CLIENT_ID` and `JWT_SECRET` in your
shell before running `docker compose up` — Vite bakes `VITE_*` variables in at build time, so
they're passed as build args rather than runtime environment variables.

## Setting up Google Sign-In (optional)

1. Create an OAuth client at the [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   (type: "Web application").
2. Add `http://localhost:5173` (and `http://localhost:4173` if using Docker) to **Authorized
   JavaScript origins**.
3. Put the client ID in `backend/.env` (`GOOGLE_CLIENT_ID`) and `frontend/.env`
   (`VITE_GOOGLE_CLIENT_ID`).

Without this configured, email/password auth still works fully — the Google button just won't
render.

## Design notes

The UI leans into the "developer" audience deliberately rather than reusing a generic dating-app
look: a dark editor-style palette, monospace accents for metadata (skills, timestamps, labels),
and a match celebration modal styled like a terminal running `git merge`. Swipe cards render
skills as syntax-highlight-style tags rather than plain pills.

## Known limitations / good next steps

This is a portfolio-grade MVP, not a production system. If you extend it, the highest-value next
steps are:

- **Photo upload** — currently profiles take a raw image URL; swapping in S3/Cloudinary upload
  would be a natural addition and a good talking point on its own.
- **Pagination / infinite scroll** on the swipe feed instead of a fixed batch of 20.
- **Tests** — there's no automated test suite yet; Jest + Supertest on the backend and
  Vitest + React Testing Library on the frontend would be the natural additions.
- **Presence/online indicators** — the socket layer already tracks connections per user room;
  surfacing "online now" in the UI is mostly frontend work at this point.
- **Rate limiting on the swipe endpoint** — currently only auth routes are rate-limited.

## Why this project exists

Built to demonstrate full-stack ownership end-to-end: schema design, secure authentication
(including OAuth), a real-time system (not just request/response), a caching layer used
correctly (cache-aside with graceful degradation), and a containerized deployment story — the
things a full-stack role actually exercises day to day.
