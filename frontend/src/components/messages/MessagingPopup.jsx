import { useQuery } from "@tanstack/react-query";
import { ChevronDown, ChevronUp, SquarePen, X } from "lucide-react";
import { axiosInstance } from "../../lib/axios";
import { useMessagingWidget } from "../../context/MessagingContext";
import ChatWindow from "./ChatWindow";

const MessagingPopup = ({ authUser }) => {
	const { isOpen, activeUserId, toggle, close, openChat, backToList } = useMessagingWidget();

	const { data: connections } = useQuery({
		queryKey: ["connections"],
		queryFn: () => axiosInstance.get("/connections").then((res) => res.data),
		enabled: !!authUser,
	});

	const { data: conversations } = useQuery({
		queryKey: ["conversations"],
		queryFn: () => axiosInstance.get("/messages/conversations").then((res) => res.data),
		enabled: !!authUser,
		refetchInterval: 60000,
	});

	const { data: unreadMessages } = useQuery({
		queryKey: ["unreadMessages"],
		queryFn: () => axiosInstance.get("/messages/unread-count"),
		enabled: !!authUser,
		refetchInterval: 60000,
	});

	if (!authUser) return null;

	const unreadCount = unreadMessages?.data?.count || 0;
	const activeUser = connections?.find((c) => c._id === activeUserId);

	return (
		<div className='fixed bottom-0 right-4 z-40 w-[300px] shadow-xl rounded-t-lg overflow-hidden border border-base-300 bg-secondary hidden sm:block'>
			<button
				onClick={toggle}
				className='w-full flex items-center justify-between gap-2 px-3 py-2.5 bg-secondary hover:bg-base-100 transition-colors'
			>
				<span className='flex items-center gap-2 min-w-0'>
					<span className='relative flex-shrink-0'>
						<img
							src={authUser.profilePicture || "/avatar.png"}
							alt={authUser.name}
							className='size-7 rounded-full object-cover'
						/>
						<span className='absolute bottom-0 right-0 size-2 rounded-full bg-green-500 border-2 border-secondary' />
					</span>
					<span className='font-semibold text-sm truncate'>Messaging</span>
					{unreadCount > 0 && (
						<span className='bg-primary text-white text-[10px] font-semibold rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none flex-shrink-0'>
							{unreadCount}
						</span>
					)}
				</span>
				<span className='flex items-center gap-1 flex-shrink-0 text-info'>
					<span
						role='button'
						tabIndex={0}
						onClick={(e) => {
							e.stopPropagation();
							backToList();
						}}
						className='p-1 hover:bg-base-300 rounded-full'
						aria-label='Compose new message'
					>
						<SquarePen size={16} />
					</span>
					{isOpen ? <ChevronDown size={18} /> : <ChevronUp size={18} />}
					<span
						role='button'
						tabIndex={0}
						onClick={(e) => {
							e.stopPropagation();
							close();
						}}
						className='p-1 hover:bg-base-300 rounded-full'
						aria-label='Close messaging'
					>
						<X size={16} />
					</span>
				</span>
			</button>

			{isOpen && (
				<div className='h-[420px] flex flex-col border-t border-base-300'>
					{activeUser ? (
						<div className='flex-1 min-h-0 flex flex-col'>
							<div className='flex items-center gap-2 px-2 py-1.5 border-b border-base-300'>
								<button
									onClick={backToList}
									className='text-xs font-medium text-info hover:text-primary px-2 py-1'
								>
									← Back
								</button>
							</div>
							<div className='flex-1 min-h-0'>
								<ChatWindow otherUser={activeUser} authUser={authUser} />
							</div>
						</div>
					) : (
						<div className='flex-1 overflow-y-auto'>
							<ConversationListForPopup
								connections={connections}
								conversations={conversations}
								authUserId={authUser._id}
								onSelect={openChat}
							/>
						</div>
					)}
				</div>
			)}
		</div>
	);
};

const ConversationListForPopup = ({ connections, conversations, authUserId, onSelect }) => {
	const conversationByUserId = new Map((conversations || []).map((c) => [c.user._id, c]));

	const items = (connections || [])
		.map((connection) => ({ connection, conversation: conversationByUserId.get(connection._id) }))
		.sort((a, b) => {
			const aTime = a.conversation ? new Date(a.conversation.lastMessage.createdAt).getTime() : 0;
			const bTime = b.conversation ? new Date(b.conversation.lastMessage.createdAt).getTime() : 0;
			return bTime - aTime;
		});

	if (items.length === 0) {
		return <p className='text-sm text-info text-center p-6'>Connect with people to start messaging them.</p>;
	}

	return (
		<ul className='divide-y divide-base-300'>
			{items.map(({ connection, conversation }) => {
				const lastMessage = conversation?.lastMessage;
				const isUnread = conversation?.unreadCount > 0;

				return (
					<li key={connection._id}>
						<button
							onClick={() => onSelect(connection._id)}
							className='w-full flex items-center gap-3 px-3 py-2.5 hover:bg-base-100 transition-colors text-left'
						>
							<img
								src={connection.profilePicture || "/avatar.png"}
								alt={connection.name}
								className='size-10 rounded-full object-cover flex-shrink-0'
							/>
							<div className='min-w-0 flex-1'>
								<p className={`text-sm truncate ${isUnread ? "font-bold" : "font-medium"}`}>{connection.name}</p>
								<p className={`text-xs truncate ${isUnread ? "font-semibold text-neutral" : "text-info"}`}>
									{lastMessage
										? `${lastMessage.sender === authUserId ? "You: " : ""}${lastMessage.content}`
										: connection.headline}
								</p>
							</div>
							{isUnread && <span className='size-2.5 rounded-full bg-primary flex-shrink-0' />}
						</button>
					</li>
				);
			})}
		</ul>
	);
};

export default MessagingPopup;
