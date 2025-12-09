import { useState, useEffect } from 'react';

interface RoundInputProps {
    players: string[];
    roundNum: number;
    phase: 'BID' | 'RESULT';
    currentBids?: Record<string, number>;
    onSubmit: (data: Record<string, any>) => void;
}

export function RoundInput({ players, roundNum, phase, currentBids, onSubmit }: RoundInputProps) {
    const [inputs, setInputs] = useState<Record<string, string>>({});
    const [bonuses, setBonuses] = useState<Record<string, Record<string, number>>>({});

    // Reset inputs when phase or round changes
    useEffect(() => {
        setInputs({});
        setBonuses({});
    }, [phase, roundNum]);

    const handleInputChange = (player: string, value: string) => {
        setInputs(prev => ({ ...prev, [player]: value }));
    };

    const handleBonusChange = (player: string, type: string, value: number) => {
        setBonuses(prev => {
            const currentVal = prev[player]?.[type] || 0;
            // Cycle logic: 0 -> value -> 2*value ... 
            // Actually, value passed here is the base score (e.g. 30).
            // We want to track COUNT, but the existing structure tracks SCORE.
            // Let's change the logic to interpret 'value' as the increment step, or better yet,
            // let's just use the current score to derive the count and increment it.

            // Wait, the previous logic was: onClick={() => handleBonusChange(player, 'pirate', bonuses[player]?.pirate ? 0 : 30)}
            // It was toggling between 0 and 30.

            // New logic for Pirate (30): 0 -> 30 -> 60 -> 90 -> 120 -> 150 -> 0 (Max 5 pirates)
            // New logic for Mermaid (20): 0 -> 20 -> 40 -> 0 (Max 2 mermaids)
            // Others toggle as before? The prompt only mentioned Pirates/Mermaids. 
            // "There are instances where a player can capture multiple pirates... multiples that could be captured in a single hand."

            let nextVal = value; // Default behavior for non-cycle items

            if (type === 'pirate') {
                const currentScore = currentVal;
                const count = currentScore / 30;
                const nextCount = (count + 1) % 6; // 0 to 5
                nextVal = nextCount * 30;
            } else if (type === 'mermaid') {
                const currentScore = currentVal;
                const count = currentScore / 20;
                const nextCount = (count + 1) % 3; // 0 to 2
                nextVal = nextCount * 20;
            } else {
                // For others, keep toggle behavior (passed value is what we want to set, but let's check input)
                // Original call: handleBonusChange(player, 'loot', bonuses[player]?.loot ? 0 : 10)
                // So 'value' is already the target value (0 or 10). We can just use it.
            }

            return {
                ...prev,
                [player]: {
                    ...(prev[player] || {}),
                    [type]: nextVal
                }
            };
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const numericData: Record<string, any> = {};
        let isValid = true;

        players.forEach(player => {
            const val = parseInt(inputs[player]);
            if (isNaN(val) || val < 0) {
                isValid = false;
            }

            if (phase === 'RESULT') {
                numericData[player] = {
                    tricks_won: val,
                    bonus: (bonuses[player]?.pirate || 0) +
                        (bonuses[player]?.mermaid || 0) +
                        (bonuses[player]?.skull_king || 0) +
                        (bonuses[player]?.loot || 0) +
                        (bonuses[player]?.rascal || 0),
                    penalty: 0
                };
            } else {
                numericData[player] = val;
            }
        });

        if (!isValid) {
            alert("Please enter valid numbers for all pirates!");
            return;
        }

        if (phase === 'RESULT') {
            const totalTricks = Object.values(numericData).reduce((a, b) => a + b.tricks_won, 0);
            if (totalTricks !== roundNum) {
                alert(`Total tricks won must equal ${roundNum}! Currently: ${totalTricks}`);
                return;
            }
        }

        onSubmit(numericData);
    };

    return (
        <div className="card">
            <h2>Round {roundNum}: {phase === 'BID' ? 'Place Your Bets!' : 'Report Results!'}</h2>
            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
                {players.map(player => (
                    <div key={player} style={{
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '0.5rem',
                        padding: '1rem',
                        backgroundColor: 'rgba(0,0,0,0.2)',
                        borderRadius: '8px',
                        border: '1px solid var(--pirate-wood)'
                    }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <label style={{ color: 'var(--pirate-gold)', fontSize: '1.2rem' }}>{player}</label>
                            {phase === 'RESULT' && currentBids && (
                                <span style={{ color: 'var(--pirate-parchment)', opacity: 0.8 }}>
                                    Bid: {currentBids[player]}
                                </span>
                            )}
                        </div>

                        <input
                            type="number"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            min="0"
                            max={phase === 'RESULT' ? roundNum : 10}
                            placeholder={phase === 'BID' ? "Bid" : "Tricks Won"}
                            value={inputs[player] || ''}
                            onChange={(e) => handleInputChange(player, e.target.value)}
                            required
                        />

                        {phase === 'RESULT' && (
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem', marginTop: '0.5rem' }}>
                                <button type="button"
                                    style={{ fontSize: '0.8rem', padding: '0.3rem', background: bonuses[player]?.pirate ? 'var(--pirate-gold)' : '#333' }}
                                    onClick={() => handleBonusChange(player, 'pirate', 30)}>
                                    ☠️ {bonuses[player]?.pirate ? `${bonuses[player].pirate / 30} Pirates (+${bonuses[player].pirate})` : 'Pirate (+30)'}
                                </button>
                                <button type="button"
                                    style={{ fontSize: '0.8rem', padding: '0.3rem', background: bonuses[player]?.mermaid ? 'var(--pirate-gold)' : '#333' }}
                                    onClick={() => handleBonusChange(player, 'mermaid', 20)}>
                                    🧜‍♀️ {bonuses[player]?.mermaid ? `${bonuses[player].mermaid / 20} Mermaids (+${bonuses[player].mermaid})` : 'Mermaid (+20)'}
                                </button>
                                <button type="button"
                                    style={{ fontSize: '0.8rem', padding: '0.3rem', background: bonuses[player]?.skull_king ? 'var(--pirate-gold)' : '#333' }}
                                    onClick={() => handleBonusChange(player, 'skull_king', bonuses[player]?.skull_king ? 0 : 50)}>
                                    👑 Skull King (+50)
                                </button>
                                <button type="button"
                                    style={{ fontSize: '0.8rem', padding: '0.3rem', background: bonuses[player]?.loot ? 'var(--pirate-gold)' : '#333' }}
                                    onClick={() => handleBonusChange(player, 'loot', bonuses[player]?.loot ? 0 : 10)}>
                                    💰 Loot (+10)
                                </button>
                                <button type="button"
                                    style={{ fontSize: '0.8rem', padding: '0.3rem', background: bonuses[player]?.rascal ? 'var(--pirate-red)' : '#333', gridColumn: '1 / -1' }}
                                    onClick={() => handleBonusChange(player, 'rascal', bonuses[player]?.rascal ? 0 : -5)}>
                                    🃏 Rascal/14 (-5)
                                </button>
                            </div>
                        )}
                    </div>
                ))}
                <button type="submit" style={{ marginTop: '1rem' }}>
                    {phase === 'BID' ? 'Lock in Bids' : 'Submit Results'}
                </button>
            </form>
        </div>
    );
}
