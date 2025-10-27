
import React, { useState, useMemo } from 'react';
import { games as mockGames } from '../data/mockData';
import { teams as allTeams } from '../data/mockData';
import { analyzeGame } from '../services/predictionService';
import { Prediction } from '../types';
import GameCard from './GameCard';
import GameDetailModal from './GameDetailModal';

const GameList: React.FC = () => {
    const [selectedPrediction, setSelectedPrediction] = useState<Prediction | null>(null);

    const predictions = useMemo(() => {
        return mockGames.map(game => analyzeGame(game)).filter(p => p !== null) as Prediction[];
    }, []);

    const handleDetailsClick = (prediction: Prediction) => {
        setSelectedPrediction(prediction);
    };

    const handleCloseModal = () => {
        setSelectedPrediction(null);
    };

    return (
        <div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {predictions.map(prediction => (
                    <GameCard
                        key={prediction.game.id}
                        game={prediction.game}
                        homeTeam={prediction.homeTeam}
                        awayTeam={prediction.awayTeam}
                        prediction={prediction}
                        onDetailsClick={handleDetailsClick}
                    />
                ))}
            </div>
            {selectedPrediction && <GameDetailModal prediction={selectedPrediction} onClose={handleCloseModal} />}
        </div>
    );
};

export default GameList;
