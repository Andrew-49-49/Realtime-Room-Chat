const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const express = require('express');
const { Server } = require('socket.io');

const dev = process.env.NODE_ENV !== 'production';
const hostname = '0.0.0.0';
const port = process.env.PORT || 3000;

const app = next({ dev });
const handle = app.getRequestHandler();

const rooms = {}; // In-memory store for rooms

app.prepare().then(() => {
  const server = express();
  const httpServer = createServer(server);
  
  const io = new Server(httpServer);

  io.on('connection', (socket) => {
    socket.on('join-room', ({ roomCode, nickname, create }) => {
      if (!create && !rooms[roomCode]) {
        socket.emit('join-error', 'This room does not exist.');
        return;
      }

      if (!rooms[roomCode]) {
        rooms[roomCode] = { users: [], messages: [] };
      }

      if (rooms[roomCode].users.find(user => user.nickname === nickname)) {
        socket.emit('join-error', 'This nickname is already taken in the room.');
        return;
      }

      socket.join(roomCode);
      const user = { id: socket.id, nickname };
      rooms[roomCode].users.push(user);
      socket.data.nickname = nickname;
      socket.data.roomCode = roomCode;
      
      const systemMessage = {
        id: Date.now() + Math.random(),
        type: 'notification',
        text: `${nickname} has joined the room.`,
      };
      rooms[roomCode].messages.push(systemMessage);

      socket.emit('join-success', rooms[roomCode].messages);
      io.to(roomCode).emit('user-list-update', rooms[roomCode].users);
      socket.to(roomCode).emit('new-message', systemMessage);
    });

    socket.on('send-message', ({ content }) => {
      const { nickname, roomCode } = socket.data;
      if (!nickname || !roomCode || !rooms[roomCode]) return;

      const message = {
        id: Date.now() + Math.random(),
        type: 'user',
        content,
        sender: nickname,
        timestamp: new Date().toISOString(),
      };
      
      rooms[roomCode].messages.push(message);
      if (rooms[roomCode].messages.length > 100) {
        rooms[roomCode].messages.shift();
      }

      io.to(roomCode).emit('new-message', message);
    });

    socket.on('disconnect', () => {
      const { nickname, roomCode } = socket.data;
      if (!nickname || !roomCode || !rooms[roomCode]) return;
      
      rooms[roomCode].users = rooms[roomCode].users.filter(user => user.id !== socket.id);
      
      if (rooms[roomCode].users.length === 0) {
        delete rooms[roomCode];
      } else {
        const systemMessage = {
          id: Date.now() + Math.random(),
          type: 'notification',
          text: `${nickname} has left the room.`,
        };
        rooms[roomCode].messages.push(systemMessage);
        io.to(roomCode).emit('new-message', systemMessage);
        io.to(roomCode).emit('user-list-update', rooms[roomCode].users);
      }
    });
  });

  server.all('*', (req, res) => {
    return handle(req, res, parse(req.url, true));
  });

  httpServer
    .once('error', (err) => {
      console.error(err);
      process.exit(1);
    })
    .listen(port, hostname, () => {
      console.log(`> Ready on http://${hostname}:${port}`);
    });
});
