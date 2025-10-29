import React, { useState } from 'react';
import { XIcon } from './icons';
import ThemeToggle from './ThemeToggle';
import type { User } from '@supabase/supabase-js';

interface UserProfileProps {
  user: User;
  onSignOut: () => Promise<{ error: any }>;
  onOpenNotifications?: () => void;
}

const UserProfile: React.FC<UserProfileProps> = ({ user, onSignOut, onOpenNotifications }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await onSignOut();
    } catch (error) {
      console.error('Erro ao sair:', error);
    } finally {
      setLoading(false);
      setIsOpen(false);
    }
  };

  return (
    <>
      {/* Botão flutuante de perfil */}
      <button
        onClick={() => setIsOpen(true)}
        className="fixed top-4 right-4 z-30 w-10 h-10 rounded-full bg-teal-500 flex items-center justify-center text-white font-bold hover:bg-teal-400 transition-all duration-300 ease-out transform hover:scale-110 shadow-lg hover:shadow-xl hover:shadow-teal-500/25"
        aria-label="Abrir perfil"
      >
        {user.email?.charAt(0).toUpperCase()}
      </button>

      {/* Modal de perfil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-end sm:items-center justify-center p-4"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-slate-800 rounded-2xl w-full max-w-md p-6 border border-slate-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white">Perfil</h2>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-slate-400 hover:text-white"
                >
                  <XIcon className="w-6 h-6" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-teal-500 flex items-center justify-center text-white text-3xl font-bold mb-2">
                  {user.email?.charAt(0).toUpperCase()}
                </div>
                <p className="text-white font-medium">{user.user_metadata?.full_name || 'Usuário'}</p>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>

              {/* Informações */}
              <div className="bg-slate-900/50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-slate-400">ID:</span>
                  <span className="text-white text-xs font-mono">{user.id.slice(0, 8)}...</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Membro desde:</span>
                  <span className="text-white text-sm">
                    {new Date(user.created_at).toLocaleDateString('pt-BR')}
                  </span>
                </div>
              </div>

              {/* Botão de configurações de notificações */}
              {onOpenNotifications && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onOpenNotifications();
                  }}
                  className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  Configurar Notificações
                </button>
              )}

              {/* Botão de logout */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full bg-red-500 hover:bg-red-400 text-white font-bold py-3 px-4 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '⏳ Saindo...' : '🚪 Sair da Conta'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;

