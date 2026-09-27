import { Link } from "react-router-dom";
import { formatDistanceToNowStrict } from "date-fns";

const ConversationList = ({ connections, conversations, activeUserId, authUserId }) => {
	const conversationByUserId = new Map((conversations || []).map((c) => [c.user._id, c]));

	const items = (connections || [])
		.map((connection) => ({
			connection,
			conversation: conversationByUserId.get(connection._id),
		}))
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
				const isActive = activeUserId === connection._id;
				const lastMessage = conversation?.lastMessage;
				const isUnread = conversation?.unreadCount > 0;

				return (
					<li key={connection._id}>
						<Link
							to={`/messages/${connection._id}`}
							className={`flex items-center gap-3 px-3 py-3 hover:bg-base-100 transition-colors ${
								isActive ? "bg-base-100" : ""
							}`}
						>
							<img
								src={connection.profilePicture || "/avatar.png"}
								alt={connection.name}
								className='size-11 rounded-full object-cover flex-shrink-0'
							/>
							<div className='min-w-0 flex-1'>
								<div className='flex items-center justify-between gap-2'>
									<p className={`text-sm truncate ${isUnread ? "font-bold" : "font-medium"}`}>
										{connection.name}
									</p>
									{lastMessage && (
										<span className='text-[11px] text-info flex-shrink-0'>
											{formatDistanceToNowStrict(new Date(lastMessage.createdAt))}
										</span>
									)}
								</div>
								<p className={`text-xs truncate ${isUnread ? "font-semibold text-neutral" : "text-info"}`}>
									{lastMessage
										? `${lastMessage.sender === authUserId ? "You: " : ""}${lastMessage.content}`
										: connection.headline}
								</p>
							</div>
							{isUnread && <span className='size-2.5 rounded-full bg-primary flex-shrink-0' />}
						</Link>
					</li>
				);
			})}
		</ul>
	);
};

export default ConversationList;
