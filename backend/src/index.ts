import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import apiRouter from './routes/api';
import prisma from './services/db';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

app.set('trust proxy', 1);

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:41117',
  'http://localhost:41177',
  'http://localhost',
  'https://localhost', // Android WebView origin
  'capacitor://localhost',
  'http://172.16.2.42:5173',
  'http://172.16.2.42:5000',
  // Production
  'https://blueprint-backend.onrender.com',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
  ...(process.env.EXPERT_URL ? [process.env.EXPERT_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Blocked by CORS policy: Request origin not allowed.'));
    }
  },
  credentials: true
}));

app.use(helmet());
app.use(express.json());

app.use('/api', apiRouter);

app.get('/', (_req, res) => {
  res.json({ message: 'Welcome to the Blueprint Advisor API Server' });
});

app.get('/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.status(200).json({ status: 'ok', database: 'connected' });
  } catch (err) {
    res.status(500).json({ status: 'error', database: 'disconnected' });
  }
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PATCH', 'DELETE'],
    credentials: true
  }
});

io.on('connection', (socket) => {
  console.log(`Client connected: ${socket.id}`);
  
  socket.on('join_request', (requestId) => {
    socket.join(`request_${requestId}`);
    console.log(`Socket ${socket.id} joined request_${requestId}`);
  });

  socket.on('disconnect', () => {
    console.log(`Client disconnected: ${socket.id}`);
  });
});

export const broadcastRequestUpdate = (requestId: string, data: any) => {
  io.to(`request_${requestId}`).emit('request_updated', data);
};

const listenPort = typeof PORT === 'string' ? parseInt(PORT, 10) : PORT;
server.listen(listenPort, '0.0.0.0', () => {
  console.log(`[API Server] Running on http://0.0.0.0:${listenPort}`);
  console.log(`[Socket.io] Ready for connections`);
});
