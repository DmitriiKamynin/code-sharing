import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import io, { Socket } from 'socket.io-client';
import RoomSelector from './components/RoomSelector';
import CodeEditor from './components/CodeEditor';
import './App.css';
import { Participant, RoomJoinedData } from './types';


function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route 
            path="/" 
            element={
              <RoomSelector />
            } 
          />
          <Route 
            path="/room/:roomId" 
            element={
              <CodeEditor />
            } 
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
