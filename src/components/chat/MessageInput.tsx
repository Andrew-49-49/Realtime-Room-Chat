"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SendHorizonal } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { messageSchema } from "@/lib/schemas";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export default function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const validatedMessage = messageSchema.safeParse(message);
    if (validatedMessage.success) {
      onSendMessage(validatedMessage.data);
      setMessage("");
    } else {
        toast({
            variant: "destructive",
            title: "Invalid Message",
            description: validatedMessage.error.errors[0].message,
        });
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex items-center gap-2 border-t border-primary/10 p-4 bg-card/50"
    >
      <Input
        type="text"
        placeholder="Type your message..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        className="flex-1 bg-background"
        maxLength={200}
      />
      <Button type="submit" size="icon" className="bg-accent hover:bg-accent/90">
        <SendHorizonal className="h-5 w-5" />
        <span className="sr-only">Send</span>
      </Button>
    </form>
  );
}
