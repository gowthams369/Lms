
import jwt from 'jsonwebtoken';
import { UserModel } from '../postgres/postgres.js';


export const adminApproveUser = async (req, res) => {
    const { id, role } = req.body; 
    const token = req.headers.authorization?.split(' ')[1]; 

    try {
        
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        // Step 2: Verify the token to extract user information
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Step 3: Ensure the token belongs to an admin
        if (decoded.role !== 'admin') {
            return res.status(403).json({ message: 'Only admins can approve users' });
        }

        // Step 4: Find the user by ID to be approved
        const user = await UserModel.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Step 5: Validate that the provided role matches the user's role
        if (!['teacher', 'student'].includes(user.role)) {
            return res.status(403).json({ message: 'Admins can only approve teachers or students' });
        }

        if (user.role !== role) {
            return res.status(400).json({ message: `The provided role (${role}) does not match the user's role (${user.role})` });
        }

        // Step 6: Approve the user and save to the database
        user.approved = true;
        await user.save();

        return res.status(200).json({ message: `User with ID ${id} approved successfully as ${user.role}` });
    } catch (error) {
        console.error('Error during user approval:', error);

        // Handle invalid token error
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
};
