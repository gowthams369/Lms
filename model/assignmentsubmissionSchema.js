import { DataTypes } from "sequelize";

export const createAssignmentSubmissionModel = (sequelize) => {
    return sequelize.define("AssignmentSubmission", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        assignmentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Assignments", key: "id" },
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: { model: "Users", key: "id" },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: true,
        },
        fileLink: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        submittedAt: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW,
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: true, 
        },
        feedbackBy: {
            type: DataTypes.INTEGER,
            allowNull: true, 
        },
        feedbackDate: {
            type: DataTypes.DATE,
            allowNull: true, 
        },
    
    });
};
