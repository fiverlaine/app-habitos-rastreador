import React from 'react';

const DebugInfo: React.FC = () => {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

  return (
    <div className="fixed top-0 left-0 right-0 bg-red-900 text-white p-2 text-xs z-50">
      <div className="max-w-4xl mx-auto">
        <strong>🐛 DEBUG INFO:</strong>
        <br />
        Supabase URL: {supabaseUrl ? '✅ Configurado' : '❌ Não encontrado'}
        <br />
        Supabase Key: {supabaseKey ? '✅ Configurado' : '❌ Não encontrado'}
        <br />
        <strong>Para corrigir:</strong> Crie um arquivo `.env.local` na raiz do projeto com:
        <br />
        <code className="bg-black p-1 rounded">
          VITE_SUPABASE_URL=https://jiohwtmymnizvwzyvdef.supabase.co<br />
          VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
        </code>
      </div>
    </div>
  );
};

export default DebugInfo;
