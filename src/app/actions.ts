"use server";

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { nanoid } from 'nanoid';
import { createRoomSchema, joinRoomSchema } from '@/lib/schemas';

export async function createRoom(prevState: any, formData: FormData) {
  const validatedFields = createRoomSchema.safeParse({
    nickname: formData.get('nickname'),
  });

  if (!validatedFields.success) {
    return {
      errors: validatedFields.error.flatten().fieldErrors,
    };
  }

  const { nickname } = validatedFields.data;
  const roomCode = nanoid(6);

  redirect(`/chat/${roomCode}?nickname=${encodeURIComponent(nickname)}&create=true`);
}

export async function joinRoom(prevState: any, formData: FormData) {
    const validatedFields = joinRoomSchema.safeParse({
      nickname: formData.get('nickname'),
      roomCode: formData.get('roomCode'),
    });
  
    if (!validatedFields.success) {
      return {
        errors: validatedFields.error.flatten().fieldErrors,
      };
    }
  
    const { nickname, roomCode } = validatedFields.data;
  
    redirect(`/chat/${roomCode}?nickname=${encodeURIComponent(nickname)}`);
}
