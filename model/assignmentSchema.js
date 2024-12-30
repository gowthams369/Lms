import { DataTypes } from "sequelize";

export const createAssignmentModel = (sequelize) => {
    return sequelize.define("Assignment", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        dueDate: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    });
};
