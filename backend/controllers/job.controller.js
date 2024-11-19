import { Job } from "../models/job.model.js";

// Admin posts a job
export const postJob = async (req, res) => {
    try {
        const {
            title,
            description,
            requirements,
            salary,
            location,
            jobType,
            experience,
            position,
            companyId,
        } = req.body;

        const userId = req.id;

        // Validate required fields
        if (!title || !description || !requirements || !salary || !location || !jobType || !experience || !position || !companyId) {
            return res.status(400).json({
                message: "All fields are required.",
                success: false,
            });
        }

        // Validate salary and experience
        const parsedSalary = Number(salary);
        const parsedExperience = Number(experience);

        if (isNaN(parsedSalary) || isNaN(parsedExperience)) {
            return res.status(400).json({
                message: "Salary and experience level must be valid numbers.",
                success: false,
            });
        }

        // Create job
        const job = await Job.create({
            title,
            description,
            requirements: requirements.split(","),
            salary: parsedSalary, // Validated salary
            location,
            jobType,
            experienceLevel: parsedExperience, // Validated experience
            position,
            company: companyId,
            created_by: userId,
        });

        return res.status(201).json({
            message: "New job created successfully.",
            job,
            success: true,
        });
    } catch (error) {
        console.error("Error creating job:", error.stack);
        return res.status(500).json({
            message: "Failed to create job.",
            success: false,
            error: error.message,
        });
    }
};

// Get all jobs for students
export const getAllJobs = async (req, res) => {
    try {
        const keyword = req.query.keyword || "";
        const query = {
            $or: [
                { title: { $regex: keyword, $options: "i" } },
                { description: { $regex: keyword, $options: "i" } },
            ],
        };

        const jobs = await Job.find(query)
            .populate("company")
            .sort({ createdAt: -1 })
            .limit(20); // Add limit for pagination

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found.",
                success: false,
            });
        }

        return res.status(200).json({
            jobs,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching jobs:", error.stack);
        return res.status(500).json({
            message: "Failed to fetch jobs.",
            success: false,
            error: error.message,
        });
    }
};

// Get job by ID for students
export const getJobById = async (req, res) => {
    try {
        const jobId = req.params.id;

        const job = await Job.findById(jobId)
            .populate("applications")
            .populate("company");

        if (!job) {
            return res.status(404).json({
                message: "Job not found.",
                success: false,
            });
        }

        return res.status(200).json({
            job,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching job by ID:", error.stack);
        return res.status(500).json({
            message: "Failed to fetch job.",
            success: false,
            error: error.message,
        });
    }
};

// Get all jobs created by admin
export const getAdminJobs = async (req, res) => {
    try {
        const adminId = req.id;

        const jobs = await Job.find({ created_by: adminId })
            .populate("company")
            .sort({ createdAt: -1 });

        if (!jobs || jobs.length === 0) {
            return res.status(404).json({
                message: "No jobs found for this admin.",
                success: false,
            });
        }

        return res.status(200).json({
            jobs,
            success: true,
        });
    } catch (error) {
        console.error("Error fetching admin jobs:", error.stack);
        return res.status(500).json({
            message: "Failed to fetch jobs for admin.",
            success: false,
            error: error.message,
        });
    }
};
