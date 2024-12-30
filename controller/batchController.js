import { BatchModel, CourseModel,StudentBatchModel,UserModel,TeacherBatchModel,NotificationModel} from "../postgres/postgres.js";
import jwt from "jsonwebtoken";

export const createBatch = async (req, res) => {
    const { courseId, name, startTime, endTime } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a super admin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Only super admins or admins can create batches" });
        }

        // Find the course to ensure it exists
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Validate the start and end times
        const startDate = new Date(startTime);
        const endDate = new Date(endTime);

        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return res.status(400).json({ message: "Invalid start or end date" });
        }

        // Create a new batch
        const batch = await BatchModel.create({
            courseId,
            batchName: name, // Map 'name' to 'batchName'
            startDate: startDate, // Map 'startTime' to 'startDate'
            endDate: endDate, // Map 'endTime' to 'endDate'
        });

        return res.status(201).json({ message: "Batch created successfully", batch });
    } catch (error) {
        console.error("Error creating batch:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};


// Update a Batch
export const updateBatch = async (req, res) => {
    const { batchId, name, startTime, endTime, courseId } = req.body; // Added courseId
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a super admin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Only super admins or admins can update batches" });
        }

        // Find the batch to ensure it exists
        const batch = await BatchModel.findByPk(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // Check if the course exists before updating the courseId
        if (courseId) {
            const course = await CourseModel.findByPk(courseId);
            if (!course) {
                return res.status(404).json({ message: "Course not found" });
            }
        }

        // Update the batch details
        batch.batchName = name || batch.batchName;
        batch.startDate = startTime || batch.startDate;
        batch.endDate = endTime || batch.endDate;
        batch.courseId = courseId || batch.courseId; // Update courseId if provided

        await batch.save();

        return res.status(200).json({ message: "Batch updated successfully", batch });
    } catch (error) {
        console.error("Error updating batch:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Delete a Batch
export const deleteBatch = async (req, res) => {
    const { courseId, batchId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is a superadmin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Access denied. Only admins and superadmins can delete batches." });
        }

        // Check if the course exists
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Check if the batch exists within the course
        const batch = await BatchModel.findOne({
            where: { id: batchId, courseId },
        });

        if (!batch) {
            return res.status(404).json({ message: "Batch not found in the specified course." });
        }

        // Delete the batch
        await batch.destroy();

        res.status(200).json({ message: "Batch deleted successfully" });
    } catch (error) {
        console.error("Error deleting batch:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};


// Assign student or teacher to a batch
export const assignUserToBatch = async (req, res) => {
    const { courseId, batchId, userId } = req.body; 
    const token = req.headers.authorization?.split(" ")[1]; 

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is superadmin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Only superadmins or admins can assign users to batches" });
        }

        // Validate Course existence
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const batch = await BatchModel.findOne({ where: { id: batchId, courseId } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found or does not belong to the specified course" });
        }

        
        const user = await UserModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const { role } = user; 

        if (!["student", "teacher"].includes(role)) {
            return res.status(400).json({ message: "User's role must be either 'student' or 'teacher'" });
        }

        if (role === "student") {
            
            const existingAssignment = await StudentBatchModel.findOne({ where: { studentId: userId } });
            if (existingAssignment) {
                return res.status(400).json({ message: "Student is already assigned to a batch" });
            }

            // Assign student to batch
            await StudentBatchModel.create({ batchId, studentId: userId });
        } else if (role === "teacher") {
            // Check if the teacher is already assigned to this batch
            const existingAssignment = await TeacherBatchModel.findOne({ where: { teacherId: userId, batchId } });
            if (existingAssignment) {
                return res.status(400).json({ message: "Teacher is already assigned to this batch" });
            }

            // Assign teacher to batch
            await TeacherBatchModel.create({ batchId, teacherId: userId });
        }

        return res.status(200).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} assigned to batch successfully` });
    } catch (error) {
        console.error("Error assigning user to batch:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const deleteUserFromBatch = async (req, res) => {
    const { courseId, batchId, userId } = req.body; // Removed role from input
    const token = req.headers.authorization?.split(" ")[1]; 

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user is superadmin or admin
        if (!["superadmin", "admin"].includes(decoded.role)) {
            return res.status(403).json({ message: "Only superadmins or admins can delete users from batches" });
        }

        // Validate Course existence
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const batch = await BatchModel.findOne({ where: { id: batchId, courseId } });
        if (!batch) {
            return res.status(404).json({ message: "Batch not found or does not belong to the specified course" });
        }

        // Validate User existence
        const user = await UserModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Get user's role
        const { role } = user;

        if (!["student", "teacher"].includes(role)) {
            return res.status(400).json({ message: "User's role must be either 'student' or 'teacher'" });
        }

        // Handle role-specific removal
        if (role === "student") {
            // Check if the student is assigned to this batch
            const existingAssignment = await StudentBatchModel.findOne({ where: { studentId: userId, batchId } });
            if (!existingAssignment) {
                return res.status(400).json({ message: "Student is not assigned to this batch" });
            }

            // Remove student from the batch
            await StudentBatchModel.destroy({ where: { studentId: userId, batchId } });
        } else if (role === "teacher") {
            // Check if the teacher is assigned to this batch
            const existingAssignment = await TeacherBatchModel.findOne({ where: { teacherId: userId, batchId } });
            if (!existingAssignment) {
                return res.status(400).json({ message: "Teacher is not assigned to this batch" });
            }

            // Remove teacher from the batch
            await TeacherBatchModel.destroy({ where: { teacherId: userId, batchId } });
        }

        return res.status(200).json({ message: `${role.charAt(0).toUpperCase() + role.slice(1)} removed from batch successfully` });
    } catch (error) {
        console.error("Error deleting user from batch:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const postLiveLink = async (req, res) => {
    const { batchId } = req.params;
    const { liveLink, liveStartTime } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!["superadmin", "admin", "teacher"].includes(decoded.role)) {
            return res.status(403).json({ message: "Only authorized users can post live links" });
        }

        const batch = await BatchModel.findByPk(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        const startTime = new Date(liveStartTime);
        if (isNaN(startTime.getTime())) {
            return res.status(400).json({ message: "Invalid live start time format" });
        }

        // Update the batch with the live link and start time
        batch.liveLink = liveLink;
        batch.liveStartTime = startTime;
        await batch.save();

        // Notify students 1 hour before live start
        const students = await UserModel.findAll({ where: { batchId } }); // Fetch all students for the batch

        // Create a notification for each student
        students.forEach(async (student) => {
            const notificationMessage = `Your live session will start in 1 hour. Link: ${liveLink}`;
            await NotificationModel.create({
                userId: student.id,
                batchId,
                message: notificationMessage,
                liveStartTime: startTime,
            });
        });

        return res.status(200).json({ message: "Live link posted successfully", batch });
    } catch (error) {
        console.error("Error posting live link:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const getNotifications = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];

    try {
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const notifications = await NotificationModel.findAll({
            where: { userId, isRead: false },
            order: [['createdAt', 'DESC']],
        });

        if (notifications.length === 0) {
            return res.status(200).json({ message: 'No new notifications', notifications: [] });
        }

        return res.status(200).json({ notifications });
    } catch (error) {
        console.error('Error retrieving notifications:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const getLiveLink = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1];
    const { courseId, batchId } = req.params;

    try {
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        // Validate the user
        const student = await UserModel.findByPk(userId);

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch the batch using batchId and courseId
        const batch = await BatchModel.findOne({
            where: { id: batchId, courseId },
        });

        if (!batch) {
            return res.status(404).json({ message: 'Batch not found for the specified course' });
        }

        // Check if the batch has a live session scheduled
        if (!batch.liveLink || !batch.liveStartTime) {
            return res.status(404).json({ message: 'No live session scheduled for this batch' });
        }

        return res.status(200).json({
            message: 'Live session details retrieved successfully',
            liveLink: batch.liveLink,
            liveStartTime: batch.liveStartTime,
        });
    } catch (error) {
        console.error('Error retrieving live session details:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};
