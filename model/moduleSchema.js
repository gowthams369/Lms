import { DataTypes } from "sequelize";

export const createModuleModel = (sequelize) => {
    return sequelize.define("Module", {
        title: {
            type: DataTypes.STRING,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Module title is required" },
            },
        },
        content: {
            type: DataTypes.TEXT,
            allowNull: false,
            validate: {
                notEmpty: { msg: "Module content is required" },
            },
        },
    });
};
