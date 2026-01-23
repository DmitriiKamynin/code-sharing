import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import RoomSelector from './components/RoomSelector';
import CodeEditor from './components/CodeEditor';
import './App.css';
import { Room, Participant, RoomJoinedData } from './types';

const socket: Socket = io('http://localhost:3001');

function App() {
  const [currentRoom, setCurrentRoom] = useState<Room | null>(null);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [participants, setParticipants] = useState<Participant[]>([]);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-joined', (data: RoomJoinedData) => {
      setCurrentRoom(data.room);
      setParticipants(data.participants || []);
    });

    socket.on('participant-joined', (participant: Participant) => {
      setParticipants(prev => [...prev, participant]);
    });

    socket.on('participant-left', (participantId: string) => {
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    });

    return () => {
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-joined');
      socket.off('participant-joined');
      socket.off('participant-left');
    };
  }, []);

  const joinRoom = (roomId: string, username: string): void => {
    socket.emit('join-room', { roomId, username });
  };

  const leaveRoom = (): void => {
    if (currentRoom) {
      socket.emit('leave-room', { roomId: currentRoom.id });
      setCurrentRoom(null);
      setParticipants([]);
    }
  };

  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <RoomSelector 
                onJoinRoom={joinRoom}
                isConnected={isConnected}
              />
            } 
          />
          <Route 
            path="/room/:roomId" 
            element={
              currentRoom ? (
                <CodeEditor 
                  room={currentRoom}
                  participants={participants}
                  socket={socket}
                  onLeaveRoom={leaveRoom}
                />
              ) : (
                <div>Загрузка...</div>
              )
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
