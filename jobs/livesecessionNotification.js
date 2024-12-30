import cron from 'node-cron';
import { NotificationModel,UserModel,BatchModel } from '../postgres/postgres.js';
import { Op } from 'sequelize';


cron.schedule('*/10 * * * *', async () => {
    const now = new Date();
    const oneHourLater = new Date(now.getTime() + 60 * 60 * 1000);
    const oneHourBefore = new Date(oneHourLater.getTime() - 10 * 60 * 1000);

    try {
        const batches = await BatchModel.findAll({
            where: {
                liveStartTime: {
                    [Op.gte]: oneHourBefore,
                    [Op.lte]: oneHourLater,
                },
            },
        });

        batches.forEach(async (batch) => {
            try {
                const students = await UserModel.findAll({ where: { batchId: batch.id } });

                students.forEach(async (student) => {
                    try {
                        const notificationMessage = `Your live session will start in 1 hour. Link: ${batch.liveLink}`;
                        await NotificationModel.create({
                            userId: student.id,
                            batchId: batch.id,
                            message: notificationMessage,
                            liveStartTime: batch.liveStartTime,
                        });
                    } catch (studentError) {
                        console.error(`Error creating notification for student ID ${student.id}:`, studentError);
                    }
                });
            } catch (batchError) {
                console.error(`Error processing batch ID ${batch.id}:`, batchError);
            }
        });
    } catch (error) {
        console.error('Error in cron job:', error);
    }
});
