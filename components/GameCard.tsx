
import React from 'react';
import { Game, Team } from '../types';
import { Prediction } from '../types';
import ProgressBar from './common/ProgressBar';
import { TrendingUp, CheckCircle, HelpCircle } from 'lucide-react';
import Tooltip from './common/Tooltip';

interface GameCardProps {
    game: Game;
    homeTeam: Team;
    awayTeam: Team;
    prediction: Prediction;
    onDetailsClick: (prediction: Prediction) => void;
}

const GameCard: React.FC<GameCardProps> = ({ game, homeTeam, awayTeam, prediction, onDetailsClick }) => {

    const getProbColor = (prob: number) => {
        if (prob > 65) return 'bg-green-500';
        if (prob > 55) return 'bg-yellow-500';
        return 'bg-red-500';
    };

    const winnerIsHome = prediction.winner.team.id === homeTeam.id;

    return (
        <div className="bg-gray-800 rounded-2xl p-4 shadow-lg border border-gray-700 hover:border-blue-500 transition-all duration-300 flex flex-col justify-between">
            <div>
                <p className="text-xs text-center text-gray-400 mb-2">{game.time}</p>
                <div className="flex justify-between items-center mb-4">
                    <div className="flex flex-col items-center w-1/3 text-center">
                        <span className="text-4xl">{awayTeam.logo}</span>
                        <span className="font-bold text-sm mt-1">{awayTeam.name}</span>
                        <span className="text-xs text-gray-400">{awayTeam.record.wins}-{awayTeam.record.losses}</span>
                    </div>
                    <div className="text-2xl font-bold text-gray-500">@</div>
                    <div className="flex flex-col items-center w-1/3 text-center">
                        <span className="text-4xl">{homeTeam.logo}</span>
                        <span className="font-bold text-sm mt-1">{homeTeam.name}</span>
                        <span className="text-xs text-gray-400">{homeTeam.record.wins}-{homeTeam.record.losses}</span>
                    </div>
                </div>

                <div className="space-y-4 my-4">
                    <div className="text-center">
                        <span className="text-xs font-semibold text-gray-300">WIN PROBABILITY</span>
                        <div className="flex items-center gap-2 mt-1">
                            <span className={`font-bold text-sm ${!winnerIsHome ? 'text-blue-400' : 'text-gray-500'}`}>{prediction.winner.team.id === awayTeam.id ? prediction.winner.probability.toFixed(1) : (100 - prediction.winner.probability).toFixed(1)}%</span>
                            <div className="w-full bg-gray-700 rounded-full h-3">
                                <div
                                    className={`h-3 rounded-full transition-all duration-500 ${winnerIsHome ? 'bg-gradient-to-l' : 'bg-gradient-to-r'} from-blue-500 to-purple-500`}
                                    style={{ width: `${winnerIsHome ? prediction.winner.probability : 100 - prediction.winner.probability}%`, marginLeft: `${winnerIsHome ? `${100-prediction.winner.probability}%` : `0`}` }}
                                ></div>
                            </div>
                            <span className={`font-bold text-sm ${winnerIsHome ? 'text-blue-400' : 'text-gray-500'}`}>{prediction.winner.team.id === homeTeam.id ? prediction.winner.probability.toFixed(1) : (100-prediction.winner.probability).toFixed(1)}%</span>
                        </div>
                    </div>
                    
                    {prediction.winner.value > 2 && (
                        <div className="bg-green-900/50 border border-green-500/50 rounded-lg p-2 flex items-center justify-center gap-2 text-sm">
                            <TrendingUp className="text-green-400" size={18} />
                            <span className="font-semibold text-green-300">Value Bet Found!</span>
                            <span className="text-xs text-green-400">(+{prediction.winner.value.toFixed(1)}%)</span>
                            <Tooltip text={`Our model's probability (${prediction.winner.probability.toFixed(1)}%) is higher than the implied odds probability (${prediction.winner.impliedProbability.toFixed(1)}%).`}>
                               <HelpCircle size={14} className="cursor-pointer text-gray-400" />
                            </Tooltip>
                        </div>
                    )}

                    <div className="flex justify-around text-xs text-center border-t border-gray-700 pt-3">
                        <div>
                            <p className="text-gray-400">Spread</p>
                            <p className="font-bold">{prediction.spread.pick}</p>
                        </div>
                         <div>
                            <p className="text-gray-400">Total</p>
                            <p className="font-bold">{prediction.total.pick} {prediction.total.line}</p>
                        </div>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onDetailsClick(prediction)}
                className="w-full mt-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg transition-colors"
            >
                View Full Analysis
            </button>
        </div>
    );
};

export default GameCard;
