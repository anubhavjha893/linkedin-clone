import express from "express";
import http from "http";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import path from "path";
import fs from "fs";

import authRoutes from "./routes/auth.route.js";
import userRoutes from "./routes/user.route.js";
import postRoutes from "./routes/post.route.js";
import notificationRoutes from "./routes/notification.route.js";
import connectionRoutes from "./routes/connection.route.js";
import messageRoutes from "./routes/message.route.js";
import jobRoutes from "./routes/job.route.js";

import { connectDB } from "./lib/db.js";
import { initializeSocket } from "./lib/socket.js";
import { allowedOrigins } from "./lib/corsOrigins.js";

dotenv.config();

const app = express();
const httpServer = http.createServer(app);
initializeSocket(httpServer);
const PORT = process.env.PORT || 5000;
const __dirname = path.resolve();

app.use(
	helmet({
		// disabled: the app renders cross-origin images (Cloudinary) and this is an API-only
		// server in dev; a default CSP would silently block those without real benefit here.
		contentSecurityPolicy: false,
		crossOriginEmbedderPolicy: false,
		// the frontend (5173) and this API (5000) are different origins in dev, and in
		// production this API may still be called cross-origin - "same-origin" CORP would
		// have the browser silently block the frontend's own fetch responses.
		crossOriginResourcePolicy: { policy: "cross-origin" },
	})
);

app.get("/api/v1/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

app.use(
	cors({
		origin: (origin, callback) => {
			// no Origin header (curl, server-to-server, health checks) - allow
			if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
			callback(new Error("Not allowed by CORS"));
		},
		credentials: true,
	})
);

app.use(express.json({ limit: "5mb" })); // parse JSON request bodies
app.use(cookieParser());

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/posts", postRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/connections", connectionRoutes);
app.use("/api/v1/messages", messageRoutes);
app.use("/api/v1/jobs", jobRoutes);

const frontendDistPath = path.join(__dirname, "frontend", "dist");
if (process.env.NODE_ENV === "production" && fs.existsSync(frontendDistPath)) {
	// only relevant when the frontend is built and served from this same server;
	// when the frontend is deployed separately (e.g. Vercel) this is simply skipped.
	app.use(express.static(frontendDistPath));

	app.get("*", (req, res) => {
		res.sendFile(path.join(frontendDistPath, "index.html"));
	});
}

httpServer.listen(PORT, () => {
	console.log(`Server running on port ${PORT}`);
	connectDB();
});
