import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { UserModel,LessonModel } from '../postgres/postgres.js';
import { Sequelize } from 'sequelize';
import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';
import { fileURLToPath } from 'url';



export const superAdminLogin = async (req, res) => {
    const { email, password } = req.body;

    try {
    
        if (email !== process.env.SUPERADMIN_EMAIL) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if the password matches the super admin password
        const isPasswordValid = await bcrypt.compare(password, process.env.SUPERADMIN_PASSWORD);
        if (!isPasswordValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate a JWT token for the super admin
        const token = jwt.sign({ role: 'superadmin' }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Return the token
        return res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

// Admin or Super Admin Dashboard
export const dashboard = async (req, res) => {
    const token = req.headers.authorization?.split(' ')[1]; 

    try {
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch users based on role
        let users;
        if (decoded.role === 'superadmin') {
            // Superadmins can see all users
            users = await UserModel.findAll();
        } else if (decoded.role === 'admin') {
            // Admins can see only students and teachers
            users = await UserModel.findAll({
                where: {
                    role: {
                        [Sequelize.Op.in]: ['student', 'teacher']
                    }
                }
            });
        } else {
            return res.status(403).json({ message: 'Unauthorized access' });
        }

        return res.status(200).json({ users });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



// Approve User
export const approveUser = async (req, res) => {
    const { id, role } = req.body; 
    const token = req.headers.authorization?.split(' ')[1]; 

    try {
        if (!token) {
            return res.status(401).json({ message: 'Authorization token required' });
        }

        // Verify the token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to a super admin or admin
        if (decoded.role === 'superadmin') {
            // Superadmin can approve any role
        } else if (decoded.role === 'admin') {
            // Admin can approve only student and teacher roles
            if (!['student', 'teacher'].includes(role)) {
                return res.status(403).json({ message: 'Admins can only approve student or teacher roles' });
            }
        } else {
            return res.status(403).json({ message: 'Only superadmins or admins can approve users' });
        }

        // Validate the provided role
        const validRoles = ['admin', 'student', 'teacher'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role provided' });
        }

        // Find the user by ID
        const user = await UserModel.findByPk(id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Approve the user and update their role
        user.approved = true;
        user.role = role; // Assign the role during approval
        await user.save();

        return res.status(200).json({ message: `User with ID ${id} approved successfully as ${role}` });
    } catch (error) {
        console.error('Error during user approval:', error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: 'Invalid token' });
        }

        return res.status(500).json({ error: 'Internal server error' });
    }
};

   
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const bulkRegisterUsers = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    // Resolve the uploaded file path
    const filePath = path.resolve(__dirname, '..', 'uploads', req.file.filename);

    // Log the final file path for debugging
    console.log('Processing file at path:', filePath);

    // Read the Excel file
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Define valid roles for validation
    const validRoles = ['superadmin', 'admin', 'student', 'teacher'];

    // Process each user from the Excel data
    const results = [];
    for (const user of data) {
      const { name, email, password, role, phoneNumber } = user; // Include phoneNumber

      // Validate inputs
      if (!name || !email || typeof password !== 'string' || password.trim() === '') {
        console.log(`Skipping invalid user entry: ${JSON.stringify(user)}`);
        results.push({ email, status: 'skipped', reason: 'Invalid input' });
        continue;
      }

      if (role && !validRoles.includes(role)) {
        console.log(`Skipping user with invalid role: ${email}`);
        results.push({ email, status: 'skipped', reason: 'Invalid role' });
        continue;
      }

      try {
        // Check if the user already exists
        const existingUser = await UserModel.findOne({ where: { email } });
        if (existingUser) {
          console.log(`User already exists: ${email}`);
          results.push({ email, status: 'skipped', reason: 'User already exists' });
          continue;
        }

        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user with 'approved' set to true
        await UserModel.create({
          name,
          email,
          password: hashedPassword,
          role: role || 'student',
          approved: true,
          phoneNumber: phoneNumber || null, // Default to null if phoneNumber is not provided
        });

        console.log(`User registered successfully: ${email}`);
        results.push({ email, status: 'success' });
      } catch (userError) {
        console.error(`Error registering user ${email}:`, userError);
        results.push({ email, status: 'failed', reason: userError.message });
      }
    }

    // Delete the uploaded file after processing
    fs.unlinkSync(filePath);

    // Return a summary of the processing
    return res.status(200).json({ message: 'Bulk user registration completed', results });
  } catch (error) {
    console.error('Error processing Excel file:', error);
    return res.status(500).json({ message: 'Error processing Excel file', error: error.message });
  }
};


export const createUser = async (req, res) => {
    const { name, email, password, role, approved, phoneNumber } = req.body;

    try {
        // Check if user already exists
        const existingUser = await UserModel.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email already exists' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create new user with name and phnum included
        const newUser = await UserModel.create({
            name,
            email,
            password: hashedPassword,
            role,
            approved,
            phoneNumber, 
        });

        return res.status(201).json({ message: 'User created successfully', newUser });
    } catch (error) {
        console.error('Error creating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};

export const updateUser = async (req, res) => {
    const { userId } = req.params;
    const { name, email, password, role, approved, phoneNumber } = req.body;

    try {
        const user = await UserModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (name) user.name = name;
        if (email) user.email = email;
        if (role) user.role = role;
        if (approved !== undefined) user.approved = approved;
        if (phoneNumber) user.phoneNumber = phoneNumber;

        if (password) {
            user.password = await bcrypt.hash(password, 10);
        }

        await user.save(); 

        return res.status(200).json({ message: 'User updated successfully', user });
    } catch (error) {
        console.error('Error updating user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const deleteUser = async (req, res) => {
    const { userId } = req.params;

    try {
        const user = await UserModel.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await user.destroy();

        return res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error('Error deleting user:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};



// Approve Lesson Request (Admin/Superadmin)
export const approveLessonRequest = async (req, res) => {
    const { lessonId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only admins or super admins can approve lesson requests" });
        }

        const lesson = await LessonModel.findByPk(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        if (lesson.status !== 'pending') {
            return res.status(400).json({ message: "This lesson request is not in a pending state" });
        }

        // Approve the lesson request
        lesson.status = 'approved';
        await lesson.save();

        return res.status(200).json({ message: "Lesson request approved successfully", lesson });
    } catch (error) {
        console.error("Error approving lesson request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Reject Lesson Request (Admin/Superadmin)
export const rejectLessonRequest = async (req, res) => {
    const { lessonId } = req.params;
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only admins or super admins can reject lesson requests" });
        }

        const lesson = await LessonModel.findByPk(lessonId);
        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found" });
        }

        if (lesson.status !== 'pending') {
            return res.status(400).json({ message: "This lesson request is not in a pending state" });
        }

        // Reject the lesson request
        lesson.status = 'rejected';
        await lesson.save();

        return res.status(200).json({ message: "Lesson request rejected", lesson });
    } catch (error) {
        console.error("Error rejecting lesson request:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllPendingLessonRequests = async (req, res) => {
    const token = req.headers.authorization?.split(" ")[1];

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only admins or superadmins can view pending lesson requests" });
        }

        // Fetch all lessons with 'pending' status
        const pendingLessons = await LessonModel.findAll({
            where: { status: 'pending' },
        });

        if (pendingLessons.length === 0) {
            return res.status(404).json({ message: "No pending lesson requests found" });
        }

        return res.status(200).json({ message: "Pending lesson requests fetched successfully", pendingLessons });
    } catch (error) {
        console.error("Error fetching pending lesson requests:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


// View Lesson in a Course and Module
export const viewLesson = async (req, res) => {
    const { courseId, moduleId, lessonId } = req.params; // Extract courseId, moduleId, and lessonId from URL params
    const token = req.headers.authorization?.split(" ")[1]; // Extract token from Authorization header

    try {
        if (!token) {
            return res.status(401).json({ message: "Authorization token required" });
        }

        // Verify the token and decode it
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if the token belongs to an admin or superadmin
        if (decoded.role !== "admin" && decoded.role !== "superadmin") {
            return res.status(403).json({ message: "Only admins or super admins can view lessons" });
        }

        // Find the lesson based on courseId, moduleId, and lessonId
        const lesson = await LessonModel.findOne({
            where: { id: lessonId, moduleId, courseId },
        });

        if (!lesson) {
            return res.status(404).json({ message: "Lesson not found or invalid course/module/lesson combination" });
        }

        // Return the lesson details
        return res.status(200).json({ lesson });
    } catch (error) {
        console.error("Error fetching lesson:", error);
        // Handle JWT token errors specifically
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ message: "Invalid token" });
        }

        // Handle token expiration errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({ message: "Token expired" });
        }

        // Handle other errors
        res.status(500).json({ message: "Internal server error" });
    }
};
