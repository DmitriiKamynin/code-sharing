import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';
import { Socket } from 'socket.io-client';
import { Room, Participant, CodeChangeData, RoomStateData, EditorRef } from '../types';
import { editor } from 'monaco-editor';

interface CodeEditorProps {
  participants: Participant[];
  socket: Socket;
  onLeaveRoom: () => void;
  room: Room;
}

const CodeEditor: React.FC<CodeEditorProps> = ({ participants, socket, onLeaveRoom, room }) => {
  const { roomId } = useParams<{ roomId: string }>();
  const [code, setCode] = useState<string>('// Добро пожаловать в совместный редактор кода!\n// Начните писать код здесь...\n\nfunction hello() {\n    console.log("Привет, мир!");\n}\n\nhello();');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const editorRef = useRef<EditorRef>(null);
  const isInitialLoad = useRef<boolean>(true);

  useEffect(() => {
    if (!socket || !roomId) return;

    // Обработчики событий сокета
    const handleCodeChange = (data: CodeChangeData) => {
      if (data.roomId === roomId && data.userId !== socket.id && data.code !== code) {
        setCode(data.code);
        if (editorRef.current) {
          editorRef.current.setValue(data.code);
        }
      }
    };

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleRoomState = (data: RoomStateData) => {
      if (data.roomId === roomId) {
        setCode(data.code || code);
      }
    };

    socket.on('code-change', handleCodeChange);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('room-state', handleRoomState);

    // Запрос текущего состояния комнаты при подключении
    if (isInitialLoad.current) {
      socket.emit('get-room-state', { roomId });
      isInitialLoad.current = false;
    }

    return () => {
      socket.off('code-change', handleCodeChange);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('room-state', handleRoomState);
    };
  }, [socket, roomId, code]);

  const handleEditorChange = (value: string | undefined): void => {
    if (!roomId || value === undefined) return;
    
    if (value !== code) {
      setCode(value);
      socket.emit('code-change', {
        roomId,
        code: value,
        userId: socket.id
      });
    }
  };

  const handleEditorDidMount = (editor: editor.IStandaloneCodeEditor): void => {
    editorRef.current = editor;
    
    // Настройка редактора
    editor.updateOptions({
      fontSize: 14,
      minimap: { enabled: true },
      scrollBeyondLastLine: false,
      automaticLayout: true,
      wordWrap: 'on',
      lineNumbers: 'on',
      renderWhitespace: 'selection',
      selectOnLineNumbers: true,
      roundedSelection: false,
      readOnly: false,
      cursorStyle: 'line',
      glyphMargin: true,
      folding: true,
      lineDecorationsWidth: 10,
      lineNumbersMinChars: 3,
      renderLineHighlight: 'line',
      scrollbar: {
        vertical: 'auto',
        horizontal: 'auto',
        useShadows: false,
        verticalHasArrows: false,
        horizontalHasArrows: false,
        verticalScrollbarSize: 10,
        horizontalScrollbarSize: 10
      }
    });
  };

  const copyRoomLink = (): void => {
    if (!roomId) return;
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Ссылка на комнату скопирована в буфер обмена!');
  };

  return (
    <div className="container">
      <div className="sidebar">
        <div className="room-info" style={{ marginBottom: '20px' }}>
          <h3 style={{ color: '#ffffff', marginBottom: '10px' }}>Комната</h3>
          <div className="room-id">{roomId}</div>
          <button 
            className="btn btn-secondary" 
            onClick={copyRoomLink}
            style={{ marginTop: '10px', fontSize: '12px', padding: '5px 10px' }}
          >
            Копировать ссылку
          </button>
        </div>

        <div className="participants" style={{ marginBottom: '20px' }}>
          <h4 style={{ color: '#ffffff', marginBottom: '10px' }}>
            Участники ({participants.length})
          </h4>
          {participants.map((participant) => (
            <div key={participant.id} className="participant">
              {participant.username}
            </div>
          ))}
        </div>

        <div style={{ marginTop: 'auto' }}>
          <button 
            className="btn btn-secondary" 
            onClick={onLeaveRoom}
            style={{ width: '100%' }}
          >
            Покинуть комнату
          </button>
        </div>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="room-info">
            <h2 style={{ color: '#ffffff' }}>Редактор кода</h2>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '10px',
              padding: '5px 10px',
              backgroundColor: isConnected ? '#4caf50' : '#f44336',
              borderRadius: '15px',
              fontSize: '12px'
            }}>
              <div style={{ 
                width: '6px', 
                height: '6px', 
                borderRadius: '50%', 
                backgroundColor: 'white' 
              }}></div>
              {isConnected ? 'Подключено' : 'Отключено'}
            </div>
          </div>
        </div>

        <div className="editor-container">
          <Editor
            height="100%"
            language="javascript"
            value={code}
            onChange={handleEditorChange}
            onMount={handleEditorDidMount}
            theme="vs-dark"
            options={{
              selectOnLineNumbers: true,
              roundedSelection: false,
              readOnly: false,
              cursorStyle: 'line',
              automaticLayout: true,
              fontSize: 14,
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              lineNumbers: 'on',
              renderWhitespace: 'selection',
              glyphMargin: true,
              folding: true,
              lineDecorationsWidth: 10,
              lineNumbersMinChars: 3,
              renderLineHighlight: 'line'
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
