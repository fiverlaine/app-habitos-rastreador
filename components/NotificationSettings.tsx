import React, { useState, useEffect } from 'react';
import { BellIcon, BellSlashIcon, XIcon } from './icons';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationSettingsProps {
    onClose: () => void;
}

const NotificationSettings: React.FC<NotificationSettingsProps> = ({ onClose }) => {
    const { 
        permission, 
        isSupported, 
        requestPermission, 
        sendTestNotification 
    } = useNotifications();

    const [testSent, setTestSent] = useState(false);

    const handleRequestPermission = async () => {
        const granted = await requestPermission();
        if (granted) {
            // Enviar notificação de teste
            await sendTestNotification('Notificações Ativadas!');
            setTestSent(true);
            setTimeout(() => setTestSent(false), 3000);
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
                return {
                    icon: <BellIcon className="w-12 h-12 text-green-500" />,
                    title: 'Notificações Ativadas',
                    description: 'Você receberá lembretes nos horários configurados.',
                    color: 'text-green-500',
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
            <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
                <div className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-700" onClick={(e) => e.stopPropagation()}>
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Notificações</h2>
                        <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                            <XIcon className="w-6 h-6" />
                        </button>
                    </div>
                    
                    <div className="text-center py-8">
                        <BellSlashIcon className="w-16 h-16 text-slate-500 mx-auto mb-4" />
                        <p className="text-slate-300 mb-2">Notificações não suportadas</p>
                        <p className="text-slate-400 text-sm mb-4">
                            Seu navegador não suporta notificações push. Tente usar um navegador moderno como Chrome, Firefox ou Safari.
                        </p>
                        <div className="bg-slate-700/50 rounded-lg p-4 text-left text-xs">
                            <p className="text-slate-300 mb-2 font-semibold">💡 Informações de Debug:</p>
                            <ul className="text-slate-400 space-y-1">
                                <li>Protocolo: <code className="text-teal-400">{window.location.protocol}</code></li>
                                <li>Hostname: <code className="text-teal-400">{window.location.hostname}</code></li>
                                <li>Service Worker: <code className="text-teal-400">{'serviceWorker' in navigator ? '✅' : '❌'}</code></li>
                                <li>Notifications: <code className="text-teal-400">{'Notification' in window ? '✅' : '❌'}</code></li>
                                <li>PushManager: <code className="text-teal-400">{'PushManager' in window ? '✅' : '❌'}</code></li>
                            </ul>
                            {window.location.protocol !== 'https:' && window.location.hostname !== 'localhost' && (
                                <p className="text-yellow-400 mt-3 font-semibold">
                                    ⚠️ Acesso via IP sem HTTPS pode limitar funcionalidades. Use localhost ou configure HTTPS.
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4" onClick={onClose}>
            <div 
                className="bg-slate-800 rounded-xl p-6 w-full max-w-md shadow-2xl border border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-white">Configurações de Notificações</h2>
                    <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors">
                        <XIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Status */}
                <div className="text-center py-6 mb-6 bg-slate-700/50 rounded-xl border border-slate-600">
                    <div className="flex justify-center mb-4">
                        {status.icon}
                    </div>
                    <h3 className={`text-xl font-bold mb-2 ${status.color}`}>{status.title}</h3>
                    <p className="text-slate-400 text-sm px-4">{status.description}</p>
                </div>

                {/* Informações */}
                <div className="space-y-4 mb-6">
                    <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                        <h4 className="font-semibold text-white mb-2 flex items-center gap-2">
                            <span>📱</span>
                            Como funcionam os lembretes?
                        </h4>
                        <ul className="text-sm text-slate-300 space-y-1 ml-6 list-disc">
                            <li>Configure horários personalizados para cada hábito</li>
                            <li>Receba notificações nos horários escolhidos</li>
                            <li>Ative/desative lembretes individualmente</li>
                        </ul>
                    </div>

                    {permission === 'granted' && (
                        <div className="bg-teal-500/10 rounded-lg p-4 border border-teal-500/30">
                            <p className="text-teal-400 text-sm flex items-center gap-2">
                                <span>✅</span>
                                Para configurar horários específicos, edite cada hábito individualmente.
                            </p>
                        </div>
                    )}

                    {permission === 'denied' && (
                        <div className="bg-red-500/10 rounded-lg p-4 border border-red-500/30">
                            <p className="text-red-400 text-sm mb-2 font-semibold">⚠️ Como desbloquear:</p>
                            <ol className="text-xs text-slate-300 space-y-1 ml-4 list-decimal">
                                <li>Clique no ícone de cadeado/informações na barra de endereço</li>
                                <li>Encontre "Notificações" nas permissões</li>
                                <li>Altere para "Permitir"</li>
                                <li>Recarregue a página</li>
                            </ol>
                        </div>
                    )}
                </div>

                {/* Botões de Ação */}
                <div className="space-y-3">
                    {permission === 'default' && (
                        <button
                            onClick={handleRequestPermission}
                            className="w-full bg-teal-600 hover:bg-teal-500 text-white font-bold py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                        >
                            <BellIcon className="w-5 h-5" />
                            Ativar Notificações
                        </button>
                    )}

                    {permission === 'granted' && (
                        <>
                            <button
                                onClick={handleSendTest}
                                className={`w-full font-medium py-3 px-4 rounded-lg transition-all flex items-center justify-center gap-2 ${
                                    testSent
                                        ? 'bg-green-600 text-white'
                                        : 'bg-slate-700 hover:bg-slate-600 text-white'
                                }`}
                                disabled={testSent}
                            >
                                {testSent ? (
                                    <>
                                        <span>✅</span>
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
                        className="w-full bg-slate-700 hover:bg-slate-600 text-white font-medium py-3 px-4 rounded-lg transition-colors"
                    >
                        Fechar
                    </button>
                </div>
            </div>
        </div>
    );
};

export default NotificationSettings;

