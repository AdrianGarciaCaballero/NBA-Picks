
import React, { useMemo } from 'react';
import { Prediction, PickType } from '../types';
import { TrendingUp, Star, Layers } from 'lucide-react';

interface DashboardProps {
  setActiveTab: (tab: 'games' | 'calculator') => void;
  predictions: Prediction[];
}

const PickCard: React.FC<{ prediction: Prediction; type: PickType }> = ({ prediction, type }) => {
    let pick, probability, value, confidence;

    switch (type) {
        case 'moneyline':
            pick = `${prediction.winner.team.name} ML`;
            probability = prediction.winner.probability;
            value = prediction.winner.value;
            confidence = prediction.winner.confidence;
            break;
        case 'spread':
            pick = prediction.spread.pick;
            probability = prediction.spread.probability;
            value = prediction.spread.value;
            confidence = prediction.spread.confidence;
            break;
        case 'total':
            pick = `${prediction.total.pick} ${prediction.total.line}`;
            probability = prediction.total.probability;
            value = prediction.total.value;
            confidence = prediction.total.confidence;
            break;
    }
    
    const confidenceColors = {
        Low: 'border-red-500/50 text-red-300',
        Medium: 'border-yellow-500/50 text-yellow-300',
        High: 'border-green-500/50 text-green-300',
    };

    return (
        <div className="bg-gray-800/70 p-3 rounded-lg border border-gray-700 hover:bg-gray-800 transition-all">
            <div className="flex justify-between items-start">
                <div>
                    <p className="font-bold text-white">{pick}</p>
                    <p className="text-xs text-gray-400">{prediction.awayTeam.name} @ {prediction.homeTeam.name}</p>
                </div>
                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${confidenceColors[confidence]}`}>{confidence}</span>
            </div>
            <div className="flex justify-between items-center mt-2 text-xs">
                <span className="text-gray-300">Prob: <span className="font-bold text-blue-400">{probability.toFixed(1)}%</span></span>
                {value > 2 && <span className="text-green-400 font-bold flex items-center gap-1"><TrendingUp size={14}/> Value</span>}
            </div>
        </div>
    );
};

const Dashboard: React.FC<DashboardProps> = ({ setActiveTab, predictions }) => {

    const topMoneyline = useMemo(() => [...predictions].sort((a, b) => b.winner.probability - a.winner.probability), [predictions]);
    const topValue = useMemo(() => [...predictions].filter(p => p.winner.value > 2).sort((a, b) => b.winner.value - a.winner.value), [predictions]);
    const topParlay = useMemo(() => [...predictions].sort((a, b) => b.winner.probability - a.winner.probability).slice(0, 3), [predictions]);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Top Picks */}
                <div className="lg:col-span-2 bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                    <h2 className="text-2xl font-bold mb-4 text-white flex items-center gap-2"><Star className="text-yellow-400"/> Top Picks of the Day</h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <h3 className="font-semibold mb-2 text-gray-300">Moneyline</h3>
                            <div className="space-y-2">
                                {topMoneyline.slice(0, 3).map(p => <PickCard key={p.game.id} prediction={p} type="moneyline" />)}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-gray-300">Spread</h3>
                            <div className="space-y-2">
                                {[...predictions].sort((a, b) => b.spread.probability - a.spread.probability).slice(0, 3).map(p => <PickCard key={p.game.id} prediction={p} type="spread" />)}
                            </div>
                        </div>
                        <div>
                            <h3 className="font-semibold mb-2 text-gray-300">Totals</h3>
                            <div className="space-y-2">
                                {[...predictions].sort((a, b) => b.total.probability - a.total.probability).slice(0, 3).map(p => <PickCard key={p.game.id} prediction={p} type="total" />)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Best Value & Parlay */}
                <div className="space-y-6">
                    <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-3 text-white flex items-center gap-2"><TrendingUp className="text-green-400"/> Best Value Bets</h2>
                        <div className="space-y-2">
                            {topValue.length > 0 ? topValue.slice(0, 3).map(p => <PickCard key={p.game.id} prediction={p} type="moneyline" />) : <p className="text-sm text-gray-400">No significant value bets found today.</p>}
                        </div>
                    </div>
                     <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                        <h2 className="text-xl font-bold mb-3 text-white flex items-center gap-2"><Layers className="text-purple-400"/> Parlay Suggestion</h2>
                        <div className="space-y-2">
                            {topParlay.map(p => <PickCard key={p.game.id} prediction={p} type="moneyline" />)}
                        </div>
                         <button onClick={() => setActiveTab('calculator')} className="mt-4 w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg transition-colors text-sm">
                            Calculate Parlay Payout
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
