import jwt from "jsonwebtoken";

export const authenticateTeacher = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Authorization token is required" });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "teacher") {
            return res.status(403).json({ message: "Access denied. Only teachers can access this route" });
        }

        req.user = decoded; 
        next();
    } catch (error) {
        console.error("Invalid token:", error);
        return res.status(403).json({ message: "Invalid token" });
    }
};
