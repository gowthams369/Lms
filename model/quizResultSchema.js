import { DataTypes } from 'sequelize';


export const createQuizResultModel = (sequelize) => {
    return sequelize.define('QuizResult', {
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        quizId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        score: {
            type: DataTypes.INTEGER,
            defaultValue: 0,
        },
       
        dateSubmitted: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: DataTypes.NOW,
        },
        status: {
            type: DataTypes.ENUM('pending', 'completed'),
            defaultValue: 'pending',
        },
    });
};
