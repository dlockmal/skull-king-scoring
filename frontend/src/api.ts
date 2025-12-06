const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export async function createGame(players: string[]) {
    const response = await fetch(`${API_BASE}/games/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ players }),
    });
    return response.json();
}

export async function startRound(gameId: string, roundNum: number) {
    const response = await fetch(`${API_BASE}/games/${gameId}/rounds/${roundNum}/start`, {
        method: 'POST',
    });
    return response.json();
}

export async function submitBids(gameId: string, roundNum: number, bids: Record<string, number>) {
    const response = await fetch(`${API_BASE}/games/${gameId}/rounds/${roundNum}/bids`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bids),
    });
    return response.json();
}

export async function submitResults(gameId: string, roundNum: number, results: Record<string, any>) {
    // results is now { player: { tricks_won: int, bonus: int, penalty: int } }
    // We can pass it directly if the backend expects this format.
    // The backend expects { "PlayerName": { "tricks_won": 1, "bonus_points": 0, ... } }
    // Our RoundInput sends "bonus", backend might expect "bonus_points".
    // Let's check backend model. RoundResult has bonus_points.
    // RoundInput sends "bonus". We need to map it.

    const formattedResults: Record<string, any> = {};
    for (const [player, data] of Object.entries(results)) {
        if (typeof data === 'object') {
            formattedResults[player] = {
                tricks_won: data.tricks_won,
                bonus_points: data.bonus || 0,
                penalty_points: data.penalty || 0
            };
        } else {
            // Fallback for simple int input (legacy)
            formattedResults[player] = {
                tricks_won: data,
                bonus_points: 0,
                penalty_points: 0
            };
        }
    }

    const response = await fetch(`${API_BASE}/games/${gameId}/rounds/${roundNum}/results`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedResults),
    });
    return response.json();
}

export async function getGame(gameId: string) {
    const response = await fetch(`${API_BASE}/games/${gameId}`);
    return response.json();
}
