
export interface Team {
    id: string;
    name: string;
    logo: string;
    record: { wins: number; losses: number };
}

export interface Game {
    id: string;
    homeTeamId: string;
    awayTeamId: string;
    time: string;
    status: 'STATUS_SCHEDULED' | 'STATUS_IN_PROGRESS' | 'STATUS_FINAL' | string;
    odds: {
        moneyline: { home: number; away: number };
        spread: { line: number; home: number; away: number };
        total: { line: number; over: number; under: number };
    };
    h2h: [number, number]; // Note: This is defaulted to neutral as it's not in the live API
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
        pick: string; 
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
