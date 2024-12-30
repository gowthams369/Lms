import express from "express";
import { createLesson,
    updateLesson,
    deleteLesson,
    uploadLessonFile,
    createAssignment,
    completeLesson,
    createQuiz,
    updateQuiz,
    deleteQuiz,
createQuestion,
updateQuestion,
deleteQuestion,
getFeedback,
updateAssignment,
deleteAssignment,
getAllLessons
} from "../controller/lessonController.js";
import { authenticateTeacher } from "../middlewares/authenticateTeacher.js";
import { authenticateAdmin } from "../middlewares/authenticateAdmin.js";
import { authenticateStudent } from "../middlewares/studentAuthMiddleware.js";

const lessonrouter = express.Router();


lessonrouter.post("/superadmin/createLesson",authenticateAdmin, createLesson);
lessonrouter.put("/superadmin/updateLesson",authenticateAdmin, updateLesson);
lessonrouter.delete("/superadmin/deleteLesson/:courseId/:moduleId/:lessonId",authenticateAdmin, deleteLesson);
lessonrouter.post("/superadmin/uploadLessonFile/:courseId/:moduleId/:lessonId",uploadLessonFile);
lessonrouter.post("/teacher/createAssignment",authenticateTeacher,createAssignment);
lessonrouter.put("/teacher/updateAssignment/:assignmentId",authenticateTeacher,updateAssignment);
lessonrouter.delete("/teacher/deleteAssignment/:assignmentId",authenticateTeacher,deleteAssignment);
lessonrouter.post("/student/completeLesson",authenticateStudent,completeLesson);
lessonrouter.post("/superadmin/createQuiz/:courseId/:batchId/:moduleId/:lessonId",authenticateAdmin,createQuiz);
lessonrouter.put("/superadmin/updateQuiz/:quizId",authenticateAdmin,updateQuiz);
lessonrouter.delete("/superadmin/deleteQuiz/:quizId", authenticateAdmin,deleteQuiz);
lessonrouter.post("/superadmin/createQuestion/:quizId",authenticateAdmin,createQuestion);
lessonrouter.put("/superadmin/updateQuestion/:quizId/:questionId",authenticateAdmin,updateQuestion);
lessonrouter.delete("/superadmin/deleteQuestion/:quizId/:questionId",authenticateAdmin,deleteQuestion);
lessonrouter.get("/superadmin/getFeedback",authenticateAdmin,getFeedback);
lessonrouter.get("/superadmin/getAllLessons/:courseId/:moduleId",authenticateAdmin,getAllLessons);
lessonrouter.get("/admin/getAllLessons/:courseId/:moduleId",authenticateAdmin,getAllLessons);



export default lessonrouter;
