import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { Link, useParams } from "react-router-dom";
import { Check, Loader, MessageCircle, Pencil, Repeat2, Send, ThumbsUp, Trash2, X } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

import PostAction from "./PostAction";

const Post = ({ post }) => {
	const { postId } = useParams();

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });
	const [showComments, setShowComments] = useState(false);
	const [newComment, setNewComment] = useState("");
	const [comments, setComments] = useState(post.comments || []);
	const [editingCommentId, setEditingCommentId] = useState(null);
	const [editingCommentText, setEditingCommentText] = useState("");
	const [showRepostBox, setShowRepostBox] = useState(false);
	const [repostQuote, setRepostQuote] = useState("");
	const [justLiked, setJustLiked] = useState(false);

	const isOwner = authUser._id === post.author._id;
	const isLiked = post.likes.includes(authUser._id);
	const isRepost = Boolean(post.repostOf);
	const original = post.repostOf;

	useEffect(() => {
		setComments(post.comments || []);
	}, [post.comments]);

	const queryClient = useQueryClient();

	const invalidatePosts = () => {
		queryClient.invalidateQueries({ queryKey: ["posts"] });
		queryClient.invalidateQueries({ queryKey: ["post", postId] });
	};

	const { mutate: deletePost, isPending: isDeletingPost } = useMutation({
		mutationFn: async () => {
			await axiosInstance.delete(`/posts/delete/${post._id}`);
		},
		onSuccess: () => {
			invalidatePosts();
			toast.success("Post deleted successfully");
		},
		onError: (error) => {
			toast.error(error.message);
		},
	});

	const { mutate: createComment, isPending: isAddingComment } = useMutation({
		mutationFn: async (newComment) => {
			await axiosInstance.post(`/posts/${post._id}/comment`, { content: newComment });
		},
		onSuccess: () => {
			invalidatePosts();
		},
		onError: (err) => {
			toast.error(err.response.data.message || "Failed to add comment");
		},
	});

	const { mutate: editComment } = useMutation({
		mutationFn: async ({ commentId, content }) =>
			axiosInstance.put(`/posts/${post._id}/comment/${commentId}`, { content }),
		onSuccess: () => {
			invalidatePosts();
			setEditingCommentId(null);
			toast.success("Comment updated");
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Failed to update comment");
		},
	});

	const { mutate: deleteComment } = useMutation({
		mutationFn: async (commentId) => axiosInstance.delete(`/posts/${post._id}/comment/${commentId}`),
		onSuccess: () => {
			invalidatePosts();
			toast.success("Comment deleted");
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Failed to delete comment");
		},
	});

	const { mutate: likePost, isPending: isLikingPost } = useMutation({
		mutationFn: async () => {
			await axiosInstance.post(`/posts/${post._id}/like`);
		},
		onSuccess: invalidatePosts,
	});

	const { mutate: repostPost, isPending: isReposting } = useMutation({
		mutationFn: async (content) => axiosInstance.post(`/posts/${post._id}/repost`, { content }),
		onSuccess: () => {
			invalidatePosts();
			setShowRepostBox(false);
			setRepostQuote("");
			toast.success("Reposted to your feed");
		},
		onError: (err) => {
			toast.error(err.response?.data?.message || "Failed to repost");
		},
	});

	const handleDeletePost = () => {
		if (!window.confirm("Are you sure you want to delete this post?")) return;
		deletePost();
	};

	const handleLikePost = async () => {
		if (isLikingPost) return;
		setJustLiked(true);
		setTimeout(() => setJustLiked(false), 300);
		likePost();
	};

	const handleAddComment = async (e) => {
		e.preventDefault();
		if (newComment.trim()) {
			createComment(newComment);
			setNewComment("");
			setComments([
				...comments,
				{
					content: newComment,
					user: {
						_id: authUser._id,
						name: authUser.name,
						profilePicture: authUser.profilePicture,
					},
					createdAt: new Date(),
				},
			]);
		}
	};

	const startEditComment = (comment) => {
		setEditingCommentId(comment._id);
		setEditingCommentText(comment.content);
	};

	const submitEditComment = (commentId) => {
		if (!editingCommentText.trim()) return;
		editComment({ commentId, content: editingCommentText });
	};

	const handleRepostSubmit = () => {
		repostPost(repostQuote.trim());
	};

	const renderOriginalPost = (originalPost) => {
		if (!originalPost) {
			return <p className='text-sm text-info italic p-3'>This post is no longer available.</p>;
		}
		return (
			<Link to={`/post/${originalPost._id}`} className='block border border-base-300 rounded-lg p-3 hover:bg-base-100 transition-colors'>
				<div className='flex items-center mb-2'>
					<img
						src={originalPost.author?.profilePicture || "/avatar.png"}
						alt={originalPost.author?.name}
						className='size-8 rounded-full mr-2 object-cover'
					/>
					<div>
						<h4 className='font-semibold text-sm'>{originalPost.author?.name}</h4>
						<p className='text-xs text-info'>
							{formatDistanceToNow(new Date(originalPost.createdAt), { addSuffix: true })}
						</p>
					</div>
				</div>
				{originalPost.content && (
					<p className='text-sm whitespace-pre-wrap mb-2'>{originalPost.content}</p>
				)}
				{originalPost.image && (
					<img
						src={originalPost.image}
						alt='Original post content'
						className='rounded-lg w-full max-h-72 object-cover'
					/>
				)}
			</Link>
		);
	};

	return (
		<div className='bg-secondary rounded-lg shadow mb-4'>
			<div className='p-4'>
				{isRepost && (
					<div className='flex items-center gap-2 text-info text-xs font-medium mb-3'>
						<Repeat2 size={16} />
						<Link to={`/profile/${post.author.username}`} className='hover:underline'>
							{isOwner ? "You" : post.author.name}
						</Link>
						reposted this
					</div>
				)}
				<div className='flex items-center justify-between mb-4'>
					<div className='flex items-center'>
						<Link to={`/profile/${post?.author?.username}`}>
							<img
								src={post.author.profilePicture || "/avatar.png"}
								alt={post.author.name}
								className='size-10 rounded-full mr-3'
							/>
						</Link>

						<div>
							<Link to={`/profile/${post?.author?.username}`}>
								<h3 className='font-semibold'>{post.author.name}</h3>
							</Link>
							<p className='text-xs text-info'>{post.author.headline}</p>
							<p className='text-xs text-info'>
								{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
							</p>
						</div>
					</div>
					{isOwner && (
						<button onClick={handleDeletePost} className='text-red-500 hover:text-red-700'>
							{isDeletingPost ? <Loader size={18} className='animate-spin' /> : <Trash2 size={18} />}
						</button>
					)}
				</div>

				{!isRepost && post.content && <p className='mb-4 whitespace-pre-wrap'>{post.content}</p>}
				{!isRepost && post.image && (
					<img
						src={post.image}
						alt='Post content'
						className='rounded-lg w-full max-h-[32rem] object-cover mb-4 border border-base-300'
					/>
				)}

				{isRepost && (
					<>
						{post.content && <p className='mb-3 whitespace-pre-wrap'>{post.content}</p>}
						<div className='mb-4'>{renderOriginalPost(original)}</div>
					</>
				)}

				<div className='flex justify-between border-t border-base-300 pt-1 text-info'>
					<PostAction
						icon={
							<span className={justLiked ? "inline-block animate-pop" : "inline-block"}>
								<ThumbsUp size={18} className={isLiked ? "text-blue-500 fill-blue-300" : ""} />
							</span>
						}
						text={`Like${post.likes.length > 0 ? ` (${post.likes.length})` : ""}`}
						onClick={handleLikePost}
						active={isLiked}
					/>

					<PostAction
						icon={<MessageCircle size={18} />}
						text={`Comment${comments.length > 0 ? ` (${comments.length})` : ""}`}
						onClick={() => setShowComments(!showComments)}
						active={showComments}
					/>
					<PostAction
						icon={<Repeat2 size={18} />}
						text='Repost'
						onClick={() => setShowRepostBox(!showRepostBox)}
						active={showRepostBox}
					/>
				</div>
			</div>

			{showRepostBox && (
				<div className='px-4 pb-4 border-t border-base-300 pt-3'>
					<textarea
						value={repostQuote}
						onChange={(e) => setRepostQuote(e.target.value)}
						placeholder='Add your thoughts (optional)'
						className='w-full p-2 rounded-lg bg-base-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]'
					/>
					<div className='flex justify-end gap-2 mt-2'>
						<button
							onClick={() => setShowRepostBox(false)}
							className='px-4 py-1.5 rounded-full text-sm font-medium text-info hover:bg-base-100 transition-colors'
						>
							Cancel
						</button>
						<button
							onClick={handleRepostSubmit}
							disabled={isReposting}
							className='px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50 flex items-center gap-2'
						>
							{isReposting ? <Loader size={16} className='animate-spin' /> : <Repeat2 size={16} />}
							Repost
						</button>
					</div>
				</div>
			)}

			{showComments && (
				<div className='px-4 pb-4 border-t border-base-300 pt-3'>
					<div className='mb-4 max-h-72 overflow-y-auto space-y-2 pr-1'>
						{comments.map((comment) => {
							const isCommentOwner = comment.user?._id === authUser._id;
							const canDelete = isCommentOwner || isOwner;
							const isEditing = editingCommentId === comment._id;

							return (
								<div
									key={comment._id || comment.createdAt}
									className='bg-base-100 p-2 rounded-lg flex items-start group'
								>
									<Link to={`/profile/${comment.user?.username}`} className='flex-shrink-0'>
										<img
											src={comment.user.profilePicture || "/avatar.png"}
											alt={comment.user.name}
											className='w-8 h-8 rounded-full mr-2 object-cover'
										/>
									</Link>
									<div className='flex-grow'>
										<div className='flex items-center gap-2 flex-wrap'>
											<span className='font-semibold text-sm'>{comment.user.name}</span>
											<span className='text-xs text-info'>
												{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
											</span>
										</div>
										{isEditing ? (
											<div className='flex items-center gap-2 mt-1'>
												<input
													type='text'
													value={editingCommentText}
													onChange={(e) => setEditingCommentText(e.target.value)}
													className='flex-grow p-1 px-2 rounded-full bg-white text-sm border border-base-300 focus:outline-none focus:ring-2 focus:ring-primary'
													autoFocus
												/>
												<button
													onClick={() => submitEditComment(comment._id)}
													className='text-green-600 hover:text-green-700 flex-shrink-0'
												>
													<Check size={16} />
												</button>
												<button
													onClick={() => setEditingCommentId(null)}
													className='text-info hover:text-red-500 flex-shrink-0'
												>
													<X size={16} />
												</button>
											</div>
										) : (
											<p className='text-sm'>{comment.content}</p>
										)}
									</div>
									{!isEditing && comment._id && canDelete && (
										<div className='flex items-center gap-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0'>
											{isCommentOwner && (
												<button
													onClick={() => startEditComment(comment)}
													className='text-info hover:text-primary p-1'
													aria-label='Edit comment'
												>
													<Pencil size={14} />
												</button>
											)}
											{canDelete && (
												<button
													onClick={() => deleteComment(comment._id)}
													className='text-info hover:text-red-500 p-1'
													aria-label='Delete comment'
												>
													<Trash2 size={14} />
												</button>
											)}
										</div>
									)}
								</div>
							);
						})}
					</div>

					<form onSubmit={handleAddComment} className='flex items-center gap-2'>
						<img
							src={authUser.profilePicture || "/avatar.png"}
							alt={authUser.name}
							className='w-8 h-8 rounded-full object-cover flex-shrink-0'
						/>
						<input
							type='text'
							value={newComment}
							onChange={(e) => setNewComment(e.target.value)}
							placeholder='Add a comment...'
							className='flex-grow p-2 px-4 rounded-full bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
						/>

						<button
							type='submit'
							className='bg-primary text-white p-2 rounded-full hover:bg-primary-dark transition duration-300 disabled:opacity-50 flex-shrink-0'
							disabled={isAddingComment || !newComment.trim()}
						>
							{isAddingComment ? <Loader size={18} className='animate-spin' /> : <Send size={18} />}
						</button>
					</form>
				</div>
			)}
		</div>
	);
};
export default Post;
