import express from 'express';
import { getAssignedCourses, getLessonsForStudent, getModulesByCourse, getStudentCourses } from '../controller/studentController.js';
import { getNotifications ,getLiveLink} from '../controller/batchController.js';
import { submitAssignment,viewQuiz,submitAnswer,getAssignmentFeedback } from '../controller/studentController.js';
import { submitFeedback } from '../controller/lessonController.js';
import { authenticateStudent } from '../middlewares/studentAuthMiddleware.js';



const studentrouter = express.Router();

studentrouter.get('/getStudentCourses', authenticateStudent,getStudentCourses);
studentrouter.post("/student/:userId/submitAssignment/:assignmentId/",authenticateStudent,submitAssignment);
studentrouter.get("/student/viewQuiz/:quizId",authenticateStudent,viewQuiz);
studentrouter.post("/student/submitAnswer/:quizId/:questionId",authenticateStudent,submitAnswer);
studentrouter.get("/student/getAssignmentFeedback/:submissionId",authenticateStudent,getAssignmentFeedback);
studentrouter.get("/student/getNotifications",authenticateStudent,getNotifications);
studentrouter.get('/student/getLiveLink/:courseId/:batchId',authenticateStudent, getLiveLink);
studentrouter.post("/student/submitFeedback",authenticateStudent,submitFeedback)
studentrouter.get("/student/getLessonsForStudent/:courseId/:moduleId",authenticateStudent,getLessonsForStudent);
studentrouter.get("/student/getAssignedCourses/:studentId",authenticateStudent,getAssignedCourses);
studentrouter.get("/student/getModulesByCourse/:courseId",authenticateStudent,getModulesByCourse);




export default studentrouter;
