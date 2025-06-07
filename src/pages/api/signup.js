import prisma from '../../lib/db.js';
import bcrypt from 'bcryptjs';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { name, email, password, role } = await request.json();

    console.log('Signup request received:', { name, email, role });

    // Validate input
    if (!email || !password || !role) {
      return new Response(JSON.stringify({
        success: false,
        error: 'Name, email, password, and role are required'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Only allow 'user' or 'admin' roles
    const allowedRoles = ['user', 'admin'];
    const userRole = allowedRoles.includes(role) ? role : 'user';

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    console.log('Existing user check:', existingUser ? 'Found' : 'Not found');

    if (existingUser) {
      return new Response(JSON.stringify({
        success: false,
        error: 'User with this email already exists'
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    console.log('Password hashed successfully');

    // Create new user with role
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'user'  // force-set to user
      }
    });

    console.log('User created successfully:', newUser.id, 'Role:', newUser.role);

    // Return success without password
    const { password: _, ...userWithoutPassword } = newUser;

    return new Response(JSON.stringify({
      success: true,
      user: userWithoutPassword
    }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Signup error:', error);

    return new Response(JSON.stringify({
      success: false,
      error: error.message
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}