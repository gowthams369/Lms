import { DataTypes } from "sequelize";

export const createUserModel = (sequelize) => {
    return sequelize.define("User", {
        name: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
            validate: { isEmail: true },
        },
        password: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        phoneNumber: { 
            type: DataTypes.STRING,
            allowNull: true,
            validate: { isNumeric: true }, 
        },
        role: {
            type: DataTypes.ENUM("superadmin", "admin", "student", "teacher"),
            allowNull: false,
            defaultValue: "student",
        },
        approved: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
        },
        batchId: {
            type: DataTypes.INTEGER,
            allowNull: true, 
          },
    });
};
