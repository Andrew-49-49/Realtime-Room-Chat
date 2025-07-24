"use client";

import { useActionState, useEffect } from 'react';
import { joinRoom } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { LogIn } from 'lucide-react';

const initialState = {
  errors: {},
};

export function JoinRoomForm() {
  const [state, formAction] = useActionState(joinRoom, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.errors?.nickname) {
      toast({
        variant: "destructive",
        title: "Invalid Nickname",
        description: state.errors.nickname[0],
      });
    }
    if (state?.errors?.roomCode) {
      toast({
        variant: "destructive",
        title: "Invalid Room Code",
        description: state.errors.roomCode[0],
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Join an Existing Room</CardTitle>
          <CardDescription>Enter your nickname and the room code to start chatting.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nickname">Nickname</Label>
            <Input id="nickname" name="nickname" placeholder="Your_Nickname" required maxLength={20} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="roomCode">Room Code</Label>
            <Input id="roomCode" name="roomCode" placeholder="ABC123" required maxLength={6} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            <LogIn className="mr-2 h-4 w-4" /> Join Room
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export default JoinRoomForm;
