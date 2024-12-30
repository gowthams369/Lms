import { DataTypes } from "sequelize";

export const createQuizModel = (sequelize) => {
  const Quiz = sequelize.define('Quiz', {
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
    },
    courseId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Courses',
        key: 'id',
      },
    },
    moduleId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Modules',
        key: 'id',
      },
    },
    lessonId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Lessons',
        key: 'id',
      },
    },
    batchId: {
      type: DataTypes.INTEGER,
      references: {
        model: 'Batches',
        key: 'id',
      },
    },
  });

 

  return Quiz;
};
