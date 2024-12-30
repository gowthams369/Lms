import express from "express";
import cors from "cors";
import { Sequelize } from "sequelize";
import { Connection } from "./postgres/postgres.js";
import "./jobs/livesecessionNotification.js";
import router from "./view/routes.js";
import superAdminRouter from "./view/superAdminRoutes.js";
import dotenv from 'dotenv'
import courserouter from "./view/courseRoutes.js";
import modulerouter from "./view/moduleRoutes.js";
import lessonrouter from "./view/lessonRoutes.js";
import batchrouter from "./view/batchRoutes.js";
import adminrouter from "./view/adminRoutes.js";
import teacherrouter from "./view/teacherRoutes.js";
import studentrouter from "./view/studentRoutes.js";
import connectSessionSequelize from 'connect-session-sequelize';
import redis from 'redis'
import session from 'express-session'; 

const redisClient = redis.createClient();
const app = express();
const PORT = 8000;
dotenv.config();
// Middleware
app.use(cors());
app.use(express.json());



const sequelize = new Sequelize({
    dialect: 'postgres', 
    host: 'localhost',
    username: 'postgres',
    password: '1234',
    database: 'LMS',
});



const SequelizeStore = connectSessionSequelize(session.Store);
const sessionStore = new SequelizeStore({
    db: sequelize,
});


app.use(
    session({
        secret: 'fb9c3a9f9d4b67b453c3a63ea3271a1f83cd95c34c3a9d56a80e56c72f60a4b1',  
        resave: false,             
        saveUninitialized: false,   
        store: sessionStore,        
        cookie: {
            httpOnly: true,         
            secure: false,          
            maxAge: 24 * 60 * 60 * 1000, 
        },
    })
);

sessionStore.sync();

app.use("/api",router);
app.use("/api",superAdminRouter);
app.use("/api",courserouter);
app.use("/api",modulerouter);
app.use("/api",lessonrouter);
app.use("/api",batchrouter);
app.use("/api",adminrouter);
app.use("/api",teacherrouter);
app.use("/api",studentrouter);

const startServer = async () => {
    try {
        await Connection(); // Establish database connection
        app.listen(PORT, () => {
            console.log(`The server is running at PORT ${PORT}`);
        });
    } catch (error) {
        console.error("Failed to start the server:", error);
    }
};

startServer();
