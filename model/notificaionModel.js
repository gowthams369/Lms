import { DataTypes } from 'sequelize';

export const createNotificationModel = (sequelize) => {
    return sequelize.define('Notification', {
        userId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        batchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        message: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        isRead: {
            type: DataTypes.BOOLEAN,
            defaultValue: false, 
        },
        liveStartTime: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
};
