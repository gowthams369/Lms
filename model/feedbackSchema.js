import { DataTypes } from "sequelize";

export const createFeedbackModel = (sequelize) => {
    const Feedback = sequelize.define("Feedback", {
        lessonId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        feedback: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
    }, {
        timestamps: true,
    });

    return Feedback; 
};
