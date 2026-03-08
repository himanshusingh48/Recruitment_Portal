const jwt = require('jsonwebtoken');
const User = require('../models/User');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'No authentication token, access denied' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id).select('-password');

        if (!req.user) {
            return res.status(401).json({ message: 'User not found' });
        }

        next();
    } catch (err) {
        res.status(401).json({ message: 'Token is invalid or expired' });
    }
};

const isRecruiter = (req, res, next) => {
    if (req.user.role !== 'recruiter') {
        return res.status(403).json({ message: 'Access restricted to recruiters only' });
    }
    next();
};

module.exports = { auth, isRecruiter };
