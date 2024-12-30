import { CourseModel, ModuleModel } from "../postgres/postgres.js";
import jwt from "jsonwebtoken";

// Create Module in a Course
export const createModule = async (req, res) => {
    const { courseId, title, content } = req.body;
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is superadmin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Access denied. Only admins and superadmins can add modules." });
        }

        // Check if the course exists
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Create the module
        const module = await ModuleModel.create({
            title,
            content,
            courseId,
        });

        return res.status(201).json({
            message: "Module created successfully",
            module,
        });
    } catch (error) {
        console.error("Error creating module:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Update a Module
export const updateModule = async (req, res) => {
    const { courseId, moduleId, title, description } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is superadmin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Access denied. Only admins and superadmins can update modules." });
        }

        // Check if the course exists
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the module exists within the specified course
        const module = await ModuleModel.findOne({
            where: { id: moduleId, courseId },
        });

        if (!module) {
            return res.status(404).json({ message: "Module not found in the specified course." });
        }

        // Update module details
        module.title = title || module.title;
        module.description = description || module.description;

        await module.save();

        res.status(200).json({ message: "Module updated successfully", module });
    } catch (error) {
        console.error("Error updating module:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Delete a Module
export const deleteModule = async (req, res) => {
    const { courseId, moduleId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is superadmin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Access denied. Only admins and superadmins can delete modules." });
        }

        // Check if the course exists
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the module exists within the course
        const module = await ModuleModel.findOne({
            where: { id: moduleId, courseId },
        });

        if (!module) {
            return res.status(404).json({ message: "Module not found in the specified course." });
        }

        // Delete the module
        await module.destroy();

        res.status(200).json({ message: "Module deleted successfully" });
    } catch (error) {
        console.error("Error deleting module:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllModulesInCourse = async (req, res) => {
    const { courseId } = req.params; // Get the courseId from the URL params
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Verify token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is superadmin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Access denied. Only admins and superadmins can view modules." });
        }

        // Check if the course exists
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Fetch all modules associated with the specified course
        const modules = await ModuleModel.findAll({
            where: { courseId },
        });

        if (modules.length === 0) {
            return res.status(404).json({ message: "No modules found for the specified course" });
        }

        // Return the list of modules
        return res.status(200).json({ modules });
    } catch (error) {
        console.error("Error fetching modules:", error);
        return res.status(error.message === "Authorization token required" ? 401 : 500).json({ message: error.message });
    }
};
