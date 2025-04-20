import 'reflect-metadata';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { errorHandler } from './middlewares/error.middleware';
import { clerkMiddleware } from '@clerk/express'
import { initializeDatabase } from './database/config/database';
import { apiRoutes } from './routes';

dotenv.config();

const app = express();
const PORT = process.env.APP_PORT

app.use(clerkMiddleware({
  secretKey: process.env.CLERK_SECRET_KEY,
  publishableKey: process.env.CLERK_PUBLISHABLE_KEY
}));

app.use(cors());
app.use(express.json());

// Usando as rotas diretamente sem prefixo
app.use(apiRoutes);

app.use(errorHandler);

initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
  });
}).catch(error => {
  console.error('Failed to initialize database:', error);
  process.exit(1);
});
