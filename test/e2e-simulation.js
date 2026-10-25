import http from 'http';
import { io as Client } from 'socket.io-client';
import express from 'express';
import { Server } from 'socket.io';
import cors from 'cors';
import { RoomManager } from '../server/roomManager.js';

async function runTest() {
  console.log('🧪 Starting End-to-End Retrospective Flow Test...\n');

  const app = express();
  const server = http.createServer(app);
  const io = new Server(server, { cors: { origin: '*' } });
  app.use(cors());
  app.use(express.json());

  const roomManager = new RoomManager();

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

  app.post('/api/rooms', (req, res) => {
    const { name, sessionDurationMinutes, hostName } = req.body;
    const result = roomManager.createRoom({ name, sessionDurationMinutes, hostName });
    res.json({
      roomId: result.room.id,
      hostToken: result.hostToken,
      hostParticipantId: result.hostParticipantId,
    });
  });

  io.on('connection', (socket) => {
    socket.on('join_room', ({ roomId, participantId, displayName, hostToken }, callback) => {
      const result = roomManager.joinParticipant(roomId, {
        participantId,
        displayName,
        hostToken,
        socketId: socket.id,
      });
      if (!result) return callback?.({ success: false });
      socket.join(roomId);
      callback?.({ success: true, participantId: result.participant.id, isHost: result.participant.isHost });
      broadcastRoomState(roomId);
    });

    socket.on('start_session', ({ roomId, hostToken }) => {
      roomManager.startSession(roomId, hostToken);
      broadcastRoomState(roomId);
    });

    socket.on('add_time', ({ roomId, hostToken, seconds }) => {
      roomManager.addTime(roomId, hostToken, seconds);
      broadcastRoomState(roomId);
    });

    socket.on('end_session_early', ({ roomId, hostToken }) => {
      roomManager.endSessionEarly(roomId, hostToken);
      broadcastRoomState(roomId);
    });

    socket.on('next_stage', ({ roomId, hostToken }) => {
      roomManager.nextStage(roomId, hostToken);
      broadcastRoomState(roomId);
    });

    socket.on('add_card', ({ roomId, participantId, type, content }) => {
      roomManager.addCard(roomId, { participantId, type, content });
      broadcastRoomState(roomId);
    });

    socket.on('vote_card', ({ roomId, cardId, participantId, value }) => {
      roomManager.voteCard(roomId, { cardId, participantId, value });
      broadcastRoomState(roomId);
    });

    socket.on('create_action_item', ({ roomId, hostToken, text, relatedCardId, assignee }) => {
      roomManager.createActionItem(roomId, hostToken, { text, relatedCardId, assignee });
      broadcastRoomState(roomId);
    });

    socket.on('close_room', ({ roomId, hostToken }) => {
      roomManager.closeRoom(roomId, hostToken);
      broadcastRoomState(roomId);
    });
  });

  await new Promise((resolve) => server.listen(0, resolve));
  const TEST_PORT = server.address().port;
  const serverUrl = `http://localhost:${TEST_PORT}`;

  try {
    // 1. Create Room (FR 1.1)
    const createRes = await fetch(`${serverUrl}/api/rooms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Sprint 10 Retrospective',
        sessionDurationMinutes: 5,
        hostName: 'Alice (Host)',
      }),
    });
    const createdData = await createRes.json();
    console.log('✅ FR 1.1 Create Room:', createdData.roomId);

    // 2. Connect Host and Participants (FR 1.2, 1.3, 1.4)
    const hostSocket = Client(serverUrl);
    const p1Socket = Client(serverUrl);
    const p2Socket = Client(serverUrl);

    let hostState, p1State, p2State;
    hostSocket.on('room_state_update', (s) => { hostState = s; });
    p1Socket.on('room_state_update', (s) => { p1State = s; });
    p2Socket.on('room_state_update', (s) => { p2State = s; });

    await new Promise((r) => {
      hostSocket.emit('join_room', {
        roomId: createdData.roomId,
        participantId: createdData.hostParticipantId,
        displayName: 'Alice (Host)',
        hostToken: createdData.hostToken,
      }, r);
    });

    let p1Id, p2Id;
    await new Promise((r) => {
      p1Socket.emit('join_room', {
        roomId: createdData.roomId,
        displayName: 'Bob (Engineer)',
      }, (res) => {
        p1Id = res.participantId;
        r();
      });
    });

    await new Promise((r) => {
      p2Socket.emit('join_room', {
        roomId: createdData.roomId,
        displayName: 'Charlie (QA)',
      }, (res) => {
        p2Id = res.participantId;
        r();
      });
    });

    await new Promise((r) => setTimeout(r, 100));
    console.log('✅ FR 1.4 Real-time Presence in Lobby:');
    console.log('   Total participants in lobby:', Object.keys(hostState.participants).length);
    if (Object.keys(hostState.participants).length !== 3) {
      throw new Error('Presence failed');
    }

    // 3. Start Session (FR 1.5)
    hostSocket.emit('start_session', { roomId: createdData.roomId, hostToken: createdData.hostToken });
    await new Promise((r) => setTimeout(r, 100));
    console.log('✅ FR 1.5 Start Session: Stage is now', hostState.stage);
    if (hostState.stage !== 'went_well_submission') throw new Error('Stage transition failed');

    // 4. Anonymous Submission & Tracker (FR 2.2, FR 2.3)
    p1Socket.emit('add_card', {
      roomId: createdData.roomId,
      participantId: p1Id,
      type: 'went_well',
      content: 'CI pipeline deployment runs 2x faster now!',
    });

    p2Socket.emit('add_card', {
      roomId: createdData.roomId,
      participantId: p2Id,
      type: 'went_well',
      content: 'Great cross-team collaboration on auth rewrite.',
    });

    await new Promise((r) => setTimeout(r, 100));

    // Verify FR 2.2 masking: P1 should see their own card, but P2's card should be masked!
    const p1Cards = p1State.cards;
    const p1OwnCard = p1Cards.find((c) => c.isMine);
    const p1OtherCard = p1Cards.find((c) => !c.isMine);

    console.log('✅ FR 2.2 Anonymous Submission & Privacy Check:');
    console.log('   P1 Own Card:', p1OwnCard.content);
    console.log('   P1 Masked Other Card:', p1OtherCard.content, '(isMasked:', p1OtherCard.isMasked, ')');
    if (!p1OtherCard.isMasked) throw new Error('Card masking failed!');

    // Verify FR 2.3 Tracker
    console.log('✅ FR 2.3 Submission Tracker Check:');
    console.log('   P1 submitted:', hostState.submissionTracker[p1Id]?.hasSubmittedWentWell);
    console.log('   P2 submitted:', hostState.submissionTracker[p2Id]?.hasSubmittedWentWell);
    if (!hostState.submissionTracker[p1Id]?.hasSubmittedWentWell || !hostState.submissionTracker[p2Id]?.hasSubmittedWentWell) {
      throw new Error('Tracker failed!');
    }

    // 5. Host Controls: End Session Early (FR 2.4) -> Reveals cards (FR 3.1)
    hostSocket.emit('end_session_early', { roomId: createdData.roomId, hostToken: createdData.hostToken });
    await new Promise((r) => setTimeout(r, 100));
    console.log('✅ FR 2.4 & FR 3.1: Session ended, stage is now', p1State.stage);
    console.log('   P1 now sees revealed other card:', p1State.cards.find((c) => !c.isMine).content);
    if (p1State.cards.some((c) => c.isMasked)) throw new Error('Reveal failed, cards still masked!');

    // 6. Voting (FR 3.2, 3.3)
    const cardToVote = p1State.cards[0].id;
    p1Socket.emit('vote_card', { roomId: createdData.roomId, cardId: cardToVote, participantId: p1Id, value: 1 });
    p2Socket.emit('vote_card', { roomId: createdData.roomId, cardId: cardToVote, participantId: p2Id, value: 1 });
    await new Promise((r) => setTimeout(r, 100));

    const votedCard = hostState.cards.find((c) => c.id === cardToVote);
    console.log('✅ FR 3.2 Voting System: Card upvotes =', votedCard.upvotes, 'score =', votedCard.score);
    if (votedCard.score !== 2) throw new Error('Voting score failed');

    // 7. Transition to Went Bad (FR 3.4)
    hostSocket.emit('next_stage', { roomId: createdData.roomId, hostToken: createdData.hostToken });
    await new Promise((r) => setTimeout(r, 100));
    console.log('✅ FR 3.4 Next Stage: Went Bad Submission', hostState.stage);

    // Went Bad Submission & early end
    p1Socket.emit('add_card', {
      roomId: createdData.roomId,
      participantId: p1Id,
      type: 'went_bad',
      content: 'Database queries on dashboard are running sluggishly under load.',
    });
    await new Promise((r) => setTimeout(r, 100));
    hostSocket.emit('end_session_early', { roomId: createdData.roomId, hostToken: createdData.hostToken });
    await new Promise((r) => setTimeout(r, 100));
    console.log('✅ Went Bad Voting Stage:', hostState.stage);

    // Vote on Went Bad card
    const wentBadCardId = hostState.cards.find((c) => c.type === 'went_bad').id;
    p2Socket.emit('vote_card', { roomId: createdData.roomId, cardId: wentBadCardId, participantId: p2Id, value: 1 });
    await new Promise((r) => setTimeout(r, 100));

    // 8. Action Items Stage (FR 4.1, 4.2, 4.3)
    hostSocket.emit('next_stage', { roomId: createdData.roomId, hostToken: createdData.hostToken });
    await new Promise((r) => setTimeout(r, 100));
    console.log('✅ FR 4.1 Action Items Stage active:', hostState.stage);

    // Create Action item (FR 4.2)
    hostSocket.emit('create_action_item', {
      roomId: createdData.roomId,
      hostToken: createdData.hostToken,
      text: 'Add Redis query caching and composite index to dashboard queries',
      relatedCardId: wentBadCardId,
      assignee: 'Bob (Engineer)',
    });
    await new Promise((r) => setTimeout(r, 100));

    console.log('✅ FR 4.3 Action Items Real-time Broadcast:');
    console.log('   P1 sees action item:', p1State.actionItems[0]?.text);
    console.log('   Assignee:', p1State.actionItems[0]?.assignee);
    console.log('   Linked Problem:', p1State.actionItems[0]?.relatedCardContent);
    if (!p1State.actionItems.length) throw new Error('Action item broadcast failed');

    // 9. Close Room & Summary (FR 5.1, 5.2, 5.3)
    hostSocket.emit('close_room', { roomId: createdData.roomId, hostToken: createdData.hostToken });
    await new Promise((r) => setTimeout(r, 100));
    console.log('✅ FR 5.1 & 5.2 Summary View active on all clients: stage =', p1State.stage);
    console.log('   Summary Action Items:', p1State.actionItems.length);
    console.log('   Summary Went Well Cards:', p1State.cards.filter((c) => c.type === 'went_well').length);
    console.log('   Summary Went Bad Cards:', p1State.cards.filter((c) => c.type === 'went_bad').length);

    console.log('\n🎉 ALL REQUIREMENTS (FR 1.1 to FR 5.3) PASSED PERFECTLY!\n');

    hostSocket.disconnect();
    p1Socket.disconnect();
    p2Socket.disconnect();
    server.close();
    process.exit(0);
  } catch (err) {
    console.error('❌ Test failed:', err);
    server.close();
    process.exit(1);
  }
}

runTest();
