import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { Loader } from "lucide-react";
import { axiosInstance } from "../../lib/axios";

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];

const PostJobForm = ({ onDone }) => {
	const [title, setTitle] = useState("");
	const [company, setCompany] = useState("");
	const [location, setLocation] = useState("");
	const [employmentType, setEmploymentType] = useState("Full-time");
	const [description, setDescription] = useState("");
	const queryClient = useQueryClient();

	const { mutate: createJob, isPending } = useMutation({
		mutationFn: () =>
			axiosInstance.post("/jobs", { title, company, location, employmentType, description }),
		onSuccess: () => {
			toast.success("Job posted");
			queryClient.invalidateQueries({ queryKey: ["jobs"] });
			queryClient.invalidateQueries({ queryKey: ["myJobs"] });
			onDone?.();
		},
		onError: (error) => toast.error(error.response?.data?.message || "Failed to post job"),
	});

	const handleSubmit = (e) => {
		e.preventDefault();
		if (!title.trim() || !company.trim() || !description.trim()) return;
		createJob();
	};

	return (
		<form onSubmit={handleSubmit} className='bg-secondary rounded-lg shadow mb-4 p-4 space-y-3'>
			<h3 className='font-semibold'>Post a job</h3>
			<div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
				<input
					type='text'
					value={title}
					onChange={(e) => setTitle(e.target.value)}
					placeholder='Job title'
					required
					className='p-2 px-3 rounded-lg bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
				/>
				<input
					type='text'
					value={company}
					onChange={(e) => setCompany(e.target.value)}
					placeholder='Company'
					required
					className='p-2 px-3 rounded-lg bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
				/>
				<input
					type='text'
					value={location}
					onChange={(e) => setLocation(e.target.value)}
					placeholder='Location (e.g. Remote)'
					className='p-2 px-3 rounded-lg bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
				/>
				<select
					value={employmentType}
					onChange={(e) => setEmploymentType(e.target.value)}
					className='p-2 px-3 rounded-lg bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
				>
					{EMPLOYMENT_TYPES.map((type) => (
						<option key={type} value={type}>
							{type}
						</option>
					))}
				</select>
			</div>
			<textarea
				value={description}
				onChange={(e) => setDescription(e.target.value)}
				placeholder='Job description, responsibilities, requirements...'
				required
				className='w-full p-2 px-3 rounded-lg bg-base-100 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary min-h-[100px]'
			/>
			<div className='flex justify-end gap-2'>
				<button
					type='button'
					onClick={onDone}
					className='px-4 py-1.5 rounded-full text-sm font-medium text-info hover:bg-base-100 transition-colors'
				>
					Cancel
				</button>
				<button
					type='submit'
					disabled={isPending || !title.trim() || !company.trim() || !description.trim()}
					className='px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors disabled:opacity-50'
				>
					{isPending ? <Loader size={16} className='animate-spin' /> : "Post job"}
				</button>
			</div>
		</form>
	);
};

export default PostJobForm;
