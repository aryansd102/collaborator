import { Server } from 'socket.io';
import http from 'http';

let io: Server;

export function initSocket(server: http.Server) {
  io = new Server(server, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST']
    }
  });

  io.on('connection', (socket) => {
    console.log('Socket connected:', socket.id);

    socket.on('join-workspace', (workspaceId: string) => {
      socket.join(`workspace:${workspaceId}`);
      console.log(`Joined workspace`, workspaceId);
    });
  });
}

export function emitWorkspaceEvent(workspaceId: string, event: any) {
  if (!io) return;
  io.to(`workspace:${workspaceId}`).emit('activity', event);
}
