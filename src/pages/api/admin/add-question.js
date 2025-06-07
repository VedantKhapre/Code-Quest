import fs from 'fs/promises';
import path from 'path';
import jwt from 'jsonwebtoken';

export async function POST({ request }) {
  try {
    const body = await request.json();
    const {
      question_number,
      title,
      description,
      answer,
      difficulty,
      hints,
      name,
      token
    } = body;

    // Basic validation
    if (!title || !description || !answer || !name || !token) {
      return new Response(JSON.stringify({ error: 'Missing required fields.' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Decode token to get admin email
    let adminEmail = "unknown";
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-default-secret-key-change-this');
      adminEmail = decoded.email || "unknown";
    } catch {
      return new Response(JSON.stringify({ error: 'Invalid token.' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Load existing questions
    const questionsPath = path.resolve('src/Questions/question.json');
    const fileData = await fs.readFile(questionsPath, 'utf-8');
    const questions = JSON.parse(fileData);

    // Find the next id
    const lastId = questions.length > 0 ? Math.max(...questions.map(q => q.id || 0)) : 0;
    const newId = lastId + 1;

    // Parse hints
    let hintsArray = [];
    if (Array.isArray(hints)) {
      hintsArray = hints;
    } else if (typeof hints === 'string') {
      try {
        hintsArray = JSON.parse(hints);
        if (!Array.isArray(hintsArray)) hintsArray = [hints];
      } catch {
        hintsArray = hints.split(',').map(h => h.trim()).filter(Boolean);
      }
    }

    // Create new question object with admin email
    const newQuestion = {
      question_number,
      title,
      description,
      answer,
      difficulty,
      hints: hintsArray,
      name,
      id: newId,
      admin: adminEmail // Save the admin's email here
    };

    // Add to questions array
    questions.push(newQuestion);

    // Save back to file
    await fs.writeFile(questionsPath, JSON.stringify(questions, null, 2), 'utf-8');

    return new Response(JSON.stringify({ success: true, question: newQuestion }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Add question error:', error);
    return new Response(JSON.stringify({ error: 'Failed to add question.' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}