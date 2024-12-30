module.exports = {
    up: async (queryInterface, Sequelize) => {
      // Step 1: Add moduleId and courseId columns as nullable
      await queryInterface.addColumn('Lessons', 'moduleId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Modules',
          key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: true, // Allow null initially to avoid breaking existing rows
      });
  
      await queryInterface.addColumn('Lessons', 'courseId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Courses',
          key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: true, // Allow null initially to avoid breaking existing rows
      });
  
      // Step 2: Update existing rows if needed
      // You can either update with specific moduleId and courseId values
      // or set the values to valid references if your data allows that.
  
      // Example: Update with default moduleId and courseId (ensure these IDs exist in your Modules and Courses tables)
      await queryInterface.sequelize.query(`
        UPDATE "Lessons"
        SET "moduleId" = 1, "courseId" = 1
        WHERE "moduleId" IS NULL OR "courseId" IS NULL
      `);
  
      // Step 3: Change the column to NOT NULL after updating existing records
      await queryInterface.changeColumn('Lessons', 'moduleId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Modules',
          key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      });
  
      await queryInterface.changeColumn('Lessons', 'courseId', {
        type: Sequelize.INTEGER,
        references: {
          model: 'Courses',
          key: 'id',
        },
        onDelete: 'CASCADE',
        allowNull: false,
      });
    },
  
    down: async (queryInterface, Sequelize) => {
      // Remove the columns if rolling back the migration
      await queryInterface.removeColumn('Lessons', 'moduleId');
      await queryInterface.removeColumn('Lessons', 'courseId');
    },
  };
  