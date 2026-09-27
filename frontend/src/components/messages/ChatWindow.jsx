import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { Loader, Send } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { axiosInstance } from "../../lib/axios";

const ChatWindow = ({ otherUser, authUser }) => {
	const [content, setContent] = useState("");
	const bottomRef = useRef(null);
	const queryClient = useQueryClient();

	const { data: messages, isLoading } = useQuery({
		queryKey: ["messages", otherUser._id],
		queryFn: async () => {
			const res = await axiosInstance.get(`/messages/${otherUser._id}`);
			return res.data;
		},
		refetchInterval: 3000,
	});

	const { mutate: sendMessage, isPending } = useMutation({
		mutationFn: async (text) => axiosInstance.post(`/messages/${otherUser._id}`, { content: text }),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["messages", otherUser._id] });
			queryClient.invalidateQueries({ queryKey: ["conversations"] });
		},
	});

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!content.trim() || isPending) return;
		sendMessage(content.trim());
		setContent("");
	};

	return (
		<div className='flex flex-col h-full'>
			<div className='flex items-center gap-3 px-4 py-3 border-b border-base-300'>
				<Link to={`/profile/${otherUser.username}`}>
					<img
						src={otherUser.profilePicture || "/avatar.png"}
						alt={otherUser.name}
						className='size-10 rounded-full object-cover'
					/>
				</Link>
				<div>
					<Link to={`/profile/${otherUser.username}`} className='font-semibold text-sm hover:underline'>
						{otherUser.name}
					</Link>
					<p className='text-xs text-info'>{otherUser.headline}</p>
				</div>
			</div>

			<div className='flex-1 overflow-y-auto px-4 py-3 space-y-2 min-h-[20rem] max-h-[28rem]'>
				{isLoading ? (
					<div className='flex justify-center py-6 text-info'>
						<Loader size={20} className='animate-spin' />
					</div>
				) : messages?.length === 0 ? (
					<p className='text-sm text-info text-center py-6'>
						Say hello to {otherUser.name.split(" ")[0]} 👋
					</p>
				) : (
					messages?.map((message) => {
						const isMine = message.sender === authUser._id;
						return (
							<div key={message._id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
								<div
									className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm ${
										isMine ? "bg-primary text-white rounded-br-sm" : "bg-base-100 rounded-bl-sm"
									}`}
								>
									<p className='whitespace-pre-wrap break-words'>{message.content}</p>
									<p className={`text-[10px] mt-1 ${isMine ? "text-white/70" : "text-info"}`}>
										{formatDistanceToNow(new Date(message.createdAt), { addSuffix: true })}
									</p>
								</div>
							</div>
						);
					})
				)}
				<div ref={bottomRef} />
			</div>

			<form onSubmit={handleSubmit} className='flex items-center gap-2 px-4 py-3 border-t border-base-300'>
				<input
					type='text'
					value={content}
					onChange={(e) => setContent(e.target.value)}
					placeholder='Write a message...'
					className='flex-grow p-2 px-4 rounded-full bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
				/>
				<button
					type='submit'
					disabled={isPending || !content.trim()}
					className='bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition duration-300 disabled:opacity-50 flex-shrink-0'
				>
					{isPending ? <Loader size={18} className='animate-spin' /> : <Send size={18} />}
				</button>
			</form>
		</div>
	);
};

export default ChatWindow;
