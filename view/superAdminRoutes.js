import express from "express";
import { superAdminLogin, dashboard,approveUser,bulkRegisterUsers, createUser, updateUser, deleteUser, approveLessonRequest, rejectLessonRequest, getAllPendingLessonRequests} from "../controller/superAdminController.js";
import { createAssignment,deleteAssignment,getAllLessons,updateAssignment,viewQuiz } from "../controller/lessonController.js";
import {upload} from "../middlewares/uploadMiddleware.js";
import { authenticateAdmin } from "../middlewares/authenticateAdmin.js";



const superAdminRouter = express.Router();

superAdminRouter.post("/superadmin/login",superAdminLogin);
superAdminRouter.get("/superadmin/dashboard", authenticateAdmin,dashboard);
superAdminRouter.post("/superadmin/approve",authenticateAdmin,approveUser);
superAdminRouter.post('/superadmin/bulkRegisterUsers', upload.single('excelFile'), bulkRegisterUsers);
superAdminRouter.post("/superadmin/createAssignment",authenticateAdmin,createAssignment);
superAdminRouter.put("/superadmin/updateAssignment/:assignmentId",authenticateAdmin,updateAssignment);
superAdminRouter.delete("/superadmin/deleteAssignment/:assignmentId",authenticateAdmin,deleteAssignment);
superAdminRouter.get("/superadmin/viewQuiz/:quizId",authenticateAdmin,viewQuiz);
superAdminRouter.post("/superadmin/createUser",authenticateAdmin,createUser);
superAdminRouter.put("/superadmin/updateUser/:userId",authenticateAdmin,updateUser);
superAdminRouter.delete("/superadmin/deleteUser/:userId",authenticateAdmin,deleteUser);
superAdminRouter.post("/superadmin/approveLessonRequest/:lessonId",authenticateAdmin,approveLessonRequest);
superAdminRouter.post("/superadmin/rejectLessonRequest/:lessonId",authenticateAdmin,rejectLessonRequest);
superAdminRouter.get("/superadmin/getAllPendingLessonRequests",authenticateAdmin,getAllPendingLessonRequests);
superAdminRouter.post("/admin/approveLessonRequest/:lessonId",authenticateAdmin,approveLessonRequest);
superAdminRouter.post("/admin/rejectLessonRequest/:lessonId",authenticateAdmin,rejectLessonRequest);
superAdminRouter.get("/admin/getAllPendingLessonRequests",authenticateAdmin,getAllPendingLessonRequests);
superAdminRouter.get("/superadmin/getAllLessons/:courseId/:moduleId/:lessonId",getAllLessons);
superAdminRouter.get("/admin/getAllLessons/:courseId/:moduleId/:lessonId",getAllLessons);






export default superAdminRouter;
