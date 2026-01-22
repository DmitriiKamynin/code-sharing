import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3001/api/rooms';

const RoomSelector = ({ onJoinRoom, isConnected }) => {
  const [username, setUsername] = useState('');
  const [roomId, setRoomId] = useState('');
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Загружаем комнаты с сервера
    loadRooms();
    
    // Обновляем список комнат каждые 5 секунд
    const interval = setInterval(() => {
      loadRooms();
    }, 5000);
    
    return () => clearInterval(interval);
  }, []);

  const loadRooms = async () => {
    try {
      const response = await fetch(API_URL);
      if (response.ok) {
        const data = await response.json();
        setRooms(data);
      }
    } catch (error) {
      console.error('Ошибка при загрузке комнат:', error);
    }
  };

  const createRoom = async () => {
    if (!username.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }
    
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
        const newRoom = await response.json();
        await loadRooms(); // Обновляем список комнат
        onJoinRoom(newRoom.id, username);
        navigate(`/room/${newRoom.id}`);
      } else {
        alert('Ошибка при создании комнаты');
      }
    } catch (error) {
      console.error('Ошибка при создании комнаты:', error);
      alert('Ошибка при создании комнаты');
    } finally {
      setLoading(false);
    }
  };

  const joinRoom = () => {
    if (!username.trim() || !roomId.trim()) {
      alert('Пожалуйста, заполните все поля');
      return;
    }
    
    onJoinRoom(roomId, username);
    navigate(`/room/${roomId}`);
  };

  const joinExistingRoom = (room) => {
    if (!username.trim()) {
      alert('Пожалуйста, введите ваше имя');
      return;
    }
    
    onJoinRoom(room.id, username);
    navigate(`/room/${room.id}`);
  };

  const copyRoomId = (roomId) => {
    navigator.clipboard.writeText(`${window.location.origin}/room/${roomId}`);
    alert('Ссылка на комнату скопирована в буфер обмена!');
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="room-form">
          <h2 style={{ color: '#ffffff', marginBottom: '20px' }}>Создать или присоединиться</h2>
          
          <div className="form-group">
            <label>Ваше имя:</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Введите ваше имя"
            />
          </div>
          
          <div className="form-group">
            <label>ID комнаты (для присоединения):</label>
            <input
              type="text"
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Введите ID комнаты"
            />
          </div>
          
          <div style={{ display: 'flex', gap: '10px' }}>
            <button 
              className="btn btn-success" 
              onClick={createRoom}
              disabled={loading}
            >
              {loading ? 'Создание...' : 'Создать комнату'}
            </button>
            <button className="btn" onClick={joinRoom}>
              Присоединиться
            </button>
          </div>
        </div>
        
        <div className="room-list">
          <h3 style={{ color: '#ffffff', marginBottom: '15px' }}>Мои комнаты</h3>
          {rooms.length === 0 ? (
            <p style={{ color: '#cccccc', fontStyle: 'italic' }}>
              У вас пока нет сохраненных комнат
            </p>
          ) : (
            rooms.map((room) => (
              <div key={room.id} className="room-item">
                <h4>{room.name}</h4>
                <p>ID: {room.id}</p>
                <p>Создана: {new Date(room.created).toLocaleDateString()}</p>
                <p>Участников: {room.participants?.length || 0}</p>
                <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                  <button 
                    className="btn" 
                    onClick={() => joinExistingRoom(room)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Войти
                  </button>
                  <button 
                    className="btn btn-secondary" 
                    onClick={() => copyRoomId(room.id)}
                    style={{ fontSize: '12px', padding: '5px 10px' }}
                  >
                    Копировать ссылку
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
      
      <div className="main-content">
        <div style={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          height: '100%',
          flexDirection: 'column',
          gap: '20px'
        }}>
          <h1 style={{ fontSize: '2.5rem', color: '#007acc' }}>
            Добро пожаловать в Code Sharing!
          </h1>
          <p style={{ fontSize: '1.2rem', color: '#cccccc', textAlign: 'center', maxWidth: '600px' }}>
            Создайте новую комнату для совместного редактирования кода или присоединитесь к существующей, 
            используя ID комнаты.
          </p>
          <div style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '10px',
            padding: '10px 20px',
            backgroundColor: isConnected ? '#4caf50' : '#f44336',
            borderRadius: '20px',
            fontSize: '14px'
          }}>
            <div style={{ 
              width: '8px', 
              height: '8px', 
              borderRadius: '50%', 
              backgroundColor: 'white' 
            }}></div>
            {isConnected ? 'Подключено к серверу' : 'Нет подключения к серверу'}
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoomSelector;

