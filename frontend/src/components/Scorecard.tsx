interface PlayerScore {
    name: string;
    score: number;
    history: number[]; // Score at each round
}

interface ScorecardProps {
    scores: PlayerScore[];
    currentRound: number;
}

export function Scorecard({ scores, currentRound }: ScorecardProps) {
    return (
        <div className="card" style={{ overflowX: 'auto', maxWidth: '100%' }}>
            <h2>Captain's Log</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', color: 'var(--pirate-parchment)', fontSize: '0.9rem' }}>
                <thead>
                    <tr style={{ borderBottom: '2px solid var(--pirate-gold)' }}>
                        <th style={{ textAlign: 'left', padding: '0.5rem', minWidth: '80px' }}>Pirate</th>
                        {Array.from({ length: currentRound }, (_, i) => (
                            <th key={i} style={{ padding: '0.5rem', minWidth: '30px' }}>{i + 1}</th>
                        ))}
                        <th style={{ padding: '0.5rem', color: 'var(--pirate-gold)', minWidth: '50px' }}>Tot</th>
                    </tr>
                </thead>
                <tbody>
                    {scores.map(player => (
                        <tr key={player.name} style={{ borderBottom: '1px solid var(--pirate-wood)' }}>
                            <td style={{ padding: '0.5rem', fontWeight: 'bold' }}>{player.name}</td>
                            {player.history.map((roundScore, i) => (
                                <td key={i} style={{ padding: '0.5rem', textAlign: 'center', opacity: 0.8 }}>{roundScore}</td>
                            ))}
                            <td style={{ padding: '0.5rem', textAlign: 'center', color: 'var(--pirate-gold)', fontWeight: 'bold', fontSize: '1.1em' }}>
                                {player.score}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}
