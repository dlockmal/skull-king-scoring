import { useState } from 'react';

interface GameSetupProps {
    onStartGame: (players: string[]) => void;
}

export function GameSetup({ onStartGame }: GameSetupProps) {
    const [players, setPlayers] = useState<string[]>(['', '', '']);

    const handlePlayerChange = (index: number, value: string) => {
        const newPlayers = [...players];
        newPlayers[index] = value;
        setPlayers(newPlayers);
    };

    const addPlayer = () => {
        if (players.length < 6) {
            setPlayers([...players, '']);
        }
    };

    const removePlayer = (index: number) => {
        if (players.length > 2) {
            const newPlayers = players.filter((_, i) => i !== index);
            setPlayers(newPlayers);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const validPlayers = players.filter(p => p.trim() !== '');
        if (validPlayers.length >= 2) {
            onStartGame(validPlayers);
        } else {
            alert("Need at least 2 pirates to play!");
        }
    };

    return (
        <div className="card">
            <h2>Assemble Your Crew</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {players.map((player, index) => (
                    <div key={index} style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                        <span style={{ color: 'var(--pirate-gold)', width: '20px' }}>{index + 1}.</span>
                        <input
                            type="text"
                            placeholder={`Pirate Name`}
                            value={player}
                            onChange={(e) => handlePlayerChange(index, e.target.value)}
                            required
                            style={{ flex: 1 }}
                        />
                        {players.length > 2 && (
                            <button type="button" onClick={() => removePlayer(index)}
                                style={{
                                    padding: '0.5rem',
                                    backgroundColor: 'var(--pirate-wood)',
                                    border: 'none',
                                    minWidth: '40px'
                                }}>
                                X
                            </button>
                        )}
                    </div>
                ))}

                <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexDirection: 'column' }}>
                    {players.length < 6 && (
                        <button type="button" onClick={addPlayer} style={{ backgroundColor: 'var(--pirate-ocean)' }}>
                            + Add Pirate
                        </button>
                    )}
                    <button type="submit" style={{ fontSize: '1.2rem', padding: '1rem' }}>
                        Set Sail!
                    </button>
                </div>
            </form>
        </div>
    );
}
