
import React, { useState, useEffect, useCallback } from 'react';
import Dashboard from './components/Dashboard';
import GameList from './components/GameList';
import Calculator from './components/Calculator';
import { Gamepad2, LayoutDashboard, Calculator as CalculatorIcon, RefreshCw, AlertTriangle } from 'lucide-react';
import { fetchTodaysGames, fetchAllTeams } from './services/apiService';
import { analyzeGame } from './services/predictionService';
import { Prediction, Team } from './types';

type Tab = 'dashboard' | 'games' | 'calculator';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');
    const [predictions, setPredictions] = useState<Prediction[]>([]);
    const [allTeams, setAllTeams] = useState<Team[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentDate] = useState(new Date());

    const loadData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            // Fetch today's games and the full list of teams concurrently
            const [liveGames, teams] = await Promise.all([
                fetchTodaysGames(),
                fetchAllTeams()
            ]);

            // Analyze each game to generate predictions
            const analyzedGames = liveGames
                .map(liveGame => analyzeGame(liveGame.game, liveGame.homeTeam, liveGame.awayTeam))
                .filter(p => p !== null) as Prediction[];
            
            setPredictions(analyzedGames);
            setAllTeams(teams);
        } catch (err: any) {
            setError(err.message || 'An unknown error occurred while fetching data.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);


    const renderContent = () => {
        if (isLoading) {
            return (
                <div className="flex flex-col justify-center items-center h-64 text-gray-400">
                    <RefreshCw className="animate-spin h-8 w-8 mb-4" />
                    <p className="text-lg">Loading today's games...</p>
                </div>
            );
        }
        if (error) {
            return (
                <div className="flex flex-col justify-center items-center h-64 text-red-400 bg-red-900/20 rounded-lg p-4">
                    <AlertTriangle className="h-8 w-8 mb-4" />
                    <p className="text-lg font-semibold">Failed to Load Data</p>
                    <p className="text-sm">{error}</p>
                </div>
            );
        }
        if (predictions.length === 0 && !isLoading) {
             return (
                <div className="text-center h-64 flex flex-col justify-center items-center bg-gray-800/50 rounded-lg">
                    <Gamepad2 className="h-12 w-12 mb-4 text-gray-500" />
                    <h3 className="text-xl font-bold text-white">No Games Today</h3>
                    <p className="text-gray-400">There are no NBA games scheduled for today.</p>
                </div>
            );
        }

        switch (activeTab) {
            case 'dashboard':
                return <Dashboard setActiveTab={setActiveTab} predictions={predictions} />;
            case 'games':
                return <GameList predictions={predictions} />;
            case 'calculator':
                return <Calculator allTeams={allTeams} />;
            default:
                return <Dashboard setActiveTab={setActiveTab} predictions={predictions} />;
        }
    };

    const TabButton: React.FC<{ tabName: Tab; icon: React.ReactNode; label: string }> = ({ tabName, icon, label }) => (
        <button
            onClick={() => setActiveTab(tabName)}
            className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-2 p-3 sm:p-4 text-sm font-semibold transition-all duration-300 rounded-lg ${
                activeTab === tabName
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700 hover:text-white'
            }`}
        >
            {icon}
            <span className="mt-1 sm:mt-0">{label}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-2 sm:p-4 md:p-6">
            <div className="max-w-7xl mx-auto">
                <header className="text-center mb-6">
                    <h1 className="text-4xl sm:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">
                        NBA PickPulse Analytics
                    </h1>
                    <div className="flex items-center justify-center gap-4 mt-3">
                        <p className="text-gray-400 text-sm sm:text-base">
                           {currentDate.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                        <button onClick={loadData} disabled={isLoading} className="text-gray-400 hover:text-white disabled:text-gray-600 disabled:cursor-not-allowed transition-colors flex items-center gap-2 bg-gray-800/50 px-3 py-1.5 rounded-md text-sm">
                            <RefreshCw size={14} className={isLoading ? 'animate-spin' : ''} />
                            Refresh
                        </button>
                    </div>
                </header>

                <nav className="sticky top-2 z-50 bg-gray-900/50 backdrop-blur-sm p-2 rounded-xl mb-6">
                    <div className="flex justify-center items-center gap-2 sm:gap-4 bg-gray-800/50 p-2 rounded-xl shadow-md">
                        <TabButton tabName="dashboard" icon={<LayoutDashboard size={20} />} label="Best Picks" />
                        <TabButton tabName="games" icon={<Gamepad2 size={20} />} label="All Games" />
                        <TabButton tabName="calculator" icon={<CalculatorIcon size={20} />} label="Calculator" />
                    </div>
                </nav>

                <main>
                    {renderContent()}
                </main>

                <footer className="text-center mt-8 text-gray-500 text-xs">
                    <p>Disclaimer: For entertainment purposes only. Please gamble responsibly. Data provided by ESPN API.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
