export type User = {
  id: string;
  nickname: string;
};

export type Message = {
  id: string | number;
  type: 'user' | 'notification' | 'question' | 'answer' | 'guess';
  content?: string;
  text?: string;
  sender?: string;
  timestamp?: string;
};

export type Role = 'Master' | 'Insider' | 'Common';

export type GameState = {
  phase: 'setup' | 'question' | 'voting' | 'finished' | 'paused';
  targetWord: string;
  roles: Record<string, Role>;
  questionPhaseEnd: number;
  votingPhaseEnd?: number;
  votes: Record<string, string>; // voterNickname: votedForNickname
  wordGuessed: boolean;
} | null;
