import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { User, Session } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Verificar se as variáveis de ambiente estão configuradas
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error('❌ Variáveis de ambiente do Supabase não configuradas');
      setError('Variáveis de ambiente do Supabase não configuradas');
      setLoading(false);
      return;
    }

    // Verificar se está online
    const isOnline = navigator.onLine;
    console.log('🌐 Status de conexão:', isOnline ? 'Online' : 'Offline');

    // Tentar carregar sessão do localStorage primeiro (para funcionamento offline)
    const tryLoadFromStorage = () => {
      try {
        const storedSession = localStorage.getItem('supabase.auth.session');
        if (storedSession) {
          const sessionData = JSON.parse(storedSession);
          if (sessionData && sessionData.user) {
            console.log('📱 Sessão carregada do localStorage (offline)');
            setSession(sessionData);
            setUser(sessionData.user);
            setLoading(false);
            return true;
          }
        }
      } catch (error) {
        console.error('❌ Erro ao carregar sessão do localStorage:', error);
      }
      return false;
    };

    // Se está offline, tentar carregar do localStorage
    if (!isOnline) {
      if (!tryLoadFromStorage()) {
        console.log('📴 Offline e sem sessão salva');
        setLoading(false);
      }
      return;
    }

    // Se está online, tentar conectar com Supabase
    console.log('🌐 Tentando conectar com Supabase...');
    supabase.auth.getSession()
      .then(({ data: { session }, error }) => {
        if (error) {
          console.error('❌ Erro ao obter sessão:', error);
          // Tentar carregar do localStorage como fallback
          if (!tryLoadFromStorage()) {
            setError('Erro ao conectar com Supabase');
          }
        } else {
          console.log('✅ Sessão obtida do Supabase');
          setSession(session);
          setUser(session?.user ?? null);
          
          // Salvar sessão no localStorage para uso offline
          if (session) {
            localStorage.setItem('supabase.auth.session', JSON.stringify(session));
          }
        }
        setLoading(false);
      })
      .catch((err) => {
        console.error('❌ Erro ao inicializar auth:', err);
        // Tentar carregar do localStorage como fallback
        if (!tryLoadFromStorage()) {
          setError('Erro ao inicializar autenticação');
        }
      });

    // Ouvir mudanças na autenticação
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log('🔄 Mudança de estado de autenticação:', _event);
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
      
      // Salvar sessão no localStorage quando mudar
      if (session) {
        localStorage.setItem('supabase.auth.session', JSON.stringify(session));
      } else {
        localStorage.removeItem('supabase.auth.session');
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email: string, password: string, fullName?: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      return { data, error: null };
    } catch (error: any) {
      return { data: null, error };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      return { error: null };
    } catch (error: any) {
      return { error };
    }
  };

  return {
    user,
    session,
    loading,
    error,
    signUp,
    signIn,
    signOut,
  };
};

