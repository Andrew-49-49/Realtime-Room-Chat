import ChatLayout from "@/components/chat/ChatLayout";

export default function ChatRoomPage({
  params,
  searchParams,
}: {
  params: { roomCode: string };
  searchParams: { nickname?: string; create?: string };
}) {
  return (
    <ChatLayout
      roomCode={params.roomCode}
      initialNickname={searchParams.nickname || ''}
      isCreating={searchParams.create === 'true'}
    />
  );
}
