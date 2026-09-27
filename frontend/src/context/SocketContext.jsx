import { createContext, useContext, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { io } from "socket.io-client";

const SOCKET_URL = import.meta.env.MODE === "development" ? "http://localhost:5000" : "/";

const SocketContext = createContext({ socket: null, onlineUsers: new Set() });

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ userId, children }) => {
	const [socket, setSocket] = useState(null);
	const [onlineUsers, setOnlineUsers] = useState(new Set());
	const queryClient = useQueryClient();

	useEffect(() => {
		if (!userId) {
			setSocket(null);
			setOnlineUsers(new Set());
			return;
		}

		const newSocket = io(SOCKET_URL, { withCredentials: true });
		setSocket(newSocket);

		newSocket.on("onlineUsers", (ids) => setOnlineUsers(new Set(ids)));

		newSocket.on("newMessage", (message) => {
			const otherUserId = message.sender === userId ? message.recipient : message.sender;
			queryClient.invalidateQueries({ queryKey: ["messages", otherUserId] });
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
			queryClient.invalidateQueries({ queryKey: ["unreadMessages"] });
		});

		newSocket.on("messagesRead", ({ by }) => {
			queryClient.invalidateQueries({ queryKey: ["messages", by] });
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		});

		return () => {
			newSocket.disconnect();
			setSocket(null);
		};
	}, [userId, queryClient]);

	return <SocketContext.Provider value={{ socket, onlineUsers }}>{children}</SocketContext.Provider>;
};
