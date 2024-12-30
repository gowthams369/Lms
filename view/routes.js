import express from "express"
import { registerUser,loginUser, logoutUser, forgotPassword, resetPassword } from "../controller/userController.js";

const router=express.Router()



router.post("/registerUser",registerUser);
router.post('/login', loginUser);
router.post('logout',logoutUser);
router.post("/forgotPassword",forgotPassword);
router.post("/resetPassword",resetPassword);



export default router;