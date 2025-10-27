import React from 'react';
import { Prediction, Team } from '../types';
import ProgressBar from './common/ProgressBar';
import { X, TrendingUp } from 'lucide-react';

interface GameDetailModalProps {
    prediction: Prediction;
    onClose: () => void;
}

const StatRow: React.FC<{ label: string; awayValue: string | number; homeValue: string | number; highlight?: 'home' | 'away' | 'none' }> = ({ label, awayValue, homeValue, highlight = 'none' }) => (
    <div className="flex justify-between items-center py-2 border-b border-gray-700">
        <span className={`font-bold w-1/4 text-right pr-4 ${highlight === 'away' ? 'text-blue-400' : 'text-gray-300'}`}>{awayValue}</span>
        <span className="text-gray-400 text-sm text-center w-1/2">{label}</span>
        <span className={`font-bold w-1/4 text-left pl-4 ${highlight === 'home' ? 'text-blue-400' : 'text-gray-300'}`}>{homeValue}</span>
    </div>
);

const ConfidenceBadge: React.FC<{ confidence: 'Low' | 'Medium' | 'High' }> = ({ confidence }) => {
    const colors = {
        Low: 'bg-red-500/20 text-red-400 border-red-500/30',
        Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        High: 'bg-green-500/20 text-green-400 border-green-500/30',
    };
    return <span className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${colors[confidence]}`}>{confidence}</span>;
}

const GameDetailModal: React.FC<GameDetailModalProps> = ({ prediction, onClose }) => {
    const { game, homeTeam, awayTeam } = prediction;
    // FIX: The `stats` property does not exist on the Team type. The API does not provide this data.
    // const homeNetRating = (homeTeam.stats.ppg - homeTeam.stats.oppg).toFixed(1);
    // const awayNetRating = (awayTeam.stats.ppg - awayTeam.stats.oppg).toFixed(1);

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex justify-center items-center z-50 p-4" onClick={onClose}>
            <div className="bg-gray-800 rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-gray-600" onClick={(e) => e.stopPropagation()}>
                <div className="sticky top-0 bg-gray-800 p-4 border-b border-gray-700 flex justify-between items-center z-10">
                    <h2 className="text-xl font-bold text-white">{awayTeam.name} @ {homeTeam.name}</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-6 space-y-6">
                    {/* Main Prediction */}
                    <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                        <h3 className="text-lg font-semibold text-center mb-4 text-blue-400">Prediction Summary</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                            <div className="bg-gray-800 p-3 rounded-md">
                                <p className="text-sm text-gray-400">Moneyline Pick</p>
                                <p className="font-bold text-lg">{prediction.winner.team.name}</p>
                                <ConfidenceBadge confidence={prediction.winner.confidence} />
                                {prediction.winner.value > 2 && <p className="text-green-400 text-xs mt-1 flex items-center justify-center gap-1"><TrendingUp size={14}/> Value</p>}
                            </div>
                            <div className="bg-gray-800 p-3 rounded-md">
                                <p className="text-sm text-gray-400">Spread Pick</p>
                                <p className="font-bold text-lg">{prediction.spread.pick}</p>
                                <ConfidenceBadge confidence={prediction.spread.confidence} />
                            </div>
                            <div className="bg-gray-800 p-3 rounded-md">
                                <p className="text-sm text-gray-400">Total Pick</p>
                                <p className="font-bold text-lg">{prediction.total.pick} {prediction.total.line}</p>
                                <ConfidenceBadge confidence={prediction.total.confidence} />
                            </div>
                        </div>
                    </div>

                    {/* Probability Breakdown */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Probability Analysis</h3>
                        <div className="space-y-2">
                             <div className="flex items-center gap-4">
                                <span className="w-40 text-sm text-gray-400">Our Prediction</span>
                                <ProgressBar value={prediction.winner.probability} colorClass="bg-green-500" />
                                <span className="w-16 text-right font-semibold">{prediction.winner.probability.toFixed(1)}%</span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="w-40 text-sm text-gray-400">Implied Odds</span>
                                <ProgressBar value={prediction.winner.impliedProbability} colorClass="bg-yellow-500" />
                                <span className="w-16 text-right font-semibold">{prediction.winner.impliedProbability.toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>
                    
                    {/* Stat Comparison */}
                    <div>
                        <h3 className="text-lg font-semibold mb-2">Statistical Comparison</h3>
                        <div className="bg-gray-900/50 p-4 rounded-lg border border-gray-700">
                            <StatRow label="Record" awayValue={`${awayTeam.record.wins}-${awayTeam.record.losses}`} homeValue={`${homeTeam.record.wins}-${homeTeam.record.losses}`} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default GameDetailModal;