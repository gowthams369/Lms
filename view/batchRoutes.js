import express from "express";
import { createBatch, updateBatch, deleteBatch,assignUserToBatch,deleteUserFromBatch,postLiveLink} from "../controller/batchController.js";
import { authenticateTeacher } from "../middlewares/authenticateTeacher.js";
import { authenticateAdmin } from "../middlewares/authenticateAdmin.js";
const batchrouter = express.Router();


batchrouter.post("/superadmin/createBatch",authenticateAdmin, createBatch);
batchrouter.put("/superadmin/updateBatch",authenticateAdmin,updateBatch);
batchrouter.delete("/superadmin/deleteBatch/:courseId/:batchId", authenticateAdmin,deleteBatch);
batchrouter.post("/superadmin/assignUserToBatch",authenticateAdmin,assignUserToBatch);
batchrouter.post("/admin/createBatch",authenticateAdmin, createBatch);
batchrouter.put("/admin/updateBatch", authenticateAdmin,updateBatch);
batchrouter.delete("/admin/:courseId/:batchId", authenticateAdmin,deleteBatch);
batchrouter.post("/admin/assignUserToBatch",authenticateAdmin,assignUserToBatch);
batchrouter.delete('/superadmin/deleteUserFromBatch',authenticateAdmin, deleteUserFromBatch);
batchrouter.delete('/admin/deleteUserFromBatch',authenticateAdmin, deleteUserFromBatch);
batchrouter.post("/superadmin/:batchId/postLiveLink",authenticateAdmin, postLiveLink);
batchrouter.post("/admin/:batchId/postLiveLink", authenticateAdmin,postLiveLink);
batchrouter.post("/teacher/:batchId/postLiveLink", authenticateTeacher,postLiveLink);

export default batchrouter;