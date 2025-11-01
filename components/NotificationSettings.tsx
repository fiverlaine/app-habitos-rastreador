import React, { useState } from 'react';
import { BellIcon, BellSlashIcon, XIcon } from './icons';

interface NotificationSettingsProps {
    onClose: () => void;
    permission: NotificationPermission;
    isSupported: boolean;
    isSubscribed: boolean;
    requestPermission: () => Promise<boolean>;
    sendTestNotification: (habitName?: string) => Promise<boolean>;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({
    onClose,
    permission,
    isSupported,
    isSubscribed,
    requestPermission,
    sendTestNotification,
}) => {
    const [testSent, setTestSent] = useState(false);
    const [isRequestingPermission, setIsRequestingPermission] = useState(false);

    const handleRequestPermission = async () => {
        if (isRequestingPermission) return;
        setIsRequestingPermission(true);
        try {
            const granted = await requestPermission();
            if (granted) {
                await sendTestNotification('Notificações Ativadas!');
                setTestSent(true);
                setTimeout(() => setTestSent(false), 3000);
            }
        } finally {
            setIsRequestingPermission(false);
        }
    };

    const handleSendTest = async () => {
        const success = await sendTestNotification('Teste de Notificação');
        if (success) {
            setTestSent(true);
            setTimeout(() => setTestSent(false), 3000);
        }
    };

    const getPermissionStatus = () => {
        switch (permission) {
            case 'granted':
                if (isSubscribed) {
                    return {
                        icon: <BellIcon className="w-12 h-12 text-green-500" />,
                        title: 'Notificações Ativadas',
                        description: 'Lembretes push configurados com sucesso neste dispositivo.',
                        color: 'text-green-500',
                    };
                }
                return {
                    icon: <BellIcon className="w-12 h-12 text-yellow-400" />,
                    title: 'Permissão concedida, finalize a configuração',
                    description: 'Precisamos concluir o registro push neste dispositivo. Clique em "Enviar Notificação de Teste" para validar.',
                    color: 'text-yellow-400',
                };
            case 'denied':
                return {
                    icon: <BellSlashIcon className="w-12 h-12 text-red-500" />,
                    title: 'Notificações Bloqueadas',
                    description: 'Você bloqueou as notificações. Para ativar, vá nas configurações do navegador.',
                    color: 'text-red-500',
                };
            default:
                return {
                    icon: <BellIcon className="w-12 h-12 text-yellow-500" />,
                    title: 'Ativar Notificações',
                    description: 'Receba lembretes para não perder seus hábitos!',
                    color: 'text-yellow-500',
                };
        }
    };

    const status = getPermissionStatus();

    if (!isSupported) {
        return (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-fade-in" onClick={onClose}>
                <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-7 w-full max-w-md shadow-2xl border border-slate-800/50 animate-scale-in" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Notificações</h2>
                        <button 
                            onClick={onClose} 
                            className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                        >
                            <XIcon className="w-5 h-5" />
                        </button>
                    </div>
                    
                    <div className="text-center py-8">
                        <div className="w-20 h-20 rounded-3xl bg-slate-800/50 border border-slate-700/50 flex items-center justify-center mx-auto mb-6">
                            <BellSlashIcon className="w-10 h-10 text-slate-500" />
                        </div>
                        <p className="text-white font-semibold mb-2 text-lg">Notificações não suportadas</p>
                        <p className="text-slate-400 text-sm leading-relaxed px-4">
                            Seu navegador não suporta notificações push. Tente usar um navegador moderno como Chrome, Firefox ou Safari.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-5 animate-fade-in" onClick={onClose}>
            <div 
                className="bg-slate-900/95 backdrop-blur-xl rounded-3xl p-7 w-full max-w-md shadow-2xl border border-slate-800/50 max-h-[90vh] overflow-y-auto animate-scale-in custom-scrollbar"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-7">
                    <h2 className="text-2xl font-bold text-white">Configurações de Notificações</h2>
                    <button 
                        onClick={onClose} 
                        className="w-10 h-10 rounded-xl bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 flex items-center justify-center text-slate-400 hover:text-white transition-all duration-300 active:scale-90"
                    >
                        <XIcon className="w-5 h-5" />
                    </button>
                </div>

                {/* Status */}
                <div className="text-center py-6 mb-6 bg-gradient-to-br from-slate-800/50 to-slate-900/30 backdrop-blur-sm rounded-2xl border border-slate-700/50">
                    <div className="flex justify-center mb-4">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${
                            status.color.includes('green') ? 'bg-emerald-500/10 border border-emerald-500/30' :
                            status.color.includes('red') ? 'bg-red-500/10 border border-red-500/30' :
                            'bg-amber-500/10 border border-amber-500/30'
                        }`}>
                            {status.icon}
                        </div>
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${status.color}`}>{status.title}</h3>
                    <p className="text-slate-400 text-sm px-4 leading-relaxed">{status.description}</p>
                </div>

                {/* Informações */}
                <div className="space-y-4 mb-6">
                    <div className="bg-slate-800/40 backdrop-blur-sm rounded-2xl p-5 border border-slate-700/50">
                        <h4 className="font-bold text-white mb-3 flex items-center gap-2">
                            <div className="w-8 h-8 rounded-xl bg-cyan-500/10 flex items-center justify-center">
                                <BellIcon className="w-4 h-4 text-cyan-400" />
                            </div>
                            Como funcionam os lembretes?
                        </h4>
                        <ul className="text-sm text-slate-300 space-y-2 ml-2">
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>Configure horários personalizados para cada hábito</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>Receba notificações nos horários escolhidos</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <span className="text-cyan-400 mt-1">•</span>
                                <span>Ative/desative lembretes individualmente</span>
                            </li>
                        </ul>
                    </div>

                    {permission === 'granted' && isSubscribed && (
                        <div className="bg-emerald-500/10 backdrop-blur-sm rounded-2xl p-4 border border-emerald-500/30">
                            <p className="text-emerald-400 text-sm flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span>Para configurar horários específicos, edite cada hábito individualmente.</span>
                            </p>
                        </div>
                    )}

                    {permission === 'granted' && !isSubscribed && (
                        <div className="bg-amber-500/10 backdrop-blur-sm rounded-2xl p-4 border border-amber-500/30">
                            <p className="text-amber-300 text-sm flex items-start gap-2">
                                <svg className="w-5 h-5 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <span>Concessão realizada, mas ainda não registramos este dispositivo. Envie uma notificação de teste para concluir o registro.</span>
                            </p>
                        </div>
                    )}

                    {permission === 'denied' && (
                        <div className="bg-red-500/10 backdrop-blur-sm rounded-2xl p-4 border border-red-500/30">
                            <p className="text-red-400 text-sm mb-3 font-bold flex items-center gap-2">
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                Como desbloquear:
                            </p>
                            <ol className="text-xs text-slate-300 space-y-2 ml-2">
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 font-bold">1.</span>
                                    <span>Clique no ícone de cadeado/informações na barra de endereço</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 font-bold">2.</span>
                                    <span>Encontre "Notificações" nas permissões</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 font-bold">3.</span>
                                    <span>Altere para "Permitir"</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="text-red-400 font-bold">4.</span>
                                    <span>Recarregue a página</span>
                                </li>
                            </ol>
                        </div>
                    )}
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3">
                    {permission === 'default' && (
                        <button
                            onClick={handleRequestPermission}
                            className={`w-full bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 shadow-xl shadow-cyan-500/30 hover:shadow-cyan-500/50 active:scale-95 flex items-center justify-center gap-2 ${
                                isRequestingPermission ? 'opacity-75 cursor-not-allowed' : ''
                            }`}
                            disabled={isRequestingPermission}
                        >
                            {isRequestingPermission ? (
                                <>
                                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                    Solicitando permissão...
                                </>
                            ) : (
                                <>
                                    <BellIcon className="w-5 h-5" />
                                    Ativar Notificações
                                </>
                            )}
                        </button>
                    )}

                    {permission === 'granted' && (
                        <>
                            <button
                                onClick={handleSendTest}
                                className={`w-full font-bold py-4 px-6 rounded-2xl transition-all duration-300 flex items-center justify-center gap-2 ${
                                    testSent
                                        ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xl shadow-emerald-500/30'
                                        : 'bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white active:scale-95'
                                }`}
                                disabled={testSent}
                            >
                                {testSent ? (
                                    <>
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                        Notificação Enviada!
                                    </>
                                ) : (
                                    <>
                                        <BellIcon className="w-5 h-5" />
                                        Enviar Notificação de Teste
                                    </>
                                )}
                            </button>
                        </>
                    )}

                    <button
                        onClick={onClose}
                        className="w-full bg-slate-800/50 hover:bg-slate-700/50 border border-slate-700/50 text-white font-bold py-4 px-6 rounded-2xl transition-all duration-300 active:scale-95"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;

