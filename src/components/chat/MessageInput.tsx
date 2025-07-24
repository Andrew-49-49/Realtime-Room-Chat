"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal, HelpCircle, Target, MessageSquare } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { messageSchema } from "@/lib/schemas";
import type { Message, GameState, Role } from "@/lib/types";

interface MessageInputProps {
  onSendMessage: (content: string, messageType: Message['type']) => void;
  gameState: GameState;
  role: Role | null;
}

export default function MessageInput({ onSendMessage, gameState, role }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState<Message['type']>('user');
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validatedMessage = messageSchema.safeParse(message);
    if (validatedMessage.success) {
      onSendMessage(validatedMessage.data, messageType);
      setMessage("");
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Message",
            description: validatedMessage.error.errors[0].message,
        });
    }
  };

  const isGameActive = gameState && (gameState.phase === 'question' || gameState.phase === 'voting');
  const canAskQuestion = isGameActive && gameState.phase === 'question' && role !== 'Master';
  const canAnswer = isGameActive && gameState.phase === 'question' && role === 'Master';
  const canGuess = isGameActive && gameState.phase === 'question';

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-primary/10 p-4 bg-card/50"
    >
      {isGameActive && (
        <div className="flex gap-1">
            <Button type="button" variant={messageType === 'user' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMessageType('user')}>
                <MessageSquare className="h-4 w-4" />
                <span className="sr-only">Chat</span>
            </Button>
            {canAskQuestion && <Button type="button" variant={messageType === 'question' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMessageType('question')}>
                <HelpCircle className="h-4 w-4" />
                <span className="sr-only">Question</span>
            </Button>}
            {canGuess && <Button type="button" variant={messageType === 'guess' ? 'secondary' : 'ghost'} size="sm" onClick={() => setMessageType('guess')}>
                <Target className="h-4 w-4" />
                <span className="sr-only">Guess</span>
            </Button>}
        </div>
      )}
      <Input
        type="text"
        placeholder={messageType === 'question' ? 'Ask a yes/no question...' : messageType === 'guess' ? 'Guess the word...' : 'Type your message...'}
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-background"
        maxLength={200}
        disabled={isGameActive && gameState.phase === 'voting'}
      />
      <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90" disabled={isGameActive && gameState.phase === 'voting'}>
        <SendHorizonal className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
