import { DataTypes } from "sequelize";

export const createLessonCompletionModel = (sequelize) => 
    sequelize.define("LessonCompletion", {
        lessonId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Lessons',
                key: 'id',
            },
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',
                key: 'id',
            },
        },
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Courses',
                key: 'id',
            },
        },
        moduleId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            references: {
                model: 'Modules',
                key: 'id',
            },
        },
        completed: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
    });
