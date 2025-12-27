const { io } = require('socket.io-client');
const { server} = require('socket.io')

console.log('🚀 Starting socket test...');

const WORKSPACE_ID = '53bf1403-9d83-4d52-86aa-10e1ab2253d2';

const socket = io('http://localhost:8080', {
  transports: ['polling', 'websocket'],
  timeout: 5000
});

socket.on('connect', () => {
  console.log('✅ Connected to socket server:', socket.id);
  socket.emit('join-workspace', WORKSPACE_ID);
});

socket.on('activity', (event) => {
  console.log('🔥 Live activity received:', event);
});

socket.on('connect_error', (err) => {
  console.error('❌ Connection error:', err.message);
});

socket.on('disconnect', (reason) => {
  console.log('❌ Socket disconnected:', reason);
});
