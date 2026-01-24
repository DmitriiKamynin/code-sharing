import React, { useState, useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useNavigate, useParams } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { CodeChangeData } from '../types';

const CodeEditor: React.FC = () => {
  const { roomId } = useParams<{ roomId: string }>() as { roomId: string };
  const navigate = useNavigate();
  const [code, setCode] = useState<string>('// Добро пожаловать в совместный редактор кода!\n// Начните писать код здесь...\n\nfunction hello() {\n    console.log("Привет, мир!");\n}\n\nhello();');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [socket, setSocket] = useState<Socket>();
  const [terminalOutput, setTerminalOutput] = useState<string>('');
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const terminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {

    fetch(`http://localhost:3001/api/rooms/${roomId}`)
      .then(res => res.json())
      .then(res => setCode(res.code));

    const socket = io('http://localhost:3001', { query: { roomId } });
    setSocket(socket);

    const handleConnect = () => {
      setIsConnected(true);
    };

    const handleDisconnect = () => {
      setIsConnected(false);
    };

    const handleCodeChange = (data: CodeChangeData) => {
      if (data.userId !== socket.id && data.code !== code) {
        console.log('code-change', data);
        console.log('code', code);
        setCode(data.code);
      }
    };

    const handleRun = (output: string) => {
      setTerminalOutput(prev => prev + output + '\n');
      setIsRunning(false);
      if (terminalRef.current) {
        terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
      }
    };

    socket.on('code-change', handleCodeChange);
    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('run', handleRun);

    return () => {
      socket.off('code-change', handleCodeChange);
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('run', handleRun);
      socket.disconnect();
    };
  }, []);

  const handleEditorChange = (value: string | undefined): void => {
    if (code === value || value === undefined) return;
    console.log('value', value);
    console.log('code', code);
    setCode(value);
    socket?.emit('code-change', {
      roomId,
      code: value,
      userId: socket.id
    });
  };

  const copyRoomLink = (): void => {
    if (!roomId) return;
    const link = `${window.location.origin}/room/${roomId}`;
    navigator.clipboard.writeText(link);
    alert('Ссылка на комнату скопирована в буфер обмена!');
  };

  const handleRunCode = (): void => {
    if (!socket || !roomId || isRunning) return;
    setIsRunning(true);
    setTerminalOutput(prev => prev + `> Запуск кода...\n`);
    socket.emit('run', { roomId, code });
  };

  const clearTerminal = (): void => {
    setTerminalOutput('');
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

        <div style={{ marginTop: 'auto' }}>
          <button 
            className="btn btn-secondary" 
            onClick={() => navigate('/')}
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
          <div className="controls">
            <button 
              className="btn btn-success" 
              onClick={handleRunCode}
              disabled={isRunning || !isConnected}
              style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '8px',
                opacity: (isRunning || !isConnected) ? 0.5 : 1
              }}
            >
              {isRunning ? '⏳ Выполняется...' : '▶ Запустить'}
            </button>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="editor-container" style={{ flex: '1 1 60%', minHeight: 0 }}>
            <Editor
              height="100%"
              language="javascript"
              value={code}
              onChange={handleEditorChange}
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
          
          <div className="terminal-container">
            <div className="terminal-header">
              <span style={{ color: '#ffffff', fontSize: '14px', fontWeight: 'bold' }}>Терминал</span>
              <button 
                className="btn btn-secondary" 
                onClick={clearTerminal}
                style={{ fontSize: '12px', padding: '4px 8px' }}
              >
                Очистить
              </button>
            </div>
            <div 
              ref={terminalRef}
              className="terminal-output"
            >
              {terminalOutput || <span style={{ color: '#888' }}>Вывод появится здесь после запуска кода...</span>}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;
