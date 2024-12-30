import { CourseModel } from "../postgres/postgres.js";
import jwt from "jsonwebtoken";

// Function to verify the role from the JWT token
const verifyRole = async (token) => {
    if (!token) {
        throw new Error("Authorization token required");
    }

    let decoded;
    try {
        decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded Token:", decoded); 
    } catch (error) {
        throw new Error("Invalid token");
    }

    if (!decoded.role) {
        throw new Error("Token does not contain a role");
    }

    // Check if the role is either 'superadmin' or 'admin'
    if (decoded.role !== "superadmin" && decoded.role !== "admin") {
        throw new Error("You do not have the required role");
    }

    return decoded;
};

// Create Course
export const createCourse = async (req, res) => {
    const { title, description, startDate, endDate } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        // Only verify the role from the token
        await verifyRole(token);

        const course = await CourseModel.create({
            name: title,
            description,
            startDate,
            endDate,
        });

        return res.status(201).json({ message: "Course created successfully", course });
    } catch (error) {
        console.error("Error creating course:", error);
        return res.status(error.message === "Authorization token required" ? 401 : 500).json({ message: error.message });
    }
};

// Update Course
export const updateCourse = async (req, res) => {
    const { id, title, description, startDate, endDate } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        // Only verify the role from the token
        await verifyRole(token);

        const course = await CourseModel.findByPk(id);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        course.name = title || course.name;
        course.description = description || course.description;
        course.startDate = startDate || course.startDate;
        course.endDate = endDate || course.endDate;

        await course.save();

        return res.status(200).json({ message: "Course updated successfully", course });
    } catch (error) {
        console.error("Error updating course:", error);
        return res.status(error.message === "Authorization token required" ? 401 : 500).json({ message: error.message });
    }
};


export const deleteCourse = async (req, res) => {
    const { id } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        // Ensure 'id' is a valid integer
        const courseId = parseInt(id, 10);
        if (isNaN(courseId)) {
            return res.status(400).json({ message: "Invalid course ID format" });
        }

        // Verify the user role
        await verifyRole(token);

        // Check if the course exists
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Delete the course
        await course.destroy();

        return res.status(200).json({ message: "Course deleted successfully" });
    } catch (error) {
        console.error("Error deleting course:", error);
        return res.status(error.message === "Authorization token required" ? 401 : 500).json({ message: error.message });
    }
};



export const getAllCourses = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {

        await verifyRole(token);

        const courses = await CourseModel.findAll();

        if (courses.length === 0) {
            return res.status(404).json({ message: "No courses found" });
        }

        return res.status(200).json({ courses });
    } catch (error) {
        console.error("Error fetching courses:", error);
        return res.status(error.message === "Authorization token required" ? 401 : 500).json({ message: error.message });
    }
};
