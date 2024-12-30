import jwt from 'jsonwebtoken';

// Middleware to verify JWT token
const authenticateJWT = (req, res, next) => {
    const token = req.header('Authorization')?.split(' ')[1]; 
    if (!token) {
        return res.status(403).json({ message: 'Access denied' });
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid token' });
        }
        req.user = user;  // Attach user info to the request object
        next();  // Proceed to the next middleware or route handler
    });
};

export default authenticateJWT;
