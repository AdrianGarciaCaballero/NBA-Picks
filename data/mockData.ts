
import { Team, Game } from '../types';

export const teams: Team[] = [
    {
        id: 'LAL', name: 'Los Angeles Lakers', logo: '🏀',
        record: { wins: 47, losses: 35 },
        stats: { ppg: 118.0, oppg: 117.4 },
        form: ['W', 'W', 'L', 'W', 'W'],
        homeRecord: { wins: 28, losses: 14 },
        awayRecord: { wins: 19, losses: 21 },
    },
    {
        id: 'GSW', name: 'Golden State Warriors', logo: '🌉',
        record: { wins: 46, losses: 36 },
        stats: { ppg: 117.8, oppg: 115.2 },
        form: ['W', 'L', 'W', 'W', 'W'],
        homeRecord: { wins: 21, losses: 20 },
        awayRecord: { wins: 25, losses: 16 },
    },
    {
        id: 'BOS', name: 'Boston Celtics', logo: '🍀',
        record: { wins: 64, losses: 18 },
        stats: { ppg: 120.6, oppg: 109.2 },
        form: ['W', 'W', 'L', 'W', 'W'],
        homeRecord: { wins: 37, losses: 4 },
        awayRecord: { wins: 27, losses: 14 },
    },
    {
        id: 'MIA', name: 'Miami Heat', logo: '🔥',
        record: { wins: 46, losses: 36 },
        stats: { ppg: 110.1, oppg: 108.4 },
        form: ['W', 'L', 'W', 'L', 'W'],
        homeRecord: { wins: 22, losses: 19 },
        awayRecord: { wins: 24, losses: 17 },
    },
    {
        id: 'DEN', name: 'Denver Nuggets', logo: '⛏️',
        record: { wins: 57, losses: 25 },
        stats: { ppg: 114.9, oppg: 109.6 },
        form: ['W', 'L', 'W', 'W', 'L'],
        homeRecord: { wins: 33, losses: 8 },
        awayRecord: { wins: 24, losses: 17 },
    },
    {
        id: 'MIL', name: 'Milwaukee Bucks', logo: '🦌',
        record: { wins: 49, losses: 33 },
        stats: { ppg: 119.0, oppg: 116.4 },
        form: ['L', 'L', 'W', 'L', 'L'],
        homeRecord: { wins: 31, losses: 11 },
        awayRecord: { wins: 18, losses: 22 },
    },
    {
        id: 'PHX', name: 'Phoenix Suns', logo: '☀️',
        record: { wins: 49, losses: 33 },
        stats: { ppg: 116.2, oppg: 113.2 },
        form: ['W', 'L', 'W', 'W', 'L'],
        homeRecord: { wins: 25, losses: 16 },
        awayRecord: { wins: 24, losses: 17 },
    },
    {
        id: 'PHI', name: 'Philadelphia 76ers', logo: '🔔',
        record: { wins: 47, losses: 35 },
        stats: { ppg: 114.6, oppg: 111.5 },
        form: ['W', 'W', 'W', 'W', 'W'],
        homeRecord: { wins: 25, losses: 16 },
        awayRecord: { wins: 22, losses: 19 },
    },
    {
        id: 'DAL', name: 'Dallas Mavericks', logo: '🤠',
        record: { wins: 50, losses: 32 },
        stats: { ppg: 117.9, oppg: 115.6 },
        form: ['L', 'W', 'L', 'W', 'W'],
        homeRecord: { wins: 25, losses: 16 },
        awayRecord: { wins: 25, losses: 16 },
    },
    {
        id: 'NYK', name: 'New York Knicks', logo: '🗽',
        record: { wins: 50, losses: 32 },
        stats: { ppg: 112.8, oppg: 108.2 },
        form: ['W', 'L', 'W', 'W', 'W'],
        homeRecord: { wins: 27, losses: 14 },
        awayRecord: { wins: 23, losses: 18 },
    },
];

export const games: Game[] = [
    {
        id: 'GAME1', homeTeamId: 'LAL', awayTeamId: 'GSW', time: '10:00 PM EST',
        odds: {
            moneyline: { home: -150, away: 130 },
            spread: { line: -3.5, home: -110, away: -110 },
            total: { line: 235.5, over: -110, under: -110 },
        },
        h2h: [4, 6],
    },
    {
        id: 'GAME2', homeTeamId: 'BOS', awayTeamId: 'MIA', time: '7:30 PM EST',
        odds: {
            moneyline: { home: -400, away: 320 },
            spread: { line: -9.5, home: -110, away: -110 },
            total: { line: 210.5, over: -110, under: -110 },
        },
        h2h: [7, 3],
    },
    {
        id: 'GAME3', homeTeamId: 'DEN', awayTeamId: 'PHX', time: '9:00 PM EST',
        odds: {
            moneyline: { home: -200, away: 170 },
            spread: { line: -5.5, home: -105, away: -115 },
            total: { line: 225.0, over: -110, under: -110 },
        },
        h2h: [6, 4],
    },
    {
        id: 'GAME4', homeTeamId: 'NYK', awayTeamId: 'PHI', time: '8:00 PM EST',
        odds: {
            moneyline: { home: 110, away: -130 },
            spread: { line: 1.5, home: -110, away: -110 },
            total: { line: 209.5, over: -112, under: -108 },
        },
        h2h: [5, 5],
    },
    {
        id: 'GAME5', homeTeamId: 'DAL', awayTeamId: 'MIL', time: '8:30 PM EST',
        odds: {
            moneyline: { home: -180, away: 150 },
            spread: { line: -4.5, home: -110, away: -110 },
            total: { line: 230.5, over: -110, under: -110 },
        },
        h2h: [3, 7],
    },
];
