import express from "express";
import { getTeacherCoursesAndStudents,postAssignmentFeedback,createLessonTeacher,updateLessonTeacher,deleteLessonTeacher } from "../controller/teacherController.js";
import { authenticateTeacher } from "../middlewares/authenticateTeacher.js";
import { createQuiz,updateQuiz,deleteQuiz,createQuestion,updateQuestion,deleteQuestion,viewQuiz,createAssignment} from "../controller/lessonController.js";
import { authenticateAdmin } from "../middlewares/authenticateAdmin.js";
const teacherrouter = express.Router();

teacherrouter.get("/teacher/getTeacherCoursesAndStudents", authenticateTeacher, getTeacherCoursesAndStudents);
teacherrouter.post("/teacher/createQuiz/:courseId/:batchId/:moduleId/:lessonId",authenticateTeacher,createQuiz);
teacherrouter.put("/teacher/updateQuiz/:quizId",authenticateTeacher,updateQuiz);
teacherrouter.delete("/teacher/deleteQuiz/:quizId",authenticateTeacher, deleteQuiz);
teacherrouter.post("/teacher/createQuestion/:quizId",authenticateTeacher,createQuestion);
teacherrouter.put("/teacher/updateQuestion/:quizId/:questionId",authenticateTeacher,updateQuestion);
teacherrouter.delete("/teacher/deleteQuestion/:quizId/:questionId",authenticateTeacher,deleteQuestion);
teacherrouter.get("/teacher/viewQuiz/:quizId",authenticateTeacher,viewQuiz);
teacherrouter.post("/superadmin/createAssignment",authenticateAdmin,createAssignment);
teacherrouter.post("/teacher/postAssignmentFeedback/:submissionId",authenticateTeacher,postAssignmentFeedback);
teacherrouter.post("/teacher/createLessonTeacher",authenticateTeacher,createLessonTeacher);
teacherrouter.put("/teacher/updateLessonTeacher",authenticateTeacher,updateLessonTeacher);
teacherrouter.delete("/teacher/deleteLessonTeacher/:courseId/:moduleId/:lessonId",authenticateTeacher,deleteLessonTeacher);

export default teacherrouter;
