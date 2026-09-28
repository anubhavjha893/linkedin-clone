import { useMutation, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link } from "react-router-dom";

const FriendRequest = ({ request }) => {
	const queryClient = useQueryClient();

	const { mutate: acceptConnectionRequest } = useMutation({
		mutationFn: (requestId) => axiosInstance.put(`/connections/accept/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request accepted");
			queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
		},
		onError: (error) => {
			toast.error(error.response.data.error);
		},
	});

	const { mutate: rejectConnectionRequest } = useMutation({
		mutationFn: (requestId) => axiosInstance.put(`/connections/reject/${requestId}`),
		onSuccess: () => {
			toast.success("Connection request rejected");
			queryClient.invalidateQueries({ queryKey: ["connectionRequests"] });
		},
		onError: (error) => {
			toast.error(error.response.data.error);
		},
	});

	return (
		<div className='bg-blue-50 rounded-lg p-4 flex items-center justify-between gap-3 transition-all hover:shadow-sm'>
			<div className='flex items-center gap-3 min-w-0'>
				<Link to={`/profile/${request.sender.username}`} className='flex-shrink-0'>
					<img
						src={request.sender.profilePicture || "/avatar.png"}
						alt={request.name}
						className='w-14 h-14 rounded-full object-cover'
					/>
				</Link>

				<div className='min-w-0'>
					<Link to={`/profile/${request.sender.username}`} className='font-semibold hover:underline'>
						{request.sender.name}
					</Link>
					<p className='text-gray-600 text-sm truncate'>{request.sender.headline}</p>
				</div>
			</div>

			<div className='flex items-center gap-2 flex-shrink-0'>
				<button
					className='border border-gray-400 text-gray-700 font-semibold px-4 py-1.5 rounded-full hover:bg-gray-100 transition-colors text-sm'
					onClick={() => rejectConnectionRequest(request._id)}
				>
					Ignore
				</button>
				<button
					className='bg-primary text-white font-semibold px-4 py-1.5 rounded-full hover:bg-primary-dark transition-colors text-sm'
					onClick={() => acceptConnectionRequest(request._id)}
				>
					Accept
				</button>
			</div>
		</div>
	);
};
export default FriendRequest;
