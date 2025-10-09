import React from 'react';

const Header: React.FC = () => {
    const getCurrentTime = () => {
        const now = new Date();
        return now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <header className="flex justify-between items-center pb-4 mb-4">
            <div className="text-2xl font-semibold text-white">
                {getCurrentTime()}
            </div>
            <h1 className="text-xl font-bold tracking-tight text-white">
                Hoje
            </h1>
            <div className="w-8 h-8"></div> {/* Spacer for symmetry */}
        </header>
    );
};

export default Header;