import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import io from 'socket.io-client';
import WelcomeScreen from './components/WelcomeScreen';
import RoomSelector from './components/RoomSelector';
import CodeEditor from './components/CodeEditor';
import './App.css';

const socket = io('http://localhost:3001');

function App() {
  const [currentRoom, setCurrentRoom] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [participants, setParticipants] = useState([]);

  useEffect(() => {
    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    socket.on('room-joined', (data) => {
      setCurrentRoom(data.room);
      setParticipants(data.participants || []);
    });

    socket.on('participant-joined', (participant) => {
      setParticipants(prev => [...prev, participant]);
    });

    socket.on('participant-left', (participantId) => {
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

  const joinRoom = (roomId, username) => {
    socket.emit('join-room', { roomId, username });
  };

  const leaveRoom = () => {
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
          <Route path="/" element={<WelcomeScreen />} />
          <Route 
            path="/rooms" 
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
        </Routes>
      </div>
    </Router>
  );
}

export default App;

