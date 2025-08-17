import bcrypt from 'bcryptjs';
import { findUserByEmail, createUser, getAllUsers } from '../models/userModel.js';
import { signToken } from '../utils/jwt.js';

// Password validation function
const validatePassword = (password) => {
  const minLength = 8;
  const hasCapital = /[A-Z]/.test(password);
  const hasSpecial = /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  
  if (password.length < minLength) {
    return { isValid: false, message: 'Password must be at least 8 characters long' };
  }
  if (!hasCapital) {
    return { isValid: false, message: 'Password must contain at least one capital letter' };
  }
  if (!hasSpecial) {
    return { isValid: false, message: 'Password must contain at least one special character' };
  }
  if (!hasNumber) {
    return { isValid: false, message: 'Password must contain at least one number' };
  }
  
  return { isValid: true };
};

export const register = async (req, res) => {
  const { name, email, password, role, profile_pic_url } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  // Validate password
  const passwordValidation = validatePassword(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({ message: passwordValidation.message });
  }
  
  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'Email already registered' });
  }
  
  // Check if this is the first user in the system
  const allUsers = await getAllUsers();
  const isFirstUser = allUsers.length === 0;
  
  // Determine user role and status
  let userRole = 'user';
  let userStatus = 'pending';
  
  if (isFirstUser) {
    // First user becomes admin and is auto-approved
    userRole = 'admin';
    userStatus = 'approved';
  } else if (role === 'admin' || role === 'vendor') {
    // Subsequent admin/vendor registrations need approval
    userRole = role;
    userStatus = 'pending';
  }
  
  const user = await createUser({ 
    name, 
    email, 
    password, // Don't hash here - schema middleware will handle it
    role: userRole, 
    status: userStatus,
    profile_pic_url 
  });
  
  if (isFirstUser) {
    // Auto-login for first admin user
    const token = signToken({ id: user._id, role: user.role });
    return res.status(201).json({ 
      message: 'Welcome! You are the first admin user. Your account has been automatically approved.',
      token,
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        status: user.status,
        profile_pic_url: user.profile_pic_url 
      }
    });
  } else {
    // Regular registration - needs admin approval
    return res.status(201).json({ 
      message: 'Registration successful! Please wait for admin approval to login.',
      user: { 
        id: user._id, 
        name: user.name, 
        email: user.email, 
        role: user.role, 
        status: user.status,
        profile_pic_url: user.profile_pic_url 
      }
    });
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ message: 'All fields are required' });
  }
  
  console.log('Login attempt for email:', email); // Debug log
  console.log('Password provided (length):', password.length); // Debug log
  
  const user = await findUserByEmail(email);
  if (!user) {
    console.log('User not found for email:', email); // Debug log
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  console.log('User found:', {
    id: user._id,
    email: user.email,
    role: user.role,
    status: user.status,
    hasPassword: !!user.password,
    passwordLength: user.password ? user.password.length : 0
  }); // Debug log
  
  // Check if user is blocked
  if (user.status === 'blocked') {
    console.log('User is blocked:', user.email); // Debug log
    return res.status(403).json({ message: 'Account has been blocked by admin' });
  }
  
  // Check if user is pending approval
  if (user.status === 'pending') {
    console.log('User is pending approval:', user.email); // Debug log
    return res.status(403).json({ message: 'Account pending admin approval' });
  }
  
  // Verify password
  if (!user.password) {
    console.log('User has no password stored:', user.email); // Debug log
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  const match = await bcrypt.compare(password, user.password);
  console.log('Password match:', match); // Debug log
  
  if (!match) {
    console.log('Password mismatch for user:', user.email); // Debug log
    return res.status(401).json({ message: 'Invalid credentials' });
  }
  
  // Only allow login if status is 'approved'
  if (user.status !== 'approved') {
    console.log('User status is not approved:', user.status, 'for user:', user.email); // Debug log
    return res.status(403).json({ message: 'Account not approved by admin' });
  }
  
  console.log('Login successful for user:', user.email); // Debug log
  
  const token = signToken({ id: user._id, role: user.role });
  res.json({ 
    token, 
    user: { 
      id: user._id, 
      name: user.name, 
      email: user.email, 
      role: user.role, 
      status: user.status,
      profile_pic_url: user.profile_pic_url 
    } 
  });
};

// Temporary admin creation endpoint (for testing only)
export const createAdmin = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    
    // Check if admin already exists
    const existingAdmin = await findUserByEmail(email);
    if (existingAdmin) {
      return res.status(409).json({ message: 'Admin already exists' });
    }
    
    const adminUser = await createUser({
      name,
      email,
      password, // Don't hash here - schema middleware will handle it
      role: 'admin',
      status: 'approved',
      previous_status: null
    });
    
    const token = signToken({ id: adminUser._id, role: adminUser.role });
    
    res.status(201).json({
      message: 'Admin user created successfully!',
      token,
      user: {
        id: adminUser._id,
        name: adminUser.name,
        email: adminUser.email,
        role: adminUser.role,
        status: adminUser.status
      }
    });
  } catch (error) {
    console.error('Error creating admin:', error);
    res.status(500).json({ message: 'Error creating admin user' });
  }
};

// Temporary debug endpoint to check user status
export const debugUser = async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({ message: 'Email parameter required' });
    }
    
    const user = await findUserByEmail(email);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    
    res.json({
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
        status: user.status,
        hasPassword: !!user.password
      }
    });
  } catch (error) {
    console.error('Error debugging user:', error);
    res.status(500).json({ message: 'Error debugging user' });
  }
};

// Temporary endpoint to list all users
export const listAllUsers = async (req, res) => {
  try {
    const users = await getAllUsers();
    const userList = users.map(user => ({
      id: user._id,
      email: user.email,
      name: user.name,
      role: user.role,
      status: user.status,
      hasPassword: !!user.password,
      createdAt: user.createdAt
    }));
    
    res.json({
      total: userList.length,
      users: userList
    });
  } catch (error) {
    console.error('Error listing users:', error);
    res.status(500).json({ message: 'Error listing users' });
  }
}; 