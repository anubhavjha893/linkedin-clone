import { useQuery } from "@tanstack/react-query";
import { useParams, Link } from "react-router-dom";
import { Hash } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import Post from "../components/Post";
import { PostSkeleton } from "../components/Skeleton";

const HashtagPage = () => {
	const { tag } = useParams();
	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: posts, isLoading } = useQuery({
		queryKey: ["hashtagPosts", tag],
		queryFn: async () => {
			const res = await axiosInstance.get(`/posts/hashtag/${tag}`);
			return res.data;
		},
	});

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='hidden lg:block lg:col-span-1'>
				<Sidebar user={authUser} />
			</div>

			<div className='col-span-1 lg:col-span-3'>
				<div className='bg-secondary rounded-lg shadow p-4 mb-4 flex items-center gap-2'>
					<Hash size={20} className='text-primary' />
					<h1 className='text-lg font-bold'>{tag}</h1>
				</div>

				{isLoading && (
					<>
						<PostSkeleton />
						<PostSkeleton />
					</>
				)}

				{!isLoading && posts?.length === 0 && (
					<div className='bg-white rounded-lg shadow p-8 text-center text-gray-500'>
						No posts from your connections use{" "}
						<Link to='/' className='text-primary hover:underline'>
							#{tag}
						</Link>{" "}
						yet.
					</div>
				)}

				{posts?.map((post) => (
					<Post key={post._id} post={post} />
				))}
			</div>
		</div>
	);
};

export default HashtagPage;
