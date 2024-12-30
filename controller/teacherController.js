import { TeacherBatchModel, BatchModel, CourseModel, StudentBatchModel, UserModel,AssignmentSubmissionModel,LessonModel,ModuleModel} from "../postgres/postgres.js";
import jwt from "jsonwebtoken";

export const getTeacherCoursesAndStudents = async (req, res) => {
    const teacherId = req.user.id; 

    try {
        
        const teacherBatches = await TeacherBatchModel.findAll({
            where: { teacherId },
            include: [
                {
                    model: BatchModel, // Include Batch details
                    include: [
                        {
                            model: CourseModel, // Include Course details
                            as: 'Course', // Alias for the Course model
                            attributes: ["id", "name", "description"], // Select specific attributes for Course
                        },
                        {
                            model: StudentBatchModel, // Include Student-Batch assignments
                            include: [
                                {
                                    model: UserModel, // Include student details
                                    attributes: ["id", "name", "email"], // Select specific attributes for User
                                },
                            ],
                        },
                    ],
                },
            ],
        });

        // Format the response to include courses and their students
        const coursesWithStudents = teacherBatches.map((teacherBatch) => {
            const batch = teacherBatch.Batch;
            const course = batch.Course;

            const students = batch.StudentBatches.map((studentBatch) => ({
                id: studentBatch.User.id,
                name: studentBatch.User.name,
                email: studentBatch.User.email,
            }));

            return {
                courseId: course.id,
                courseName: course.name,
                courseDescription: course.description,
                batchId: batch.id,
                batchName: batch.name,
                students,
            };
        });

        return res.status(200).json({ courses: coursesWithStudents });
    } catch (error) {
        console.error("Error fetching teacher courses and students:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const postAssignmentFeedback = async (req, res) => {
    const { submissionId } = req.params;
    const { feedback } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Verify user role
        const allowedRoles = ["teacher", "admin", "superadmin"];
        if (!allowedRoles.includes(decoded.role)) {
            return res.status(403).json({ message: "Only teachers, admins, or superadmins can provide feedback" });
        }

        // Find the submission by ID
        const submission = await AssignmentSubmissionModel.findByPk(submissionId);
        if (!submission) {
            return res.status(404).json({ message: "Assignment submission not found" });
        }

        // Update feedback field in the submission
        submission.feedback = feedback;
        submission.feedbackBy = decoded.id; // Store the ID of the user providing feedback
        submission.feedbackDate = new Date();
        await submission.save();

        return res.status(200).json({ message: "Feedback submitted successfully", submission });
    } catch (error) {
        console.error("Error posting feedback:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const createLessonTeacher = async (req, res) => {
    const { courseId, moduleId, title, content, videoLink } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a teacher
        if (decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can create lesson requests" });
        }

        // Validate Course and Module
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await ModuleModel.findOne({ where: { id: moduleId, courseId } });
        if (!module) {
            return res.status(404).json({ message: "Module not found or does not belong to the specified course" });
        }

        
        const lessonRequest = await LessonModel.create({
            moduleId,
            courseId,
            title,
            content,
            videoLink,
            status: 'pending',  
        });

        return res.status(201).json({ message: "Lesson creation request submitted", lessonRequest });
    } catch (error) {
        console.error("Error creating lesson request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const updateLessonTeacher = async (req, res) => {
    const { courseId, moduleId, lessonId, title, content, videoLink } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a teacher
        if (decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can request lesson updates" });
        }

        const lesson = await LessonModel.findOne({ where: { id: lessonId, moduleId, courseId } });
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found or invalid course/module combination" });
        }

        
        lesson.title = title || lesson.title;
        lesson.content = content || lesson.content;
        lesson.videoLink = videoLink || lesson.videoLink;
        lesson.status = 'pending';  

        await lesson.save();

        return res.status(200).json({ message: "Lesson update request submitted", lesson });
    } catch (error) {
        console.error("Error updating lesson request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Delete Lesson (Teacher Request)
export const deleteLessonTeacher = async (req, res) => {
    const { courseId, moduleId, lessonId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a teacher
        if (decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only teachers can request lesson deletion" });
        }

        const lesson = await LessonModel.findOne({ where: { id: lessonId, moduleId, courseId } });
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found or invalid course/module combination" });
        }

        // Set the lesson status to pending for deletion
        lesson.status = 'pending';  // Pending status for teacher-initiated requests
        await lesson.save();

        return res.status(200).json({ message: "Lesson deletion request submitted", lesson });
    } catch (error) {
        console.error("Error deleting lesson request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

