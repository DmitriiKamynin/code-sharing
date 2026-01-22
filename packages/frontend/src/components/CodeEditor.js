import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useParams } from 'react-router-dom';

const CodeEditor = ({ room, participants, socket, onLeaveRoom }) => {
  const { roomId } = useParams();
  const [code, setCode] = useState('// Добро пожаловать в совместный редактор кода!\n// Начните писать код здесь...\n\nfunction hello() {\n    console.log("Привет, мир!");\n}\n\nhello();');
  const [language, setLanguage] = useState('javascript');
  const [isConnected, setIsConnected] = useState(true);
  const editorRef = useRef(null);
  const isInitialLoad = useRef(true);

  const languages = [
    { value: 'javascript', label: 'JavaScript' },
    { value: 'typescript', label: 'TypeScript' },
    { value: 'python', label: 'Python' },
    { value: 'java', label: 'Java' },
    { value: 'cpp', label: 'C++' },
    { value: 'csharp', label: 'C#' },
    { value: 'go', label: 'Go' },
    { value: 'rust', label: 'Rust' },
    { value: 'php', label: 'PHP' },
    { value: 'ruby', label: 'Ruby' },
    { value: 'html', label: 'HTML' },
    { value: 'css', label: 'CSS' },
    { value: 'json', label: 'JSON' },
    { value: 'xml', label: 'XML' },
    { value: 'sql', label: 'SQL' }
  ];

  useEffect(() => {
    if (!socket) return;

    // Обработчики событий сокета
    socket.on('code-change', (data) => {
      if (data.roomId === roomId && data.userId !== socket.id && data.code !== code) {
        setCode(data.code);
        if (editorRef.current) {
          editorRef.current.setValue(data.code);
        }
      }
    });

    socket.on('language-change', (data) => {
      if (data.roomId === roomId && data.userId !== socket.id) {
        setLanguage(data.language);
      }
    });

    socket.on('connect', () => {
      setIsConnected(true);
    });

    socket.on('disconnect', () => {
      setIsConnected(false);
    });

    // Запрос текущего состояния комнаты при подключении
    if (isInitialLoad.current) {
      socket.emit('get-room-state', { roomId });
      isInitialLoad.current = false;
    }

    socket.on('room-state', (data) => {
      if (data.roomId === roomId) {
        setCode(data.code || code);
        setLanguage(data.language || language);
      }
    });

    return () => {
      socket.off('code-change');
      socket.off('language-change');
      socket.off('connect');
      socket.off('disconnect');
      socket.off('room-state');
    };
  }, [socket, roomId, code, language]);

  const handleEditorChange = (value) => {
    if (value !== code) {
      setCode(value);
      socket.emit('code-change', {
        roomId,
        code: value,
        userId: socket.id
      });
    }
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    socket.emit('language-change', {
      roomId,
      language: newLanguage,
      userId: socket.id
    });
  };

  const handleEditorDidMount = (editor) => {
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

  const copyRoomLink = () => {
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

        <div className="form-group">
          <label>Язык программирования:</label>
          <select
            value={language}
            onChange={(e) => handleLanguageChange(e.target.value)}
            style={{
              background: '#3c3c3c',
              border: '1px solid #555',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '4px',
              fontSize: '14px'
            }}
          >
            {languages.map((lang) => (
              <option key={lang.value} value={lang.value}>
                {lang.label}
              </option>
            ))}
          </select>
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
            language={language}
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

