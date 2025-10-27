
import React, { useState } from 'react';
import Dashboard from './components/Dashboard';
import GameList from './components/GameList';
import Calculator from './components/Calculator';
import { Gamepad2, LayoutDashboard, Calculator as CalculatorIcon } from 'lucide-react';

type Tab = 'dashboard' | 'games' | 'calculator';

const App: React.FC = () => {
    const [activeTab, setActiveTab] = useState<Tab>('dashboard');

    const renderContent = () => {
        switch (activeTab) {
            case 'dashboard':
                return <Dashboard setActiveTab={setActiveTab} />;
            case 'games':
                return <GameList />;
            case 'calculator':
                return <Calculator />;
            default:
                return <Dashboard setActiveTab={setActiveTab} />;
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
                    <p className="text-gray-400 mt-2 text-sm sm:text-base">Your edge in NBA betting analysis.</p>
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
                    <p>Disclaimer: For entertainment purposes only. Please gamble responsibly.</p>
                </footer>
            </div>
        </div>
    );
};

export default App;
