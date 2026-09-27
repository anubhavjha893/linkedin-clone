import { Link } from "react-router-dom";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Check, Clock, UserCheck, UserPlus, X } from "lucide-react";

function UserCard({ user, isConnection }) {
	const queryClient = useQueryClient();

	const { data: connectionStatus, isLoading } = useQuery({
		queryKey: ["connectionStatus", user._id],
		queryFn: () => axiosInstance.get(`/connections/status/${user._id}`),
		enabled: !isConnection,
	});

	const invalidate = () => {
		queryClient.invalidateQueries({ queryKey: ["connectionStatus", user._id] });
		queryClient.invalidateQueries({ queryKey: ["connections"] });
		queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
	};

	const { mutate: sendConnectionRequest } = useMutation({
		mutationFn: () => axiosInstance.post(`/connections/request/${user._id}`),
		onSuccess: () => {
			toast.success("Connection request sent");
			invalidate();
		},
		onError: (error) => toast.error(error.response?.data?.message || "An error occurred"),
	});

	const { mutate: acceptRequest } = useMutation({
		mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request accepted");
			invalidate();
		},
		onError: (error) => toast.error(error.response?.data?.message || "An error occurred"),
	});

	const { mutate: rejectRequest } = useMutation({
		mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request rejected");
			invalidate();
		},
		onError: (error) => toast.error(error.response?.data?.message || "An error occurred"),
	});

	const { mutate: removeConnection } = useMutation({
		mutationFn: () => axiosInstance.delete(`/connections/${user._id}`),
		onSuccess: () => {
			toast.success("Connection removed");
			invalidate();
		},
		onError: (error) => toast.error(error.response?.data?.message || "An error occurred"),
	});

	const renderButton = () => {
		if (isConnection) {
			return (
				<button
					onClick={() => removeConnection()}
					className='mt-4 border border-base-300 text-info hover:border-red-500 hover:text-red-500 px-4 py-2 rounded-full transition-colors w-full flex items-center justify-center gap-2 text-sm font-medium'
				>
					<UserCheck size={16} /> Connected
				</button>
			);
		}

		if (isLoading) {
			return (
				<button className='mt-4 bg-base-100 text-info px-4 py-2 rounded-full w-full text-sm' disabled>
					Loading...
				</button>
			);
		}

		switch (connectionStatus?.data?.status) {
			case "pending":
				return (
					<button
						className='mt-4 bg-base-100 text-info px-4 py-2 rounded-full w-full flex items-center justify-center gap-2 text-sm font-medium'
						disabled
					>
						<Clock size={16} /> Pending
					</button>
				);
			case "received":
				return (
					<div className='flex gap-2 mt-4 w-full'>
						<button
							onClick={() => acceptRequest(connectionStatus.data.requestId)}
							className='flex-1 bg-primary text-white py-2 rounded-full hover:bg-primary-dark transition-colors flex items-center justify-center gap-1 text-sm font-medium'
						>
							<Check size={16} /> Accept
						</button>
						<button
							onClick={() => rejectRequest(connectionStatus.data.requestId)}
							className='flex-1 border border-base-300 text-info py-2 rounded-full hover:bg-base-100 transition-colors flex items-center justify-center gap-1 text-sm font-medium'
						>
							<X size={16} /> Reject
						</button>
					</div>
				);
			case "connected":
				return (
					<button
						className='mt-4 border border-base-300 text-info px-4 py-2 rounded-full w-full flex items-center justify-center gap-2 text-sm font-medium'
						disabled
					>
						<UserCheck size={16} /> Connected
					</button>
				);
			default:
				return (
					<button
						onClick={() => sendConnectionRequest()}
						className='mt-4 border border-primary text-primary hover:bg-primary hover:text-white transition-colors px-4 py-2 rounded-full w-full flex items-center justify-center gap-2 text-sm font-medium'
					>
						<UserPlus size={16} /> Connect
					</button>
				);
		}
	};

	return (
		<div className='bg-white rounded-lg shadow p-4 flex flex-col items-center transition-all hover:shadow-md'>
			<Link to={`/profile/${user.username}`} className='flex flex-col items-center'>
				<img
					src={user.profilePicture || "/avatar.png"}
					alt={user.name}
					className='w-24 h-24 rounded-full object-cover mb-4'
				/>
				<h3 className='font-semibold text-lg text-center hover:underline'>{user.name}</h3>
			</Link>
			<p className='text-gray-600 text-center text-sm'>{user.headline}</p>
			<p className='text-xs text-gray-500 mt-2'>{user.connections?.length ?? 0} connections</p>
			{renderButton()}
		</div>
	);
}

export default UserCard;
