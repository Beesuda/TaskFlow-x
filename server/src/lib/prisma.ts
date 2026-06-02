import { PrismaClient } from '@prisma/client';

// Single shared PrismaClient instance for the whole server process.
export const prisma = new PrismaClient();
