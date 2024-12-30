import { DataTypes } from 'sequelize';

export const createQuestionModel = (sequelize) => {
    const Question = sequelize.define('Question', {
      text: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      quizId: {
        type: DataTypes.INTEGER,
        references: {
          model: 'Quizzes',
          key: 'id',
        },
      },
    });
  

  
    return Question;
  };
  