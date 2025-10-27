
import React, { useState, useEffect, useMemo } from 'react';
import { Game, Team } from '../types';
import { analyzeGame } from '../services/predictionService';
import { americanToDecimal } from '../services/predictionService';
import { Trash2, PlusCircle, AlertTriangle } from 'lucide-react';
import ProgressBar from './common/ProgressBar';

interface ParlayLeg {
    id: number;
    description: string;
    odds: number;
}

interface CalculatorProps {
    allTeams: Team[];
}

const Calculator: React.FC<CalculatorProps> = ({ allTeams }) => {
    const [teamAId, setTeamAId] = useState<string>(allTeams.length > 0 ? allTeams[0].id : '');
    const [teamBId, setTeamBId] = useState<string>(allTeams.length > 1 ? allTeams[1].id : '');
    const [prediction, setPrediction] = useState<any | null>(null);
    
    const [parlayLegs, setParlayLegs] = useState<ParlayLeg[]>([]);
    const [parlayOdds, setParlayOdds] = useState<number>(110);
    const [parlayDescription, setParlayDescription] = useState('');
    const [wager, setWager] = useState<number>(10);
    const [parlayResult, setParlayResult] = useState({ totalOdds: 0, payout: 0, decimalOdds: 0 });

    const teamsMap = useMemo(() => {
        const map = new Map<string, Team>();
        allTeams.forEach(team => map.set(team.id, team));
        return map;
    }, [allTeams]);


    useEffect(() => {
        // Ensure dropdowns are set if allTeams loads after initial render
        if (!teamAId && allTeams.length > 0) setTeamAId(allTeams[0].id);
        if (!teamBId && allTeams.length > 1) setTeamBId(allTeams[1].id);

        if (teamAId && teamBId && teamAId !== teamBId) {
            // We can't get live records for teams not playing today,
            // so we'll create dummy teams for the calculator's prediction logic.
            // The main purpose here is to demonstrate the calculation, not to be 100% accurate.
            const dummyTeamA: Team = teamsMap.get(teamAId) || { id: 'A', name: 'Team A', logo: '🏀', record: { wins: 25, losses: 15 }};
            const dummyTeamB: Team = teamsMap.get(teamBId) || { id: 'B', name: 'Team B', logo: '🏀', record: { wins: 20, losses: 20 }};
            
            const dummyGame: Game = {
                id: 'CALC_GAME',
                homeTeamId: teamAId,
                awayTeamId: teamBId,
                time: 'Custom',
                status: 'STATUS_SCHEDULED',
                odds: { 
                    moneyline: { home: -150, away: 130 },
                    spread: { line: -3.5, home: -110, away: -110 },
                    total: { line: 220, over: -110, under: -110 },
                },
                h2h: [5, 5] // Neutral H2H
            };
            const analysis = analyzeGame(dummyGame, dummyTeamA, dummyTeamB);
            setPrediction(analysis);
        } else {
            setPrediction(null);
        }
    }, [teamAId, teamBId, allTeams, teamsMap]);
    
    useEffect(() => {
        if (parlayLegs.length > 0) {
            const totalDecimalOdds = parlayLegs.reduce((acc, leg) => acc * americanToDecimal(leg.odds), 1);
            let totalAmericanOdds;
            if (totalDecimalOdds >= 2) {
                totalAmericanOdds = (totalDecimalOdds - 1) * 100;
            } else {
                totalAmericanOdds = -100 / (totalDecimalOdds - 1);
            }
            const payout = wager * totalDecimalOdds;
            setParlayResult({ totalOdds: Math.round(totalAmericanOdds), payout, decimalOdds: totalDecimalOdds });
        } else {
             setParlayResult({ totalOdds: 0, payout: 0, decimalOdds: 0 });
        }
    }, [parlayLegs, wager]);


    const handleAddLeg = () => {
        if(parlayDescription.trim() === '' || isNaN(parlayOdds)) return;
        setParlayLegs([...parlayLegs, {id: Date.now(), description: parlayDescription, odds: parlayOdds}]);
        setParlayDescription('');
        setParlayOdds(110);
    }
    
    const handleRemoveLeg = (id: number) => {
        setParlayLegs(parlayLegs.filter(leg => leg.id !== id));
    }

    const availableTeamsForB = allTeams.filter(t => t.id !== teamAId);
    const availableTeamsForA = allTeams.filter(t => t.id !== teamBId);

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Probability Calculator */}
            <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-white">Matchup Simulator</h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Team A (Home)</label>
                        <select value={teamAId} onChange={(e) => setTeamAId(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            {availableTeamsForA.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Team B (Away)</label>
                        <select value={teamBId} onChange={(e) => setTeamBId(e.target.value)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none">
                            {availableTeamsForB.map(team => <option key={team.id} value={team.id}>{team.name}</option>)}
                        </select>
                    </div>
                </div>

                {prediction && (
                    <div className="bg-gray-900/50 p-4 rounded-lg my-4 border border-gray-700">
                        <h3 className="text-lg font-semibold mb-2 text-center">{prediction.homeTeam.name} vs {prediction.awayTeam.name}</h3>
                        <ProgressBar value={prediction.winner.probability} colorClass="bg-blue-500" label={`Predicted Winner: ${prediction.winner.team.name}`} />
                        <p className="text-center mt-2 font-bold text-2xl">{prediction.winner.probability.toFixed(1)}%</p>
                    </div>
                )}
                
                {teamAId === teamBId && 
                  <div className="text-yellow-400 bg-yellow-900/50 border border-yellow-500/30 p-3 rounded-md text-sm flex items-center gap-2">
                    <AlertTriangle size={18}/> Please select two different teams.
                  </div>
                }

            </div>
            {/* Parlay Calculator */}
             <div className="bg-gray-800 p-6 rounded-2xl shadow-lg border border-gray-700">
                <h2 className="text-2xl font-bold mb-4 text-white">Parlay Payout Calculator</h2>
                <div className="space-y-3 mb-4 max-h-40 overflow-y-auto pr-2">
                    {parlayLegs.map(leg => (
                        <div key={leg.id} className="flex items-center justify-between bg-gray-700 p-2 rounded-md">
                            <span className="text-sm">{leg.description}</span>
                            <div className="flex items-center gap-3">
                                <span className={`font-bold text-sm ${leg.odds > 0 ? 'text-green-400' : 'text-red-400'}`}>{leg.odds > 0 ? '+' : ''}{leg.odds}</span>
                                <button onClick={() => handleRemoveLeg(leg.id)} className="text-gray-400 hover:text-red-500"><Trash2 size={16}/></button>
                            </div>
                        </div>
                    ))}
                </div>
                 <div className="flex items-end gap-2 mb-4">
                    <div className="flex-grow">
                        <label className="block text-xs font-medium text-gray-400 mb-1">Pick Description</label>
                        <input type="text" value={parlayDescription} onChange={e => setParlayDescription(e.target.value)} placeholder="e.g., Lakers ML" className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"/>
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-400 mb-1">Odds</label>
                        <input type="number" step="1" value={parlayOdds} onChange={e => setParlayOdds(parseInt(e.target.value))} className="w-24 bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none text-sm"/>
                    </div>
                    <button onClick={handleAddLeg} className="p-2 bg-blue-600 hover:bg-blue-700 rounded-md text-white"><PlusCircle size={20}/></button>
                </div>
                 <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Wager ($)</label>
                    <input type="number" min="0" value={wager} onChange={e => setWager(parseFloat(e.target.value) || 0)} className="w-full bg-gray-700 text-white rounded-md p-2 border border-gray-600 focus:ring-2 focus:ring-blue-500 focus:outline-none"/>
                </div>
                 <div className="mt-4 bg-gray-900/50 p-4 rounded-lg border border-gray-700 text-center">
                    <p className="text-gray-400 text-sm">Total Odds</p>
                    <p className="text-2xl font-bold text-purple-400">{parlayResult.totalOdds > 0 ? '+' : ''}{parlayResult.totalOdds || '...'}</p>
                    <p className="text-gray-400 text-sm mt-2">Potential Payout</p>
                    <p className="text-3xl font-extrabold text-green-400">${(parlayResult.payout || 0).toFixed(2)}</p>
                </div>

            </div>
        </div>
    );
};

export default Calculator;
