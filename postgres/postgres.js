import { Sequelize, DataTypes } from "sequelize";
import { createUserModel } from "../model/userSchema.js";
import { createCourseModel } from "../model/courseSchema.js";
import { createModuleModel } from "../model/moduleSchema.js";
import { createLessonModel } from "../model/lessonSchema.js";
import { createBatchModel } from "../model/batchSchema.js";
import { createStudentBatchModel } from "../model/studentbatchSchema.js";
import { createTeacherBatchModel } from "../model/teacherbatchSchema.js";
import { createAssignmentModel } from "../model/assignmentSchema.js";
import { createAssignmentSubmissionModel } from "../model/assignmentsubmissionSchema.js";
import {createLessonCompletionModel} from "../model/lessoncompletionSchema.js"
import { createQuizModel } from "../model/quizSchema.js";
import { createAnswerModel } from "../model/answerModel.js";
import { createQuestionModel } from "../model/questionSchema.js";
import { createQuizResultModel } from "../model/quizResultSchema.js";
import { createNotificationModel } from "../model/notificaionModel.js";
import { createFeedbackModel } from "../model/feedbackSchema.js";

let sequelize;

export let UserModel;
export let CourseModel;
export let ModuleModel;
export let LessonModel;
export let BatchModel;
export let StudentBatchModel;
export let TeacherBatchModel;
export let AssignmentModel;
export let AssignmentSubmissionModel;
export let LessonCompletionModel;
export let QuizModel;
export let AnswerModel;
export let QuestionModel;
export let QuizResultModel;
export let NotificationModel;
export let FeedbackModel;

export const Connection = async () => {
    try {
        // Initialize Sequelize instance
        sequelize = new Sequelize("LMS", "postgres", "1234", {
            host: "localhost",
            dialect: "postgres",
        });

        // Test the connection
        await sequelize.authenticate();
        console.log("Database connected successfully!");

        // Initialize models
        UserModel = createUserModel(sequelize);
        CourseModel = createCourseModel(sequelize);
        ModuleModel = createModuleModel(sequelize);
        LessonModel = createLessonModel(sequelize);
        BatchModel = createBatchModel(sequelize);
        StudentBatchModel = createStudentBatchModel(sequelize);
        TeacherBatchModel = createTeacherBatchModel(sequelize);
        AssignmentModel=createAssignmentModel(sequelize);
        AssignmentSubmissionModel=createAssignmentSubmissionModel(sequelize);
        LessonCompletionModel=createLessonCompletionModel(sequelize);
        QuizModel=createQuizModel(sequelize);
        AnswerModel=createAnswerModel(sequelize);
        QuestionModel=createQuestionModel(sequelize);
        QuizResultModel=createQuizResultModel(sequelize);
        NotificationModel=createNotificationModel(sequelize);
        FeedbackModel=createFeedbackModel(sequelize);
    


        UserModel.associate = (models) => { UserModel.belongsTo(models.Batch, {foreignKey: 'batchId',as: 'batch', });
          };
        // Associations
        // Course -> Module
        CourseModel.hasMany(ModuleModel, { as: "modules", foreignKey: "courseId" });
        ModuleModel.belongsTo(CourseModel, { foreignKey: "courseId" });

        // Course -> Batch
        CourseModel.hasMany(BatchModel, { foreignKey: "courseId", onDelete: "CASCADE" });
        BatchModel.belongsTo(CourseModel, { foreignKey: "courseId" });

        // Association between Course and Assignment
        CourseModel.hasMany(AssignmentModel, { foreignKey: "courseId" });
        AssignmentModel.belongsTo(CourseModel, { foreignKey: "courseId" });


        // StudentBatch associations
        BatchModel.belongsToMany(UserModel, { through: StudentBatchModel, foreignKey: "batchId" });
        UserModel.belongsToMany(BatchModel, { through: StudentBatchModel, foreignKey: "studentId" });

        BatchModel.belongsTo(CourseModel, { foreignKey: "courseId" });
        CourseModel.hasMany(BatchModel, { foreignKey: "courseId" });

        StudentBatchModel.belongsTo(UserModel, { foreignKey: "studentId" });
        UserModel.hasOne(StudentBatchModel, { foreignKey: "studentId" });

        StudentBatchModel.belongsTo(BatchModel, { foreignKey: "batchId" });
        BatchModel.hasMany(StudentBatchModel, { foreignKey: "batchId" });

        // TeacherBatch associations
        TeacherBatchModel.belongsTo(UserModel, { foreignKey: "teacherId" });
        UserModel.hasMany(TeacherBatchModel, { foreignKey: "teacherId" });

        TeacherBatchModel.belongsTo(BatchModel, { foreignKey: "batchId" });
        BatchModel.hasMany(TeacherBatchModel, { foreignKey: "batchId" });

        // Lesson associations
        LessonModel.belongsTo(ModuleModel, { foreignKey: "moduleId", as: "module" });
        ModuleModel.hasMany(LessonModel, { foreignKey: "moduleId" });

        LessonModel.belongsTo(CourseModel, { foreignKey: "courseId", as: "course" });
        CourseModel.hasMany(LessonModel, { foreignKey: "courseId" });


            // Associations for Assignment
        AssignmentModel.belongsTo(CourseModel, { foreignKey: "courseId" });
        CourseModel.hasMany(AssignmentModel, { foreignKey: "courseId" });

        AssignmentModel.belongsTo(ModuleModel, { foreignKey: "moduleId" });
        ModuleModel.hasMany(AssignmentModel, { foreignKey: "moduleId" });

        AssignmentModel.belongsTo(LessonModel, { foreignKey: "lessonId" });
        LessonModel.hasMany(AssignmentModel, { foreignKey: "lessonId" });
        // Association between Assignment and Batch (Optional)
       AssignmentModel.belongsTo(BatchModel, { foreignKey: "batchId" });
       BatchModel.hasMany(AssignmentModel, { foreignKey: "batchId" });


        // Associations for AssignmentSubmission
        AssignmentSubmissionModel.belongsTo(AssignmentModel, { foreignKey: "assignmentId" });
        AssignmentModel.hasMany(AssignmentSubmissionModel, { foreignKey: "assignmentId" });

        AssignmentSubmissionModel.belongsTo(UserModel, { foreignKey: "studentId" });
        UserModel.hasMany(AssignmentSubmissionModel, { foreignKey: "studentId" });

        // Associations for LessonCompletionModel
        LessonCompletionModel.belongsTo(UserModel, { foreignKey: "studentId", as: "student" });
        LessonCompletionModel.belongsTo(LessonModel, { foreignKey: "lessonId", as: "lesson" });
        LessonCompletionModel.belongsTo(CourseModel, { foreignKey: "courseId", as: "course" });
        LessonCompletionModel.belongsTo(ModuleModel, { foreignKey: "moduleId", as: "module" });

        QuizModel.hasMany(QuestionModel, { foreignKey: "quizId", as:'questions'});
        QuestionModel.hasMany(AnswerModel, { foreignKey: "questionId" });
        QuestionModel.belongsTo(QuizModel, { foreignKey: 'quizId', as: 'quiz' });
        QuestionModel.hasMany(AnswerModel, { foreignKey: 'questionId', as: 'answers' });
        QuizResultModel.hasMany(AnswerModel, {foreignKey: 'quizResultId', as: 'answers',});

        NotificationModel.associate = (models) => {
        NotificationModel.belongsTo(models.User, { foreignKey: 'userId' });
        NotificationModel.belongsTo(models.Batch, { foreignKey: 'batchId' });};


        FeedbackModel.belongsTo(LessonModel, { foreignKey: 'lessonId' });
        FeedbackModel.belongsTo(UserModel, { foreignKey: 'studentId' });
        LessonModel.hasMany(FeedbackModel, { foreignKey: 'lessonId' });
        UserModel.hasMany(FeedbackModel, { foreignKey: 'studentId' });





       
        // Sync the models with the database
        await sequelize.sync({ alter: true });
        console.log("Models synchronized successfully!");
    } catch (error) {
        console.error("Database connection failed:", error);
        throw error;
    }
};
