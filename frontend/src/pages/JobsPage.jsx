import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Briefcase, Plus, Search } from "lucide-react";
import { axiosInstance } from "../lib/axios";
import Sidebar from "../components/Sidebar";
import JobCard from "../components/jobs/JobCard";
import PostJobForm from "../components/jobs/PostJobForm";
import { CardSkeleton } from "../components/Skeleton";

const TABS = [
	{ key: "browse", label: "Browse jobs" },
	{ key: "mine", label: "Posted by you" },
	{ key: "applied", label: "Your applications" },
];

const EMPLOYMENT_TYPES = ["Full-time", "Part-time", "Contract", "Internship", "Temporary"];

const JobsPage = () => {
	const [tab, setTab] = useState("browse");
	const [q, setQ] = useState("");
	const [location, setLocation] = useState("");
	const [type, setType] = useState("");
	const [showPostForm, setShowPostForm] = useState(false);

	const { data: authUser } = useQuery({ queryKey: ["authUser"] });

	const { data: jobs, isLoading: isJobsLoading } = useQuery({
		queryKey: ["jobs", q, location, type],
		queryFn: () =>
			axiosInstance
				.get("/jobs", { params: { q: q || undefined, location: location || undefined, type: type || undefined } })
				.then((res) => res.data),
		enabled: tab === "browse",
	});

	const { data: myJobs, isLoading: isMyJobsLoading } = useQuery({
		queryKey: ["myJobs"],
		queryFn: () => axiosInstance.get("/jobs/mine").then((res) => res.data),
		enabled: tab === "mine",
	});

	const { data: myApplications, isLoading: isApplicationsLoading } = useQuery({
		queryKey: ["myApplications"],
		queryFn: () => axiosInstance.get("/jobs/applied").then((res) => res.data),
		enabled: tab === "applied",
	});

	const list = useMemo(() => {
		if (tab === "mine") return myJobs;
		if (tab === "applied") return myApplications;
		return jobs;
	}, [tab, jobs, myJobs, myApplications]);

	const isLoading =
		(tab === "browse" && isJobsLoading) ||
		(tab === "mine" && isMyJobsLoading) ||
		(tab === "applied" && isApplicationsLoading);

	return (
		<div className='grid grid-cols-1 lg:grid-cols-4 gap-6'>
			<div className='hidden lg:block lg:col-span-1'>
				<Sidebar user={authUser} />
			</div>

			<div className='col-span-1 lg:col-span-3'>
				<div className='bg-secondary rounded-lg shadow mb-4 p-4'>
					<div className='flex items-center justify-between flex-wrap gap-3'>
						<div className='flex items-center gap-2'>
							<Briefcase size={20} className='text-primary' />
							<h1 className='text-lg font-bold'>Jobs</h1>
						</div>
						<button
							onClick={() => setShowPostForm(!showPostForm)}
							className='flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-medium bg-primary text-white hover:bg-primary-dark transition-colors'
						>
							<Plus size={16} /> Post a job
						</button>
					</div>

					<div className='flex gap-1 mt-4 border-b border-base-300'>
						{TABS.map((t) => (
							<button
								key={t.key}
								onClick={() => setTab(t.key)}
								className={`px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
									tab === t.key ? "border-primary text-primary" : "border-transparent text-info hover:text-neutral"
								}`}
							>
								{t.label}
							</button>
						))}
					</div>

					{tab === "browse" && (
						<div className='flex flex-wrap gap-2 mt-4'>
							<div className='relative flex-1 min-w-[160px]'>
								<Search size={14} className='absolute left-3 top-1/2 -translate-y-1/2 text-info' />
								<input
									type='text'
									value={q}
									onChange={(e) => setQ(e.target.value)}
									placeholder='Title or company'
									className='w-full pl-8 pr-3 py-1.5 rounded-full bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
								/>
							</div>
							<input
								type='text'
								value={location}
								onChange={(e) => setLocation(e.target.value)}
								placeholder='Location'
								className='flex-1 min-w-[140px] px-3 py-1.5 rounded-full bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
							/>
							<select
								value={type}
								onChange={(e) => setType(e.target.value)}
								className='px-3 py-1.5 rounded-full bg-base-100 text-sm focus:outline-none focus:ring-2 focus:ring-primary'
							>
								<option value=''>All types</option>
								{EMPLOYMENT_TYPES.map((t) => (
									<option key={t} value={t}>
										{t}
									</option>
								))}
							</select>
						</div>
					)}
				</div>

				{showPostForm && <PostJobForm onDone={() => setShowPostForm(false)} />}

				{isLoading && (
					<div className='space-y-3'>
						<CardSkeleton />
						<CardSkeleton />
						<CardSkeleton />
					</div>
				)}

				{!isLoading && list?.length === 0 && (
					<div className='bg-white rounded-lg shadow p-8 text-center text-gray-500'>
						{tab === "browse" && "No jobs match your search yet."}
						{tab === "mine" && "You haven't posted any jobs yet."}
						{tab === "applied" && "You haven't applied to any jobs yet."}
					</div>
				)}

				{list?.map((job) => (
					<JobCard key={job._id} job={job} isOwner={tab === "mine" || job.postedBy?._id === authUser?._id} />
				))}
			</div>
		</div>
	);
};

export default JobsPage;
