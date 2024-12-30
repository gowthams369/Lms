import jwt from 'jsonwebtoken';

export const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access token is missing" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is either an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Forbidden: Admin or Superadmin access required" });
        }

        req.user = decoded; 
        next(); 
    } catch (error) {
        console.error("Token verification failed:", error);
        return res.status(401).json({ message: "Invalid or expired token" });
    }
};
