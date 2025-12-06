interface GameGraphProps {
    scores: { name: string; history: number[] }[];
}

export function GameGraph({ scores }: GameGraphProps) {
    // Simple SVG Line Chart
    const width = 600;
    const height = 300;
    const padding = 40;
    const rounds = 10;

    // Calculate scales
    // Calculate scales
    const maxScore = Math.max(
        ...scores.flatMap(s => {
            let sum = 0;
            return s.history.map(val => {
                sum += val;
                return sum;
            });
        }),
        100 // Minimum max for scale
    );
    const minScore = Math.min(
        ...scores.flatMap(s => {
            let sum = 0;
            return s.history.map(val => {
                sum += val;
                return sum;
            });
        }),
        0
    );

    const scoreRange = maxScore - minScore || 100;

    const getX = (round: number) => padding + (round / rounds) * (width - 2 * padding);
    const getY = (score: number) => height - padding - ((score - minScore) / scoreRange) * (height - 2 * padding);

    // Colors for lines
    const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#00ffff', '#ff00ff'];

    return (
        <div className="card" style={{ width: '100%', overflowX: 'auto' }}>
            <h2>Voyage Progress</h2>
            <svg width="100%" height="100%" viewBox={`0 0 ${width} ${height}`} style={{ minWidth: '300px' }}>
                {/* Grid lines */}
                {Array.from({ length: 5 }).map((_, i) => {
                    const y = padding + (i / 4) * (height - 2 * padding);
                    return <line key={i} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#444" strokeWidth="1" />;
                })}

                {/* X Axis Labels */}
                {Array.from({ length: rounds + 1 }).map((_, i) => (
                    <text key={i} x={getX(i)} y={height - 10} fill="var(--pirate-parchment)" fontSize="10" textAnchor="middle">
                        {i}
                    </text>
                ))}

                {/* Player Lines */}
                {scores.map((player, idx) => {
                    // Calculate cumulative scores
                    let cumulative = 0;
                    const points = [[0, 0], ...player.history.map((s, i) => [i + 1, s])].map(([r, s]) => {
                        if (r !== 0) cumulative += s;
                        return [r, cumulative];
                    });

                    const pathD = points.map(([r, s], i) =>
                        `${i === 0 ? 'M' : 'L'} ${getX(r)} ${getY(s)}`
                    ).join(' ');

                    return (
                        <g key={player.name}>
                            <path d={pathD} fill="none" stroke={colors[idx % colors.length]} strokeWidth="3" />
                            {points.map(([r, s], i) => (
                                <circle key={i} cx={getX(r)} cy={getY(s)} r="3" fill={colors[idx % colors.length]} />
                            ))}
                        </g>
                    );
                })}
            </svg>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem', justifyContent: 'center' }}>
                {scores.map((player, idx) => (
                    <div key={player.name} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{ width: '12px', height: '12px', backgroundColor: colors[idx % colors.length], borderRadius: '50%' }} />
                        <span style={{ color: 'var(--pirate-parchment)' }}>{player.name}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
