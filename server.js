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

function getRoomOwner(roomCode) {
  if (rooms[roomCode] && rooms[roomCode].users.length > 0) {
    return rooms[roomCode].users[0]; // First user is the owner
  }
  return null;
}

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
        rooms[roomCode] = { 
          users: [], 
          messages: [],
          game: null,
        };
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

      socket.emit('join-success', { messages: rooms[roomCode].messages, gameState: rooms[roomCode].game, ownerId: getRoomOwner(roomCode)?.id });
      io.to(roomCode).emit('user-list-update', rooms[roomCode].users);
      socket.to(roomCode).emit('new-message', systemMessage);
    });

    socket.on('send-message', ({ content, messageType }) => {
      const { nickname, roomCode } = socket.data;
      if (!nickname || !roomCode || !rooms[roomCode]) return;

      const message = {
        id: Date.now() + Math.random(),
        type: messageType || 'user',
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

    socket.on('start-game', ({ targetWord }) => {
        const { roomCode } = socket.data;
        const room = rooms[roomCode];
        if (!room) return;

        const owner = getRoomOwner(roomCode);
        if (socket.id !== owner?.id) {
            socket.emit('game-error', 'Only the room owner can start the game.');
            return;
        }

        if (room.users.length < 4) {
            socket.emit('game-error', 'You need at least 4 players to start the game.');
            return;
        }

        const master = owner;
        const potentialInsiders = room.users.filter(u => u.id !== master.id);
        const insider = potentialInsiders[Math.floor(Math.random() * potentialInsiders.length)];
        
        const roles = {};
        room.users.forEach(u => {
            if (u.id === master.id) roles[u.id] = 'Master';
            else if (u.id === insider.id) roles[u.id] = 'Insider';
            else roles[u.id] = 'Common';
        });

        room.game = {
            phase: 'question',
            targetWord,
            roles,
            questionPhaseEnd: Date.now() + 5 * 60 * 1000,
            votes: {},
            wordGuessed: false,
        };
        
        io.to(roomCode).emit('game-state-update', room.game);
        
        room.users.forEach(user => {
            const role = roles[user.id];
            const payload = { role };
            if (role === 'Master' || role === 'Insider') {
                payload.targetWord = targetWord;
            }
            io.to(user.id).emit('role-assigned', payload);
        });

        const gameStartMessage = {
            id: Date.now() + Math.random(),
            type: 'notification',
            text: `The Insider game has started! The Master is ${master.nickname}. You have 5 minutes to guess the word.`,
        };
        room.messages.push(gameStartMessage);
        io.to(roomCode).emit('new-message', gameStartMessage);
    });

    socket.on('word-guessed', () => {
        const { roomCode } = socket.data;
        const room = rooms[roomCode];
        if (!room || !room.game) return;

        room.game.wordGuessed = true;
        room.game.phase = 'voting';
        room.game.votingPhaseEnd = Date.now() + 1 * 60 * 1000;
        
        io.to(roomCode).emit('game-state-update', room.game);

        const votingStartMessage = {
            id: Date.now() + Math.random(),
            type: 'notification',
            text: `The word has been guessed! Now you have 1 minute to discuss and vote for the Insider.`,
        };
        room.messages.push(votingStartMessage);
        io.to(roomCode).emit('new-message', votingStartMessage);
    });

    socket.on('submit-vote', ({votedForNickname}) => {
      const {roomCode, nickname} = socket.data;
      const room = rooms[roomCode];
      if (!room || !room.game || room.game.phase !== 'voting') return;

      room.game.votes[nickname] = votedForNickname;

      const totalVotes = Object.keys(room.game.votes).length;
      if (totalVotes === room.users.length) {
          endVoting(roomCode);
      } else {
        io.to(roomCode).emit('game-state-update', room.game);
      }
    });
    
    function endVoting(roomCode) {
        const room = rooms[roomCode];
        if (!room || !room.game) return;

        room.game.phase = 'finished';

        const voteCounts = {};
        let insiderNickname = '';
        let insiderId = '';

        Object.values(room.game.votes).forEach(votedFor => {
            voteCounts[votedFor] = (voteCounts[votedFor] || 0) + 1;
        });
        
        for (const id in room.game.roles) {
            if (room.game.roles[id] === 'Insider') {
                insiderId = id;
                insiderNickname = room.users.find(u => u.id === id).nickname;
                break;
            }
        }
        
        const mostVotedNickname = Object.keys(voteCounts).reduce((a, b) => voteCounts[a] > voteCounts[b] ? a : b, '');
        
        let resultMessageText;
        if (!room.game.wordGuessed) {
            resultMessageText = `Time ran out! The word was "${room.game.targetWord}". Everyone loses!`;
        } else if (mostVotedNickname === insiderNickname) {
            resultMessageText = `The Insider was ${insiderNickname}! Commons and Master win!`;
        } else {
            resultMessageText = `The Insider (${insiderNickname}) escaped! The Insider wins! The word was "${room.game.targetWord}".`;
        }

        const resultMessage = {
            id: Date.now() + Math.random(),
            type: 'notification',
            text: resultMessageText
        };
        room.messages.push(resultMessage);
        io.to(roomCode).emit('new-message', resultMessage);
        io.to(roomCode).emit('game-state-update', room.game);
    }

    // Handle question phase timeout on the server
    setInterval(() => {
        Object.keys(rooms).forEach(roomCode => {
            const room = rooms[roomCode];
            if (room.game && room.game.phase === 'question' && Date.now() > room.game.questionPhaseEnd && !room.game.wordGuessed) {
                room.game.phase = 'voting';
                room.game.votingPhaseEnd = Date.now() + 1 * 60 * 1000;
                io.to(roomCode).emit('game-state-update', room.game);
                const timeUpMessage = {
                    id: Date.now() + Math.random(),
                    type: 'notification',
                    text: "Time's up! The word was not guessed. Discuss and vote for the Insider."
                };
                room.messages.push(timeUpMessage);
                io.to(roomCode).emit('new-message', timeUpMessage);
            }
        });
    }, 1000);

    // Handle voting phase timeout
    setInterval(() => {
        Object.keys(rooms).forEach(roomCode => {
            const room = rooms[roomCode];
            if (room.game && room.game.phase === 'voting' && Date.now() > room.game.votingPhaseEnd) {
                endVoting(roomCode);
            }
        });
    }, 1000);

    socket.on('disconnect', () => {
      const { nickname, roomCode } = socket.data;
      if (!nickname || !roomCode || !rooms[roomCode]) return;
      
      const room = rooms[roomCode];
      room.users = room.users.filter(user => user.id !== socket.id);
      
      if (room.users.length === 0) {
        delete rooms[roomCode];
      } else {
        // If a game was active, pause it
        if (room.game && room.game.phase !== 'finished') {
            room.game.phase = 'paused';
            io.to(roomCode).emit('game-state-update', room.game);
            const pauseMessage = {
                id: Date.now() + Math.random(),
                type: 'notification',
                text: `${nickname} has left. The game is paused. The owner can restart the game.`,
            };
            room.messages.push(pauseMessage);
            io.to(roomCode).emit('new-message', pauseMessage);
        }

        const systemMessage = {
          id: Date.now() + Math.random(),
          type: 'notification',
          text: `${nickname} has left the room.`,
        };
        room.messages.push(systemMessage);
        io.to(roomCode).emit('new-message', systemMessage);
        io.to(roomCode).emit('user-list-update', room.users);
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
