import { DataTypes } from "sequelize";

export const createStudentBatchModel = (sequelize) => {
    return sequelize.define("StudentBatch", {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
        },
        studentId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Users',  // Ensure this refers to the correct model name in your database
                key: 'id',
            },
        },
        batchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: 'Batches',  // Ensure this refers to the correct model name in your database
                key: 'id',
            },
        },
        enrollmentDate: {
            type: DataTypes.DATE,
            allowNull: false,
            defaultValue: DataTypes.NOW,
        },
    }, {
        timestamps: false,
        indexes: [
            {
                unique: true,
                fields: ['studentId', 'batchId'],  // Composite index on studentId and batchId
            },
        ],
    });
};
