import multer from 'multer';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import { StudentBatchModel, BatchModel, CourseModel,AssignmentModel,AssignmentSubmissionModel, LessonCompletionModel,QuizModel,AnswerModel,QuestionModel,QuizResultModel,LessonModel,ModuleModel} from '../postgres/postgres.js';
import { fileURLToPath } from 'url';
import { UserModel } from '../postgres/postgres.js';


export const getStudentCourses = async (req, res) => {
    const studentId = req.user?.id; 

    if (!studentId) {
        return res.status(400).json({ message: 'Invalid or missing user ID' });
    }

    try {
        
        const studentBatches = await StudentBatchModel.findAll({
            where: { studentId },
            include: [
                {
                    model: BatchModel,
                    include: [
                        {
                            model: CourseModel, 
                            attributes: ["id", "name", "description"], 
                        },
                    ],
                },
            ],
        });
        const coursesAssigned = studentBatches.map((studentBatch) => {
            const batch = studentBatch.Batch;
            const course = batch.Course;

            return {
                courseId: course.id,
                courseName: course.name,
                courseDescription: course.description,
                batchId: batch.id,
                batchName: batch.name,
            };
        });

        return res.status(200).json({ courses: coursesAssigned });
    } catch (error) {
        console.error("Error fetching student courses:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



// Get the current directory (works in ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Set up multer storage
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = path.join(__dirname, '..', 'uploads');
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir); // Save files to 'uploads' directory
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Save file with timestamp and original name
    }
});

// Set file size limit and storage configuration for PDF files
const upload = multer({
    storage,
    fileFilter: (req, file, cb) => {
        const allowedMimeTypes = ['application/pdf'];
        if (allowedMimeTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDFs are allowed.'));
        }
    },
    limits: { fileSize: 10 * 1024 * 1024 }, // Limit file size to 10MB
}).single('file'); // Ensure this matches the field name in Postman

export const submitAssignment = async (req, res) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ message: err.message });
        }

        const { assignmentId, userId } = req.params;
        const { content } = req.body;
        const token = req.headers.authorization?.split(' ')[1];

        try {
            if (!token) {
                return res.status(401).json({ message: 'Authorization token required' });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Debugging: Log decoded token and URL params
            console.log('Decoded Token:', decoded);
            console.log('User ID from URL:', userId);

            // Ensure the userId matches the decoded user ID
            if (decoded.id !== parseInt(userId)) {
                return res.status(403).json({ message: 'Unauthorized user' });
            }

            // Ensure the role is 'student'
            if (decoded.role !== 'student') {
                return res.status(403).json({ message: 'Only students can submit assignments' });
            }

            const user = await UserModel.findByPk(decoded.id);
            console.log('User Role from DB:', user.role);

            // Find the assignment by ID
            const assignment = await AssignmentModel.findByPk(assignmentId);
            if (!assignment) {
                return res.status(404).json({ message: 'Assignment not found' });
            }

            // Ensure the assignment has a lessonId
            if (!assignment.lessonId) {
                return res.status(400).json({ message: 'Assignment is not linked to a lesson' });
            }

            // Check lesson completion before allowing assignment submission
            const lessonCompletion = await LessonCompletionModel.findOne({
                where: { lessonId: assignment.lessonId, studentId: decoded.id },
            });

            if (!lessonCompletion || !lessonCompletion.completed) {
                return res.status(403).json({ message: 'You must complete the lesson before submitting the assignment' });
            }

            const fileLink = req.file ? `uploads/${req.file.filename}` : null;

            const submission = await AssignmentSubmissionModel.create({
                assignmentId,
                studentId: decoded.id,
                content,
                fileLink,
            });

            return res.status(201).json({ message: 'Assignment submitted successfully', submission });
        } catch (error) {
            console.error('Error submitting assignment:', error);
            return res.status(500).json({ error: 'Internal server error' });
        }
    });
};
export const viewQuiz = async (req, res) => {
    const { quizId } = req.params; // Get quizId from URL params
    const token = req.headers.authorization?.split(" ")[1]; // Get the token from Authorization header

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Decode the token to get user details
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user has the correct role (student)
        if (decoded.role !== "student") {
            return res.status(403).json({ message: "Only students can view quiz questions" });
        }

        // Find the quiz by ID
        const quiz = await QuizModel.findByPk(quizId, {
            include: {
                model: QuestionModel,
                as: 'questions', // Ensure this matches the alias defined in the association
                attributes: ['id', 'text'], // Only include question id and text (without answers)
                include: {
                    model: AnswerModel,
                    as: 'answers', // Assuming this is the alias defined in the association
                    attributes: ['id', 'text'], // Include answer options without revealing correct answer
                }
            },
        });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Check if the student has completed the lesson related to this quiz
        const lessonCompletion = await LessonCompletionModel.findOne({
            where: { lessonId: quiz.lessonId, studentId: decoded.id },
        });

        if (!lessonCompletion || !lessonCompletion.completed) {
            return res.status(403).json({ message: 'You must complete the lesson before viewing the quiz' });
        }

        // Respond with the quiz details along with its questions and options (answers)
        return res.status(200).json({ quiz });
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};
export const submitAnswer = async (req, res) => {
    const { quizId, questionId } = req.params; 
    const { selectedAnswerId } = req.body; 
    const studentId = req.user.id; 

    try {
        // Find the quiz by ID
        const quiz = await QuizModel.findByPk(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Check if the student has completed the lesson related to this quiz
        const lessonCompletion = await LessonCompletionModel.findOne({
            where: { lessonId: quiz.lessonId, studentId },
        });

        if (!lessonCompletion || !lessonCompletion.completed) {
            return res.status(403).json({ message: 'You must complete the lesson before submitting answers' });
        }

        // Find the question by ID within the quiz
        const question = await QuestionModel.findOne({ where: { id: questionId, quizId } });
        if (!question) {
            return res.status(404).json({ message: "Question not found in this quiz" });
        }

        // Find the selected answer
        const selectedAnswer = await AnswerModel.findByPk(selectedAnswerId);

        if (!selectedAnswer) {
            return res.status(400).json({ message: "Answer not found" });
        }

        // Ensure selected answer belongs to the right question
        if (Number(selectedAnswer.questionId) !== Number(questionId)) {
            return res.status(400).json({ message: "Selected answer does not belong to the given question" });
        }

        // Check if the answer is correct
        const isCorrect = selectedAnswer.isCorrect;

        // Find or create the student's result for this quiz
        let result = await QuizResultModel.findOne({ where: { studentId, quizId } });

        if (!result) {
            // If this is the student's first answer submission for this quiz, create the result entry
            result = await QuizResultModel.create({ studentId, quizId, score: 0 });
        }

        // Update the score for the quiz
        const newScore = isCorrect ? result.score + 1 : result.score;

        // Save the updated score
        await result.update({ score: newScore });

        // Return feedback to the student
        return res.status(200).json({
            message: isCorrect ? "Correct answer!" : "Incorrect answer!",
            score: newScore,  // Return the updated score
            isCorrect,
        });
    } catch (error) {
        console.error("Error submitting answer:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};

export const getAssignmentFeedback = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];
    const submissionId = parseInt(req.params.submissionId, 10);

    if (isNaN(submissionId)) {
        return res.status(400).json({ message: "Invalid submission ID format" });
    }

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Parsed Submission ID:", submissionId);
        console.log("Decoded Token:", decoded);

        const submission = await AssignmentSubmissionModel.findByPk(submissionId, {
            attributes: ["id", "assignmentId", "feedback", "feedbackBy", "feedbackDate", "studentId"], 
        });

        if (!submission) {
            return res.status(404).json({ message: "Assignment submission not found" });
        }

        console.log("Submission Data:", submission);

        if (decoded.role === "student" && decoded.id !== submission.studentId) {
            return res.status(403).json({ message: "Unauthorized access to feedback" });
        }

        return res.status(200).json({ submission });
    } catch (error) {
        console.error("Error retrieving feedback:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getLessonsForStudent = async (req, res) => {
    const { courseId, moduleId } = req.params; 
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a student
        if (decoded.role !== "student") {
            return res.status(403).json({ message: "Only students can view lessons for a course" });
        }

        // Fetch only lessons that are approved for students
        const lessons = await LessonModel.findAll({
            where: {
                courseId: courseId,  
                moduleId: moduleId,  
                status: 'approved',  
            },
        });

        if (lessons.length === 0) {
            return res.status(404).json({ message: "No approved lessons found for the given course and module" });
        }

        return res.status(200).json({ message: "Approved lessons fetched successfully", lessons });
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getAssignedCourses = async (req, res) => {
    const { studentId } = req.params; 
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded Token:", decoded); // Debug log for the token

        
        if (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.id !== parseInt(studentId, 10)) {
            return res.status(403).json({ message: "Access denied" });
        }

        if (!studentId) {
            return res.status(400).json({ message: "Student ID is required" });
        }

        // Fetch the batches the student is enrolled in, along with their courses
        const assignedCourses = await StudentBatchModel.findAll({
            where: { studentId }, // Filter by the student ID
            include: [
                {
                    model: BatchModel,
                    include: [
                        {
                            model: CourseModel,
                            attributes: ['id', 'name', 'description'], // Include only required fields from CourseModel
                        },
                    ],
                },
            ],
        });

        if (assignedCourses.length === 0) {
            return res.status(404).json({ message: "No courses found for this student" });
        }

        // Extract courses from the result
        const courses = assignedCourses.map((item) => item.Batch.Course);

        return res.status(200).json({ message: "Courses fetched successfully", courses });
    } catch (error) {
        console.error("Error fetching assigned courses:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getModulesByCourse = async (req, res) => {
    const { courseId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        console.log("Decoded Token:", decoded);

        if (decoded.role !== "student") {
            return res.status(403).json({ message: "Only students can access course modules" });
        }

        const studentId = decoded.id;

        console.log("Student ID:", studentId, "Course ID:", courseId);

        const studentCourse = await StudentBatchModel.findOne({
            where: { studentId },
            include: [
                {
                    model: BatchModel,
                    include: [
                        {
                            model: CourseModel,
                            where: { id: courseId },
                        },
                    ],
                },
            ],
        });

        // Check if the student is assigned to the course
        if (!studentCourse) {
            return res.status(403).json({ message: "Access denied: You are not enrolled in this course" });
        }

        // Fetch the modules associated with the course
        const modules = await ModuleModel.findAll({
            where: { courseId },
            attributes: ['id', 'title', 'content'], // Corrected field names to 'title' and 'content'
        });

        // Check if modules exist for the course
        if (modules.length === 0) {
            return res.status(404).json({ message: "No modules found for this course" });
        }

        return res.status(200).json({ message: "Modules fetched successfully", modules });
    } catch (error) {
        console.error("Error fetching course modules:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
