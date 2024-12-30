import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel } from '../postgres/postgres.js';
import crypto from 'crypto';
import nodemailer from 'nodemailer';


export const registerUser = async (req, res) => {
    const { name, email, password, role, phoneNumber } = req.body;

    try {
        // Validate the role
        const validRoles = ['superadmin', 'admin', 'student', 'teacher'];
        if (role && !validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // If no role is provided, set the default role as 'student'
        const userRole = role || 'student';

        // Check if the user already exists
        const existingUser = await UserModel.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({ message: 'User already registered' }); // 409 for conflict
        }

        // Hash the password before saving the user
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create a new user with the provided role
        await UserModel.create({
            name,
            email,
            password: hashedPassword,
            phoneNumber, 
            role: userRole, 
        });

        return res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        console.error('Error during registration:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const loginUser = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Check if the user exists
        const user = await UserModel.findOne({ where: { email } });
        if (!user) {
            console.log(`No user found with email: ${email}`);
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the user is approved
        if (!user.approved) {
            console.log(`User with email ${email} is not approved`);
            return res.status(403).json({ message: 'Account not approved by super admin' });
        }

        // Check if the password matches
        if (!user.password) {
            console.log(`Password not set for user ID: ${user.id}`);
            return res.status(500).json({ message: 'Server error: password not set' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            console.log(`Password mismatch for user ID: ${user.id}`);
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token for the user
        if (!process.env.JWT_SECRET) {
            console.log('JWT_SECRET is not defined in the environment variables');
            return res.status(500).json({ message: 'Server configuration error' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error.message, error.stack);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const logoutUser = async (req, res) => {
    try {
        res.status(200).json({ message: 'Logged out successfully' });
    } catch (error) {
        console.error('Error during logout:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        // Check if the user exists
        const user = await UserModel.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ message: 'User with this email not found' });
        }

        // Generate a password reset token
        const resetToken = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send reset link via email
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
        const mailOptions = {
            to: email,
            subject: 'Password Reset Request',
            html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to reset your password.</p>`,
        };

        await transporter.sendMail(mailOptions);

        return res.status(200).json({ message: 'Password reset link sent to your email' });
    } catch (error) {
        console.error('Error during forgot password:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};



export const resetPassword = async (req, res) => {
    const { token, newPassword } = req.body;

    try {
        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user
        const user = await UserModel.findByPk(decoded.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the user's password
        user.password = hashedPassword;
        await user.save();

        return res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        console.error('Error during password reset:', error);
        return res.status(400).json({ message: 'Invalid or expired token' });
    }
};
