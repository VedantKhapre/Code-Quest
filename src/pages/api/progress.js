import prisma from '../../lib/db.js';
import jwt from 'jsonwebtoken';

export const prerender = false;

// Helper function to get user ID from token
async function getUserIdFromToken(token) {
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-change-this');
    const userId = decoded.id;
    
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      return null;
    }
    
    return userId;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
}

export async function POST({ request }) {
  try {
    const { questionId, solved, code, language, token } = await request.json();
    
    // Validate token
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Get user ID from token
    const userId = await getUserIdFromToken(token);
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token or user not found' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Create or update progress
    const progress = await prisma.progress.upsert({
      where: {
        userId_questionId: {
          userId,
          questionId
        }
      },
      update: {
        solved,
        code,
        language,
        solvedAt: new Date()
      },
      create: {
        userId,
        questionId,
        solved,
        code,
        language
      }
    });
    
    return new Response(JSON.stringify({ success: true, progress }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error saving progress:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}

export async function GET({ request, url }) {
  try {
    const params = new URL(url).searchParams;
    const token = params.get('token');
    
    // Validate token
    if (!token) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Get user ID from token
    const userId = await getUserIdFromToken(token);
    
    if (!userId) {
      return new Response(JSON.stringify({ error: 'Invalid token or user not found' }), { 
        status: 401, 
        headers: { 'Content-Type': 'application/json' } 
      });
    }
    
    // Get user's progress
    const progress = await prisma.progress.findMany({
      where: {
        userId,
        solved: true
      },
      orderBy: {
        solvedAt: 'desc'
      }
    });
    
    return new Response(JSON.stringify({ progress }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error retrieving progress:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}