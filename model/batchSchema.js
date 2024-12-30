import { DataTypes } from 'sequelize';

export const createBatchModel = (sequelize) => {
    return sequelize.define('Batch', {
        batchName: {
            type: DataTypes.STRING,
            allowNull: true, // Batch name is required
            defaultValue: 'Default Batch Name', // Set default value
            validate: {
                notEmpty: true, // Ensure it is not an empty string
            },
        },
        startDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: new Date(), // Default to the current date and time if not provided
        },
        endDate: {
            type: DataTypes.DATE,
            allowNull: true,
            defaultValue: new Date(), // Default to the current date and time if not provided
        },
        courseId: {
            type: DataTypes.INTEGER,
            allowNull: true,
        },
        liveLink: {
            type: DataTypes.STRING,
            allowNull: true,
        },
        liveStartTime: {
            type: DataTypes.DATE,
            allowNull: true,
        },
        
    });
};
