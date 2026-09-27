import Message from "../models/message.model.js";
import User from "../models/user.model.js";
import { emitToUser } from "../lib/socket.js";

const ensureConnected = (req, res, userId) => {
	if (userId === req.user._id.toString()) {
		res.status(400).json({ message: "You can't message yourself" });
		return false;
	}
	if (!req.user.connections.some((id) => id.toString() === userId)) {
		res.status(403).json({ message: "You can only message your connections" });
		return false;
	}
	return true;
};

export const getConversations = async (req, res) => {
	try {
		const myId = req.user._id;

		const messages = await Message.find({
			$or: [{ sender: myId }, { recipient: myId }],
		})
			.sort({ createdAt: -1 })
			.lean();

		const conversationMap = new Map();

		for (const message of messages) {
			const otherUserId = message.sender.toString() === myId.toString() ? message.recipient.toString() : message.sender.toString();

			if (!conversationMap.has(otherUserId)) {
				conversationMap.set(otherUserId, {
					otherUserId,
					lastMessage: message,
					unreadCount: 0,
				});
			}

			if (message.recipient.toString() === myId.toString() && !message.read) {
				conversationMap.get(otherUserId).unreadCount += 1;
			}
		}

		const otherUserIds = [...conversationMap.keys()];
		const users = await User.find({ _id: { $in: otherUserIds } }).select("name username profilePicture headline");
		const userById = new Map(users.map((u) => [u._id.toString(), u]));

		const conversations = otherUserIds
			.map((id) => ({
				user: userById.get(id),
				lastMessage: conversationMap.get(id).lastMessage,
				unreadCount: conversationMap.get(id).unreadCount,
			}))
			.filter((c) => c.user)
			.sort((a, b) => new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt));

		res.json(conversations);
	} catch (error) {
		console.error("Error in getConversations controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getUnreadCount = async (req, res) => {
	try {
		const count = await Message.countDocuments({ recipient: req.user._id, read: false });
		res.json({ count });
	} catch (error) {
		console.error("Error in getUnreadCount controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMessages = async (req, res) => {
	try {
		const { userId } = req.params;
		const myId = req.user._id;

		if (!ensureConnected(req, res, userId)) return;

		const messages = await Message.find({
			$or: [
				{ sender: myId, recipient: userId },
				{ sender: userId, recipient: myId },
			],
		}).sort({ createdAt: 1 });

		const { modifiedCount } = await Message.updateMany(
			{ sender: userId, recipient: myId, read: false },
			{ $set: { read: true } }
		);

		if (modifiedCount > 0) {
			emitToUser(userId, "messagesRead", { by: myId.toString() });
		}

		res.json(messages);
	} catch (error) {
		console.error("Error in getMessages controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const sendMessage = async (req, res) => {
	try {
		const { userId } = req.params;
		const { content } = req.body;

		if (!ensureConnected(req, res, userId)) return;

		if (!content || !content.trim()) {
			return res.status(400).json({ message: "Message content is required" });
		}

		const message = new Message({
			sender: req.user._id,
			recipient: userId,
			content: content.trim(),
		});
		await message.save();

		emitToUser(userId, "newMessage", message);
		emitToUser(req.user._id.toString(), "newMessage", message);

		res.status(201).json(message);
	} catch (error) {
		console.error("Error in sendMessage controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
