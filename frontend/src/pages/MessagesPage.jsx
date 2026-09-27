import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { MessageSquare } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";
import { CardSkeleton } from "../components/Skeleton";

const MessagesPage = () => {
	const { userId } = useParams();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: connections, isLoading: isConnectionsLoading } = useQuery({
		queryKey: ["connections"],
		queryFn: () => axiosInstance.get("/connections").then((res) => res.data),
	});

	const { data: conversations } = useQuery({
		queryKey: ["conversations"],
		queryFn: () => axiosInstance.get("/messages/conversations").then((res) => res.data),
		// sockets invalidate this on new messages; this is just a safety net
		refetchInterval: 60000,
	});

	const activeUser = connections?.find((c) => c._id === userId);

	return (
		<div className='bg-secondary rounded-lg shadow overflow-hidden' style={{ height: "calc(100vh - 8rem)" }}>
			<div className='grid grid-cols-1 md:grid-cols-3 h-full'>
				<div className={`border-r border-base-300 overflow-y-auto ${userId ? "hidden md:block" : ""}`}>
					<h1 className='text-lg font-bold px-4 py-3 border-b border-base-300'>Messaging</h1>
					{isConnectionsLoading ? (
						<div className='p-3 space-y-3'>
							<CardSkeleton />
							<CardSkeleton />
							<CardSkeleton />
						</div>
					) : (
						<ConversationList
							connections={connections}
							conversations={conversations}
							activeUserId={userId}
							authUserId={authUser._id}
						/>
					)}
				</div>

				<div className='md:col-span-2 h-full'>
					{activeUser ? (
						<ChatWindow otherUser={activeUser} authUser={authUser} />
					) : (
						<div className='hidden md:flex flex-col items-center justify-center h-full text-info gap-2'>
							<MessageSquare size={40} />
							<p>{userId ? "You can only message your connections." : "Select a conversation to start chatting."}</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default MessagesPage;
