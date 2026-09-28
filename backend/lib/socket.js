import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/user.model.js";
import { allowedOrigins } from "./corsOrigins.js";

let io;
const userSockets = new Map(); // userId -> Set<socketId>

const getCookieValue = (cookieHeader, name) => {
	if (!cookieHeader) return null;
	const match = cookieHeader
		.split(";")
		.map((c) => c.trim())
		.find((c) => c.startsWith(`${name}=`));
	return match ? decodeURIComponent(match.slice(name.length + 1)) : null;
};

export const initializeSocket = (httpServer) => {
	io = new Server(httpServer, {
		cors: {
			origin: allowedOrigins,
			credentials: true,
		},
	});

	io.use(async (socket, next) => {
		try {
			const token = getCookieValue(socket.handshake.headers.cookie, "jwt-linkedin");
			if (!token) return next(new Error("Unauthorized"));

			const decoded = jwt.verify(token, process.env.JWT_SECRET);
			const user = await User.findById(decoded.userId).select("_id");
			if (!user) return next(new Error("Unauthorized"));

			socket.userId = user._id.toString();
			next();
		} catch (error) {
			next(new Error("Unauthorized"));
		}
	});

	io.on("connection", (socket) => {
		const { userId } = socket;

		if (!userSockets.has(userId)) userSockets.set(userId, new Set());
		userSockets.get(userId).add(socket.id);
		socket.join(`user:${userId}`);

		io.emit("onlineUsers", [...userSockets.keys()]);

		socket.on("typing", ({ to }) => {
			if (to) io.to(`user:${to}`).emit("typing", { from: userId });
		});

		socket.on("stopTyping", ({ to }) => {
			if (to) io.to(`user:${to}`).emit("stopTyping", { from: userId });
		});

		socket.on("disconnect", () => {
			const sockets = userSockets.get(userId);
			if (sockets) {
				sockets.delete(socket.id);
				if (sockets.size === 0) userSockets.delete(userId);
			}
			io.emit("onlineUsers", [...userSockets.keys()]);
		});
	});

	return io;
};

export const emitToUser = (userId, event, payload) => {
	if (!io) return;
	io.to(`user:${userId.toString()}`).emit(event, payload);
};
