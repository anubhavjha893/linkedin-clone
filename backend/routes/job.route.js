import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import {
	createJob,
	getJobs,
	getMyPostedJobs,
	getMyApplications,
	getJobApplicants,
	applyToJob,
	withdrawApplication,
	deleteJob,
} from "../controllers/job.controller.js";

const router = express.Router();

router.get("/", protectRoute, getJobs);
router.post("/", protectRoute, createJob);
router.get("/mine", protectRoute, getMyPostedJobs);
router.get("/applied", protectRoute, getMyApplications);
router.get("/:id/applicants", protectRoute, getJobApplicants);
router.post("/:id/apply", protectRoute, applyToJob);
router.delete("/:id/apply", protectRoute, withdrawApplication);
router.delete("/:id", protectRoute, deleteJob);

export default router;
