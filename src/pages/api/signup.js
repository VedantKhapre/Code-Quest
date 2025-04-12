import prisma from '../../lib/db.js';
import bcrypt from 'bcryptjs';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { name, email, password } = await request.json();
    
    console.log('Signup request received:', { name, email });
    
    // Validate input
    if (!email || !password) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Email and password are required' 
      }), { 
        status: 400, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
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
    
    // Create new user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      }
    });
    
    console.log('User created successfully:', user.id);
    
    // Return success without password
    const { password: _, ...userWithoutPassword } = user;
    
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