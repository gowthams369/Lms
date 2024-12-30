import { DataTypes } from 'sequelize';

export const createAnswerModel = (sequelize) => {
  const Answer = sequelize.define('Answer', {
    text: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    isCorrect: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    questionId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Questions', 
        key: 'id',
      },
    },
  });

  return Answer;
};
