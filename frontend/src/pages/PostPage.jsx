import { useQuery } from "@tanstack/react-query";
import { useParams } from "react-router-dom";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import { PostSkeleton } from "../components/Skeleton";

const PostPage = () => {
	const { postId } = useParams();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: post, isLoading } = useQuery({
		queryKey: ["post", postId],
		queryFn: () => axiosInstance.get(`/posts/${postId}`),
	});

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='hidden lg:block lg:col-span-1'>
				<Sidebar user={authUser} />
			</div>

			<div className='col-span-1 lg:col-span-3'>
				{isLoading ? (
					<PostSkeleton />
				) : post?.data ? (
					<Post post={post.data} />
				) : (
					<div className='bg-white rounded-lg shadow p-8 text-center text-gray-500'>Post not found.</div>
				)}
			</div>
		</div>
	);
};
export default PostPage;
