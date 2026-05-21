import React from 'react';
import { History } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';

const ActivityHistorySection: React.FC = () => {
    const { logs: auditLogs } = useAuditLogs();

    return (
        <div className="mt-6 sm:mt-8 lg:mt-12 bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm transition-all hover:shadow-md">
            {/* Header */}
            <div className="p-4 sm:p-6 lg:p-8 border-b border-slate-100 dark:border-slate-800/50 bg-linear-to-r from-blue-50/50 to-cyan-50/50 dark:from-slate-900/50 dark:to-slate-800/50">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl sm:rounded-2xl">
                        <History className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <div>
                        <h2 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">Histórico de Atividades</h2>
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Últimas ações realizadas</p>
                    </div>
                </div>
            </div>

            {/* Conteúdo */}
            <div className="p-4 sm:p-6 lg:p-8">
                {auditLogs && auditLogs.length > 0 ? (
                    <>
                        <div className="space-y-2 sm:space-y-3">
                            {auditLogs.slice(0, 15).map((log) => (
                                <div key={log.id} className="flex items-start gap-3 p-3 sm:p-4 bg-slate-50 dark:bg-slate-950/50 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-900/50 transition-colors">
                                    <div className="mt-1">
                                        <div className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{log.action}</p>
                                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{log.timestamp}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        {auditLogs.length > 15 && (
                            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/30 rounded-lg">
                                <p className="text-xs text-blue-700 dark:text-blue-400 text-center font-medium">
                                    Exibindo últimos 15 registros de <span className="font-bold">{auditLogs.length}</span> atividades
                                </p>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="text-center py-8">
                        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">Nenhuma atividade registrada</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ActivityHistorySection;
