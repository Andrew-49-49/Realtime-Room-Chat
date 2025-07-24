"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import io, { type Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import type { User, Message } from "@/lib/types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserList } from "./UserList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Copy, LogOut, MessageSquare, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";

interface ChatLayoutProps {
  roomCode: string;
  initialNickname: string;
  isCreating: boolean;
}

let socket: Socket | null = null;

export default function ChatLayout({ roomCode, initialNickname, isCreating }: ChatLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  useEffect(() => {
    if (!initialNickname) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "You must provide a nickname to join a room.",
      });
      router.push('/');
      return;
    }

    socket = io();

    socket.on('connect', () => {
      socket?.emit('join-room', { roomCode, nickname: initialNickname, create: isCreating });
    });

    socket.on('join-success', (history: Message[]) => {
      setMessages(history);
      toast({
        title: `Joined Room: ${roomCode}`,
        description: "You can now start sending messages.",
      });
    });

    socket.on('join-error', (error: string) => {
      toast({
        variant: "destructive",
        title: "Failed to join room",
        description: error,
      });
      router.push('/');
    });

    socket.on('user-list-update', (userList: User[]) => {
      setUsers(userList);
    });

    socket.on('new-message', (message: Message) => {
      setMessages(prev => [...prev, message]);
    });

    socket.on('connect_error', () => {
        toast({
            variant: "destructive",
            title: "Connection Failed",
            description: "Could not connect to the server. Please try again later.",
        });
        router.push('/');
    });

    return () => {
      socket?.disconnect();
      socket = null;
    };
  }, [roomCode, initialNickname, router, toast, isCreating]);

  const handleSendMessage = (content: string) => {
    if (socket) {
      socket.emit('send-message', { content });
    }
  };
  
  const handleLeaveRoom = () => {
    router.push('/');
  };

  const handleCopyRoomCode = () => {
    navigator.clipboard.writeText(roomCode);
    toast({
      title: "Copied!",
      description: "Room code has been copied to your clipboard.",
    });
  };

  return (
    <div className="flex h-screen w-full flex-col md:flex-row bg-background">
      {/* Desktop User List */}
      <aside className="hidden md:flex md:w-64 lg:w-72 flex-col border-r border-primary/10">
        <UserList users={users} />
      </aside>

      {/* Main Chat Area */}
      <main className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-primary/10 bg-card/50 px-4 md:px-6">
          <div className="flex items-center gap-3">
             <div className="md:hidden">
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Users className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <UserList users={users} />
                </SheetContent>
              </Sheet>
            </div>
            <MessageSquare className="h-6 w-6 text-primary" />
            <div>
              <h2 className="text-lg font-semibold">Room Code: {roomCode}</h2>
              <p className="text-sm text-muted-foreground">{users.length} user(s) online</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handleCopyRoomCode}>
              <Copy className="mr-2 h-4 w-4" /> Copy Code
            </Button>
            <Button variant="destructive" size="sm" onClick={handleLeaveRoom}>
              <LogOut className="mr-2 h-4 w-4" /> Leave
            </Button>
          </div>
        </header>

        <Card className="flex-1 flex flex-col overflow-hidden m-2 md:m-4 mt-0 md:mt-0 rounded-lg border-primary/10 shadow-inner">
          <MessageList messages={messages} currentUserNickname={initialNickname} />
          <MessageInput onSendMessage={handleSendMessage} />
        </Card>
      </main>
    </div>
  );
}
