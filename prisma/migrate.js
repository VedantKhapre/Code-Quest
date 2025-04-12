import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database initialization...');
  
  try {
    // Check if database exists
    await prisma.$connect();
    console.log('Connected to database successfully');
    
    // Create test user if it doesn't exist
    const testEmail = 'test@example.com';
    const existingUser = await prisma.user.findUnique({
      where: { email: testEmail }
    });
    
    if (!existingUser) {
      console.log('Creating test user...');
      const hashedPassword = await bcrypt.hash('password123', 10);
      
      await prisma.user.create({
        data: {
          name: 'Test User',
          email: testEmail,
          password: hashedPassword
        }
      });
      console.log('Test user created successfully');
    } else {
      console.log('Test user already exists');
    }
    
    console.log('Database initialization completed successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();