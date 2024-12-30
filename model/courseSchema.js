import { DataTypes } from "sequelize";
import { createBatchModel } from "./batchSchema.js";

export const createCourseModel = (sequelize) => {
    const Course = sequelize.define("Course", {
        name: {
            type: DataTypes.STRING,
            allowNull: false, // Course name is required
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false, // Course description is required
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true, // Optional start date
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true, // Optional end date
        },
    });

    const BatchModel = createBatchModel(sequelize);

    Course.hasMany(BatchModel, {
        foreignKey: "courseId",
        as: "batches",
        onDelete: "CASCADE",
    });

    BatchModel.belongsTo(Course, {
        foreignKey: "courseId",
        as: "course",
    });

    return Course;
};
