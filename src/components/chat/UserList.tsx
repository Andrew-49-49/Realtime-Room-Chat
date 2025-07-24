import type { User as UserType } from "@/lib/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Users } from "lucide-react";

interface UserListProps {
  users: UserType[];
}

export function UserList({ users }: UserListProps) {
  return (
    <div className="flex h-full flex-col bg-card/30">
        <header className="flex h-16 items-center border-b border-primary/10 px-4">
            <h2 className="text-lg font-semibold flex items-center gap-2">
                <Users className="h-6 w-6 text-primary" />
                Participants ({users.length})
            </h2>
        </header>
        <ScrollArea className="flex-1 p-4">
            <div className="flex flex-col gap-4">
            {users.map((user) => (
                <div key={user.id} className="flex items-center gap-3">
                    <Avatar className="h-10 w-10 border-2 border-primary">
                        <AvatarFallback className="bg-primary/20 text-primary font-bold">
                        {user.nickname.charAt(0).toUpperCase()}
                        </AvatarFallback>
                    </Avatar>
                    <span className="font-medium truncate">{user.nickname}</span>
                </div>
            ))}
            </div>
        </ScrollArea>
    </div>
  );
}
