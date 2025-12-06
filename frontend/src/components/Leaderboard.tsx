import React, { useEffect, useState } from 'react';
// import * as api from '../api'; // Not used in mock version

interface UserStats {
    username: string;
    total_wins: number;
    high_score: number;
    games_played: number;
}

export function Leaderboard() {
    const [stats, setStats] = useState<UserStats[]>([]);

    useEffect(() => {
        // In a real app, we'd fetch this. For now, we'll mock or fetch if endpoint exists.
        // The current backend has a user_repository but no public endpoint to list all users easily 
        // without implementing it. Let's assume we can fetch or just show a placeholder if empty.
        // Actually, let's implement a fetch if possible, or just mock for the UI demo.
        // We'll try to fetch from a new endpoint we should probably add, or just use local state for now.
        // Given the constraints, I'll mock it for the UI to ensure it looks good, 
        // and we can hook it up to real data if the user asks for persistence.

        setStats([
            { username: 'Blackbeard', total_wins: 5, high_score: 420, games_played: 12 },
            { username: 'Anne Bonny', total_wins: 3, high_score: 380, games_played: 10 },
            { username: 'Calico Jack', total_wins: 2, high_score: 250, games_played: 8 },
        ]);
    }, []);

    return (
        <div className="card">
            <h2>Pirate Legends</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--pirate-parchment)' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--pirate-gold)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem' }}>Pirate</th>
                        <th style={{ padding: '0.5rem' }}>Wins</th>
                        <th style={{ padding: '0.5rem' }}>High Score</th>
                        <th style={{ padding: '0.5rem' }}>Voyages</th>
                    </tr>
                </thead>
                <tbody>
                    {stats.map(stat => (
                        <tr key={stat.username} style={{ borderBottom: '1px solid var(--pirate-wood)' }}>
                            <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{stat.username}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>{stat.total_wins}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--pirate-gold)' }}>{stat.high_score}</td>
                            <td style={{ padding: '0.5rem', textAlign: 'center' }}>{stat.games_played}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
