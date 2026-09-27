import mongoose from "mongoose";

const jobSchema = new mongoose.Schema(
	{
		title: { type: String, required: true, trim: true },
		company: { type: String, required: true, trim: true },
		location: { type: String, default: "Remote", trim: true },
		employmentType: {
			type: String,
			enum: ["Full-time", "Part-time", "Contract", "Internship", "Temporary"],
			default: "Full-time",
		},
		description: { type: String, required: true },
		postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
		applicants: [
			{
				user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
				note: { type: String, default: "" },
				appliedAt: { type: Date, default: Date.now },
			},
		],
	},
	{ timestamps: true }
);

jobSchema.index({ title: "text", company: "text", location: "text" });

const Job = mongoose.model("Job", jobSchema);

export default Job;
