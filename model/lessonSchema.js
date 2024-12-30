import { Sequelize, DataTypes } from "sequelize";

export const createLessonModel = (sequelize) =>
    sequelize.define("Lesson", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Lesson title is required",
                },
            },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: {
                    msg: "Lesson content is required",
                },
            },
        },
        moduleId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Modules',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Courses',
                key: 'id',
            },
            onDelete: 'CASCADE',
        },
        status: {
            type: DataTypes.ENUM('pending', 'approved', 'rejected'),
            defaultValue: 'pending',
        },
        createdAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
        updatedAt: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    });
