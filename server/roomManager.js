import { nanoid } from 'nanoid';

export class RoomManager {
  constructor() {
    this.rooms = new Map();
  }

  createRoom({ name, sessionDurationMinutes = 3, hostName }) {
    const roomId = nanoid(7).toLowerCase();
    const hostToken = nanoid(24);
    const hostParticipantId = nanoid(10);

    const room = {
      id: roomId,
      name: name.trim() || 'Sprint Retrospective',
      sessionDurationMinutes: Math.max(1, parseInt(sessionDurationMinutes, 10) || 3),
      hostToken,
      hostParticipantId,
      createdAt: Date.now(),
      stage: 'lobby', // 'lobby' | 'went_well_submission' | 'went_well_voting' | 'went_bad_submission' | 'went_bad_voting' | 'action_items' | 'summary'
      stageEndsAt: null,
      participants: {
        [hostParticipantId]: {
          id: hostParticipantId,
          name: hostName.trim() || 'Host',
          isHost: true,
          online: false,
          joinedAt: Date.now(),
          socketId: null,
        },
      },
      cards: [],
      actionItems: [],
    };

    this.rooms.set(roomId, room);
    return { room, hostToken, hostParticipantId };
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  joinParticipant(roomId, { participantId, displayName, hostToken, socketId }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    let pid = participantId;
    const isHostAttempt = Boolean(hostToken && hostToken === room.hostToken);

    // If host is rejoining or recognized
    if (isHostAttempt) {
      pid = room.hostParticipantId;
    } else if (!pid || !room.participants[pid]) {
      pid = nanoid(10);
    }

    const isHost = pid === room.hostParticipantId || isHostAttempt;

    if (!room.participants[pid]) {
      room.participants[pid] = {
        id: pid,
        name: (displayName || 'Team Member').trim(),
        isHost,
        online: true,
        joinedAt: Date.now(),
        socketId,
      };
    } else {
      room.participants[pid].online = true;
      room.participants[pid].socketId = socketId;
      if (displayName) {
        room.participants[pid].name = displayName.trim();
      }
      if (isHost) {
        room.participants[pid].isHost = true;
      }
    }

    return { room, participant: room.participants[pid] };
  }

  handleDisconnect(socketId) {
    for (const room of this.rooms.values()) {
      for (const participant of Object.values(room.participants)) {
        if (participant.socketId === socketId) {
          participant.online = false;
          participant.socketId = null;
          return { roomId: room.id, participant };
        }
      }
    }
    return null;
  }

  startSession(roomId, hostToken) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostToken !== hostToken) return null;

    room.stage = 'went_well_submission';
    room.stageEndsAt = Date.now() + room.sessionDurationMinutes * 60 * 1000;
    return room;
  }

  addTime(roomId, hostToken, seconds = 60) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostToken !== hostToken) return null;

    if (room.stage === 'went_well_submission' || room.stage === 'went_bad_submission') {
      const currentEnd = Math.max(Date.now(), room.stageEndsAt || Date.now());
      room.stageEndsAt = currentEnd + seconds * 1000;
    }
    return room;
  }

  endSessionEarly(roomId, hostToken) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostToken !== hostToken) return null;

    if (room.stage === 'went_well_submission') {
      room.stage = 'went_well_voting';
      room.stageEndsAt = null;
    } else if (room.stage === 'went_bad_submission') {
      room.stage = 'went_bad_voting';
      room.stageEndsAt = null;
    }
    return room;
  }

  nextStage(roomId, hostToken) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostToken !== hostToken) return null;

    switch (room.stage) {
      case 'lobby':
        room.stage = 'went_well_submission';
        room.stageEndsAt = Date.now() + room.sessionDurationMinutes * 60 * 1000;
        break;
      case 'went_well_submission':
        room.stage = 'went_well_voting';
        room.stageEndsAt = null;
        break;
      case 'went_well_voting':
        room.stage = 'went_bad_submission';
        room.stageEndsAt = Date.now() + room.sessionDurationMinutes * 60 * 1000;
        break;
      case 'went_bad_submission':
        room.stage = 'went_bad_voting';
        room.stageEndsAt = null;
        break;
      case 'went_bad_voting':
        room.stage = 'action_items';
        room.stageEndsAt = null;
        break;
      case 'action_items':
        room.stage = 'summary';
        room.stageEndsAt = null;
        break;
      default:
        break;
    }

    return room;
  }

  addCard(roomId, { participantId, type, content }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check valid stage for submission
    if (type === 'went_well' && room.stage !== 'went_well_submission') return null;
    if (type === 'went_bad' && room.stage !== 'went_bad_submission') return null;

    const trimmed = (content || '').trim();
    if (!trimmed) return null;

    const card = {
      id: nanoid(8),
      type, // 'went_well' | 'went_bad'
      content: trimmed,
      authorId: participantId, // server tracks, never exposed publicly
      createdAt: Date.now(),
      votes: {}, // participantId -> 1 or -1
      upvotes: 0,
      downvotes: 0,
      score: 0,
    };

    room.cards.push(card);
    return { room, card };
  }

  deleteCard(roomId, { cardId, participantId, hostToken }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const index = room.cards.findIndex(c => c.id === cardId);
    if (index === -1) return null;

    const card = room.cards[index];
    // Allowed if author or host
    const isHost = hostToken === room.hostToken;
    const isAuthor = card.authorId === participantId;

    if (isAuthor || isHost) {
      room.cards.splice(index, 1);
      return room;
    }
    return null;
  }

  voteCard(roomId, { cardId, participantId, value }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Voting allowed only in voting or action_items stages
    if (room.stage !== 'went_well_voting' && room.stage !== 'went_bad_voting' && room.stage !== 'action_items') {
      return null;
    }

    const card = room.cards.find(c => c.id === cardId);
    if (!card) return null;

    const currentVote = card.votes[participantId] || 0;
    // Toggle logic: if user clicked the same vote again, remove it
    if (currentVote === value) {
      delete card.votes[participantId];
    } else {
      card.votes[participantId] = value; // 1 or -1
    }

    // Recalculate tallies
    let up = 0;
    let down = 0;
    for (const v of Object.values(card.votes)) {
      if (v > 0) up++;
      else if (v < 0) down++;
    }
    card.upvotes = up;
    card.downvotes = down;
    card.score = up - down;

    return room;
  }

  createActionItem(roomId, hostToken, { text, relatedCardId, assignee }) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostToken !== hostToken) return null;

    const trimmed = (text || '').trim();
    if (!trimmed) return null;

    let relatedCardContent = '';
    if (relatedCardId) {
      const rc = room.cards.find(c => c.id === relatedCardId);
      if (rc) relatedCardContent = rc.content;
    }

    const actionItem = {
      id: nanoid(8),
      text: trimmed,
      relatedCardId: relatedCardId || null,
      relatedCardContent,
      assignee: (assignee || '').trim() || 'Team',
      completed: false,
      createdAt: Date.now(),
    };

    room.actionItems.push(actionItem);
    return room;
  }

  toggleActionItem(roomId, { actionItemId }) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const item = room.actionItems.find(ai => ai.id === actionItemId);
    if (item) {
      item.completed = !item.completed;
      return room;
    }
    return null;
  }

  deleteActionItem(roomId, hostToken, actionItemId) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostToken !== hostToken) return null;

    room.actionItems = room.actionItems.filter(ai => ai.id !== actionItemId);
    return room;
  }

  closeRoom(roomId, hostToken) {
    const room = this.rooms.get(roomId);
    if (!room || room.hostToken !== hostToken) return null;

    room.stage = 'summary';
    room.stageEndsAt = null;
    return room;
  }

  // Format room data sent to a specific participant, masking cards according to PRD FR 2.2
  getClientState(roomId, participantId) {
    const room = this.rooms.get(roomId);
    if (!room) return null;

    // Check participant submission tracker stats
    const tracker = {};
    for (const p of Object.values(room.participants)) {
      const wentWellCount = room.cards.filter(c => c.type === 'went_well' && c.authorId === p.id).length;
      const wentBadCount = room.cards.filter(c => c.type === 'went_bad' && c.authorId === p.id).length;
      tracker[p.id] = {
        hasSubmittedWentWell: wentWellCount > 0,
        hasSubmittedWentBad: wentBadCount > 0,
      };
    }

    // Mask card contents during submission stages if not the author's card
    const isMaskingWentWell = room.stage === 'went_well_submission';
    const isMaskingWentBad = room.stage === 'went_bad_submission';

    const processedCards = room.cards.map(card => {
      const isMine = card.authorId === participantId;
      const userVote = card.votes[participantId] || 0;

      let isMasked = false;
      let displayContent = card.content;

      if (card.type === 'went_well' && isMaskingWentWell && !isMine) {
        isMasked = true;
        displayContent = '🔒 [Kartu Anonim - Disembunyikan hingga sesi berakhir]';
      } else if (card.type === 'went_bad' && isMaskingWentBad && !isMine) {
        isMasked = true;
        displayContent = '🔒 [Kartu Anonim - Disembunyikan hingga sesi berakhir]';
      }

      return {
        id: card.id,
        type: card.type,
        content: displayContent,
        isMasked,
        isMine,
        createdAt: card.createdAt,
        upvotes: card.upvotes,
        downvotes: card.downvotes,
        score: card.score,
        myVote: userVote,
      };
    });

    return {
      id: room.id,
      name: room.name,
      sessionDurationMinutes: room.sessionDurationMinutes,
      createdAt: room.createdAt,
      stage: room.stage,
      stageEndsAt: room.stageEndsAt,
      participants: room.participants,
      submissionTracker: tracker,
      cards: processedCards,
      actionItems: room.actionItems,
    };
  }
}
