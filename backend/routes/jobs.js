const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const { auth, isRecruiter } = require('../middleware/auth');

// GET /api/jobs (Public or Protected depending on needs, accessible to all users)
router.get('/', async (req, res) => {
    try {
        const jobs = await Job.find().populate('recruiter', 'name email').sort({ createdAt: -1 });
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/jobs/:id
router.get('/:id', async (req, res) => {
    try {
        const job = await Job.findById(req.params.id).populate('recruiter', 'name email');
        if (!job) return res.status(404).json({ message: 'Job not found' });
        res.json(job);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// POST /api/jobs (Recruiter only)
router.post('/', auth, isRecruiter, async (req, res) => {
    try {
        const { title, company, location, salary, description, requirements } = req.body;

        // Parse requirements if sent as comma-separated string
        let reqsArray = Array.isArray(requirements) ? requirements : requirements ? requirements.split(',').map(r => r.trim()) : [];

        const newJob = new Job({
            title,
            company,
            location,
            salary,
            description,
            requirements: reqsArray,
            recruiter: req.user.id
        });

        const savedJob = await newJob.save();
        res.status(201).json(savedJob);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/jobs/:id (Recruiter only, own jobs)
router.put('/:id', auth, isRecruiter, async (req, res) => {
    try {
        let job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        job = await Job.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(job);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// DELETE /api/jobs/:id (Recruiter only, own jobs)
router.delete('/:id', auth, isRecruiter, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        await job.deleteOne();
        res.json({ message: 'Job removed' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
