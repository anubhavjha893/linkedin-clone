import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import { Calendar, Layers, Newspaper, UserPlus, Users, Building2 } from "lucide-react";
import { Link } from "react-router-dom";
import FriendRequest from "../components/FriendRequest";
import UserCard from "../components/UserCard";
import { CardSkeleton } from "../components/Skeleton";

const ManageNetworkSidebar = ({ connectionsCount }) => (
	<div className='bg-secondary rounded-lg shadow p-2'>
		<h2 className='font-semibold px-3 py-2'>Manage my network</h2>
		<ul className='text-sm'>
			<li>
				<Link
					to='#connections'
					className='flex items-center justify-between px-3 py-2.5 rounded hover:bg-base-100 transition-colors'
				>
					<span className='flex items-center gap-3 text-neutral'>
						<Users size={18} className='text-info' /> Connections
					</span>
					<span className='text-info'>{connectionsCount ?? ""}</span>
				</Link>
			</li>
			<li className='flex items-center justify-between px-3 py-2.5 rounded text-info cursor-not-allowed'>
				<span className='flex items-center gap-3'>
					<UserPlus size={18} /> Following &amp; followers
				</span>
			</li>
			<li className='flex items-center justify-between px-3 py-2.5 rounded text-info cursor-not-allowed'>
				<span className='flex items-center gap-3'>
					<Layers size={18} /> Groups
				</span>
			</li>
			<li className='flex items-center justify-between px-3 py-2.5 rounded text-info cursor-not-allowed'>
				<span className='flex items-center gap-3'>
					<Calendar size={18} /> Events
				</span>
			</li>
			<li className='flex items-center justify-between px-3 py-2.5 rounded text-info cursor-not-allowed'>
				<span className='flex items-center gap-3'>
					<Building2 size={18} /> Pages
				</span>
			</li>
			<li className='flex items-center justify-between px-3 py-2.5 rounded text-info cursor-not-allowed'>
				<span className='flex items-center gap-3'>
					<Newspaper size={18} /> Newsletters
				</span>
			</li>
		</ul>
	</div>
);

const NetworkPage = () => {
	const [tab, setTab] = useState("grow");

	const { data: connectionRequests, isLoading: isRequestsLoading } = useQuery({
		queryKey: ["connectionRequests"],
		queryFn: () => axiosInstance.get("/connections/requests"),
	});

	const { data: connections, isLoading: isConnectionsLoading } = useQuery({
		queryKey: ["connections"],
		queryFn: () => axiosInstance.get("/connections").then((res) => res.data),
	});

	const requestCount = connectionRequests?.data?.length || 0;

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='col-span-1 lg:col-span-1'>
				<ManageNetworkSidebar connectionsCount={connections?.length} />
			</div>
			<div className='col-span-1 lg:col-span-3'>
				<div className='bg-secondary rounded-lg shadow mb-6'>
					<div className='flex border-b border-base-300 px-4'>
						<button
							onClick={() => setTab("grow")}
							className={`px-2 py-3 mr-6 text-sm font-semibold border-b-2 transition-colors ${
								tab === "grow" ? "border-success text-success" : "border-transparent text-info hover:text-neutral"
							}`}
						>
							Grow
						</button>
						<button
							onClick={() => setTab("catchup")}
							className={`px-2 py-3 text-sm font-semibold border-b-2 transition-colors ${
								tab === "catchup" ? "border-success text-success" : "border-transparent text-info hover:text-neutral"
							}`}
						>
							Catch up
						</button>
					</div>

					{tab === "grow" ? (
						<div className='p-6'>
							{isRequestsLoading ? (
								<div className='space-y-4 mb-8'>
									<CardSkeleton />
									<CardSkeleton />
								</div>
							) : requestCount > 0 ? (
								<div className='mb-8'>
									<div className='flex items-center justify-between mb-3'>
										<h2 className='text-lg font-semibold'>Invitations ({requestCount})</h2>
										<button className='text-sm font-medium text-info hover:text-primary'>Show all</button>
									</div>
									<div className='space-y-3'>
										{connectionRequests.data.map((request) => (
											<FriendRequest key={request._id} request={request} />
										))}
									</div>
								</div>
							) : (
								<div className='bg-white rounded-lg p-6 text-center mb-6'>
									<UserPlus size={48} className='mx-auto text-gray-400 mb-4' />
									<h3 className='text-xl font-semibold mb-2'>No Connection Requests</h3>
									<p className='text-gray-600'>
										You don&apos;t have any pending connection requests at the moment.
									</p>
									<p className='text-gray-600 mt-2'>
										Explore suggested connections below to expand your network!
									</p>
								</div>
							)}

							{isConnectionsLoading ? (
								<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
									<CardSkeleton />
									<CardSkeleton />
									<CardSkeleton />
								</div>
							) : (
								connections?.length > 0 && (
									<div>
										<h2 className='text-lg font-semibold mb-4'>
											My Connections <span className='text-info font-normal'>({connections.length})</span>
										</h2>
										<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
											{connections.map((connection) => (
												<UserCard key={connection._id} user={connection} isConnection={true} />
											))}
										</div>
									</div>
								)
							)}
						</div>
					) : (
						<div className='p-10 text-center text-info'>
							<p>You&apos;re all caught up. Check back later for updates from your network.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};
export default NetworkPage;
