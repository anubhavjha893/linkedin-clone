import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useLocation } from "react-router-dom";
import { Bell, Briefcase, Home, LogOut, MessageSquare, Users } from "lucide-react";
import SearchBar from "../SearchBar";

const Navbar = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();
	const location = useLocation();

	const { data: notifications } = useQuery({
		queryKey: ["notifications"],
		queryFn: async () => axiosInstance.get("/notifications"),
		enabled: !!authUser,
	});

	const { data: connectionRequests } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: async () => axiosInstance.get("/connections/requests"),
		enabled: !!authUser,
	});

	const { data: unreadMessages } = useQuery({
		queryKey: ["unreadMessages"],
		queryFn: async () => axiosInstance.get("/messages/unread-count"),
		enabled: !!authUser,
		// sockets invalidate this on new messages; this is just a safety net
		refetchInterval: 60000,
	});

	const { mutate: logout } = useMutation({
		mutationFn: () => axiosInstance.post("/auth/logout"),
		onSuccess: () => {
			queryClient.invalidateQueries({ queryKey: ["authUser"] });
		},
	});

	const unreadNotificationCount = notifications?.data.filter((notif) => !notif.read).length;
	const unreadConnectionRequestsCount = connectionRequests?.data?.length;
	const unreadMessageCount = unreadMessages?.data?.count;

	const navLinkClass = (path, exact = true) =>
		`flex flex-col items-center px-2 py-1 rounded-md transition-colors ${
			(exact ? location.pathname === path : location.pathname.startsWith(path))
				? "text-primary"
				: "text-info hover:text-neutral"
		}`;

	return (
		<nav className='bg-secondary/95 backdrop-blur border-b border-base-300 shadow-sm sticky top-0 z-20'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='flex justify-between items-center py-2'>
					<div className='flex items-center gap-3 flex-1 min-w-0'>
						<Link to='/' className='flex items-center flex-shrink-0'>
							<img className='h-9 rounded' src='/small-logo.png' alt='LinkedIn' />
						</Link>
						{authUser && <SearchBar />}
					</div>
					<div className='flex items-center gap-1 md:gap-3 flex-shrink-0'>
						{authUser ? (
							<>
								<Link to={"/"} className={navLinkClass("/")}>
									<Home size={22} />
									<span className='text-xs hidden md:block mt-0.5'>Home</span>
								</Link>
								<Link to='/network' className={`${navLinkClass("/network")} relative`}>
									<Users size={22} />
									<span className='text-xs hidden md:block mt-0.5'>My Network</span>
									{unreadConnectionRequestsCount > 0 && (
										<span
											className='absolute -top-1 right-0 md:right-2 bg-red-500 text-white text-[10px] font-semibold
										rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none'
										>
											{unreadConnectionRequestsCount}
										</span>
									)}
								</Link>
								<Link to='/jobs' className={navLinkClass("/jobs", false)}>
									<Briefcase size={22} />
									<span className='text-xs hidden md:block mt-0.5'>Jobs</span>
								</Link>
								<Link to='/messages' className={`${navLinkClass("/messages", false)} relative`}>
									<MessageSquare size={22} />
									<span className='text-xs hidden md:block mt-0.5'>Messaging</span>
									{unreadMessageCount > 0 && (
										<span
											className='absolute -top-1 right-0 md:right-2 bg-red-500 text-white text-[10px] font-semibold
										rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none'
										>
											{unreadMessageCount}
										</span>
									)}
								</Link>
								<Link to='/notifications' className={`${navLinkClass("/notifications")} relative`}>
									<Bell size={22} />
									<span className='text-xs hidden md:block mt-0.5'>Notifications</span>
									{unreadNotificationCount > 0 && (
										<span
											className='absolute -top-1 right-0 md:right-2 bg-red-500 text-white text-[10px] font-semibold
										rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none'
										>
											{unreadNotificationCount}
										</span>
									)}
								</Link>
								<div className='w-px h-8 bg-base-300 mx-1 hidden md:block' />
								<Link
									to={`/profile/${authUser.username}`}
									className={navLinkClass(`/profile/${authUser.username}`)}
								>
									<img
										src={authUser.profilePicture || "/avatar.png"}
										alt={authUser.name}
										className='size-6 rounded-full object-cover'
									/>
									<span className='text-xs hidden md:block mt-0.5'>Me</span>
								</Link>
								<button
									className='flex flex-col items-center px-2 py-1 rounded-md text-info hover:text-neutral transition-colors'
									onClick={() => logout()}
								>
									<LogOut size={22} />
									<span className='text-xs hidden md:block mt-0.5'>Logout</span>
								</button>
							</>
						) : (
							<>
								<Link to='/login' className='btn btn-ghost'>
									Sign In
								</Link>
								<Link to='/signup' className='btn btn-primary rounded-full'>
									Join now
								</Link>
							</>
						)}
					</div>
				</div>
			</div>
		</nav>
	);
};
export default Navbar;
