export type User = {
  id: string;
  nickname: string;
};

export type Message = {
  id: string | number;
  type: 'user' | 'notification';
  content?: string;
  text?: string;
  sender?: string;
  timestamp?: string;
};
