const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3001",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3001;

// Хранилище комнат и их состояний
const rooms = new Map();

// Middleware для статических файлов
app.use(express.static(path.join(__dirname, 'build')));

// API для получения информации о комнате
app.get('/api/room/:roomId', (req, res) => {
  const roomId = req.params.roomId;
  const room = rooms.get(roomId);
  
  if (room) {
    res.json({
      id: roomId,
      code: room.code || '',
      language: room.language || 'javascript',
      participants: room.participants || []
    });
  } else {
    res.status(404).json({ error: 'Комната не найдена' });
  }
});

// WebSocket соединения
io.on('connection', (socket) => {
  console.log('Пользователь подключился:', socket.id);

  // Присоединение к комнате
  socket.on('join-room', (data) => {
    const { roomId, username } = data;
    
    if (!roomId || !username) {
      socket.emit('error', { message: 'Неверные данные для присоединения к комнате' });
      return;
    }

    // Создаем комнату если её нет
    if (!rooms.has(roomId)) {
      rooms.set(roomId, {
        id: roomId,
        code: '// Добро пожаловать в совместный редактор кода!\n// Начните писать код здесь...\n\nfunction hello() {\n    console.log("Привет, мир!");\n}\n\nhello();',
        language: 'javascript',
        participants: []
      });
    }

    const room = rooms.get(roomId);
    
    // Добавляем участника
    const participant = {
      id: socket.id,
      username: username,
      joinedAt: new Date().toISOString()
    };
    
    room.participants.push(participant);
    
    // Присоединяем сокет к комнате
    socket.join(roomId);
    
    // Отправляем информацию о комнате новому участнику
    socket.emit('room-joined', {
      room: {
        id: roomId,
        code: room.code,
        language: room.language
      },
      participants: room.participants
    });
    
    // Уведомляем других участников о новом участнике
    socket.to(roomId).emit('participant-joined', participant);
    
    console.log(`Пользователь ${username} присоединился к комнате ${roomId}`);
  });

  // Покидание комнаты
  socket.on('leave-room', (data) => {
    const { roomId } = data;
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      
      // Удаляем участника
      room.participants = room.participants.filter(p => p.id !== socket.id);
      
      // Уведомляем других участников
      socket.to(roomId).emit('participant-left', socket.id);
      
      // Удаляем комнату если она пустая
      if (room.participants.length === 0) {
        rooms.delete(roomId);
        console.log(`Комната ${roomId} удалена (пустая)`);
      }
    }
    
    socket.leave(roomId);
    console.log(`Пользователь покинул комнату ${roomId}`);
  });

  // Изменение кода
  socket.on('code-change', (data) => {
    const { roomId, code, userId } = data;
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.code = code;
      
      // Отправляем изменение всем участникам кроме отправителя
      socket.to(roomId).emit('code-change', data);
    }
  });

  // Изменение языка программирования
  socket.on('language-change', (data) => {
    const { roomId, language, userId } = data;
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      room.language = language;
      
      // Отправляем изменение всем участникам кроме отправителя
      socket.to(roomId).emit('language-change', data);
    }
  });

  // Запрос состояния комнаты
  socket.on('get-room-state', (data) => {
    const { roomId } = data;
    
    if (rooms.has(roomId)) {
      const room = rooms.get(roomId);
      socket.emit('room-state', {
        roomId,
        code: room.code,
        language: room.language
      });
    }
  });

  // Отключение
  socket.on('disconnect', () => {
    console.log('Пользователь отключился:', socket.id);
    
    // Удаляем участника из всех комнат
    rooms.forEach((room, roomId) => {
      const participantIndex = room.participants.findIndex(p => p.id === socket.id);
      if (participantIndex !== -1) {
        room.participants.splice(participantIndex, 1);
        
        // Уведомляем других участников
        socket.to(roomId).emit('participant-left', socket.id);
        
        // Удаляем комнату если она пустая
        if (room.participants.length === 0) {
          rooms.delete(roomId);
          console.log(`Комната ${roomId} удалена (пустая)`);
        }
      }
    });
  });
});

// Обработка всех остальных маршрутов для SPA
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

server.listen(PORT, () => {
  console.log(`Сервер запущен на порту ${PORT}`);
  console.log(`WebSocket сервер доступен на ws://localhost:${PORT}`);
});

