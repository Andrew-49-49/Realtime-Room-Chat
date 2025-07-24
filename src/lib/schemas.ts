import { z } from 'zod';

export const nicknameSchema = z.string()
  .trim()
  .min(2, { message: 'Nickname must be at least 2 characters long.' })
  .max(20, { message: 'Nickname cannot be more than 20 characters long.' })
  .regex(/^[a-zA-Z0-9_]+$/, { message: 'Nickname can only contain letters, numbers, and underscores.' });

export const roomCodeSchema = z.string()
  .trim()
  .length(6, { message: 'Room code must be exactly 6 characters long.' })
  .regex(/^[a-zA-Z0-9]+$/, { message: 'Room code must be alphanumeric.' });

export const joinRoomSchema = z.object({
  nickname: nicknameSchema,
  roomCode: roomCodeSchema,
});

export const createRoomSchema = z.object({
  nickname: nicknameSchema,
});

export const messageSchema = z.string()
  .trim()
  .min(1, { message: "Message can't be empty." })
  .max(200, { message: 'Message cannot be longer than 200 characters.' });
