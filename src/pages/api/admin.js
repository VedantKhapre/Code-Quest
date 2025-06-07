import prisma from '../../lib/db.js';
import jwt from 'jsonwebtoken';

export async function GET({ request }) {
  // 1. Get token from header or query
  const authHeader = request.headers.get('authorization');
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.slice(7);
  } else {
    const url = new URL(request.url);
    token = url.searchParams.get('token');
  }

  if (!token) {
    return new Response(JSON.stringify({ error: 'No token provided' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 2. Verify JWT and check admin role
  let id;
  try {
    ({ id } = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-change-this'));
  } catch (err) {
    return new Response(JSON.stringify({ error: 'Invalid token' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  // 3. Check user in DB and role
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 403 });
  }

  // 4. ...your admin logic here (e.g., return users)...
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, progress: true }
  });

  return new Response(JSON.stringify({ users }), {
    status: 200,
    headers: { 'Content-Type': 'application/json' }
  });
}