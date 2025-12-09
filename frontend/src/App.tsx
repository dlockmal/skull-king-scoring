import React, { useState } from 'react';
import './App.css';
import { GameSetup } from './components/GameSetup';
import { RoundInput } from './components/RoundInput';
import { Scorecard } from './components/Scorecard';
import { GameGraph } from './components/GameGraph';
import { Leaderboard } from './components/Leaderboard';
import * as api from './api';

interface GameState {
  game_id: string;
  players: string[];
  rounds: any[];
  status: string;
}

class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("Uncaught error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="card" style={{ color: 'red', padding: '2rem', border: '2px solid red' }}>
          <h2>Something went wrong!</h2>
          <p>Please report this to the ship's carpenter.</p>
          <pre style={{ overflow: 'auto', maxHeight: '200px', background: '#333', padding: '1rem' }}>
            {this.state.error?.toString()}
          </pre>
          <button onClick={() => window.location.reload()}>Reload</button>
        </div>
      );
    }

    return this.props.children;
  }
}

function GameContainer() {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentRound, setCurrentRound] = useState(1);
  const [phase, setPhase] = useState<'BID' | 'RESULT' | 'GAME_OVER'>('BID');
  const [loading, setLoading] = useState(false);
  const [currentBids, setCurrentBids] = useState<Record<string, number>>({});
  const [view, setView] = useState<'GAME' | 'LEADERBOARD'>('GAME');

  const handleStartGame = async (players: string[]) => {
    setLoading(true);
    try {

      const game = await api.createGame(players);
      setGameState(game);
      setCurrentRound(1);
      setPhase('BID');
      setCurrentBids({});
      await api.startRound(game.game_id, 1);
    } catch (error) {
      console.error("Failed to start game:", error);
      alert("Failed to start game. Is the backend running?");
    }
    setLoading(false);
  };

  const handleBids = async (bids: Record<string, number>) => {
    if (!gameState) return;
    setLoading(true);
    try {
      await api.submitBids(gameState.game_id, currentRound, bids);
      setCurrentBids(bids);
      setPhase('RESULT');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Failed to submit bids:", error);
    }
    setLoading(false);
  };

  const handleResults = async (results: Record<string, number>) => {
    if (!gameState) return;
    setLoading(true);
    try {
      const updatedGame = await api.submitResults(gameState.game_id, currentRound, results);
      setGameState(updatedGame);

      if (currentRound < 10) {
        const nextRound = currentRound + 1;
        setCurrentRound(nextRound);
        setPhase('BID');
        setCurrentBids({});
        await api.startRound(gameState.game_id, nextRound);
      } else {
        alert("Game Over! Check the final scores!");
        setPhase('GAME_OVER'); // Custom phase for end
      }
    } catch (error) {
      console.error("Failed to submit results:", error);
    }
    setLoading(false);
  };

  // Calculate scores for Scorecard
  const calculateScores = () => {
    if (!gameState) return [];

    try {
      const scores: Record<string, { score: number, history: number[] }> = {};

      // Ensure players exists and is an array
      if (Array.isArray(gameState.players)) {
        gameState.players.forEach(p => scores[p] = { score: 0, history: [] });
      } else {
        console.warn("gameState.players is not an array:", gameState.players);
        return [];
      }

      // Ensure rounds exists and is an array
      if (Array.isArray(gameState.rounds)) {
        gameState.rounds.forEach(r => {
          if (r && r.results) {
            Object.entries(r.results).forEach(([player, res]: [string, any]) => {
              if (scores[player]) {
                scores[player].score += res.round_score;
                scores[player].history.push(res.round_score);
              }
            });
          }
        });
      }

      return Object.entries(scores).map(([name, data]) => ({
        name,
        score: data.score,
        history: data.history
      }));
    } catch (e) {
      console.error("Error calculating scores:", e);
      return [];
    }
  };

  return (
    <>
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
        <button onClick={() => setView('GAME')} style={{ opacity: view === 'GAME' ? 1 : 0.7 }}>Game</button>
        <button onClick={() => setView('LEADERBOARD')} style={{ opacity: view === 'LEADERBOARD' ? 1 : 0.7 }}>Leaderboard</button>
      </div>

      {view === 'LEADERBOARD' ? (
        <Leaderboard />
      ) : (
        <>
          {!gameState ? (
            <GameSetup onStartGame={handleStartGame} />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', width: '100%', maxWidth: '800px' }}>
              {phase !== 'GAME_OVER' && (
                <RoundInput
                  players={gameState.players}
                  roundNum={currentRound}
                  phase={phase}
                  currentBids={currentBids}
                  onSubmit={phase === 'BID' ? handleBids : handleResults}
                />
              )}

              <Scorecard
                scores={calculateScores()}
                currentRound={currentRound}
              />

              <GameGraph
                scores={calculateScores()}
              />

              {phase === 'GAME_OVER' && (
                <div className="card">
                  <h2>Game Over!</h2>
                  <button onClick={() => window.location.reload()}>Start New Game</button>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {loading && <div style={{ position: 'fixed', top: 10, right: 10, color: 'var(--pirate-gold)' }}>Loading...</div>}
    </>
  );
}

function App() {
  return (
    <div className="app-container">
      <h1>Skull King Companion</h1>
      <ErrorBoundary>
        <GameContainer />
      </ErrorBoundary>
    </div>
  );
}

export default App;
