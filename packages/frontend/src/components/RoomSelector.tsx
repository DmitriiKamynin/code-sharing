import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api/rooms';

interface RoomSelectorProps {
  onJoinRoom: (roomId: string, username: string) => void;
  isConnected: boolean;
}

interface RoomResponse {
  id: string;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({ onJoinRoom, isConnected }) => {
  const [loading, setLoading] = useState<boolean>(false);
  const navigate = useNavigate();

  const createRoom = async (): Promise<void> => {
    setLoading(true);
    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      if (response.ok) {
        const newRoom: RoomResponse = await response.json();
        onJoinRoom(newRoom.id, 'guest');
        navigate(`/room/${newRoom.id}`);
      } else {
        alert('Ошибка при создании комнаты');
      }
    } catch (error) {
      console.error('Ошибка при создании комнаты:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
        <button
          style={{ 
            backgroundColor: 'green', 
            width: '200px', height: '50px',   
            fontFamily: 'sans-serif',
            fontSize: '16px',
            fontWeight: 'bold',
            color: 'white',
            borderRadius: '5px',
            border: 'none',
            cursor: 'pointer',
          }}
          onClick={createRoom}
          disabled={loading}
      >
        {loading ? 'Создание...' : 'Создать комнату'}
      </button>
    </div>
  );
};

export default RoomSelector;
