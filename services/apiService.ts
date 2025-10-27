import { Game, Team } from '../types';
import { MOCK_TEAMS } from '../data/mockData';

// We'll try multiple CORS proxies to improve reliability.
const PROXIES = [
    {
        name: 'AllOrigins',
        buildUrl: (url: string) => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`
    },
    {
        name: 'ThingProxy',
        buildUrl: (url: string) => `https://thingproxy.freeboard.io/fetch/${url}`
    }
];

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
 * Fetches today's NBA games from the ESPN Scoreboard API.
 * It tries multiple CORS proxies for better reliability and includes a timeout.
 */
export const fetchTodaysGames = async (): Promise<LiveGameData[]> => {
    const apiUrl = 'https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard';
    let lastError: Error | null = null;

    for (const proxy of PROXIES) {
        const requestUrl = proxy.buildUrl(apiUrl);
        try {
            // Use AbortController for a fetch timeout (e.g., 8 seconds)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 8000);

            const response = await fetch(requestUrl, { signal: controller.signal });
            clearTimeout(timeoutId);

            if (!response.ok) {
                throw new Error(`Request failed with status ${response.status}`);
            }
            
            const text = await response.text();
            // Check for common proxy error messages in the response body
            if (text.includes("CORS-Anywhere") || text.includes("host has been blocked")) {
                 throw new Error(`Proxy returned an error page.`);
            }

            try {
                const data = JSON.parse(text);
                return transformESPNData(data.events || []);
            } catch (e) {
                 // Don't throw here, let it fall through to the outer catch and try the next proxy
                 throw new Error('Received invalid data format from the API.');
            }
        } catch (error: any) {
            console.warn(`Fetch attempt via ${proxy.name} failed:`, error.message);
            lastError = error;
        }
    }

    // If all proxies failed, throw a final, more informative error.
    throw new Error('Failed to fetch game data. This could be a network issue or the data provider might be temporarily down.');
};

/**
 * Fetches a list of all NBA teams for use in the calculator.
 * The list of teams is static, so we use reliable local data to prevent network failures.
 */
export const fetchAllTeams = async (): Promise<Team[]> => {
    // To ensure the calculator is always functional and to avoid errors from
    // unreliable free APIs, we will directly use the local mock data.
    return Promise.resolve(MOCK_TEAMS);
};
