"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { io, type Socket } from "socket.io-client";
import { useToast } from "@/hooks/use-toast";
import type { User, Message, GameState } from "@/lib/types";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UserList } from "./UserList";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";
import { Copy, LogOut, MessageSquare, Users } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "../ui/sheet";
import GameControl from "./GameControl";

interface ChatLayoutProps {
  roomCode: string;
  initialNickname: string;
  isCreating: boolean;
}

export default function ChatLayout({ roomCode, initialNickname, isCreating }: ChatLayoutProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [gameState, setGameState] = useState<GameState>(null);
  const [role, setRole] = useState<string | null>(null);
  const [targetWord, setTargetWord] = useState<string | null>(null);
  const [ownerId, setOwnerId] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);

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
    
    // Initialize socket connection
    const socket = io();
    socketRef.current = socket;

    const handleConnect = () => {
      console.log('Socket connected, emitting join-room');
      socket.emit('join-room', { roomCode, nickname: initialNickname, create: isCreating });
    };

    const handleJoinSuccess = ({ messages: history, gameState: initialGameState, ownerId: roomOwnerId }: { messages: Message[], gameState: GameState, ownerId: string }) => {
      setMessages(history);
      setGameState(initialGameState);
      setOwnerId(roomOwnerId);
      toast({
        title: `Joined Room: ${roomCode}`,
        description: "You can now start sending messages.",
      });
    };

    const handleJoinError = (error: string) => {
      toast({
        variant: "destructive",
        title: "Failed to join room",
        description: error,
      });
      router.push('/');
    };

    const handleUserListUpdate = (userList: User[]) => {
      setUsers(userList);
    };

    const handleNewMessage = (message: Message) => {
      setMessages(prev => [...prev, message]);
    };

    const handleConnectError = (error: any) => {
      console.error('Connection Failed:', error);
      toast({
          variant: "destructive",
          title: "Connection Failed",
          description: "Could not connect to the server. Please try again later.",
      });
      router.push('/');
    };

    const handleGameStateUpdate = (newGameState: GameState) => {
        setGameState(newGameState);
    }

    const handleRoleAssigned = ({ role, targetWord: newTargetWord }: {role: string, targetWord?: string}) => {
        setRole(role);
        if (newTargetWord) {
            setTargetWord(newTargetWord);
        }
        toast({
            title: "Game Role Assigned!",
            description: `You are the ${role}. ${newTargetWord ? `The word is "${newTargetWord}".`: ''}`
        })
    }
    
    const handleGameError = (error: string) => {
        toast({
            variant: "destructive",
            title: "Game Error",
            description: error,
        });
    }

    socket.on('connect', handleConnect);
    socket.on('join-success', handleJoinSuccess);
    socket.on('join-error', handleJoinError);
    socket.on('user-list-update', handleUserListUpdate);
    socket.on('new-message', handleNewMessage);
    socket.on('connect_error', handleConnectError);
    socket.on('game-state-update', handleGameStateUpdate);
    socket.on('role-assigned', handleRoleAssigned);
    socket.on('game-error', handleGameError);

    // Cleanup on component unmount
    return () => {
      socket.off('connect', handleConnect);
      socket.off('join-success', handleJoinSuccess);
      socket.off('join-error', handleJoinError);
      socket.off('user-list-update', handleUserListUpdate);
      socket.off('new-message', handleNewMessage);
      socket.off('connect_error', handleConnectError);
      socket.off('game-state-update', handleGameStateUpdate);
      socket.off('role-assigned', handleRoleAssigned);
      socket.off('game-error', handleGameError);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [roomCode, initialNickname, router, toast, isCreating]);

  const handleSendMessage = (content: string, messageType: Message['type'] = 'user') => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', { content, messageType });
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

  const isOwner = socketRef.current?.id === ownerId;

  const handleStartGame = (targetWord: string) => {
      if(socketRef.current) {
          socketRef.current.emit('start-game', { targetWord });
      }
  }

  const handleWordGuessed = () => {
      if(socketRef.current) {
          socketRef.current.emit('word-guessed');
      }
  }

  const handleSubmitVote = (votedForNickname: string) => {
    if (socketRef.current) {
        socketRef.current.emit('submit-vote', { votedForNickname });
    }
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
        <GameControl
            gameState={gameState}
            isOwner={isOwner}
            onStartGame={handleStartGame}
            onWordGuessed={handleWordGuessed}
            users={users}
            currentUserNickname={initialNickname}
            onSubmitVote={handleSubmitVote}
        />
        <Card className="flex-1 flex flex-col overflow-hidden m-2 md:m-4 mt-0 md:mt-0 rounded-lg border-primary/10 shadow-inner">
          <MessageList messages={messages} currentUserNickname={initialNickname} />
          <MessageInput onSendMessage={handleSendMessage} gameState={gameState} role={role} />
        </Card>
      </main>
    </div>
  );
}
