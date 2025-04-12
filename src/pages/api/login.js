import prisma from '../../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export const prerender = false;

export async function POST({ request }) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login request received for:', email);
    
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
    
    // Find user
    const user = await prisma.user.findUnique({ where: { email } });
    
    if (!user) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid credentials' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    
    if (!isMatch) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Invalid credentials' 
      }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Create JWT token with string ID to match Prisma's UUID format
    const token = jwt.sign(
      { 
        id: user.id,  // Ensure this is a string
        email: user.email 
      },
      process.env.JWT_SECRET || 'your-default-secret-key-change-this',
      { expiresIn: '7d' }
    );
    
    console.log('Created token for user ID:', user.id);
    
    console.log('User logged in successfully:', user.id);
    
    // Return user data without password and token
    const { password: _, ...userWithoutPassword } = user;
    
    return new Response(JSON.stringify({ 
      success: true,
      user: userWithoutPassword,
      token
    }), { 
      status: 200, 
      headers: { 'Content-Type': 'application/json' } 
    });
    
  } catch (error) {
    console.error('Login error:', error);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    });
  }
}