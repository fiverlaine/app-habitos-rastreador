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
        className="fixed top-6 right-5 z-30 w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 flex items-center justify-center text-white font-bold transition-all duration-300 ease-out active:scale-90 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50"
        aria-label="Abrir perfil"
      >
        <span className="text-lg">{user.email?.charAt(0).toUpperCase()}</span>
      </button>

      {/* Modal de perfil */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-end sm:items-center justify-center p-5 animate-fade-in"
          onClick={() => setIsOpen(false)}
        >
          <div
            className="bg-slate-900/95 backdrop-blur-xl rounded-3xl w-full max-w-md p-7 border border-slate-800/50 shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-7">
              <h2 className="text-2xl font-bold text-white">Perfil</h2>
              <div className="flex items-center gap-2">
                <ThemeToggle />
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                >
                  <XIcon className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="space-y-5">
              {/* Avatar */}
              <div className="flex flex-col items-center mb-6">
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold shadow-2xl shadow-cyan-500/30">
                    {user.email?.charAt(0).toUpperCase()}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-xl bg-emerald-500 border-4 border-slate-900 flex items-center justify-center">
                    <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                </div>
                <p className="text-white font-bold text-lg mb-1">{user.user_metadata?.full_name || 'Usuário'}</p>
                <p className="text-slate-400 text-sm">{user.email}</p>
              </div>

              {/* Informações */}
              <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-slate-800/50 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">ID</span>
                  <span className="text-slate-300 text-xs font-mono bg-slate-800/50 px-2.5 py-1 rounded-lg">{user.id.slice(0, 8)}...</span>
                </div>
                <div className="h-px bg-slate-800/50"></div>
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 text-sm font-medium">Membro desde</span>
                  <span className="text-slate-300 text-sm font-semibold">
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
                  className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold py-3.5 px-5 rounded-2xl transition-all duration-300 shadow-lg shadow-cyan-500/25 hover:shadow-xl hover:shadow-cyan-500/40 active:scale-95 flex items-center justify-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
                  </svg>
                  Configurar Notificações
                </button>
              )}

              {/* Botão de logout */}
              <button
                onClick={handleSignOut}
                disabled={loading}
                className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 text-white font-semibold py-3.5 px-5 rounded-2xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/40 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Saindo...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Sair da Conta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UserProfile;

