import express from "express";
import { createModule,updateModule,deleteModule, getAllModulesInCourse } from "../controller/moduleController.js";
import { authenticateAdmin } from "../middlewares/authenticateAdmin.js";

const modulerouter = express.Router();

modulerouter.post("/superadmin/createModule",authenticateAdmin, createModule);
modulerouter.put("/superadmin/updateModule", authenticateAdmin,updateModule);
modulerouter.delete('/superadmin/deleteModule/:courseId/:moduleId',authenticateAdmin, deleteModule);
modulerouter.get("/superadmin/getAllModules/:courseId",getAllModulesInCourse);
modulerouter.get("/admin/getAllModules/:courseId",getAllModulesInCourse);

export default modulerouter;
