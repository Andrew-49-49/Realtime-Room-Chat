"use client";

import { useActionState } from 'react';
import { createRoom } from '@/app/actions';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { PlusCircle } from 'lucide-react';

const initialState = {
  errors: {},
};

export function CreateRoomForm() {
  const [state, formAction] = useActionState(createRoom, initialState);
  const { toast } = useToast();

  useEffect(() => {
    if (state?.errors?.nickname) {
      toast({
        variant: "destructive",
        title: "Invalid Nickname",
        description: state.errors.nickname[0],
      });
    }
  }, [state, toast]);

  return (
    <form action={formAction}>
      <Card className="border-none shadow-none">
        <CardHeader>
          <CardTitle>Create a New Room</CardTitle>
          <CardDescription>Enter a nickname and we'll create a new room for you.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="create-nickname">Nickname</Label>
            <Input id="create-nickname" name="nickname" placeholder="Your_Nickname" required maxLength={20} />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full bg-accent hover:bg-accent/90">
            <PlusCircle className="mr-2 h-4 w-4" /> Create and Join Room
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
