
export interface Team {
    id: string;
    name: string;
    logo: string;
    record: { wins: number; losses: number };
    stats: {
        ppg: number; // Points per game
        oppg: number; // Opponent points per game
    };
    form: ('W' | 'L')[]; // Last 5 games
    homeRecord: { wins: number; losses: number };
    awayRecord: { wins: number; losses: number };
}

export interface Game {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    time: string;
    odds: {
        moneyline: { home: number; away: number };
        spread: { line: number; home: number; away: number };
        total: { line: number; over: number; under: number };
    };
    h2h: [number, number]; // [homeTeamWins, awayTeamWins] in last 10 games
}

export interface Prediction {
    game: Game;
    homeTeam: Team;
    awayTeam: Team;
    winner: {
        team: Team;
        probability: number;
        impliedProbability: number;
        value: number;
        confidence: 'Low' | 'Medium' | 'High';
    };
    spread: {
        pick: string; // e.g. 'Lakers -5.5'
        probability: number;
        confidence: 'Low' | 'Medium' | 'High';
        value: number;
    };
    total: {
        pick: 'Over' | 'Under';
        line: number;
        probability: number;
        confidence: 'Low' | 'Medium' | 'High';
        value: number;
    };
}

export type PickType = 'moneyline' | 'spread' | 'total';
