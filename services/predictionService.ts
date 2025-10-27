
import { Team, Game, Prediction } from '../types';

const WEIGHTS = {
    RECORD: 0.70, // Win % is the most reliable stat we have from the API
    LOCATION: 0.30, // Static home court advantage
};

export const americanToDecimal = (odds: number): number => {
    if (odds >= 100) {
        return (odds / 100) + 1;
    }
    return (100 / Math.abs(odds)) + 1;
};

export const decimalToImpliedProbability = (decimal: number): number => {
    return (1 / decimal) * 100;
};

export const getImpliedProbability = (americanOdds: number): number => {
    return decimalToImpliedProbability(americanToDecimal(americanOdds));
};

const calculateScore = (team: Team, isHome: boolean): number => {
    // 1. Record Score (0-100) based on win percentage
    const totalGames = team.record.wins + team.record.losses;
    const recordScore = totalGames > 0 ? (team.record.wins / totalGames) * 100 : 50; // Default to 50 if no games played (early season)

    // 2. Location Score (0-100) - Simple static bonus for home team
    const locationScore = isHome ? 65 : 35;

    // Weighted average
    const totalScore = 
        (recordScore * WEIGHTS.RECORD) +
        (locationScore * WEIGHTS.LOCATION);
        
    return totalScore;
};

const getConfidence = (probability: number): 'Low' | 'Medium' | 'High' => {
    if (probability > 65) return 'High';
    if (probability > 55) return 'Medium';
    return 'Low';
};

export const analyzeGame = (game: Game, homeTeam: Team, awayTeam: Team): Prediction | null => {
    if (!homeTeam || !awayTeam) return null;

    const homeScore = calculateScore(homeTeam, true);
    const awayScore = calculateScore(awayTeam, false);

    const totalScore = homeScore + awayScore;
    const homeWinProbability = (homeScore / totalScore) * 100;
    const awayWinProbability = (awayScore / totalScore) * 100;

    const winner = homeWinProbability > awayWinProbability ? homeTeam : awayTeam;
    const winnerProbability = Math.max(homeWinProbability, awayWinProbability);
    const winnerOdds = winner.id === homeTeam.id ? game.odds.moneyline.home : game.odds.moneyline.away;
    const impliedProbability = getImpliedProbability(winnerOdds);
    const value = winnerProbability - impliedProbability;

    // Simplified Spread & Total Logic based on available data
    const homeWinPct = homeTeam.record.wins / (homeTeam.record.wins + homeTeam.record.losses || 1);
    const awayWinPct = awayTeam.record.wins / (awayTeam.record.wins + awayTeam.record.losses || 1);
    // Heuristic: map win % difference to point spread. e.g., 10% diff = ~4 points
    const predictedPointDifference = (homeWinPct - awayWinPct) * 40; 
    
    const spreadPickValue = game.odds.spread.line > 0 ? `+${game.odds.spread.line}` : `${game.odds.spread.line}`;
    const awaySpreadPickValue = -game.odds.spread.line > 0 ? `+${-game.odds.spread.line}` : `${-game.odds.spread.line}`;
    const spreadPick = predictedPointDifference > -game.odds.spread.line ? `${homeTeam.id} ${spreadPickValue}` : `${awayTeam.id} ${awaySpreadPickValue}`;
    
    const spreadMargin = Math.abs(predictedPointDifference - (-game.odds.spread.line));
    const spreadProbability = 50 + spreadMargin * 1.5; // Adjusted heuristic multiplier

    // Total prediction is hard without PPG stats. We'll base it weakly on the odds provided.
    const totalPick = game.odds.total.over < game.odds.total.under ? 'Over' : 'Under';
    const totalProbability = 51.5; // Barely an edge, reflecting low confidence in this pick.

    return {
        game,
        homeTeam,
        awayTeam,
        winner: {
            team: winner,
            probability: winnerProbability,
            impliedProbability,
            value,
            confidence: getConfidence(winnerProbability),
        },
        spread: {
            pick: spreadPick,
            probability: spreadProbability,
            confidence: getConfidence(spreadProbability),
            value: spreadProbability - getImpliedProbability(game.odds.spread.home),
        },
        total: {
            pick: totalPick,
            line: game.odds.total.line,
            probability: totalProbability,
            confidence: 'Low',
            value: totalProbability - getImpliedProbability(game.odds.total.over),
        }
    };
};
