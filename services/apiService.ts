import { Game, Team } from '../types';

// CORS Proxy to bypass browser restrictions on client-side requests.
const PROXY_URL = 'https://api.allorigins.win/raw?url=';

// Interface for the transformed data that includes teams directly
export interface LiveGameData {
    game: Game;
    homeTeam: Team;
    awayTeam: Team;
}

/**
 * Transforms raw data from the ESPN Scoreboard API into a structured format.
 * @param events - The array of game events from the API response.
 * @returns An array of LiveGameData objects.
 */
const transformESPNData = (events: any[]): LiveGameData[] => {
    const liveGames: LiveGameData[] = [];

    for (const event of events) {
        const competition = event.competitions[0];
        const competitors = competition.competitors;
        
        const homeCompetitor = competitors.find((c: any) => c.homeAway === 'home');
        const awayCompetitor = competitors.find((c: any) => c.homeAway === 'away');

        if (!homeCompetitor || !awayCompetitor) continue;

        // Helper to parse record string like "47-35" from the records array
        const parseRecord = (recordArr: any[]): { wins: number; losses: number } => {
            const overallRecord = recordArr.find(r => r.name === 'overall');
            if (overallRecord && overallRecord.summary) {
                const parts = overallRecord.summary.split('-');
                if (parts.length === 2) {
                    return { wins: parseInt(parts[0], 10), losses: parseInt(parts[1], 10) };
                }
            }
            return { wins: 0, losses: 0 }; // Default if record not found
        };

        const homeTeam: Team = {
            id: homeCompetitor.team.abbreviation,
            name: homeCompetitor.team.displayName,
            logo: homeCompetitor.team.logo,
            record: parseRecord(homeCompetitor.records || []),
        };

        const awayTeam: Team = {
            id: awayCompetitor.team.abbreviation,
            name: awayCompetitor.team.displayName,
            logo: awayCompetitor.team.logo,
            record: parseRecord(awayCompetitor.records || []),
        };

        const oddsData = competition.odds ? competition.odds.find((o:any)=>o.provider.name.toLowerCase() === 'draftkings') || competition.odds[0] : null;
        const moneyline = {
            home: oddsData?.homeTeamOdds?.moneyLine ?? -110,
            away: oddsData?.awayTeamOdds?.moneyLine ?? -110,
        };
        // The spread line in ESPN API is from the away team's perspective
        const spread = {
            line: oddsData?.awayTeamOdds?.spread ?? 0, 
            home: oddsData?.homeTeamOdds?.spreadOdds ?? -110,
            away: oddsData?.awayTeamOdds?.spreadOdds ?? -110,
        };
        const total = {
            line: oddsData?.overUnder ?? 220,
            over: oddsData?.overOdds ?? -110,
            under: oddsData?.underOdds ?? -110,
        };
        
        const game: Game = {
            id: event.id,
            homeTeamId: homeTeam.id,
            awayTeamId: awayTeam.id,
            time: new Date(event.date).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', timeZoneName: 'short' }),
            status: event.status.type.name,
            odds: { moneyline, spread, total },
            h2h: [5, 5], // Defaulting to neutral as H2H data is not in this API endpoint
        };

        liveGames.push({ game, homeTeam, awayTeam });
    }
    return liveGames;
}

/**
 * Fetches today's NBA games from the ESPN Scoreboard API via a CORS proxy.
 */
export const fetchTodaysGames = async (): Promise<LiveGameData[]> => {
    const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
    const requestUrl = `${PROXY_URL}${encodeURIComponent(apiUrl)}`;

    const response = await fetch(requestUrl);
    if (!response.ok) {
        throw new Error('Failed to fetch game data from ESPN API. The service may be temporarily unavailable or blocked by CORS.');
    }
    const data = await response.json();
    return transformESPNData(data.events || []);
};

/**
 * Fetches a list of all NBA teams for use in the calculator via a CORS proxy.
 * Uses the balldontlie.io API as it provides a simple, key-less endpoint for all teams.
 */
export const fetchAllTeams = async (): Promise<Team[]> => {
    const apiUrl = 'https://www.balldontlie.io/api/v1/teams';
    const requestUrl = `${PROXY_URL}${encodeURIComponent(apiUrl)}`;
    
    const response = await fetch(requestUrl);
     if (!response.ok) {
        // Return a default list if this secondary API fails, so the calculator still works
        console.error('Failed to fetch team list from balldontlie API. Using a default list.');
        return [];
    }
    const data = await response.json();
    
    // Transform the API response to our internal Team type
    return data.data.map((team: any) => ({
        id: team.abbreviation,
        name: team.full_name,
        // Use a reliable source for NBA team logos based on abbreviation
        logo: `https://www.nba.com/stats/media/img/teams/logos/${team.abbreviation}_logo.svg`,
        record: { wins: 0, losses: 0 } // Record is not relevant for the team list in the calculator
    }));
};