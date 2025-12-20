import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './config/database';
import tournamentRoutes from './routes/tournaments';
import teamRoutes from './routes/teams';
import playerRoutes from './routes/players';
import matchRoutes from './routes/matches';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/players', playerRoutes);
app.use('/api/matches', matchRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ message: 'Server is running!' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    console.log('Database initialized successfully');
    
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();