import React, { useEffect, useState, useMemo } from 'react';
import Header from './components/Header';
import HomeView from './views/HomeView';
import JoinModal from './views/JoinModal';
import LobbyView from './views/LobbyView';
import SubmissionView from './views/SubmissionView';
import PresentationView from './views/PresentationView';
import VotingView from './views/VotingView';
import ActionItemsView from './views/ActionItemsView';
import SummaryView from './views/SummaryView';
import ParticipantsModal from './components/ParticipantsModal';
import { getSocket } from './utils/socket';
import { Loader2, AlertCircle, Tv } from 'lucide-react';

export default function App() {
  const [roomId, setRoomId] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room') || '';
  });

  const isPresentationView = useMemo(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('view') === 'presentation';
  }, []);

  const [roomState, setRoomState] = useState(null);
  const [participantId, setParticipantId] = useState('');
  const [displayName, setDisplayName] = useState(() => {
    const saved = localStorage.getItem('retro_display_name');
    if (saved) return saved;
    const params = new URLSearchParams(window.location.search);
    if (params.get('view') === 'presentation') return 'Layar Presentasi';
    return '';
  });

  const [isHost, setIsHost] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [isParticipantsModalOpen, setIsParticipantsModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Host token stored in localStorage for this specific room
  const hostToken = useMemo(() => {
    if (!roomId) return null;
    return localStorage.getItem(`retro_host_token_${roomId}`);
  }, [roomId]);

  // Connect socket when roomId and displayName are available
  useEffect(() => {
    if (!roomId) return;

    if (!displayName && !isPresentationView) {
      setShowJoinModal(true);
      return;
    }

    const currentName = displayName || 'Layar Presentasi';
    const socket = getSocket();
    setIsConnecting(true);
    setErrorMessage('');

    const savedParticipantId = localStorage.getItem(`retro_participant_id_${roomId}`) || '';

    socket.emit(
      'join_room',
      {
        roomId,
        participantId: savedParticipantId,
        displayName: currentName,
        hostToken,
      },
      (res) => {
        setIsConnecting(false);
        if (res && res.success) {
          setParticipantId(res.participantId);
          setIsHost(res.isHost);
          localStorage.setItem(`retro_participant_id_${roomId}`, res.participantId);
        } else {
          setErrorMessage(res?.error || 'Gagal terhubung ke ruangan.');
        }
      }
    );

    const handleRoomStateUpdate = (state) => {
      setRoomState(state);
      if (participantId && state.participants && state.participants[participantId]) {
        setIsHost(state.participants[participantId].isHost);
      }
    };

    socket.on('room_state_update', handleRoomStateUpdate);

    return () => {
      socket.off('room_state_update', handleRoomStateUpdate);
    };
  }, [roomId, displayName, hostToken, isPresentationView]);

  // Handle Create Room (FR 1.1)
  const handleCreateRoom = async ({ name, sessionDurationMinutes, hostName }) => {
    setIsCreating(true);
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, sessionDurationMinutes, hostName }),
      });
      const data = await res.json();

      localStorage.setItem(`retro_host_token_${data.roomId}`, data.hostToken);
      localStorage.setItem(`retro_participant_id_${data.roomId}`, data.hostParticipantId);
      localStorage.setItem('retro_display_name', hostName);

      setDisplayName(hostName);
      setParticipantId(data.hostParticipantId);
      setIsHost(true);
      setRoomId(data.roomId);

      const newUrl = `${window.location.pathname}?room=${data.roomId}`;
      window.history.pushState({ path: newUrl }, '', newUrl);
    } catch (err) {
      console.error(err);
      setErrorMessage('Terjadi kesalahan saat membuat ruangan.');
    } finally {
      setIsCreating(false);
    }
  };

  // Handle Join Room Display Name Submit (FR 1.3)
  const handleJoinModalSubmit = (enteredName) => {
    localStorage.setItem('retro_display_name', enteredName);
    setDisplayName(enteredName);
    setShowJoinModal(false);
  };

  // Socket Actions
  const handleStartSession = () => {
    getSocket().emit('start_session', { roomId, hostToken });
  };

  const handleAddTime = (seconds = 60) => {
    getSocket().emit('add_time', { roomId, hostToken, seconds });
  };

  const handleEndEarly = () => {
    getSocket().emit('end_session_early', { roomId, hostToken });
  };

  const handleNextStage = () => {
    getSocket().emit('next_stage', { roomId, hostToken });
  };

  const handleAddCard = ({ type, content }) => {
    getSocket().emit('add_card', { roomId, participantId, type, content });
  };

  const handleDeleteCard = (cardId) => {
    getSocket().emit('delete_card', { roomId, cardId, participantId, hostToken });
  };

  const handleVote = (cardId, value) => {
    getSocket().emit('vote_card', { roomId, cardId, participantId, value });
  };

  const handleCreateActionItem = ({ text, relatedCardId, assignee }) => {
    getSocket().emit('create_action_item', { roomId, hostToken, text, relatedCardId, assignee });
  };

  const handleToggleActionItem = (actionItemId) => {
    getSocket().emit('toggle_action_item', { roomId, actionItemId });
  };

  const handleDeleteActionItem = (actionItemId) => {
    getSocket().emit('delete_action_item', { roomId, hostToken, actionItemId });
  };

  const handleCloseRoom = () => {
    getSocket().emit('close_room', { roomId, hostToken });
  };

  // Render: If no roomId in URL -> show Home / Create Room View
  if (!roomId) {
    return <HomeView onCreateRoom={handleCreateRoom} isCreating={isCreating} />;
  }

  // Render: If prompt for Display Name is needed
  if (showJoinModal && !isPresentationView) {
    return (
      <JoinModal
        roomName={roomState?.name}
        onJoin={handleJoinModalSubmit}
      />
    );
  }

  // Render: Loading state
  if (isConnecting || !roomState) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {errorMessage ? (
          <div className="bg-rose-950/40 border border-rose-500/40 rounded-2xl p-6 text-center max-w-sm">
            <AlertCircle className="w-10 h-10 text-rose-400 mx-auto mb-2" />
            <h3 className="text-base font-bold text-white mb-1">Gagal Masuk</h3>
            <p className="text-xs text-rose-200 mb-4">{errorMessage}</p>
            <a
              href="/"
              className="inline-block px-4 py-2 rounded-xl bg-slate-800 text-xs font-semibold text-white hover:bg-slate-700"
            >
              Kembali ke Beranda
            </a>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 text-slate-400">
            <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
            <span className="text-xs font-medium">Menghubungkan ke Ruangan Retrospektif...</span>
          </div>
        )}
      </div>
    );
  }

  const currentParticipant = roomState.participants?.[participantId] || {
    id: participantId,
    name: displayName,
    isHost,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Real-time Header */}
      <Header
        roomState={roomState}
        isHost={isHost}
        participant={currentParticipant}
        onOpenParticipantsModal={() => setIsParticipantsModalOpen(true)}
        isPresentationView={isPresentationView}
      />

      {/* Main Stage View */}
      <main className="flex-1">
        {roomState.stage === 'lobby' && (
          <LobbyView
            roomState={roomState}
            isHost={isHost}
            participant={currentParticipant}
            onStartSession={handleStartSession}
          />
        )}

        {(roomState.stage === 'went_well_submission' || roomState.stage === 'went_bad_submission') && (
          isPresentationView ? (
            <PresentationView
              roomState={roomState}
              isHost={isHost}
              onAddTime={handleAddTime}
              onEndEarly={handleEndEarly}
              isStandalone={true}
            />
          ) : (
            <SubmissionView
              roomState={roomState}
              isHost={isHost}
              participant={currentParticipant}
              onAddCard={handleAddCard}
              onDeleteCard={handleDeleteCard}
              onAddTime={handleAddTime}
              onEndEarly={handleEndEarly}
            />
          )
        )}

        {(roomState.stage === 'went_well_voting' || roomState.stage === 'went_bad_voting') && (
          <VotingView
            roomState={roomState}
            isHost={isHost}
            participant={currentParticipant}
            onVote={handleVote}
            onNextStage={handleNextStage}
          />
        )}

        {roomState.stage === 'action_items' && (
          <ActionItemsView
            roomState={roomState}
            isHost={isHost}
            participant={currentParticipant}
            onCreateActionItem={handleCreateActionItem}
            onToggleActionItem={handleToggleActionItem}
            onDeleteActionItem={handleDeleteActionItem}
            onCloseRoom={handleCloseRoom}
          />
        )}

        {roomState.stage === 'summary' && (
          <SummaryView roomState={roomState} />
        )}
      </main>

      {/* Participants Modal */}
      <ParticipantsModal
        isOpen={isParticipantsModalOpen}
        onClose={() => setIsParticipantsModalOpen(false)}
        participants={roomState.participants}
        submissionTracker={roomState.submissionTracker}
        currentStage={roomState.stage}
      />
    </div>
  );
}
