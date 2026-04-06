const express = require('express');
const router = express.Router();
const Application = require('../models/Application');
const Job = require('../models/Job');
const { auth, isRecruiter } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Make sure uploads folder always exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype === 'application/pdf') {
            cb(null, true);
        } else {
            return cb(new Error('Only .pdf format allowed!'), false);
        }
    }
});

// Multer error handler middleware (Express 5 compatible)
const handleMulterError = (err, req, res, next) => {
    if (err) {
        return res.status(400).json({ message: err.message || 'File upload error. Only PDF allowed.' });
    }
    next();
};

// POST /api/applications/:jobId (Applicant only)
router.post(
    '/:jobId',
    auth,
    upload.single('resume'),
    handleMulterError,
    async (req, res) => {
        try {
            if (req.user.role !== 'applicant') {
                return res.status(403).json({ message: 'Only applicants can apply for jobs' });
            }

            const { coverLetter, email, phone } = req.body;
            const resume = req.file ? req.file.filename : null;
            const jobId = req.params.jobId;

            console.log('[Apply] jobId:', jobId, '| file:', req.file?.filename, '| email:', email, '| phone:', phone);

            if (!resume) {
                return res.status(400).json({ message: 'Resume (PDF) is required' });
            }
            if (!email) {
                return res.status(400).json({ message: 'Email address is required' });
            }
            if (!phone) {
                return res.status(400).json({ message: 'Phone number is required' });
            }

            const job = await Job.findById(jobId).lean();
            if (!job) return res.status(404).json({ message: 'Job not found' });

            const existingApplication = await Application.findOne({
                job: jobId,
                applicant: req.user._id
            });
            if (existingApplication) {
                return res.status(400).json({ message: 'You have already applied for this job' });
            }

            const newRef = new Application({
                job: jobId,
                applicant: req.user._id,
                coverLetter: coverLetter || '',
                resume,
                email,
                phone
            });

            const savedApp = await newRef.save();
            res.status(201).json(savedApp);
        } catch (err) {
            console.error('[Apply Error]', err.name, '-', err.message);
            res.status(500).json({ message: err.message || 'Server Error' });
        }
    }
);

// GET /api/applications (My Applications for applicant, or received applications for recruiter)
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role === 'applicant') {
            const apps = await Application.find({ applicant: req.user.id })
                .populate('job', 'title company location salary')
                .sort({ createdAt: -1 });
            return res.json(apps);
        } else if (req.user.role === 'recruiter') {
            // Find all jobs by this recruiter
            const jobs = await Job.find({ recruiter: req.user.id }).select('_id');
            const jobIds = jobs.map(j => j._id);

            const apps = await Application.find({ job: { $in: jobIds } })
                .populate('job', 'title company')
                .populate('applicant', 'name email')
                .sort({ createdAt: -1 });
            return res.json(apps);
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

// PUT /api/applications/:id/status (Recruiter only)
router.put('/:id/status', auth, isRecruiter, async (req, res) => {
    try {
        const { status } = req.body; // pending, reviewed, accepted, rejected
        const validStatuses = ['pending', 'reviewed', 'accepted', 'rejected'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const app = await Application.findById(req.params.id).populate('job');
        if (!app) return res.status(404).json({ message: 'Application not found' });

        // Validate ownership of the job
        if (app.job.recruiter.toString() !== req.user.id) {
            return res.status(403).json({ message: 'Unauthorized' });
        }

        app.status = status;
        await app.save();

        res.json(app);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server Error' });
    }
});

module.exports = router;
