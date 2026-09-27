import Job from "../models/job.model.js";
import Notification from "../models/notification.model.js";

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const createJob = async (req, res) => {
	try {
		const { title, company, location, employmentType, description } = req.body;

		if (!title || !company || !description) {
			return res.status(400).json({ message: "Title, company, and description are required" });
		}

		const job = new Job({
			title: title.trim(),
			company: company.trim(),
			location: location?.trim() || undefined,
			employmentType,
			description: description.trim(),
			postedBy: req.user._id,
		});
		await job.save();

		const populatedJob = await Job.findById(job._id).populate("postedBy", "name username profilePicture headline");

		res.status(201).json(populatedJob);
	} catch (error) {
		console.error("Error in createJob controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getJobs = async (req, res) => {
	try {
		const { q, location, type } = req.query;
		const filter = {};

		if (q) {
			const regex = new RegExp(escapeRegex(q.trim()), "i");
			filter.$or = [{ title: regex }, { company: regex }];
		}
		if (location) {
			filter.location = new RegExp(escapeRegex(location.trim()), "i");
		}
		if (type) {
			filter.employmentType = type;
		}

		const jobs = await Job.find(filter)
			.populate("postedBy", "name username profilePicture headline")
			.sort({ createdAt: -1 })
			.limit(50);

		const jobsWithMeta = jobs.map((job) => ({
			...job.toObject(),
			applicantCount: job.applicants.length,
			hasApplied: job.applicants.some((a) => a.user.toString() === req.user._id.toString()),
			applicants: undefined,
		}));

		res.status(200).json(jobsWithMeta);
	} catch (error) {
		console.error("Error in getJobs controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMyPostedJobs = async (req, res) => {
	try {
		const jobs = await Job.find({ postedBy: req.user._id })
			.populate("postedBy", "name username profilePicture headline")
			.sort({ createdAt: -1 });

		const jobsWithMeta = jobs.map((job) => ({
			...job.toObject(),
			applicantCount: job.applicants.length,
			applicants: undefined,
		}));

		res.status(200).json(jobsWithMeta);
	} catch (error) {
		console.error("Error in getMyPostedJobs controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getMyApplications = async (req, res) => {
	try {
		const jobs = await Job.find({ "applicants.user": req.user._id })
			.populate("postedBy", "name username profilePicture headline")
			.sort({ createdAt: -1 });

		const applications = jobs.map((job) => {
			const application = job.applicants.find((a) => a.user.toString() === req.user._id.toString());
			return {
				...job.toObject(),
				applicantCount: job.applicants.length,
				hasApplied: true,
				applicants: undefined,
				appliedAt: application?.appliedAt,
				note: application?.note,
			};
		});

		res.status(200).json(applications);
	} catch (error) {
		console.error("Error in getMyApplications controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const getJobApplicants = async (req, res) => {
	try {
		const job = await Job.findById(req.params.id).populate(
			"applicants.user",
			"name username profilePicture headline"
		);
		if (!job) return res.status(404).json({ message: "Job not found" });

		if (job.postedBy.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "Only the job poster can view applicants" });
		}

		res.status(200).json(job.applicants);
	} catch (error) {
		console.error("Error in getJobApplicants controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const applyToJob = async (req, res) => {
	try {
		const { note } = req.body;
		const job = await Job.findById(req.params.id);
		if (!job) return res.status(404).json({ message: "Job not found" });

		if (job.postedBy.toString() === req.user._id.toString()) {
			return res.status(400).json({ message: "You can't apply to your own job posting" });
		}

		const alreadyApplied = job.applicants.some((a) => a.user.toString() === req.user._id.toString());
		if (alreadyApplied) {
			return res.status(400).json({ message: "You already applied to this job" });
		}

		job.applicants.push({ user: req.user._id, note: note?.trim() || "" });
		await job.save();

		const notification = new Notification({
			recipient: job.postedBy,
			type: "jobApplication",
			relatedUser: req.user._id,
			relatedJob: job._id,
		});
		await notification.save();

		res.status(200).json({ message: "Application submitted" });
	} catch (error) {
		console.error("Error in applyToJob controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const withdrawApplication = async (req, res) => {
	try {
		const job = await Job.findById(req.params.id);
		if (!job) return res.status(404).json({ message: "Job not found" });

		job.applicants = job.applicants.filter((a) => a.user.toString() !== req.user._id.toString());
		await job.save();

		res.status(200).json({ message: "Application withdrawn" });
	} catch (error) {
		console.error("Error in withdrawApplication controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};

export const deleteJob = async (req, res) => {
	try {
		const job = await Job.findById(req.params.id);
		if (!job) return res.status(404).json({ message: "Job not found" });

		if (job.postedBy.toString() !== req.user._id.toString()) {
			return res.status(403).json({ message: "You can only delete your own job postings" });
		}

		await job.deleteOne();
		res.status(200).json({ message: "Job deleted" });
	} catch (error) {
		console.error("Error in deleteJob controller:", error);
		res.status(500).json({ message: "Server error" });
	}
};
