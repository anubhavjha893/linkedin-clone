import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../../lib/axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Bell, Briefcase, ChevronDown, Home, MessageSquare, Users } from "lucide-react";
import SearchBar from "../SearchBar";
import { useMessagingWidget } from "../../context/MessagingContext";

const Navbar = () => {
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const queryClient = useQueryClient();
	const location = useLocation();
	const navigate = useNavigate();
	const messaging = useMessagingWidget();
	const [isMenuOpen, setIsMenuOpen] = useState(false);
	const menuRef = useRef(null);

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

	useEffect(() => {
		const handleClickOutside = (e) => {
			if (menuRef.current && !menuRef.current.contains(e.target)) {
				setIsMenuOpen(false);
			}
		};
		document.addEventListener("mousedown", handleClickOutside);
		return () => document.removeEventListener("mousedown", handleClickOutside);
	}, []);

	const unreadNotificationCount = notifications?.data.filter((notif) => !notif.read).length;
	const unreadConnectionRequestsCount = connectionRequests?.data?.length;
	const unreadMessageCount = unreadMessages?.data?.count;

	const isPathActive = (path, exact = true) =>
		exact ? location.pathname === path : location.pathname.startsWith(path);

	const navItemClass = (isActive) =>
		`relative flex flex-col items-center justify-center px-3 sm:px-4 h-full transition-colors ${
			isActive ? "text-neutral" : "text-info hover:text-neutral"
		}`;

	const ActiveIndicator = ({ isActive }) =>
		isActive ? (
			<span className='absolute -bottom-[1px] left-1/2 -translate-x-1/2 w-full max-w-[34px] h-[3px] bg-neutral rounded-t-sm' />
		) : null;

	return (
		<nav className='bg-secondary/95 backdrop-blur border-b border-base-300 shadow-sm sticky top-0 z-30'>
			<div className='max-w-7xl mx-auto px-4'>
				<div className='flex justify-between items-center h-[52px]'>
					<div className='flex items-center gap-2 flex-1 min-w-0'>
						<Link to='/' className='flex items-center flex-shrink-0'>
							<img className='h-8 w-8 rounded' src='/linkedin-icon.png' alt='LinkedIn' />
						</Link>
						{authUser && <SearchBar />}
					</div>
					<div className='flex items-center h-full flex-shrink-0'>
						{authUser ? (
							<>
								<Link to={"/"} className={navItemClass(isPathActive("/"))}>
									<Home size={22} strokeWidth={isPathActive("/") ? 2.4 : 2} />
									<span className='text-[11px] hidden md:block mt-0.5'>Home</span>
									<ActiveIndicator isActive={isPathActive("/")} />
								</Link>
								<Link to='/network' className={navItemClass(isPathActive("/network"))}>
									<span className='relative'>
										<Users size={22} strokeWidth={isPathActive("/network") ? 2.4 : 2} />
										{unreadConnectionRequestsCount > 0 && (
											<span
												className='absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-semibold
											rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none'
											>
												{unreadConnectionRequestsCount}
											</span>
										)}
									</span>
									<span className='text-[11px] hidden md:block mt-0.5'>My Network</span>
									<ActiveIndicator isActive={isPathActive("/network")} />
								</Link>
								<Link to='/jobs' className={navItemClass(isPathActive("/jobs", false))}>
									<Briefcase size={22} strokeWidth={isPathActive("/jobs", false) ? 2.4 : 2} />
									<span className='text-[11px] hidden md:block mt-0.5'>Jobs</span>
									<ActiveIndicator isActive={isPathActive("/jobs", false)} />
								</Link>
								<button
									onClick={() => messaging.toggle()}
									className={navItemClass(messaging.isOpen || isPathActive("/messages", false))}
								>
									<span className='relative'>
										<MessageSquare
											size={22}
											strokeWidth={messaging.isOpen || isPathActive("/messages", false) ? 2.4 : 2}
										/>
										{unreadMessageCount > 0 && (
											<span
												className='absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-semibold
											rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none'
											>
												{unreadMessageCount}
											</span>
										)}
									</span>
									<span className='text-[11px] hidden md:block mt-0.5'>Messaging</span>
									<ActiveIndicator isActive={messaging.isOpen || isPathActive("/messages", false)} />
								</button>
								<Link to='/notifications' className={navItemClass(isPathActive("/notifications"))}>
									<span className='relative'>
										<Bell size={22} strokeWidth={isPathActive("/notifications") ? 2.4 : 2} />
										{unreadNotificationCount > 0 && (
											<span
												className='absolute -top-1.5 -right-2 bg-red-500 text-white text-[10px] font-semibold
											rounded-full min-w-4 h-4 px-1 flex items-center justify-center leading-none'
											>
												{unreadNotificationCount}
											</span>
										)}
									</span>
									<span className='text-[11px] hidden md:block mt-0.5'>Notifications</span>
									<ActiveIndicator isActive={isPathActive("/notifications")} />
								</Link>

								<div className='w-px h-8 bg-base-300 mx-1 hidden md:block' />

								<div className='relative h-full' ref={menuRef}>
									<button
										onClick={() => setIsMenuOpen((prev) => !prev)}
										className={navItemClass(isMenuOpen || isPathActive(`/profile/${authUser.username}`))}
									>
										<span className='flex items-center gap-0.5'>
											<img
												src={authUser.profilePicture || "/avatar.png"}
												alt={authUser.name}
												className='size-6 rounded-full object-cover'
											/>
											<ChevronDown size={14} className='hidden md:block' />
										</span>
										<span className='text-[11px] hidden md:flex items-center gap-0.5 mt-0.5'>Me</span>
										<ActiveIndicator isActive={isMenuOpen} />
									</button>

									{isMenuOpen && (
										<div className='absolute right-0 top-full mt-1 w-72 bg-secondary rounded-lg shadow-xl border border-base-300 py-3 z-40'>
											<div className='px-4 pb-3 flex gap-3'>
												<img
													src={authUser.profilePicture || "/avatar.png"}
													alt={authUser.name}
													className='size-14 rounded-full object-cover flex-shrink-0'
												/>
												<div className='min-w-0'>
													<p className='font-semibold text-sm truncate'>{authUser.name}</p>
													<p className='text-xs text-info line-clamp-2'>{authUser.headline}</p>
												</div>
											</div>
											<div className='px-4 pb-3 flex gap-2'>
												<button
													onClick={() => {
														setIsMenuOpen(false);
														navigate(`/profile/${authUser.username}`);
													}}
													className='flex-1 border border-primary text-primary text-sm font-semibold rounded-full py-1.5 hover:bg-primary/5 transition-colors'
												>
													View Profile
												</button>
											</div>
											<div className='border-t border-base-300 pt-2 pb-1 px-4'>
												<p className='text-xs font-semibold text-neutral mb-1'>Account</p>
												<ul className='text-sm text-info'>
													<li className='py-1.5 hover:text-neutral cursor-pointer transition-colors'>Settings &amp; Privacy</li>
													<li className='py-1.5 hover:text-neutral cursor-pointer transition-colors'>Help</li>
												</ul>
											</div>
											<div className='border-t border-base-300 mt-1 pt-2 px-4'>
												<button
													onClick={() => {
														setIsMenuOpen(false);
														logout();
													}}
													className='w-full text-left text-sm font-medium text-error py-1.5 hover:underline'
												>
													Sign out
												</button>
											</div>
										</div>
									)}
								</div>
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
