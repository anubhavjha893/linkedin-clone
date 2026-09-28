import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { MessageSquare, Search, SquarePen } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import ConversationList from "../components/messages/ConversationList";
import ChatWindow from "../components/messages/ChatWindow";
import { CardSkeleton } from "../components/Skeleton";

const FILTER_PILLS = ["Jobs", "Connections", "InMail", "Starred"];

const MessagesPage = () => {
	const { userId } = useParams();
	const [focusTab, setFocusTab] = useState("focused");
	const [search, setSearch] = useState("");
	const [activeFilter, setActiveFilter] = useState(null);
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
				<div className={`border-r border-base-300 overflow-y-auto flex flex-col ${userId ? "hidden md:flex" : "flex"}`}>
					<div className='flex items-center justify-between px-4 py-3 border-b border-base-300'>
						<h1 className='text-lg font-bold'>Messaging</h1>
						<button
							className='p-1.5 hover:bg-base-100 rounded-full text-info'
							onClick={() => setSearch("")}
							aria-label='Compose new message'
						>
							<SquarePen size={18} />
						</button>
					</div>

					<div className='px-3 pt-3'>
						<div className='relative'>
							<Search size={15} className='absolute left-3 top-1/2 -translate-y-1/2 text-info' />
							<input
								type='text'
								value={search}
								onChange={(e) => setSearch(e.target.value)}
								placeholder='Search messages'
								className='w-full pl-8 pr-3 py-1.5 rounded-full bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
							/>
						</div>
					</div>

					<div className='flex items-center gap-2 px-3 pt-3 pb-2 overflow-x-auto'>
						<button
							onClick={() => setFocusTab("focused")}
							className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
								focusTab === "focused" ? "bg-success/10 text-success" : "text-info hover:bg-base-100"
							}`}
						>
							Focused
						</button>
						<button
							onClick={() => setFocusTab("other")}
							className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
								focusTab === "other" ? "bg-success/10 text-success" : "text-info hover:bg-base-100"
							}`}
						>
							Other
						</button>
					</div>

					<div className='flex items-center gap-2 px-3 pb-2 overflow-x-auto'>
						{FILTER_PILLS.map((pill) => (
							<button
								key={pill}
								onClick={() => setActiveFilter((prev) => (prev === pill ? null : pill))}
								className={`px-3 py-1 rounded-full text-xs font-medium border whitespace-nowrap transition-colors ${
									activeFilter === pill
										? "bg-neutral text-white border-neutral"
										: "border-base-300 text-info hover:bg-base-100"
								}`}
							>
								{pill}
							</button>
						))}
					</div>

					<div className='flex-1 overflow-y-auto'>
						{focusTab === "other" ? (
							<p className='text-sm text-info text-center p-6'>No other messages.</p>
						) : isConnectionsLoading ? (
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
								searchQuery={search}
							/>
						)}
					</div>
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
