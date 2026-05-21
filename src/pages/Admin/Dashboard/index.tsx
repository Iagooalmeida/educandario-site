/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState, useEffect } from 'react';
import { 
    FileText, 
    Clock, 
    Plus, 
    Eye, 
    Edit2, 
    Trash2,
    AlertCircle
} from 'lucide-react';
import UploadModal from '@/components/Admin/UploadModal';
import UploadConfirmationModal from '@/components/Admin/UploadConfirmationModal';
import EditDocumentModal from '@/components/Admin/EditDocumentModal';
import PDFModal from '@/components/Admin/PDFModal';
import { useAuth } from '@/hooks/useAuth';
import { useDocuments } from '@/hooks/useDocuments';
import { useNotifications } from '@/hooks/useNotifications';
import { usePortalSettingsContext } from '@/contexts/PortalSettingsContext';
//import { userNotificationsService } from '@/services/userNotificationsService';
import { auditService } from '@/services/auditService';

const Dashboard: React.FC = () => {
    // Authentication
    const { user, loading: authLoading, error: authError } = useAuth();

    // Portal Settings (para última atualização)
    const { settings: portalSettings } = usePortalSettingsContext();

    // Documents
    const { documents, upload, delete: deleteDoc, update: updateDoc, list: listDocuments, getURL } = useDocuments();

    // Notifications
    const { create: createNotification } = useNotifications();

    // UI State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [uploadedDocumentName, setUploadedDocumentName] = useState('');
    const [isUploadProcessing, setIsUploadProcessing] = useState(false);
    
    // Edit Document State
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [editingDocument, setEditingDocument] = useState<any>(null);
    const [isEditProcessing, setIsEditProcessing] = useState(false);

    // View PDF Modal State
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState<string>('');
    const [selectedPdfTitle, setSelectedPdfTitle] = useState<string>('');
    
    // Obter timestamp da última atualização (documentos + portal settings)
    const getLastUpdateTimestamp = (): number | null => {
        let latestTimestamp: number | null = null;

        // Verificar o documento mais recente
        if (documents && documents.length > 0) {
            const sortedByUpdate = [...documents].sort((a, b) => {
                const timeB = b.updatedAt ? (b.updatedAt instanceof Date ? b.updatedAt.getTime() : typeof b.updatedAt === 'number' ? b.updatedAt : new Date(b.updatedAt as any).getTime()) : 0;
                const timeA = a.updatedAt ? (a.updatedAt instanceof Date ? a.updatedAt.getTime() : typeof a.updatedAt === 'number' ? a.updatedAt : new Date(a.updatedAt as any).getTime()) : 0;
                return timeB - timeA;
            });
            
            const newestDoc = sortedByUpdate[0];
            if (newestDoc?.updatedAt) {
                const docTime = newestDoc.updatedAt instanceof Date 
                    ? newestDoc.updatedAt.getTime() 
                    : typeof newestDoc.updatedAt === 'number' 
                    ? newestDoc.updatedAt 
                    : new Date(newestDoc.updatedAt as any).getTime();
                latestTimestamp = docTime;
            }
        }

        // Verificar portal settings
        if (portalSettings?.updated_at) {
            let settingsTime: number | null = null;
            if (typeof portalSettings.updated_at === 'object' && 'toMillis' in portalSettings.updated_at) {
                settingsTime = (portalSettings.updated_at as any).toMillis();
            } else if (typeof portalSettings.updated_at === 'string') {
                settingsTime = new Date(portalSettings.updated_at).getTime();
            }
            
            if (settingsTime && (!latestTimestamp || settingsTime > latestTimestamp)) {
                latestTimestamp = settingsTime;
            }
        }
        
        return latestTimestamp;
    };
    
    const [lastUploadTime, setLastUploadTime] = useState<number | null>(getLastUpdateTimestamp());
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    // Load documents on mount
    useEffect(() => {
        listDocuments();
    }, [listDocuments]);

    // Sincronizar lastUploadTime com documentos e portalSettings
    useEffect(() => {
        const timestamp = getLastUpdateTimestamp();
        if (timestamp) {
            setLastUploadTime(timestamp);
            console.log('🔄 [Dashboard] Última atualização sincronizada:', new Date(timestamp));
        }
    }, [documents, portalSettings?.updated_at]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 30000);
        return () => clearInterval(interval);
    }, []);

    // Listener para atualizações de configurações do portal
    useEffect(() => {
        const handleSettingsUpdate = (event: Event) => {
            const customEvent = event as CustomEvent;
            const updated = customEvent.detail;
            if (updated?.updated_at) {
                const timestamp = (() => {
                    if (typeof updated.updated_at === 'object' && 'toMillis' in updated.updated_at) {
                        return (updated.updated_at as any).toMillis();
                    }
                    if (typeof updated.updated_at === 'string') {
                        return new Date(updated.updated_at).getTime();
                    }
                    return null;
                })();
                if (timestamp) {
                    setLastUploadTime(timestamp);
                    console.log('🔄 [Dashboard] Configurações atualizadas em tempo real:', new Date(timestamp));
                }
            }
        };

        window.addEventListener('portalSettingsUpdated', handleSettingsUpdate);
        return () => window.removeEventListener('portalSettingsUpdated', handleSettingsUpdate);
    }, []);
    // Mapa de categorias
    const categoryMap: Record<string, string> = {
        'ensa': 'Institucional',
        'social': 'Promoção Social',
        'cpfl': 'Convênio CPFL',
        'educacao': 'Educação'
    };

    // Time formatting helpers
    const getTimeAgo = (timestamp: number) => {
        const diffMs = currentTime - timestamp;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'agora mesmo';
        if (diffMins < 60) return `há ${diffMins} min`;
        if (diffHours < 24) return `há ${diffHours}h`;
        if (diffDays < 7) return `há ${diffDays}d`;
        return new Date(timestamp).toLocaleDateString('pt-BR');
    };

    const formatTimeAMPM = (timestamp: number) => {
        const date = new Date(timestamp);
        const hours = date.getHours();
        const minutes = date.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours % 12 || 12;
        const displayMinutes = minutes.toString().padStart(2, '0');
        return `${displayHours}:${displayMinutes} ${ampm}`;
    };

    const getLastUpdateLabel = () => {
        if (!lastUploadTime) return 'Sem dados';
        const updateDate = new Date(lastUploadTime);
        const today = new Date();
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const isToday = updateDate.toDateString() === today.toDateString();
        const isYesterday = updateDate.toDateString() === yesterday.toDateString();
        if (isToday) return 'Hoje';
        if (isYesterday) return 'Ontem';
        const diffDays = Math.floor((today.getTime() - updateDate.getTime()) / (1000 * 60 * 60 * 24));
        if (diffDays < 7) return `Há ${diffDays} ${diffDays === 1 ? 'dia' : 'dias'}`;
        return updateDate.toLocaleDateString('pt-BR');
    };

    const getLastUpdateTime = () => {
        if (!lastUploadTime) return '--:--';
        return formatTimeAMPM(lastUploadTime);
    };

    // Document management
    const sortedDocuments = [...documents].sort((a, b) => {
        // Usar updatedAt se disponível, caso contrário usar uploadedAt
        const timeB = (b.updatedAt ? (b.updatedAt instanceof Date ? b.updatedAt.getTime() : typeof b.updatedAt === 'number' ? b.updatedAt : new Date(b.updatedAt as any).getTime()) : (b.uploadedAt instanceof Date ? b.uploadedAt.getTime() : typeof b.uploadedAt === 'number' ? b.uploadedAt : new Date(b.uploadedAt as any).getTime())) || 0;
        const timeA = (a.updatedAt ? (a.updatedAt instanceof Date ? a.updatedAt.getTime() : typeof a.updatedAt === 'number' ? a.updatedAt : new Date(a.updatedAt as any).getTime()) : (a.uploadedAt instanceof Date ? a.uploadedAt.getTime() : typeof a.uploadedAt === 'number' ? a.uploadedAt : new Date(a.uploadedAt as any).getTime())) || 0;
        return timeB - timeA;
    });
    const recentDocs = sortedDocuments.slice(0, 5);

    const getPublicDocumentsCount = () => {
        return documents.filter(doc => doc.public).length;
    };

    const getPrivateDocumentsCount = () => {
        return documents.filter(doc => !doc.public).length;
    };

    // Upload handler with Firebase
    const handleUpload = async (uploadData: { 
        nome: string; 
        arquivo: File; 
        ano: string; 
        visibilidade: string; 
        categoria: string 
    }) => {
        if (!user) {
            alert('Você precisa estar autenticado para fazer upload');
            return;
        }

        setIsUploadProcessing(true);
        try {
            const result = await upload(uploadData.arquivo, {
                name: uploadData.arquivo.name,
                type: 'pdf',
                category: categoryMap[uploadData.categoria] || uploadData.categoria,
                public: uploadData.visibilidade === 'Público',
                tags: [uploadData.ano],
            });

            if (result) {
                setUploadedDocumentName(uploadData.nome);
                setShowConfirmation(true);
                
                // O timestamp agora é sincronizado via Firestore quando o usuário faz alterações
                // na página de configurações, então não precisamos mais atualizar localStorage aqui

                // Registra no histórico de auditoria (inclui notificação protegida automaticamente)
                await auditService.addLog(
                    `📤 Arquivo enviado: ${uploadData.nome} (${categoryMap[uploadData.categoria] || uploadData.categoria})`
                );

                // Create notification for this upload (Firebase - histórico global)
                await createNotification({
                    title: 'Upload realizado',
                    message: `Documento "${uploadData.nome}" foi enviado com sucesso`,
                    type: 'success',
                    actionUrl: '/admin/transparency',
                });

                // Recarregar documentos para atualizar a lista com o novo documento
                await listDocuments();
            }
        } catch (err) {
            console.error('Upload error:', err);
            alert('Erro ao fazer upload');
        } finally {
            setIsUploadProcessing(false);
        }
    };

    // Modal handlers
    const openModal = () => setIsModalOpen(true);
    const closeModal = () => setIsModalOpen(false);

    // Edit document handlers
    const openEditModal = (document: any) => {
        setEditingDocument({
            id: document.id,
            nome: document.name,
            categoria: document.category,
            ano: document.tags?.[0] || new Date(document.uploadedAt).getFullYear().toString(),
            visibilidade: document.public ? 'Público' : 'Privado'
        });
        setIsEditModalOpen(true);
    };

    const closeEditModal = () => {
        setIsEditModalOpen(false);
        setEditingDocument(null);
    };

    // Função para visualizar documento
    const handleView = async (documentId: string, name: string) => {
        try {
            console.log('📄 [Dashboard] Buscando URL do documento:', documentId);
            const url = await getURL(documentId);
            
            if (!url) {
                alert("Este documento não possui um link de visualização disponível.");
                return;
            }
            
            setSelectedPdfUrl(url);
            setSelectedPdfTitle(name);
            setIsViewModalOpen(true);
            console.log('✅ [Dashboard] URL obtida com sucesso:', url);
        } catch (err) {
            console.error('❌ [Dashboard] Erro ao obter URL do documento:', err);
            alert("Erro ao carregar documento. Tente novamente.");
        }
    };

    const closeViewModal = () => {
        setIsViewModalOpen(false);
        setSelectedPdfUrl('');
        setSelectedPdfTitle('');
    };

    const handleEditDocument = async (updatedData: {
        id: string;
        nome: string;
        categoria: string;
        ano: string;
        visibilidade: string;
    }) => {
        setIsEditProcessing(true);
        try {
            await updateDoc(updatedData.id, {
                name: updatedData.nome,
                category: updatedData.categoria,
                tags: [updatedData.ano],
                public: updatedData.visibilidade === 'Público',
            });

            // Log audit
            await auditService.addLog(
                `✏️ Documento atualizado: ${updatedData.nome} (${updatedData.categoria})`
            );

            // Create notification
            await createNotification({
                title: 'Documento atualizado',
                message: `"${updatedData.nome}" foi atualizado com sucesso`,
                type: 'success',
                actionUrl: '/admin/transparency',
            });

            // Reload documents list to sync changes
            await listDocuments();

            closeEditModal();
        } catch (err) {
            console.error('Edit error:', err);
            alert('Erro ao atualizar documento');
        } finally {
            setIsEditProcessing(false);
        }
    };

    return (
        <div className="space-y-6 sm:space-y-8 animate-in fade-in duration-700">
            {/* Auth Error */}
            {authError && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div>
                        <h3 className="font-semibold text-red-700 dark:text-red-300">Erro de autenticação</h3>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{authError.message}</p>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex flex-col sm:flex-row md:flex-row md:justify-between md:items-center gap-4">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white truncate">
                        Visão Geral {user && user.name && `(${user.name})`}
                    </h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">
                        Bem-vindo ao painel administrativo.
                    </p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start md:items-center">
                    {/* Last Upload Indicator */}
                    {lastUploadTime && (
                        <div className="flex items-center gap-2 px-3 md:px-4 py-2 md:py-2.5 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800/50 rounded-lg">
                            <div className="relative flex items-center justify-center">
                                <Clock size={16} className="text-green-600 dark:text-green-400" />
                                <div className="absolute inset-0 rounded-full animate-pulse bg-green-400/20"></div>
                            </div>
                            <div className="flex flex-col">
                                <span className="text-xs font-semibold text-green-700 dark:text-green-300">Último upload</span>
                                <span className="text-xs text-green-600 dark:text-green-400">{getTimeAgo(lastUploadTime)}</span>
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <button 
                        onClick={openModal}
                        disabled={authLoading}
                        className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold flex items-center justify-center md:justify-start gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm md:text-base shrink-0"
                    >
                        <Plus size={20} /> 
                        <span className="hidden md:inline">Novo Documento</span>
                        <span className="md:hidden">Novo</span>
                    </button>
                </div>
            </div>

            {/* Grid de Métricas - Responsivo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 lg:gap-6">
                <MetricCard 
                    title="Documentos Públicos" 
                    value={getPublicDocumentsCount().toString()} 
                    icon={<FileText size={24} className="text-blue-600 dark:text-blue-400" />} 
                    trend="Ativos no site"
                />
                <MetricCard 
                    title="Documentos Privados" 
                    value={getPrivateDocumentsCount().toString()} 
                    icon={<FileText size={24} className="text-purple-600 dark:text-purple-400" />} 
                    trend="Restritos aos membros"
                />
                <MetricCard 
                    title="Última Atualização" 
                    value={getLastUpdateLabel()} 
                    icon={<Clock size={24} className="text-amber-600 dark:text-amber-400" />} 
                    trend={getLastUpdateTime()}
                />
            </div>

            {/* Tabela de Documentos Recentes - Resumo Operacional */}
            <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-colors duration-300">
                <div className="p-3 sm:p-6 border-b border-slate-100 dark:border-slate-800">
                    <h2 className="font-bold text-slate-800 dark:text-white text-base sm:text-lg">Documentos Recentes</h2>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">Últimos 5 documentos adicionados ao sistema</p>
                </div>

                {/* Versão Desktop - Tabela */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-wider">
                                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Nome do Arquivo</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold">Ano</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-center">Status</th>
                                <th className="px-4 sm:px-6 py-3 sm:py-4 font-semibold text-right">Ações</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                            {recentDocs.map((doc) => (
                                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 shrink-0">
                                                <FileText size={18} />
                                            </div>
                                            <span className="font-medium text-slate-700 dark:text-slate-200 truncate">{doc.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-slate-500 dark:text-slate-400 text-sm font-medium">
                                        {doc.tags?.[0] || doc.uploadedAt ? new Date(doc.uploadedAt).getFullYear() : '-'}
                                    </td>
                                    <td className="px-4 sm:px-6 py-4 text-center">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                                            doc.public 
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                        }`}>
                                            {doc.public ? 'Público' : 'Privado'}
                                        </span>
                                    </td>
                                    <td className="px-4 sm:px-6 py-4">
                                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                            <button
                                                onClick={() => handleView(doc.id, doc.name)}
                                                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg" 
                                                title="Visualizar">
                                                <Eye size={18} />
 
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(doc)}
                                                className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg" 
                                                title="Editar"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button 
                                                onClick={() => deleteDoc(doc.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" 
                                                title="Excluir"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Versão Mobile - Cards */}
                <div className="md:hidden">
                    {recentDocs.length > 0 ? (
                        <div className="space-y-2 p-3 sm:p-4">
                            {recentDocs.map((doc) => (
                                <div key={doc.id} className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors">
                                    <div className="flex items-start gap-3 mb-3">
                                        <div className="p-2 bg-red-50 dark:bg-red-900/20 rounded-lg text-red-600 dark:text-red-400 shrink-0">
                                            <FileText size={18} />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-semibold text-slate-900 dark:text-white text-sm truncate">{doc.name}</p>
                                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Ano: <span className="font-medium">{doc.uploadedAt ? new Date(doc.uploadedAt).getFullYear() : '-'}</span></p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3">
                                        <span className={`px-3 py-1 text-xs font-bold rounded-full uppercase ${
                                            doc.public 
                                                ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                                        }`}>
                                            {doc.public ? 'Público' : 'Privado'}
                                        </span>
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleView(doc.id, doc.name)}
                                                className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg cursor-pointer" 
                                                title="Visualizar"
                                            >
                                                <Eye size={16} />
                                            </button>
                                            <button 
                                                onClick={() => openEditModal(doc)}
                                                className="p-2 text-slate-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg cursor-pointer" 
                                                title="Editar"
                                            >
                                                <Edit2 size={16} />
                                            </button>
                                            <button 
                                                onClick={() => deleteDoc(doc.id)}
                                                className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition-colors hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg cursor-pointer" 
                                                title="Excluir"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="p-8 text-center">
                            <p className="text-slate-500 dark:text-slate-400">Nenhum documento encontrado</p>
                        </div>
                    )}
                </div>

                {/* Tabela Vazia */}
                {recentDocs.length === 0 && (
                    <div className="hidden md:flex p-8 justify-center">
                        <p className="text-slate-500 dark:text-slate-400">Nenhum documento encontrado</p>
                    </div>
                )}
            </div>

        <UploadModal isOpen={isModalOpen} onClose={closeModal} onUpload={handleUpload} />
        <UploadConfirmationModal 
            isOpen={showConfirmation} 
            documentName={uploadedDocumentName} 
            onClose={() => setShowConfirmation(false)}
            onCloseAll={() => {
                setShowConfirmation(false);
                setIsModalOpen(false);
            }}
            isLoading={isUploadProcessing}
        />
        <EditDocumentModal
            isOpen={isEditModalOpen}
            document={editingDocument}
            onClose={closeEditModal}
            onSave={handleEditDocument}
            isLoading={isEditProcessing}
        />

        <PDFModal 
            isOpen={isViewModalOpen}
            onClose={closeViewModal}
            pdfUrl={selectedPdfUrl}
            title={selectedPdfTitle}
        />
        </div>
    );
};

// Sub-componente MetricCard
const MetricCard = ({ title, value, icon, trend }: { title: string, value: string, icon: React.ReactNode, trend: string }) => (
    <div className="bg-white dark:bg-slate-900 p-4 sm:p-6 rounded-lg sm:rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm group hover:shadow-xl hover:shadow-blue-500/5 transition-all duration-300">
        <div className="flex justify-between items-start mb-3 sm:mb-4 gap-2">
            <div className="p-2 sm:p-3 bg-slate-50 dark:bg-slate-800 rounded-lg sm:rounded-2xl group-hover:scale-110 transition-transform shrink-0">
                <div className="scale-75 sm:scale-100 origin-top-left">
                    {icon}
                </div>
            </div>
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest text-right">{trend}</span>
        </div>
        <div>
            <h3 className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium">{title}</h3>
            <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
        </div>
    </div>
);

export default Dashboard;