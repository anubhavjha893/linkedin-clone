import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";
import { Briefcase, ChevronDown, ChevronUp, Loader, MapPin, Trash2, Users } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { axiosInstance } from "../../lib/axios";
import { renderRichText } from "../../lib/richText";

const JobCard = ({ job, isOwner }) => {
	const [expanded, setExpanded] = useState(false);
	const [showApplyForm, setShowApplyForm] = useState(false);
	const [note, setNote] = useState("");
	const [showApplicants, setShowApplicants] = useState(false);
	const queryClient = useQueryClient();

	const invalidateJobs = () => {
		queryClient.invalidateQueries({ queryKey: ["jobs"] });
		queryClient.invalidateQueries({ queryKey: ["myJobs"] });
		queryClient.invalidateQueries({ queryKey: ["myApplications"] });
	};

	const { data: applicants, isLoading: isApplicantsLoading } = useQuery({
		queryKey: ["jobApplicants", job._id],
		queryFn: () => axiosInstance.get(`/jobs/${job._id}/applicants`).then((res) => res.data),
		enabled: isOwner && showApplicants,
	});

	const { mutate: apply, isPending: isApplying } = useMutation({
		mutationFn: () => axiosInstance.post(`/jobs/${job._id}/apply`, { note: note.trim() }),
		onSuccess: () => {
			toast.success("Application submitted");
			setShowApplyForm(false);
			setNote("");
			invalidateJobs();
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to apply"),
	});

	const { mutate: withdraw, isPending: isWithdrawing } = useMutation({
		mutationFn: () => axiosInstance.delete(`/jobs/${job._id}/apply`),
		onSuccess: () => {
			toast.success("Application withdrawn");
			invalidateJobs();
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to withdraw"),
	});

	const { mutate: removeJob, isPending: isDeleting } = useMutation({
		mutationFn: () => axiosInstance.delete(`/jobs/${job._id}`),
		onSuccess: () => {
			toast.success("Job posting deleted");
			invalidateJobs();
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to delete"),
	});

	const handleDelete = () => {
		if (!window.confirm("Delete this job posting?")) return;
		removeJob();
	};

	return (
		<div className='bg-secondary rounded-lg shadow mb-4 p-4'>
			<div className='flex items-start justify-between gap-3'>
				<div className='flex items-start gap-3 min-w-0'>
					<div className='size-12 rounded-lg bg-base-100 flex items-center justify-center flex-shrink-0'>
						<Briefcase size={22} className='text-primary' />
					</div>
					<div className='min-w-0'>
						<h3 className='font-semibold truncate'>{job.title}</h3>
						<p className='text-sm text-info truncate'>{job.company}</p>
						<div className='flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-info'>
							<span className='flex items-center gap-1'>
								<MapPin size={12} /> {job.location}
							</span>
							<span className='px-2 py-0.5 rounded-full bg-base-100'>{job.employmentType}</span>
							<span>{formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
						</div>
					</div>
				</div>
				{isOwner && (
					<button
						onClick={handleDelete}
						className='text-red-500 hover:text-red-700 flex-shrink-0'
						aria-label='Delete job posting'
					>
						{isDeleting ? <Loader size={18} className='animate-spin' /> : <Trash2 size={18} />}
					</button>
				)}
			</div>

			<p className={`text-sm mt-3 whitespace-pre-wrap ${expanded ? "" : "line-clamp-3"}`}>
				{renderRichText(job.description)}
			</p>
			{job.description?.length > 160 && (
				<button
					onClick={() => setExpanded(!expanded)}
					className='text-xs text-primary hover:underline mt-1 flex items-center gap-1'
				>
					{expanded ? (
						<>
							Show less <ChevronUp size={12} />
						</>
					) : (
						<>
							Show more <ChevronDown size={12} />
						</>
					)}
				</button>
			)}

			<div className='flex items-center justify-between mt-3 pt-3 border-t border-base-300'>
				<Link
					to={`/profile/${job.postedBy?.username}`}
					className='text-xs text-info hover:underline flex items-center gap-2'
				>
					<img
						src={job.postedBy?.profilePicture || "/avatar.png"}
						alt={job.postedBy?.name}
						className='size-6 rounded-full object-cover'
					/>
					Posted by {job.postedBy?.name}
				</Link>

				{isOwner ? (
					<button
						onClick={() => setShowApplicants(!showApplicants)}
						className='text-xs font-medium text-primary hover:underline flex items-center gap-1'
					>
						<Users size={14} /> {job.applicantCount || 0} applicant{job.applicantCount === 1 ? "" : "s"}
					</button>
				) : job.hasApplied ? (
					<button
						onClick={() => withdraw()}
						disabled={isWithdrawing}
						className='px-4 py-1.5 rounded-full text-sm font-medium border border-base-300 text-info hover:border-red-500 hover:text-red-500 transition-colors disabled:opacity-50'
					>
						{isWithdrawing ? <Loader size={14} className='animate-spin' /> : "Applied · Withdraw"}
					</button>
				) : (
					<button
						onClick={() => setShowApplyForm(!showApplyForm)}
						className='px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors'
					>
						Apply
					</button>
				)}
			</div>

			{showApplyForm && !isOwner && !job.hasApplied && (
				<div className='mt-3 pt-3 border-t border-base-300'>
					<textarea
						value={note}
						onChange={(e) => setNote(e.target.value)}
						placeholder='Add a short note to the poster (optional)'
						className='w-full p-2 rounded-lg bg-base-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[60px]'
					/>
					<div className='flex justify-end gap-2 mt-2'>
						<button
							onClick={() => setShowApplyForm(false)}
							className='px-4 py-1.5 rounded-full text-sm font-medium text-info hover:bg-base-100 transition-colors'
						>
							Cancel
						</button>
						<button
							onClick={() => apply()}
							disabled={isApplying}
							className='px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50'
						>
							{isApplying ? <Loader size={16} className='animate-spin' /> : "Submit application"}
						</button>
					</div>
				</div>
			)}

			{isOwner && showApplicants && (
				<div className='mt-3 pt-3 border-t border-base-300 space-y-2'>
					{isApplicantsLoading ? (
						<div className='flex justify-center py-3 text-info'>
							<Loader size={18} className='animate-spin' />
						</div>
					) : applicants?.length === 0 ? (
						<p className='text-sm text-info text-center py-2'>No applicants yet.</p>
					) : (
						applicants?.map((applicant) => (
							<div key={applicant.user._id} className='flex items-start gap-3 bg-base-100 rounded-lg p-2'>
								<Link to={`/profile/${applicant.user.username}`} className='flex-shrink-0'>
									<img
										src={applicant.user.profilePicture || "/avatar.png"}
										alt={applicant.user.name}
										className='size-9 rounded-full object-cover'
									/>
								</Link>
								<div className='min-w-0 flex-1'>
									<Link
										to={`/profile/${applicant.user.username}`}
										className='text-sm font-semibold hover:underline'
									>
										{applicant.user.name}
									</Link>
									<p className='text-xs text-info'>{applicant.user.headline}</p>
									{applicant.note && <p className='text-sm mt-1'>{applicant.note}</p>}
								</div>
								<span className='text-[11px] text-info flex-shrink-0'>
									{formatDistanceToNow(new Date(applicant.appliedAt), { addSuffix: true })}
								</span>
							</div>
						))
					)}
				</div>
			)}
		</div>
	);
};

export default JobCard;
