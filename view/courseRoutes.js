import express from 'express';
import { createCourse, updateCourse, deleteCourse, getAllCourses } from '../controller/courseController.js';
import { authenticateAdmin } from '../middlewares/authenticateAdmin.js';

const courserouter = express.Router();

// Route for creating a course
courserouter.post("/superadmin/createCourse",authenticateAdmin,createCourse);
courserouter.put('/superadmin/updateCourse',authenticateAdmin, updateCourse);
courserouter.delete("/superadmin/deleteCourse/:id", authenticateAdmin,deleteCourse);
courserouter.get("/superadmin/getAllCourses",authenticateAdmin,getAllCourses);



export default courserouter;
