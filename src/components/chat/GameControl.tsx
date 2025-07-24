"use client";

import { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import type { GameState, User } from '@/lib/types';
import { Timer, Vote, Play } from 'lucide-react';

interface GameControlProps {
    gameState: GameState;
    isOwner: boolean;
    onStartGame: (targetWord: string) => void;
    onWordGuessed: () => void;
    users: User[];
    currentUserNickname: string;
    onSubmitVote: (votedForNickname: string) => void;
}

export default function GameControl({ gameState, isOwner, onStartGame, onWordGuessed, users, currentUserNickname, onSubmitVote }: GameControlProps) {
    const [targetWord, setTargetWord] = useState('');
    const [votedFor, setVotedFor] = useState('');
    const [timeLeft, setTimeLeft] = useState(0);

    useEffect(() => {
        if (!gameState) return;

        let interval: NodeJS.Timeout | null = null;
        if (gameState.phase === 'question' && gameState.questionPhaseEnd) {
            const updateTimer = () => {
                const remaining = Math.max(0, Math.round((gameState.questionPhaseEnd - Date.now()) / 1000));
                setTimeLeft(remaining);
            };
            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else if (gameState.phase === 'voting' && gameState.votingPhaseEnd) {
            const updateTimer = () => {
                const remaining = Math.max(0, Math.round((gameState.votingPhaseEnd - Date.now()) / 1000));
                setTimeLeft(remaining);
            };
            updateTimer();
            interval = setInterval(updateTimer, 1000);
        } else {
            setTimeLeft(0);
        }

        return () => {
            if (interval) {
                clearInterval(interval);
            }
        };
    }, [gameState]);

    const handleStartGame = (e: React.FormEvent) => {
        e.preventDefault();
        if (targetWord.trim()) {
            onStartGame(targetWord.trim());
        }
    };

    const handleVoteSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (votedFor) {
            onSubmitVote(votedFor);
        }
    }

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${minutes}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const hasVoted = gameState?.votes && gameState.votes[currentUserNickname];

    if (!gameState || gameState.phase === 'finished' || gameState.phase === 'paused') {
        if (isOwner) {
            return (
                <div className="p-4 bg-card/50 border-b border-primary/10">
                    <form onSubmit={handleStartGame} className="flex items-center gap-2">
                        <Input
                            type="text"
                            placeholder="Enter the secret word..."
                            value={targetWord}
                            onChange={(e) => setTargetWord(e.target.value)}
                            maxLength={50}
                        />
                        <Button type="submit">
                            <Play className="mr-2 h-4 w-4"/>
                            Start Insider Game
                        </Button>
                    </form>
                    {gameState?.phase === 'paused' && <p className='text-yellow-500 text-sm mt-2'>Game is paused. You can start a new one.</p>}
                </div>
            );
        }
        return (
            <div className="p-4 bg-card/50 border-b border-primary/10">
                <p className="text-muted-foreground text-sm">Waiting for the room owner to start the Insider game...</p>
                 {gameState?.phase === 'paused' && <p className='text-yellow-500 text-sm mt-2'>Game is paused. The owner can start a new game.</p>}
            </div>
        )
    }

    return (
        <Card className="m-2 md:m-4 mb-0 md:mb-0 rounded-b-none border-b-0 border-primary/10 shadow-inner">
            <CardHeader className="p-4 flex flex-row items-center justify-between">
                <CardTitle className="text-xl capitalize flex items-center gap-2">
                    {gameState.phase === 'question' ? <Timer className="h-6 w-6 text-primary" /> : <Vote className="h-6 w-6 text-primary" />}
                    {gameState.phase} Phase
                </CardTitle>
                {timeLeft > 0 && <span className="font-bold text-lg">{formatTime(timeLeft)}</span>}
            </CardHeader>
            <CardContent className="p-4 pt-0">
                {gameState.phase === 'question' && (
                     <Button onClick={onWordGuessed} disabled={gameState.wordGuessed}>
                        The word has been guessed!
                    </Button>
                )}
                 {gameState.phase === 'voting' && (
                    <form onSubmit={handleVoteSubmit}>
                        <Label>Vote for the Insider</Label>
                        <div className="flex items-center gap-2 mt-2">
                             <Select onValueChange={setVotedFor} value={votedFor} disabled={!!hasVoted}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Select a player..." />
                                </SelectTrigger>
                                <SelectContent>
                                    {users.map(u => (
                                        <SelectItem key={u.id} value={u.nickname} disabled={u.nickname === currentUserNickname}>
                                            {u.nickname}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Button type="submit" disabled={!votedFor || !!hasVoted}>
                                {hasVoted ? 'Voted' : 'Submit Vote'}
                            </Button>
                        </div>
                        {hasVoted && <p className="text-sm text-muted-foreground mt-2">You voted for {gameState.votes[currentUserNickname]}. Waiting for others...</p>}
                    </form>
                 )}
            </CardContent>
        </Card>
    );
}
