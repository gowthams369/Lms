import express from 'express';
import { createCourse, updateCourse, deleteCourse, getAllCourses } from '../controller/courseController.js';
import { createModule,updateModule,deleteModule } from '../controller/moduleController.js';
import {dashboard } from '../controller/superAdminController.js';
import { adminApproveUser } from '../controller/adminController.js';
import { authenticateAdmin } from '../middlewares/authenticateAdmin.js';
import { createLesson,updateLesson,deleteLesson,uploadLessonFile,createQuiz,updateQuiz,deleteQuiz,createQuestion,updateQuestion,deleteQuestion,createAssignment,viewQuiz, updateAssignment, deleteAssignment } from '../controller/lessonController.js';
const adminrouter = express.Router();

// Route for creating a course
adminrouter.post('/admin/createCourse',authenticateAdmin, createCourse);
adminrouter.put('/admin/updateCourse',authenticateAdmin, updateCourse);
adminrouter.delete("/admin/:id", authenticateAdmin,deleteCourse);
adminrouter.get("/admin/getAllCourses",getAllCourses);
adminrouter.post("/admin/createModule", authenticateAdmin,createModule);
adminrouter.put("/admin/updateModule", authenticateAdmin,updateModule);
adminrouter.delete('/admin/deleteModule/:courseId/:moduleId',authenticateAdmin, deleteModule);
adminrouter.post("/admin/createLesson",authenticateAdmin, createLesson);
adminrouter.put("/admin/updateLesson",authenticateAdmin, updateLesson);
adminrouter.delete("/admin/deleteLesson/:courseId/:moduleId/:lessonId",authenticateAdmin,deleteLesson);
adminrouter.post("/admin/uploadLessonFile/:courseId/:moduleId/:lessonId",authenticateAdmin,uploadLessonFile)
adminrouter.post("/admin/createAssignment",authenticateAdmin,createAssignment);
adminrouter.put("/admin/updateAssignment/:assignmentId",authenticateAdmin,updateAssignment)
adminrouter.delete("/admin/deleteAssignment/:assignmentId",authenticateAdmin,deleteAssignment)
adminrouter.post("/admin/createQuiz/:courseId/:batchId/:moduleId/:lessonId",authenticateAdmin,createQuiz);
adminrouter.put("/admin/updateQuiz/:quizId",authenticateAdmin,updateQuiz);
adminrouter.delete("/admin/deleteQuiz/:quizId",authenticateAdmin, deleteQuiz);
adminrouter.post("/admin/createQuestion/:quizId",authenticateAdmin,createQuestion);
adminrouter.put("/admin/updateQuestion/:quizId/:questionId",authenticateAdmin,updateQuestion);
adminrouter.delete("/admin/deleteQuestion/:quizId/:questionId",authenticateAdmin,deleteQuestion);
adminrouter.get("/admin/viewQuiz/:quizId",authenticateAdmin,viewQuiz)



adminrouter.post("/admin/adminApproveUser",authenticateAdmin,adminApproveUser);
adminrouter.get("/admin/dashboard",authenticateAdmin,dashboard);



export default adminrouter;
