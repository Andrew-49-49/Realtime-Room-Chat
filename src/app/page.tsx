import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateRoomForm } from "@/components/landing/CreateRoomForm";
import { JoinRoomForm } from "@/components/landing/JoinRoomForm";
import { MessageSquarePlus } from "lucide-react";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-4 bg-background">
      <div className="w-full max-w-md">
        <Card className="shadow-2xl bg-card/80 backdrop-blur-sm border-primary/20">
          <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-2">
              <MessageSquarePlus className="w-8 h-8 text-primary" />
              <CardTitle className="text-3xl font-headline font-bold text-primary">Realtime Chat</CardTitle>
            </div>
            <CardDescription className="text-muted-foreground">
              Create a room or join one to start chatting!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="join" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="join">Join Room</TabsTrigger>
                <TabsTrigger value="create">Create Room</TabsTrigger>
              </TabsList>
              <TabsContent value="join">
                <JoinRoomForm />
              </TabsContent>
              <TabsContent value="create">
                <CreateRoomForm />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        <p className="text-center text-sm text-muted-foreground mt-4">
          Powered by Next.js & Socket.IO
        </p>
      </div>
    </main>
  );
}
