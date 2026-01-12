import { config } from 'dotenv';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as argon2 from 'argon2';


config({ path: '.env' });
config({ path: '.env.local', override: true });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

const adapter = new PrismaPg(pool);

const prisma = new PrismaClient({
  adapter,
});

async function initDatabase() {
  try {
    console.log('🔄 Connecting to database...');

    // Check if root user already exists
    const rootEmail = process.env.ROOT_EMAIL;
    const rootPassword = process.env.ROOT_PASSWORD;
    const rootName = process.env.ROOT_NAME;

    if (!rootEmail || !rootPassword) {
      console.log('⚠️  ROOT_EMAIL and ROOT_PASSWORD not set in .env or .env.local');
      console.log('ℹ️  Skipping root user creation');
      await prisma.$disconnect();
      return;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: rootEmail },
    });

    if (existingUser) {
      console.log('ℹ️  Root user already exists');
    } else {
      console.log('🔄 Creating root user...');
      const hashedPassword = await argon2.hash(rootPassword);

      await prisma.user.create({
        data: {
          name: rootName || 'Administrator',
          email: rootEmail,
          password: hashedPassword,
          role: 'admin',
          emailVerified: new Date(),
        },
      });

      console.log('✅ Root user created successfully');
      console.log(`   Email: ${rootEmail}`);
    }

    await prisma.$disconnect();
    console.log('✅ Database initialization complete');
  } catch (error) {
    console.error('❌ Error initializing database:', error);
    await prisma.$disconnect();
    process.exit(1);
  }
}

initDatabase();
