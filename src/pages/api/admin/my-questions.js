
// import jwt from 'jsonwebtoken';

// export async function GET({ request }) {
//   const token = request.headers.get('authorization')?.replace('Bearer ', '') ||
//     new URL(request.url).searchParams.get('token');
//   if (!token) {
//     return new Response(JSON.stringify({ error: 'No token provided' }), { status: 401 });
//   }
//   let decoded;
//   try {
//     decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-change-this');
//   } catch {
//     return new Response(JSON.stringify({ error: 'Invalid token' }), { status: 401 });
//   }
//   // Find questions by admin's name or id (adjust as per your schema)
//   const questions = await prisma.question.findMany({
//     where: { name: decoded.name }, // or use authorId: decoded.id if you store it
//     orderBy: { question_number: 'asc' }
//   });
//   return new Response(JSON.stringify({ questions }), { status: 200 });
// }