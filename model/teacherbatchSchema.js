import { DataTypes } from "sequelize";

export const createTeacherBatchModel = (sequelize) => {
    return sequelize.define("TeacherBatch", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        teacherId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users', // Ensure this matches your User model table name
                key: 'id',
            },
        },
        batchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Batches', // Ensure this matches your Batch model table name
                key: 'id',
            },
        },
        assignmentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['teacherId', 'batchId'], // Composite index for uniqueness
            },
        ],
    });
};
