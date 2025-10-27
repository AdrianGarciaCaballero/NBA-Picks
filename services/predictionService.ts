
import { Team, Game, Prediction } from '../types';
import { teams as allTeams } from '../data/mockData';

const WEIGHTS = {
    RECORD: 0.20,
    FORM: 0.30,
    STATS: 0.25,
    LOCATION: 0.15,
    H2H: 0.10,
};

const getTeamById = (id: string): Team | undefined => allTeams.find(t => t.id === id);

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

const calculateScore = (team: Team, opponent: Team, isHome: boolean, h2hWins: number): number => {
    // 1. Record Score (0-100)
    const recordScore = (team.record.wins / (team.record.wins + team.record.losses)) * 100;

    // 2. Form Score (0-100)
    const formScore = (team.form.filter(r => r === 'W').length / team.form.length) * 100;

    // 3. Stats Score (normalized net rating)
    const teamNetRating = team.stats.ppg - team.stats.oppg;
    const opponentNetRating = opponent.stats.ppg - opponent.stats.oppg;
    // A score of 50 is neutral. Can range from ~0-100.
    const statsScore = 50 + (teamNetRating - opponentNetRating) * 2.5;

    // 4. Location Score (0-100)
    const locationRecord = isHome ? team.homeRecord : team.awayRecord;
    const locationScore = (locationRecord.wins / (locationRecord.wins + locationRecord.losses)) * 100;

    // 5. H2H Score (0-100)
    const h2hScore = (h2hWins / 10) * 100; // Assuming last 10 games

    // Weighted average
    const totalScore = 
        (recordScore * WEIGHTS.RECORD) +
        (formScore * WEIGHTS.FORM) +
        (statsScore * WEIGHTS.STATS) +
        (locationScore * WEIGHTS.LOCATION) +
        (h2hScore * WEIGHTS.H2H);
        
    return totalScore;
};

const getConfidence = (probability: number): 'Low' | 'Medium' | 'High' => {
    if (probability > 65) return 'High';
    if (probability > 55) return 'Medium';
    return 'Low';
};

export const analyzeGame = (game: Game): Prediction | null => {
    const homeTeam = getTeamById(game.homeTeamId);
    const awayTeam = getTeamById(game.awayTeamId);

    if (!homeTeam || !awayTeam) return null;

    const homeScore = calculateScore(homeTeam, awayTeam, true, game.h2h[0]);
    const awayScore = calculateScore(awayTeam, homeTeam, false, game.h2h[1]);

    const totalScore = homeScore + awayScore;
    const homeWinProbability = (homeScore / totalScore) * 100;
    const awayWinProbability = (awayScore / totalScore) * 100;

    const winner = homeWinProbability > awayWinProbability ? homeTeam : awayTeam;
    const winnerProbability = Math.max(homeWinProbability, awayWinProbability);
    const winnerOdds = winner.id === homeTeam.id ? game.odds.moneyline.home : game.odds.moneyline.away;
    const impliedProbability = getImpliedProbability(winnerOdds);
    const value = winnerProbability - impliedProbability;

    // Simplified Spread & Total Logic
    const predictedPointDifference = (homeTeam.stats.ppg - homeTeam.stats.oppg) - (awayTeam.stats.ppg - awayTeam.stats.oppg);
    const spreadPick = predictedPointDifference > -game.odds.spread.line ? `${homeTeam.id} ${game.odds.spread.line > 0 ? '+':''}${game.odds.spread.line}` : `${awayTeam.id} ${-game.odds.spread.line > 0 ? '+':''}${-game.odds.spread.line}`;
    
    // Spread probability based on how much the prediction exceeds the line
    const spreadMargin = Math.abs(predictedPointDifference - (-game.odds.spread.line));
    const spreadProbability = 50 + spreadMargin * 2.5; // Simple heuristic

    const predictedTotal = (homeTeam.stats.ppg + awayTeam.stats.ppg) / 2 + (homeTeam.stats.oppg + awayTeam.stats.oppg) / 2;
    const totalPick = predictedTotal > game.odds.total.line ? 'Over' : 'Under';
    
    const totalMargin = Math.abs(predictedTotal - game.odds.total.line);
    const totalProbability = 50 + totalMargin * 2.0;

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
            confidence: getConfidence(totalProbability),
            value: totalProbability - getImpliedProbability(game.odds.total.over),
        }
    };
};
