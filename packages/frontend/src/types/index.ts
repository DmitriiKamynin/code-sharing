import { Socket } from 'socket.io-client';
import { editor } from 'monaco-editor';

export interface Participant {
  id: string;
  username: string;
  joinedAt: string;
}

export interface Room {
  id: string;
  code: string;
  language: string;
}

export interface RoomJoinedData {
  room: Room;
  participants: Participant[];
}

export interface CodeChangeData {
  roomId: string;
  code: string;
  userId: string;
}

export interface RoomStateData {
  roomId: string;
  code: string;
  language: string;
}

export interface AppSocket extends Socket {
  id: string;
}

export type EditorRef = editor.IStandaloneCodeEditor | null;
