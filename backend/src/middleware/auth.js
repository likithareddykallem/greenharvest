const jwt = require('jsonwebtoken');
const User = require('../models/User'); 
const { redisClient } = require('../config/redis');
const logger = require('../utils/logger');
const config = require('../config/env');

// Helper function to normalize user data for caching and request object
const normalizeUserData = (user) => ({
    id: user._id,
    email: user.email,
    role: user.role,
    profile: user.profile
});


/**
 * @desc Protect routes - verify JWT token and ensure user is active
 */
exports.protect = async (req, res, next) => {
    try {
        let token;

        // 1. Get token from header (Bearer scheme)
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Not authorized to access this route: No token provided'
            });
        }

        try {
            // 2. Verify token signature
            const decoded = jwt.verify(token, config.auth.jwt.secret);
            
            // SECURITY: 3. Check Token Blacklist (Revocation Check)
            const isBlacklisted = await redisClient.get(`blacklist:${decoded.jti}`); 
            if (isBlacklisted) {
                return res.status(401).json({ 
                    success: false, 
                    message: 'Access token has been revoked' 
                });
            }

            // 4. Check if user data is cached in Redis
            const cachedUser = await redisClient.get(`user:${decoded.id}`);
            
            if (cachedUser) {
                req.user = { ...JSON.parse(cachedUser), jti: decoded.jti };
                return next();
            }

            // 5. If not cached, get from database
            const user = await User.findById(decoded.id).select('-password -refreshToken');

            if (!user) {
                return res.status(401).json({
                    success: false,
                    message: 'User not found or ID invalid'
                });
            }

            // 6. Check user status
            if (user.status !== 'active') {
                return res.status(403).json({
                    success: false,
                    message: 'Your account is currently inactive or suspended'
                });
            }

            const userData = normalizeUserData(user);

            // 7. Cache user data (900 seconds = 15 minutes)
            await redisClient.setex(
                `user:${user._id}`,
                900, 
                JSON.stringify(userData)
            );

            req.user = { ...userData, jti: decoded.jti };
            next();

        } catch (error) {
            logger.error('Token processing error:', error);
            
            let message = 'Invalid or expired token';
            if (error.name === 'TokenExpiredError') {
                message = 'Token has expired';
            } else if (error.name === 'JsonWebTokenError') {
                message = 'Token signature is invalid';
            }

            return res.status(401).json({
                success: false,
                message: message
            });
        }
    } catch (error) {
        logger.error('Global Auth middleware error:', error);
        res.status(500).json({
            success: false,
            message: 'Error authenticating user'
        });
    }
};

/**
 * @desc Grant access to specific roles
 */
exports.authorize = (...roles) => {
    return (req, res, next) => {
        // Ensure protect middleware ran successfully and req.user is set
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                success: false,
                message: `User role '${req.user ? req.user.role : 'anonymous'}' is not authorized to access this route`
            });
        }
        next();
    };
};

/**
 * @desc Optional auth - attempts to load user but continues if no token or invalid token is provided
 */
exports.optionalAuth = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            req.user = null; // Ensure user is null if not authenticated
            return next();
        }

        try {
            const decoded = jwt.verify(token, config.auth.jwt.secret);
            
            // Check Token Blacklist (even optional auth shouldn't use revoked tokens)
            const isBlacklisted = await redisClient.get(`blacklist:${decoded.jti}`); 
            if (isBlacklisted) {
                req.user = null;
                return next();
            }

            const cachedUser = await redisClient.get(`user:${decoded.id}`);
            
            if (cachedUser) {
                req.user = { ...JSON.parse(cachedUser), jti: decoded.jti };
            } else {
                const user = await User.findById(decoded.id).select('-password -refreshToken');
                
                if (user && user.status === 'active') {
                    const userData = normalizeUserData(user);
                    
                    // Cache user data (best practice for consistency)
                    await redisClient.setex(`user:${user._id}`, 900, JSON.stringify(userData));
                    req.user = { ...userData, jti: decoded.jti };
                }
            }
        } catch (error) {
            // Token invalid or expired, proceed anonymously
            logger.debug('Optional Auth: Token found but is invalid or expired.');
            req.user = null; 
        }

        next();
    } catch (error) {
        logger.error('Optional Auth: unexpected error', error);
        next();
    }
};