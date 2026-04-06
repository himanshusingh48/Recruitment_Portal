const express = require('express');
const router = express.Router();
const Job = require('../models/Job');
const Application = require('../models/Application');
const { auth, isRecruiter } = require('../middleware/auth');

// Helper: delete all expired jobs (called on every GET / request)
const purgeExpiredJobs = async () => {
    try {
        const now = new Date();
        const expired = await Job.find({ closingDate: { $lt: now } }).select('_id');
        if (expired.length > 0) {
            const expiredIds = expired.map(j => j._id);
            await Application.deleteMany({ job: { $in: expiredIds } });
            await Job.deleteMany({ _id: { $in: expiredIds } });
            console.log(`[Auto-cleanup] Removed ${expired.length} expired job(s).`);
        }
    } catch (err) {
        console.error('[Auto-cleanup] Error:', err.message);
    }
};

// GET /api/jobs (Public - filter out expired)
router.get('/', async (req, res) => {
    try {
        await purgeExpiredJobs();
        const now = new Date();
        const jobs = await Job.find({ closingDate: { $gte: now } })
            .populate('recruiter', 'name email')
            .sort({ closingDate: 1 });
        res.json(jobs);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// GET /api/jobs/mine  (Recruiter: my posted jobs only)
router.get('/mine', auth, isRecruiter, async (req, res) => {
    try {
        const jobs = await Job.find({ recruiter: req.user.id })
            .sort({ closingDate: 1 });
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
        const { title, company, location, salary, description, requirements, closingDate } = req.body;

        if (!closingDate) {
            return res.status(400).json({ message: 'Closing date is required' });
        }

        const closing = new Date(closingDate);
        if (closing <= new Date()) {
            return res.status(400).json({ message: 'Closing date must be in the future' });
        }

        let reqsArray = Array.isArray(requirements)
            ? requirements
            : requirements ? requirements.split(',').map(r => r.trim()) : [];

        const newJob = new Job({
            title, company, location, salary, description,
            requirements: reqsArray,
            recruiter: req.user.id,
            closingDate: closing
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

// DELETE /api/jobs/:id (Recruiter only, own jobs — manual delete)
router.delete('/:id', auth, isRecruiter, async (req, res) => {
    try {
        const job = await Job.findById(req.params.id);
        if (!job) return res.status(404).json({ message: 'Job not found' });

        if (job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        // Also remove all applications for this job
        await Application.deleteMany({ job: job._id });
        await job.deleteOne();
        res.json({ message: 'Job and its applications deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
