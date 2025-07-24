"use client";

import { useEffect, useRef } from "react";
import type { Message } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format, parseISO } from 'date-fns';
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback } from "../ui/avatar";

interface MessageListProps {
  messages: Message[];
  currentUserNickname: string;
}

export default function MessageList({ messages, currentUserNickname }: MessageListProps) {
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('div[data-radix-scroll-area-viewport]');
        if (viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  return (
    <ScrollArea className="flex-1" ref={scrollAreaRef}>
      <div className="p-4 md:p-6 space-y-6">
        {messages.map((msg) => {
          if (msg.type === 'notification') {
            return (
              <div key={msg.id} className="text-center text-sm text-muted-foreground italic">
                {msg.text}
              </div>
            );
          }

          const isCurrentUser = msg.sender === currentUserNickname;
          return (
            <div
              key={msg.id}
              className={cn("flex items-end gap-3", isCurrentUser ? "justify-end" : "justify-start")}
            >
              {!isCurrentUser && (
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-secondary text-secondary-foreground">
                    {msg.sender?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
              <div
                className={cn(
                  "max-w-xs md:max-w-md lg:max-w-lg rounded-lg px-4 py-3 text-sm",
                  isCurrentUser
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-card border rounded-bl-none"
                )}
              >
                {!isCurrentUser && (
                  <p className="font-semibold text-primary mb-1">{msg.sender}</p>
                )}
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={cn("text-xs mt-1", isCurrentUser ? "text-primary-foreground/70" : "text-muted-foreground")}>
                  {msg.timestamp ? format(parseISO(msg.timestamp), 'h:mm a') : ''}
                </p>
              </div>
              {isCurrentUser && (
                <Avatar className="h-10 w-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {currentUserNickname.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              )}
            </div>
          );
        })}
      </div>
    </ScrollArea>
  );
}
