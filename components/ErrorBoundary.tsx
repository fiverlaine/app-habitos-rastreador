import React, { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    console.error('🚨 ErrorBoundary capturou erro:', error);
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('🚨 ErrorBoundary - Erro capturado:', error);
    console.error('🚨 ErrorBoundary - Error Info:', errorInfo);
    
    this.setState({
      error,
      errorInfo
    });
  }

  private handleReload = () => {
    window.location.reload();
  };

  private handleReset = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined });
  };

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-slate-900 font-sans text-slate-200 p-4">
          <div className="max-w-md mx-auto mt-8">
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-2 text-red-400 mb-4">
                <div className="w-12 h-12 text-4xl">🚨</div>
              </div>
              <h1 className="text-2xl font-bold text-white mb-2">
                Erro no App
              </h1>
              <p className="text-slate-400">
                Algo deu errado. Vamos tentar resolver isso.
              </p>
            </div>

            {/* Informações do erro */}
            <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-red-500/50">
              <h2 className="text-lg font-bold text-white mb-4">🔧 Informações do Erro</h2>
              
              <div className="space-y-3 text-sm">
                <div>
                  <span className="text-slate-400">Tipo:</span>
                  <span className="text-red-400 ml-2">{this.state.error?.name || 'Desconhecido'}</span>
                </div>
                
                <div>
                  <span className="text-slate-400">Mensagem:</span>
                  <div className="text-red-300 mt-1 break-all">
                    {this.state.error?.message || 'Erro desconhecido'}
                  </div>
                </div>

                {/* Informações do navegador */}
                <div className="mt-4 pt-4 border-t border-slate-600">
                  <div className="text-slate-400 font-bold mb-2">📱 Informações do Navegador:</div>
                  <div className="space-y-1 text-xs text-slate-300">
                    <div>Online: {navigator.onLine ? '✅' : '❌'}</div>
                    <div>IndexedDB: {('indexedDB' in window) ? '✅' : '❌'}</div>
                    <div>Service Worker: {('serviceWorker' in navigator) ? '✅' : '❌'}</div>
                    <div>LocalStorage: {('localStorage' in window) ? '✅' : '❌'}</div>
                    <div>User Agent: {navigator.userAgent.includes('Mobile') ? 'Mobile' : 'Desktop'}</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stack trace (apenas em desenvolvimento) */}
            {process.env.NODE_ENV === 'development' && this.state.errorInfo && (
              <div className="bg-slate-800 rounded-xl p-6 mb-6 border border-slate-700">
                <h3 className="text-white font-bold mb-3">📋 Stack Trace:</h3>
                <pre className="text-xs text-red-300 bg-black p-3 rounded overflow-auto max-h-40">
                  {this.state.errorInfo.componentStack}
                </pre>
              </div>
            )}

            {/* Botões de ação */}
            <div className="space-y-3">
              <button
                onClick={this.handleReset}
                className="w-full bg-teal-500 hover:bg-teal-400 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                🔄 Tentar Novamente
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full bg-slate-600 hover:bg-slate-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                🔄 Recarregar Página
              </button>

              {/* Botão para limpar dados locais */}
              <button
                onClick={() => {
                  if (confirm('Isso irá limpar todos os dados salvos localmente. Continuar?')) {
                    localStorage.clear();
                    if ('indexedDB' in window) {
                      indexedDB.deleteDatabase('habitos-offline-db');
                    }
                    window.location.reload();
                  }
                }}
                className="w-full bg-red-600 hover:bg-red-500 text-white font-medium py-3 px-4 rounded-lg transition-colors"
              >
                🗑️ Limpar Dados Locais
              </button>
            </div>

            {/* Instruções */}
            <div className="mt-8 text-center">
              <div className="text-xs text-slate-500">
                <div>Se o problema persistir, tente:</div>
                <div>1. Conectar-se à internet</div>
                <div>2. Limpar cache do navegador</div>
                <div>3. Recarregar a página</div>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
