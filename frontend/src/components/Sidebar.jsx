import { Link } from "react-router-dom";
import { Home, UserPlus, Bell, ChevronRight } from "lucide-react";

export default function Sidebar({ user }) {
	return (
		<div className='bg-secondary rounded-lg shadow overflow-hidden'>
			<div
				className='h-14 bg-cover bg-center'
				style={{
					backgroundImage: `url("${user.bannerImg || "/banner.png"}")`,
				}}
			/>
			<div className='p-4 text-center -mt-8'>
				<Link to={`/profile/${user.username}`}>
					<img
						src={user.profilePicture || "/avatar.png"}
						alt={user.name}
						className='w-16 h-16 rounded-full mx-auto border-4 border-secondary object-cover shadow'
					/>
					<h2 className='text-lg font-semibold mt-2 hover:underline'>{user.name}</h2>
				</Link>
				<p className='text-info text-sm mt-0.5'>{user.headline}</p>
				<div className='border-t border-base-300 mt-3 pt-3'>
					<Link
						to={`/profile/${user.username}`}
						className='text-xs text-info hover:text-primary flex items-center justify-between'
					>
						<span>Connections</span>
						<span className='font-semibold text-primary'>{user.connections.length}</span>
					</Link>
				</div>
			</div>
			<div className='border-t border-base-300 py-2'>
				<nav>
					<ul>
						<li>
							<Link
								to='/'
								className='flex items-center justify-between py-2 px-4 hover:bg-base-100 transition-colors text-sm'
							>
								<span className='flex items-center gap-3'>
									<Home size={18} /> Home
								</span>
								<ChevronRight size={14} className='text-info' />
							</Link>
						</li>
						<li>
							<Link
								to='/network'
								className='flex items-center justify-between py-2 px-4 hover:bg-base-100 transition-colors text-sm'
							>
								<span className='flex items-center gap-3'>
									<UserPlus size={18} /> My Network
								</span>
								<ChevronRight size={14} className='text-info' />
							</Link>
						</li>
						<li>
							<Link
								to='/notifications'
								className='flex items-center justify-between py-2 px-4 hover:bg-base-100 transition-colors text-sm'
							>
								<span className='flex items-center gap-3'>
									<Bell size={18} /> Notifications
								</span>
								<ChevronRight size={14} className='text-info' />
							</Link>
						</li>
					</ul>
				</nav>
			</div>
			<div className='border-t border-base-300 p-3'>
				<Link to={`/profile/${user.username}`} className='text-sm font-semibold text-info hover:text-primary'>
					Visit your profile
				</Link>
			</div>
		</div>
	);
}
