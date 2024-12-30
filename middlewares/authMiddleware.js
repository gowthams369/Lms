import jwt from 'jsonwebtoken';

export const verifyToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; 

    if (!token) {
        return res.status(401).json({ message: 'Token is required' });
    }

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; 
        console.log('Token decoded, user info:', req.user); 
        next(); 
    } catch (error) {
        console.error('Token verification failed:', error);
        return res.status(401).json({ message: 'Invalid or expired token' });
    }
};
