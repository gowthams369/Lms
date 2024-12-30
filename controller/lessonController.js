import { LessonModel, ModuleModel, CourseModel,AssignmentModel,BatchModel,LessonCompletionModel,QuizModel,AnswerModel,QuestionModel,FeedbackModel } from "../postgres/postgres.js"; 
import jwt from "jsonwebtoken";
import multer from "multer";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";


// Create Lesson
export const createLesson = async (req, res) => {
    const { courseId, moduleId, title, content, videoLink } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only admins or super admins can add lessons" });
        }

        // Validate Course
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        // Validate Module
        const module = await ModuleModel.findOne({ where: { id: moduleId, courseId } });
        if (!module) {
            return res.status(404).json({ message: "Module not found or does not belong to the specified course" });
        }

        // Create a new lesson
        const lesson = await LessonModel.create({
            moduleId,
            courseId,
            title,
            content,
            videoLink, // Save the video link
        });

        return res.status(201).json({ message: "Lesson created successfully", lesson });
    } catch (error) {
        console.error("Error creating lesson:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



// Get the current directory
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Multer Configuration for File Uploads
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
    },
});

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
}).single('file');

// Upload File to Lesson
export const uploadLessonFile = async (req, res) => {
    const { courseId, moduleId, lessonId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    upload(req, res, async (uploadError) => {
        if (uploadError) {
            return res.status(400).json({ message: uploadError.message });
        }

        try {
            if (!token) {
                return res.status(401).json({ message: "Authorization token required" });
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Check if the token belongs to an admin or superadmin
            if (decoded.role !== "admin" && decoded.role !== "superadmin") {
                return res.status(403).json({ message: "Only admins or super admins can upload files" });
            }

            const lesson = await LessonModel.findOne({ where: { id: lessonId, moduleId, courseId } });
            if (!lesson) {
                return res.status(404).json({ message: "Lesson not found or invalid course/module combination" });
            }

            // Save the file path in the lesson record
            lesson.pdfPath = req.file.path;
            await lesson.save();

            res.status(200).json({ message: "File uploaded successfully", lesson });
        } catch (error) {
            console.error("Error uploading file:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    });
};

// Update Lesson
export const updateLesson = async (req, res) => {
    const { courseId, moduleId, lessonId, title, content, videoLink } = req.body;
    const token = req.headers.authorization?.split(" ")[1];  // Get token from Authorization header

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Verify the token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only admins or super admins can update lessons" });
        }

        // Find the lesson
        const lesson = await LessonModel.findOne({ where: { id: lessonId, moduleId, courseId } });
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found or invalid course/module combination" });
        }

        // Update lesson details
        lesson.title = title || lesson.title;
        lesson.content = content || lesson.content;
        lesson.videoLink = videoLink || lesson.videoLink;

        // Save updated lesson
        await lesson.save();

        // Send success response
        res.status(200).json({ message: "Lesson updated successfully", lesson });
    } catch (error) {
        // Handle JWT token errors specifically
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Handle token expiration errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }

        // Log other unexpected errors
        console.error("Error updating lesson:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
// Delete Lesson
export const deleteLesson = async (req, res) => {
    const { courseId, moduleId, lessonId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only admins or super admins can delete lessons" });
        }

        const lesson = await LessonModel.findOne({ where: { id: lessonId, moduleId, courseId } });
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found or invalid course/module combination" });
        }

        // Delete the lesson
        await lesson.destroy();

        res.status(200).json({ message: "Lesson deleted successfully" });
    } catch (error) {
        console.error("Error deleting lesson:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};

export const createAssignment = async (req, res) => {
    const { courseId, moduleId, lessonId, batchId, title, description, dueDate, submissionLink } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a teacher, admin, or superadmin
        if (decoded.role !== "teacher" && decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only teachers or admins can create assignments" });
        }

        // Validate course, module, and lesson
        const course = await CourseModel.findByPk(courseId);
        if (!course) {
            return res.status(404).json({ message: "Course not found" });
        }

        const module = await ModuleModel.findOne({ where: { id: moduleId, courseId } });
        if (!module) {
            return res.status(404).json({ message: "Module not found or does not belong to the specified course" });
        }

        const lesson = await LessonModel.findOne({ where: { id: lessonId, moduleId } });
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found or does not belong to the specified module" });
        }

        // Validate batch
        const batch = await BatchModel.findByPk(batchId);
        if (!batch) {
            return res.status(404).json({ message: "Batch not found" });
        }

        // Validate submission link
        if (!submissionLink || typeof submissionLink !== "string") {
            return res.status(400).json({ message: "A valid submission link is required" });
        }

        // Create the assignment
        const assignment = await AssignmentModel.create({
            courseId,
            moduleId,
            lessonId,
            batchId,
            title,
            description,
            dueDate,
            submissionLink,
        });

        return res.status(201).json({ message: "Assignment created successfully", assignment });
    } catch (error) {
        console.error("Error creating assignment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const updateAssignment = async (req, res) => {
    const { assignmentId } = req.params; // Get the assignment ID from the request params
    const { title, description, dueDate, submissionLink } = req.body;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "teacher" && decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only teachers, admins, or superadmins can update assignments" });
        }

       
        const assignment = await AssignmentModel.findByPk(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        
        if (title) assignment.title = title;
        if (description) assignment.description = description;
        if (dueDate) assignment.dueDate = dueDate;
        if (submissionLink) assignment.submissionLink = submissionLink;

        await assignment.save(); 

        return res.status(200).json({ message: "Assignment updated successfully", assignment });
    } catch (error) {
        console.error("Error updating assignment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const deleteAssignment = async (req, res) => {
    const { assignmentId } = req.params; 
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        
        if (decoded.role !== "teacher" && decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only teachers, admins, or superadmins can delete assignments" });
        }

       
        const assignment = await AssignmentModel.findByPk(assignmentId);
        if (!assignment) {
            return res.status(404).json({ message: "Assignment not found" });
        }

        await assignment.destroy(); 

        return res.status(200).json({ message: "Assignment deleted successfully" });
    } catch (error) {
        console.error("Error deleting assignment:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const completeLesson = async (req, res) => {
    const { lessonId, courseId, moduleId } = req.body; 
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "student") {
            return res.status(403).json({ message: "Only students can complete lessons" });
        }

        // Mark the lesson as completed along with courseId and moduleId
        const [completion, created] = await LessonCompletionModel.findOrCreate({
            where: { lessonId, studentId: decoded.id },
            defaults: { completed: true, courseId, moduleId }, // Save courseId and moduleId
        });

        if (!created) {
            // If already exists, update the completion status
            completion.completed = true;
            completion.courseId = courseId; 
            completion.moduleId = moduleId; 
            await completion.save();
        }

        return res.status(200).json({ message: "Lesson marked as completed" });
    } catch (error) {
        console.error("Error completing lesson:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const submitFeedback = async (req, res) => {
    const { lessonId, studentId, feedback } = req.body;

    // Log the received data for debugging
    console.log("Received data:", { lessonId, studentId, feedback });

    try {
        if (!lessonId || !studentId || !feedback) {
            return res.status(400).json({ message: "All fields are required" });
        }

        // Create the new feedback record
        const newFeedback = await FeedbackModel.create({
            lessonId,
            studentId,
            feedback,
        });

        return res.status(200).json({ message: "Feedback submitted successfully", newFeedback });
    } catch (error) {
        console.error("Error submitting feedback:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const getFeedback = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        
        const userRole = decoded.role; 
        const userId = decoded.id; 
        
        if (userRole === "student") {
            const feedback = await FeedbackModel.findAll({
                where: {
                    studentId: userId
                }
            });
            return res.status(200).json({ message: "Feedback retrieved successfully", feedback });
        }

        
        if (userRole === "teacher") {
            const lessons = await LessonModel.findAll({
                where: {
                    teacherId: userId 
                }
            });

            const feedback = await FeedbackModel.findAll({
                where: {
                    lessonId: lessons.map(lesson => lesson.id) 
                }
            });
            return res.status(200).json({ message: "Feedback retrieved successfully", feedback });
        }

       
        if (userRole === "superadmin") {
            const feedback = await FeedbackModel.findAll();
            return res.status(200).json({ message: "All feedback retrieved successfully", feedback });
        }

        return res.status(403).json({ message: "You are not authorized to view feedback" });
    } catch (error) {
        console.error("Error fetching feedback:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};



export const createQuiz = async (req, res) => {
    const { batchId, courseId, lessonId, moduleId } = req.params; 
    const { name, description, questions } = req.body; 
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin, superadmin, or teacher
        if (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only authorized users can create a quiz" });
        }

        // For teachers, ensure they are assigned to the batch
        if (decoded.role === "teacher") {
            const teacherBatch = await TeacherBatchModel.findOne({
                where: { teacherId: decoded.id, batchId },
            });

            if (!teacherBatch) {
                return res.status(403).json({ message: "Teacher not assigned to this batch" });
            }
        }

        // Validate the lesson and module
        const lesson = await LessonModel.findOne({ where: { id: lessonId, moduleId, courseId } });
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found or does not belong to the specified module or course" });
        }

        // Create the quiz
        const quiz = await QuizModel.create({
            name,
            description,
            courseId,
            batchId,
            moduleId,
            lessonId,
        });

        // Add questions to the quiz
        if (questions && questions.length > 0) {
            for (const questionData of questions) {
                const question = await QuestionModel.create({
                    text: questionData.text,
                    quizId: quiz.id,
                });

                // Add answers for each question
                if (questionData.answers && questionData.answers.length > 0) {
                    for (const answerData of questionData.answers) {
                        await AnswerModel.create({
                            text: answerData.text,
                            isCorrect: answerData.isCorrect,
                            questionId: question.id,
                        });
                    }
                }
            }
        }

        return res.status(201).json({ message: "Quiz created successfully", quiz });
    } catch (error) {
        console.error("Error creating quiz:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const updateQuiz = async (req, res) => {
    const { quizId } = req.params; // Get quizId from URL params
    const { name, description, questions } = req.body; // Get updated name, description, and questions
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin, superadmin, or teacher
        if (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only authorized users can update a quiz" });
        }

        // Find the quiz by ID
        const quiz = await QuizModel.findByPk(quizId);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // For teachers, ensure they are assigned to the batch
        if (decoded.role === "teacher") {
            const teacherBatch = await TeacherBatchModel.findOne({
                where: { teacherId: decoded.id, batchId: quiz.batchId },
            });

            if (!teacherBatch) {
                return res.status(403).json({ message: "Teacher not authorized to update this quiz" });
            }
        }

        // Update the quiz details
        quiz.name = name || quiz.name;
        quiz.description = description || quiz.description;
        await quiz.save();

        // Update or add questions
        if (questions && questions.length > 0) {
            for (const questionData of questions) {
                if (questionData.id) {
                    // Update existing question
                    const existingQuestion = await QuestionModel.findByPk(questionData.id);
                    if (existingQuestion) {
                        existingQuestion.text = questionData.text || existingQuestion.text;
                        await existingQuestion.save();

                        // Update or add answers
                        if (questionData.answers && questionData.answers.length > 0) {
                            for (const answerData of questionData.answers) {
                                if (answerData.id) {
                                    // Update existing answer
                                    const existingAnswer = await AnswerModel.findByPk(answerData.id);
                                    if (existingAnswer) {
                                        existingAnswer.text = answerData.text || existingAnswer.text;
                                        existingAnswer.isCorrect =
                                            answerData.isCorrect !== undefined
                                                ? answerData.isCorrect
                                                : existingAnswer.isCorrect;
                                        await existingAnswer.save();
                                    }
                                } else {
                                    // Add new answer
                                    await AnswerModel.create({
                                        text: answerData.text,
                                        isCorrect: answerData.isCorrect,
                                        questionId: existingQuestion.id,
                                    });
                                }
                            }
                        }
                    }
                } else {
                    // Add new question
                    const newQuestion = await QuestionModel.create({
                        text: questionData.text,
                        quizId: quiz.id,
                    });

                    // Add answers for the new question
                    if (questionData.answers && questionData.answers.length > 0) {
                        for (const answerData of questionData.answers) {
                            await AnswerModel.create({
                                text: answerData.text,
                                isCorrect: answerData.isCorrect,
                                questionId: newQuestion.id,
                            });
                        }
                    }
                }
            }
        }

        return res.status(200).json({ message: "Quiz updated successfully", quiz });
    } catch (error) {
        console.error("Error updating quiz:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const deleteQuiz = async (req, res) => {
    const { quizId } = req.params; 
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only authorized users can delete a quiz" });
        }

        // Find the quiz by ID
        const quiz = await QuizModel.findByPk(quizId);

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // For teachers, ensure they are assigned to the batch
        if (decoded.role === "teacher") {
            const teacherBatch = await TeacherBatchModel.findOne({
                where: { teacherId: decoded.id, batchId: quiz.batchId },
            });

            if (!teacherBatch) {
                return res.status(403).json({ message: "Teacher not authorized to delete this quiz" });
            }
        }

        // Delete questions and answers associated with the quiz
        await AnswerModel.destroy({ where: { questionId: await QuestionModel.findAll({ where: { quizId } }) } });
        await QuestionModel.destroy({ where: { quizId } });

        // Delete the quiz
        await quiz.destroy();

        return res.status(200).json({ message: "Quiz and its associated questions deleted successfully" });
    } catch (error) {
        console.error("Error deleting quiz:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const createQuestion = async (req, res) => {
    const { quizId } = req.params; // Get quizId from URL params
    const { text, answers } = req.body; // Get question text and answers from the request body
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin, superadmin, or teacher
        if (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only authorized users can create a question" });
        }

        // Validate quiz existence
        const quiz = await QuizModel.findByPk(quizId);
        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // For teachers, ensure they are assigned to the batch
        if (decoded.role === "teacher") {
            const teacherBatch = await TeacherBatchModel.findOne({
                where: { teacherId: decoded.id, batchId: quiz.batchId },
            });

            if (!teacherBatch) {
                return res.status(403).json({ message: "Teacher not authorized to create a question for this quiz" });
            }
        }

        // Create the question
        const question = await QuestionModel.create({ text, quizId });

        // Add answers to the question
        if (answers && answers.length > 0) {
            for (const answerData of answers) {
                await AnswerModel.create({
                    text: answerData.text,
                    isCorrect: answerData.isCorrect,
                    questionId: question.id,
                });
            }
        }

        return res.status(201).json({ message: "Question created successfully", question });
    } catch (error) {
        console.error("Error creating question:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const updateQuestion = async (req, res) => {
    const { quizId, questionId } = req.params; // Get quizId and questionId from URL params
    const { text, answers } = req.body; // Get updated question text and answers
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin, superadmin, or teacher
        if (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only authorized users can update a question" });
        }

        // Validate question existence within the quiz
        const question = await QuestionModel.findOne({ where: { id: questionId, quizId } });
        if (!question) {
            return res.status(404).json({ message: "Question not found in the specified quiz" });
        }

        // For teachers, ensure they are assigned to the batch
        if (decoded.role === "teacher") {
            const quiz = await QuizModel.findByPk(quizId);
            const teacherBatch = await TeacherBatchModel.findOne({
                where: { teacherId: decoded.id, batchId: quiz.batchId },
            });

            if (!teacherBatch) {
                return res.status(403).json({ message: "Teacher not authorized to update this question" });
            }
        }

        // Update the question
        question.text = text || question.text;
        await question.save();

        // Update answers if provided
        if (answers && answers.length > 0) {
            await AnswerModel.destroy({ where: { questionId: question.id } }); // Remove old answers
            for (const answerData of answers) {
                await AnswerModel.create({
                    text: answerData.text,
                    isCorrect: answerData.isCorrect,
                    questionId: question.id,
                });
            }
        }

        return res.status(200).json({ message: "Question updated successfully", question });
    } catch (error) {
        console.error("Error updating question:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const deleteQuestion = async (req, res) => {
    const { quizId, questionId } = req.params; // Get quizId and questionId from URL params
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin, superadmin, or teacher
        if (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only authorized users can delete a question" });
        }

        // Find the question by ID and quizId
        const question = await QuestionModel.findOne({ where: { id: questionId, quizId } });
        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        // For teachers, ensure they are assigned to the batch
        if (decoded.role === "teacher") {
            const quiz = await QuizModel.findByPk(quizId);
            const teacherBatch = await TeacherBatchModel.findOne({
                where: { teacherId: decoded.id, batchId: quiz.batchId },
            });

            if (!teacherBatch) {
                return res.status(403).json({ message: "Teacher not authorized to delete this question" });
            }
        }

        // Delete answers associated with the question
        await AnswerModel.destroy({ where: { questionId } });
        // Delete the question
        await question.destroy();

        return res.status(200).json({ message: "Question deleted successfully" });
    } catch (error) {
        console.error("Error deleting question:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};



export const viewQuiz = async (req, res) => {
    const { quizId } = req.params; 
    const token = req.headers.authorization?.split(" ")[1]; 

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Decode the token to get user details
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the user has the correct role (admin, superadmin, or teacher)
        if (decoded.role !== "admin" && decoded.role !== "superadmin" && decoded.role !== "teacher") {
            return res.status(403).json({ message: "Only authorized users (admin, superadmin, teacher) can view a quiz" });
        }

        // Find the quiz by ID, including questions and answers
        const quiz = await QuizModel.findByPk(quizId, {
            include: {
                model: QuestionModel,
                as: 'questions', // Ensure this matches the alias defined in the association
                include: {
                    model: AnswerModel,
                    as: 'answers', // Ensure this matches the alias in the association
                },
            },
        });

        if (!quiz) {
            return res.status(404).json({ message: "Quiz not found" });
        }

        // Respond with the quiz details along with its questions and answers
        return res.status(200).json({ quiz });
    } catch (error) {
        console.error("Error fetching quiz:", error);
        return res.status(500).json({ message: "Internal server error" });
    }
};


export const getAllLessons = async (req, res) => {
    const { courseId, moduleId } = req.params; 
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only admins or superadmins can view all lessons" });
        }

        // Fetch all lessons using courseId and moduleId
        const lessons = await LessonModel.findAll({
            where: {
                courseId: courseId,  // Filter by courseId
                moduleId: moduleId,  // Filter by moduleId
            },
        });

        if (lessons.length === 0) {
            return res.status(404).json({ message: "No lessons found for the given course and module" });
        }

        return res.status(200).json({ message: "Lessons fetched successfully", lessons });
    } catch (error) {
        console.error("Error fetching lessons:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};
