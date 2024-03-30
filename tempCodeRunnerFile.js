const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');

const PORT =  process.env.PORT||3000;

const app = express();
const server = http.createServer(app);
const io = socketIo(server, { cors: { origin: "*" } });
app.use(cors());

server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});

io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
  
    socket.on('join room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${socket.id} joined room ${roomId}`);
    });
  
    socket.on('offer', (offer, roomId) => {
      socket.to(roomId).emit('offer', offer);
    });
  
    socket.on('answer', (answer, roomId) => {
      socket.to(roomId).emit('answer', answer);
    });
  
    socket.on('ice candidate', (candidate, roomId) => {
      socket.to(roomId).emit('ice candidate', candidate);
    });
  
    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
  


