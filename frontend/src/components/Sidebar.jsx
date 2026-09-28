import { Link } from "react-router-dom";
import { Bookmark, Calendar, Newspaper, Users2 } from "lucide-react";

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
				<p className='text-info text-sm mt-0.5 line-clamp-2'>{user.headline}</p>
				<p className='text-info text-xs mt-1'>{user.location}</p>
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
							<span className='flex items-center gap-3 py-2 px-4 text-sm text-info cursor-not-allowed'>
								<Bookmark size={17} /> Saved items
							</span>
						</li>
						<li>
							<span className='flex items-center gap-3 py-2 px-4 text-sm text-info cursor-not-allowed'>
								<Users2 size={17} /> Groups
							</span>
						</li>
						<li>
							<span className='flex items-center gap-3 py-2 px-4 text-sm text-info cursor-not-allowed'>
								<Newspaper size={17} /> Newsletters
							</span>
						</li>
						<li>
							<span className='flex items-center gap-3 py-2 px-4 text-sm text-info cursor-not-allowed'>
								<Calendar size={17} /> Events
							</span>
						</li>
					</ul>
				</nav>
			</div>
		</div>
	);
}
