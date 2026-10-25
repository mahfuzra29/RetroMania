import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from './roomManager.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isProd = process.env.NODE_ENV === 'production';
const PORT = process.env.PORT || 3000;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());

const roomManager = new RoomManager();

// Helper to broadcast personalized room state to all clients in a room
function broadcastRoomState(roomId) {
  const room = roomManager.getRoom(roomId);
  if (!room) return;

  for (const participant of Object.values(room.participants)) {
    if (participant.socketId) {
      const clientState = roomManager.getClientState(roomId, participant.id);
      io.to(participant.socketId).emit('room_state_update', clientState);
    }
  }
}

// Background timer ticker to automatically end submission stages when timer finishes
setInterval(() => {
  const now = Date.now();
  for (const room of roomManager.rooms.values()) {
    if (
      (room.stage === 'went_well_submission' || room.stage === 'went_bad_submission') &&
      room.stageEndsAt &&
      now >= room.stageEndsAt
    ) {
      if (room.stage === 'went_well_submission') {
        room.stage = 'went_well_voting';
      } else if (room.stage === 'went_bad_submission') {
        room.stage = 'went_bad_voting';
      }
      room.stageEndsAt = null;
      broadcastRoomState(room.id);
    }
  }
}, 1000);

// REST API for Room Creation
app.post('/api/rooms', (req, res) => {
  const { name, sessionDurationMinutes, hostName } = req.body;
  const result = roomManager.createRoom({ name, sessionDurationMinutes, hostName });
  res.json({
    roomId: result.room.id,
    hostToken: result.hostToken,
    hostParticipantId: result.hostParticipantId,
  });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = roomManager.getRoom(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    id: room.id,
    name: room.name,
    stage: room.stage,
    participantCount: Object.keys(room.participants).length,
  });
});

// Socket.io real-time connection
io.on('connection', (socket) => {
  let currentRoomId = null;
  let currentParticipantId = null;

  socket.on('join_room', ({ roomId, participantId, displayName, hostToken }, callback) => {
    currentRoomId = roomId;
    const result = roomManager.joinParticipant(roomId, {
      participantId,
      displayName,
      hostToken,
      socketId: socket.id,
    });

    if (!result) {
      if (callback) callback({ success: false, error: 'Ruangan tidak ditemukan' });
      return;
    }

    currentParticipantId = result.participant.id;
    socket.join(roomId);

    if (callback) {
      callback({
        success: true,
        participantId: result.participant.id,
        isHost: result.participant.isHost,
      });
    }

    broadcastRoomState(roomId);
  });

  socket.on('start_session', ({ roomId, hostToken }) => {
    const room = roomManager.startSession(roomId, hostToken);
    if (room) broadcastRoomState(roomId);
  });

  socket.on('add_time', ({ roomId, hostToken, seconds }) => {
    const room = roomManager.addTime(roomId, hostToken, seconds || 60);
    if (room) broadcastRoomState(roomId);
  });

  socket.on('end_session_early', ({ roomId, hostToken }) => {
    const room = roomManager.endSessionEarly(roomId, hostToken);
    if (room) broadcastRoomState(roomId);
  });

  socket.on('next_stage', ({ roomId, hostToken }) => {
    const room = roomManager.nextStage(roomId, hostToken);
    if (room) broadcastRoomState(roomId);
  });

  socket.on('add_card', ({ roomId, participantId, type, content }) => {
    const res = roomManager.addCard(roomId, { participantId, type, content });
    if (res) broadcastRoomState(roomId);
  });

  socket.on('delete_card', ({ roomId, cardId, participantId, hostToken }) => {
    const room = roomManager.deleteCard(roomId, { cardId, participantId, hostToken });
    if (room) broadcastRoomState(roomId);
  });

  socket.on('vote_card', ({ roomId, cardId, participantId, value }) => {
    const room = roomManager.voteCard(roomId, { cardId, participantId, value });
    if (room) broadcastRoomState(roomId);
  });

  socket.on('create_action_item', ({ roomId, hostToken, text, relatedCardId, assignee }) => {
    const room = roomManager.createActionItem(roomId, hostToken, { text, relatedCardId, assignee });
    if (room) broadcastRoomState(roomId);
  });

  socket.on('toggle_action_item', ({ roomId, actionItemId }) => {
    const room = roomManager.toggleActionItem(roomId, { actionItemId });
    if (room) broadcastRoomState(roomId);
  });

  socket.on('delete_action_item', ({ roomId, hostToken, actionItemId }) => {
    const room = roomManager.deleteActionItem(roomId, hostToken, actionItemId);
    if (room) broadcastRoomState(roomId);
  });

  socket.on('close_room', ({ roomId, hostToken }) => {
    const room = roomManager.closeRoom(roomId, hostToken);
    if (room) broadcastRoomState(roomId);
  });

  socket.on('disconnect', () => {
    const res = roomManager.handleDisconnect(socket.id);
    if (res) {
      broadcastRoomState(res.roomId);
    }
  });
});

// Setup Vite middleware or Static files
async function startServer() {
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, '../dist')));
    app.use((req, res) => {
      res.sendFile(path.resolve(__dirname, '../dist/index.html'));
    });
  }

  server.listen(PORT, () => {
    console.log(`🚀 RetroTools server is running at http://localhost:${PORT}`);
  });
}

startServer();
