<h1 align="center">LinkedIn Clone</h1>

<p align="center">
  A full-stack professional networking app built with the MERN stack: connect with people, share posts, chat in real time and browse jobs.
</p>

<p align="center">
  <a href="https://linkedin-clone-lovat-tau.vercel.app"><strong>Live demo</strong></a>
  &nbsp;·&nbsp;
  <a href="#getting-started">Getting started</a>
  &nbsp;·&nbsp;
  <a href="#api-overview">API overview</a>
</p>

<p align="center">
  <img alt="React" src="https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white">
  <img alt="Vite" src="https://img.shields.io/badge/Vite-5-646CFF?logo=vite&logoColor=white">
  <img alt="Node.js" src="https://img.shields.io/badge/Node.js-Express-339933?logo=node.js&logoColor=white">
  <img alt="MongoDB" src="https://img.shields.io/badge/MongoDB-Mongoose-47A248?logo=mongodb&logoColor=white">
  <img alt="Socket.IO" src="https://img.shields.io/badge/Socket.IO-4-010101?logo=socket.io&logoColor=white">
  <img alt="Tailwind CSS" src="https://img.shields.io/badge/Tailwind-DaisyUI-06B6D4?logo=tailwindcss&logoColor=white">
</p>

> The live demo's backend runs on a free Render instance, so the first request after a period of inactivity can take up to a minute while the server wakes up.

---

## Features

**Accounts and profiles**
- Sign up, log in and log out with JWT authentication stored in HTTP-only cookies
- Editable profile with headline, location, about, experience, education, skills, profile picture and banner
- Welcome email on sign-up

**Network**
- Send, accept and reject connection requests
- Suggested people to connect with
- Search for users

**Feed**
- Create posts with text and images
- Like, comment on (edit or delete) and repost posts
- Feed built from your connections' activity
- `#hashtags` open a hashtag feed and `@mentions` link to a profile
- Deep links to individual posts

**Messaging**
- Real-time one-to-one chat over Socket.IO
- Online/offline presence and typing indicators
- Floating message popup available from any page

**Jobs board**
- Post job openings and browse, search and filter open roles
- Apply with an optional note and withdraw an application
- Job posters get a notification for each application and can manage applicants

**Notifications**
- In-app notifications for connection requests, likes, comments and job applications

**Security and performance**
- `helmet` security headers, rate limiting on auth routes and a health-check endpoint
- Input guards against NoSQL injection on login and sign-up
- Configurable CORS allowlist and cross-origin cookies for split deployments
- Route-based code splitting on the frontend

## Tech stack

| Layer     | Technology                                                                     |
| --------- | ------------------------------------------------------------------------------ |
| Frontend  | React 18, Vite, React Router, TanStack Query, Axios, Tailwind CSS, DaisyUI     |
| Backend   | Node.js, Express, Socket.IO                                                    |
| Database  | MongoDB with Mongoose                                                          |
| Auth      | JSON Web Tokens in HTTP-only cookies, bcryptjs                                 |
| Services  | Cloudinary (image uploads), Mailtrap (transactional email)                     |
| Hosting   | Vercel (frontend), Render (backend), MongoDB Atlas (database)                  |

## Project structure

```
linkedin-clone/
├── backend/
│   ├── controllers/     # Request handlers (auth, posts, connections, messages, jobs, ...)
│   ├── emails/          # Email templates
│   ├── lib/             # DB, Cloudinary, Mailtrap, Socket.IO, CORS and cookie helpers
│   ├── middleware/      # Auth middleware
│   ├── models/          # Mongoose schemas
│   ├── routes/          # Express routers
│   └── server.js        # App entry point
├── frontend/
│   └── src/
│       ├── components/  # Reusable UI (posts, profile sections, messages, jobs, layout)
│       ├── pages/       # Route-level pages
│       ├── context/     # React context providers
│       └── lib/         # Axios instance and helpers
└── package.json
```

## Getting started

### Prerequisites

- Node.js 18 or newer
- A [MongoDB](https://www.mongodb.com/atlas) database (Atlas free tier works)
- A [Cloudinary](https://cloudinary.com) account for image uploads
- A [Mailtrap](https://mailtrap.io) account for emails (optional)

### 1. Clone and install

```bash
git clone https://github.com/anubhavjha893/linkedin-clone.git
cd linkedin-clone

npm install
npm install --prefix frontend
```

### 2. Configure environment variables

Create `backend/.env` (see `backend/.env.example`):

```env
PORT=5000
NODE_ENV=development

MONGO_URI=<your_mongodb_connection_string>
JWT_SECRET=<a_long_random_string>

CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=<your_cloud_name>
CLOUDINARY_API_KEY=<your_api_key>
CLOUDINARY_API_SECRET=<your_api_secret>

MAILTRAP_TOKEN=<your_mailtrap_token>
EMAIL_FROM=<sender_email_address>
EMAIL_FROM_NAME=<sender_name>
```

`CLIENT_URL` accepts a comma-separated list of allowed origins. The first one is used when building links in emails.

The frontend needs no configuration in development. For a split deployment, set `VITE_API_URL` to your backend's URL (for example `https://your-api.onrender.com`).

### 3. Run in development

In two terminals:

```bash
# Terminal 1 - API on http://localhost:5000
npm run dev

# Terminal 2 - frontend on http://localhost:5173
npm run dev --prefix frontend
```

### 4. Run a production build

Build the frontend and serve it from the Express server:

```bash
npm run build
NODE_ENV=production npm start
```

## Deployment

The app can run as one server or be split across two hosts. The live demo uses the split setup.

**Backend on Render (Web Service)**

| Setting         | Value           |
| --------------- | --------------- |
| Root directory  | *(leave empty)* |
| Build command   | `npm install`   |
| Start command   | `npm start`     |

Set the variables from the `.env` section above, with `NODE_ENV=production` and `CLIENT_URL` set to your frontend's URL.

**Frontend on Vercel**

| Setting          | Value                              |
| ---------------- | ---------------------------------- |
| Root directory   | `frontend`                         |
| Framework preset | Vite                               |
| Environment      | `VITE_API_URL` = your backend URL  |

In production the API sets `SameSite=None; Secure` cookies so that authentication works across the two domains.

## API overview

All routes are prefixed with `/api/v1`.

| Resource          | Base path        | What it covers                                                  |
| ----------------- | ---------------- | --------------------------------------------------------------- |
| Auth              | `/auth`          | Sign up, log in, log out, current user                          |
| Users             | `/users`         | Suggested users, search, public profiles, profile updates       |
| Posts             | `/posts`         | Feed, create, delete, like, repost, comments, single post, hashtag feed |
| Connections       | `/connections`   | Send, accept, reject and remove connections, pending requests   |
| Messages          | `/messages`      | Conversations and message history                               |
| Jobs              | `/jobs`          | Create, list, search, apply, withdraw, manage applicants        |
| Notifications     | `/notifications` | List, mark as read, delete                                      |
| Health            | `/health`        | Liveness check, returns `{ "status": "ok" }`                    |

## Scripts

| Command                          | Description                                      |
| -------------------------------- | ------------------------------------------------ |
| `npm run dev`                    | Start the API with nodemon                       |
| `npm start`                      | Start the API                                    |
| `npm run build`                  | Install dependencies and build the frontend      |
| `npm run dev --prefix frontend`  | Start the Vite dev server                        |
| `npm run lint --prefix frontend` | Lint the frontend                                |

## Author

**Anubhav Jha** - [@anubhavjha893](https://github.com/anubhavjha893)
