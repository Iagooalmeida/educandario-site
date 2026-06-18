/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { Plus, AlertCircle } from 'lucide-react';
import UploadModal from '@/components/Admin/UploadModal';
import UploadConfirmationModal from '@/components/Admin/UploadConfirmationModal';
import OperationConfirmationModal from '@/components/Admin/OperationConfirmationModal';
import ConfirmDeleteModal from '@/components/Admin/ConfirmDeleteModal';
import EditDocumentModal from '@/components/Admin/EditDocumentModal';
import { useDocuments } from '@/hooks/useDocuments';
import type { DocumentMetadata } from '@/services/api/documents';
import { useNotifications } from '@/hooks/useNotifications';
import { auditService } from '@/services/auditService';
import { supabaseDocumentService } from '@/services/supabase/documents';
import PDFModal from '@/components/Admin/PDFModal';

// Componentes desacoplados com contratos originais preservados
import DocumentsFilter from '@/components/Admin/DocumentsFilter';
import DocumentsTable from '@/components/Admin/DocumentsTable';
import LastUploadIndicator from '@/components/Admin/LastUploadIndicator';
import PaginationControls from '@/components/Admin/PaginationControls';

const TransparencyAdmin: React.FC = () => {
    const { documents, loading, error, delete: deleteDoc, upload, update, list: listDocuments } = useDocuments();
    const { create: createNotification } = useNotifications();

    // UI States
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showConfirmation, setShowConfirmation] = useState(false);
    const [uploadedDocumentName, setUploadedDocumentName] = useState('');
    const [showEditConfirmation, setShowEditConfirmation] = useState(false);
    const [editedDocumentName, setEditedDocumentName] = useState('');
    const [isUploadProcessing, setIsUploadProcessing] = useState(false);
    const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);
    const [deleteModalOpen, setDeleteModalOpen] = useState(false);
    const [documentToDelete, setDocumentToDelete] = useState<string | null>(null);
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [documentToEdit, setDocumentToEdit] = useState<string | null>(null);
    
    // Paginação
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;
    
    const [deleteLoading, setDeleteLoading] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [selectedPdfUrl, setSelectedPdfUrl] = useState('');
    const [selectedPdfTitle, setSelectedPdfTitle] = useState('');
    
    const [lastUploadTime, setLastUploadTime] = useState<number | null>(null);
    const [currentTime, setCurrentTime] = useState(() => Date.now());

    const getLastUpdateTimestampMemo = useCallback(() => {
        if (!documents || documents.length === 0) return null;

        const sortedByUpdate = [...documents].sort((a, b) => {
            const timeB = (b.updatedAt ? (b.updatedAt instanceof Date ? b.updatedAt.getTime() : typeof b.updatedAt === 'number' ? b.updatedAt : new Date(b.updatedAt as string).getTime()) : (b.uploadedAt instanceof Date ? b.uploadedAt.getTime() : typeof b.uploadedAt === 'number' ? b.uploadedAt : new Date(b.uploadedAt as string).getTime())) || 0;
            const timeA = (a.updatedAt ? (a.updatedAt instanceof Date ? a.updatedAt.getTime() : typeof a.updatedAt === 'number' ? a.updatedAt : new Date(a.updatedAt as string).getTime()) : (a.uploadedAt instanceof Date ? a.uploadedAt.getTime() : typeof a.uploadedAt === 'number' ? a.uploadedAt : new Date(a.uploadedAt as string).getTime())) || 0;
            return timeB - timeA;
        });

        const newestDoc = sortedByUpdate[0];
        if (newestDoc?.updatedAt || newestDoc?.uploadedAt) {
            const timestamp = newestDoc.updatedAt || newestDoc.uploadedAt;
            return timestamp instanceof Date ? timestamp.getTime() : typeof timestamp === 'number' ? timestamp : new Date(timestamp as string).getTime();
        }
        return null;
    }, [documents]);

    useEffect(() => {
        listDocuments();
    }, [listDocuments]);

    useEffect(() => {
        const timestamp = getLastUpdateTimestampMemo();
        if (timestamp) setLastUploadTime(timestamp);
    }, [getLastUpdateTimestampMemo]);

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentTime(Date.now());
        }, 30000);
        return () => clearInterval(interval);
    }, []);
    
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
    
    const [filters, setFilters] = useState({
        busca: '',
        categoria: '',
        visibilidade: '',
        ano: ''
    });

    const categoryMap: Record<string, string> = {
        'ensa': 'Institucional',
        'social': 'Promoção Social',
        'cpfl': 'Convênio CPFL',
        'educacao': 'Educação'
    };

    const calculateNewestTimestamp = (docs: DocumentMetadata[]): number | null => {
        if (!docs || docs.length === 0) return null;
        let maxTime = 0;
        docs.forEach((doc) => {
            const timestamp = doc.updatedAt || doc.uploadedAt;
            let docTime = 0;
            if (timestamp instanceof Date) docTime = timestamp.getTime();
            else if (typeof timestamp === 'number') docTime = timestamp;
            else if (typeof timestamp === 'string') docTime = new Date(timestamp).getTime();
            if (docTime > maxTime) maxTime = docTime;
        });
        return maxTime > 0 ? maxTime : null;
    };

    const handleUpload = async (uploadData: { nome: string; arquivo: File; ano: string; visibilidade: string; categoria: string; descricao: string }) => {
        setIsUploadProcessing(true);
        try {
            await upload(uploadData.arquivo, {
                name: uploadData.nome,
                type: 'pdf',
                category: categoryMap[uploadData.categoria] || uploadData.categoria,
                public: uploadData.visibilidade === 'Público',
                tags: [uploadData.ano],
                description: uploadData.descricao
            });
            
            setUploadedDocumentName(uploadData.nome);
            setShowConfirmation(true);
            
            await auditService.addLog(`📤 Arquivo enviado: ${uploadData.nome} (${categoryMap[uploadData.categoria] || uploadData.categoria})`);
            
            const listResult = await supabaseDocumentService.listDocuments();
            const newestTimestamp = calculateNewestTimestamp(listResult.documents);
            
            if (newestTimestamp && newestTimestamp > 0) {
                setLastUploadTime(newestTimestamp);
                localStorage.setItem('documentsLatestTimestamp', newestTimestamp.toString());
                window.dispatchEvent(new CustomEvent('documentsUpdated', { detail: { timestamp: newestTimestamp } }));
            }
        } catch (err) {
            // Error handling
        } finally {
            setIsUploadProcessing(false);
        }
    };

    const handleView = (url: string, name: string) => {
        if (!url) {
            alert("Este documento não possui um link de visualização disponível.");
            return;
        }
        setSelectedPdfUrl(url);
        setSelectedPdfTitle(name);
        setIsViewModalOpen(true);
    };

    const openDeleteModal = (docId: string) => {
        setDocumentToDelete(docId);
        setDeleteModalOpen(true);
    };

    const handleConfirmDelete = async () => {
        if (documentToDelete === null) return;
        setDeleteLoading(true);
        setDeleteError(null);
        try {
            const docToDelete = documents.find(d => d.id === documentToDelete);
            const docName = docToDelete?.name || 'Documento desconhecido';
            await deleteDoc(documentToDelete);
            await auditService.addLog(`🗑️ Arquivo deletado: ${docName}`);
            setDeleteModalOpen(false);
            setDocumentToDelete(null);
        } catch (err) {
            let errorMessage = 'Erro ao deletar documento. Tente novamente.';
            if (err instanceof Error) {
                const errorStr = err.message.toLowerCase();
                if (errorStr.includes('permission denied') || errorStr.includes('row-level security') || errorStr.includes('rls') || errorStr.includes('unauthorized')) {
                    errorMessage = '🔒 Você não tem permissão para excluir este documento, pois ele foi enviado por outro administrador.';
                } else if (errorStr.includes('not found')) {
                    errorMessage = '❌ Documento não encontrado. Ele pode ter sido excluído recentemente.';
                } else {
                    errorMessage = err.message;
                }
            }
            setDeleteError(errorMessage);
        } finally {
            setDeleteLoading(false);
        }
    };

    const handleEdit = (docId: string) => {
        setDocumentToEdit(docId);
        setEditModalOpen(true);
    };

    const handleSaveEdit = async (updatedDocument: { id: string; nome?: string; title?: string; category?: string; categoria?: string; year?: string; ano?: string; visibilidade: string }) => {
        const docIdToUpdate = documentToEdit;
        if (docIdToUpdate === null) return;

        try {
            const categoryName = updatedDocument.categoria || updatedDocument.category || '';
            const finalName = updatedDocument.nome || updatedDocument.title || '';
            const finalAno = updatedDocument.ano || updatedDocument.year || '';
            
            await update(docIdToUpdate, {
                name: finalName,
                public: updatedDocument.visibilidade === 'Público',
                category: categoryName,
                tags: finalAno ? [finalAno] : []
            });
            
            setEditedDocumentName(finalName);
            setShowEditConfirmation(true);
            setEditModalOpen(false);
            setDocumentToEdit(null);

            const listResult = await supabaseDocumentService.listDocuments();
            const newestTimestamp = calculateNewestTimestamp(listResult.documents);
            
            if (newestTimestamp && newestTimestamp > 0) {
                setLastUploadTime(newestTimestamp);
                localStorage.setItem('documentsLatestTimestamp', newestTimestamp.toString());
                window.dispatchEvent(new CustomEvent('documentsUpdated', { detail: { timestamp: newestTimestamp } }));
            }

            await auditService.addLog(`✏️ Documento atualizado: ${finalName} (${categoryName})`);
            await createNotification({
                title: 'Documento atualizado',
                message: `"${finalName}" foi atualizado com sucesso`,
                type: 'success',
                actionUrl: '/admin/transparency',
            });
            localStorage.setItem('lastDocumentUpdate', Date.now().toString());
        } catch (err) {
            // Error handling
        }
    };

    const documentsConverted = useMemo(() => {
        return documents
            .map(doc => ({
                id: doc.id,
                nome: doc.name || '',
                title: doc.name || '',
                url: doc.fileUrl || '',
                categoria: doc.category || '',
                ano: doc.tags?.[0] || '',
                year: doc.tags?.[0] || '',
                visibilidade: doc.public ? 'Público' : 'Privado',
                updatedAt: doc.updatedAt || doc.uploadedAt || 0
            }))
            .sort((a, b) => (typeof b.updatedAt === 'number' ? b.updatedAt : 0) - (typeof a.updatedAt === 'number' ? a.updatedAt : 0));
    }, [documents]);

    const categorias = useMemo(() => [...new Set(documentsConverted.map(doc => doc.categoria))].filter(Boolean), [documentsConverted]);
    const anos = useMemo(() => [...new Set(documentsConverted.map(doc => doc.ano))].filter(Boolean).sort().reverse(), [documentsConverted]);
    const visibilidades = ['Público', 'Privado', 'Restrito'];

    interface ConvertibleToMillis {
    toMillis: () => number;
}

    const getTimeInMillis = (timestamp: number | Date | ConvertibleToMillis | unknown): number => {
        if (!timestamp) return 0;
        if (typeof timestamp === 'number') return timestamp;
        if (timestamp instanceof Date) return timestamp.getTime();
        if (typeof timestamp === 'object' && timestamp !== null && 'toMillis' in timestamp) {
            return (timestamp as ConvertibleToMillis).toMillis();
        }
        return 0;
    };

    const documentosFiltrados = useMemo(() => {
        const filtered = documentsConverted.filter(doc => {
            const buscaMatch = doc.nome.toLowerCase().includes(filters.busca.toLowerCase());
            const categoriaMatch = !filters.categoria || doc.categoria === filters.categoria;
            const visibilidadeMatch = !filters.visibilidade || doc.visibilidade === filters.visibilidade;
            const anoMatch = !filters.ano || doc.ano === filters.ano;
            return buscaMatch && categoriaMatch && visibilidadeMatch && anoMatch;
        });
        return filtered.sort((a, b) => getTimeInMillis(b.updatedAt) - getTimeInMillis(a.updatedAt));
    }, [documentsConverted, filters]);

    // Lógica Segura de Paginação (Corrige o cascading render ao resetar dinamicamente na renderização)
    const totalPages = Math.ceil(documentosFiltrados.length / itemsPerPage);
    const validCurrentPage = currentPage > totalPages ? 1 : currentPage;
    const startIndex = (validCurrentPage - 1) * itemsPerPage;
    const documentosPaginados = useMemo(() => {
        return documentosFiltrados.slice(startIndex, startIndex + itemsPerPage);
    }, [documentosFiltrados, startIndex]);

    const handlePreviousPage = () => setCurrentPage(prev => Math.max(prev - 1, 1));
    const handleNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages || 1));
    const handlePageInput = (page: string) => {
        const pageNum = parseInt(page) || 1;
        setCurrentPage(Math.max(1, Math.min(pageNum, totalPages || 1)));
    };

    const limparFiltros = () => setFilters({ busca: '', categoria: '', visibilidade: '', ano: '' });
    const filtrosAtivos = Object.values(filters).filter(f => f !== '').length;

    return (
        <div className="space-y-4 sm:space-y-6 p-4 md:p-6 lg:p-8">
            {error && (
                <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4 flex items-start gap-3">
                    <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="font-semibold text-red-700 dark:text-red-300">Erro ao carregar documentos</h3>
                        <p className="text-sm text-red-600 dark:text-red-400 mt-1">{error.message}</p>
                    </div>
                    <button onClick={() => window.location.reload()} className="text-sm font-semibold text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-200 transition-colors shrink-0">
                        Recarregar
                    </button>
                </div>
            )}

            <div className="flex flex-col sm:flex-row md:flex-row md:justify-between md:items-center gap-4 bg-white dark:bg-slate-900 p-4 md:p-6 lg:p-8 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <div className="min-w-0 flex-1">
                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Gestão de Transparência</h1>
                    <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium mt-1">Controle total sobre os documentos públicos da instituição.</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 md:gap-4 items-start md:items-center">
                    <LastUploadIndicator lastUploadTime={lastUploadTime} getTimeAgo={getTimeAgo} />
                    <button onClick={() => setIsModalOpen(true)} className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-500/20 text-sm md:text-base shrink-0 cursor-pointer">
                        <Plus size={20} /> Novo PDF
                    </button>
                </div>
            </div>

            <DocumentsFilter 
                filters={filters}
                setFilters={setFilters}
                showAdvancedFilter={showAdvancedFilter}
                setShowAdvancedFilter={setShowAdvancedFilter}
                categorias={categorias}
                anos={anos}
                visibilidades={visibilidades}
                filtrosAtivos={filtrosAtivos}
                limparFiltros={limparFiltros}
                totalFiltrados={documentosFiltrados.length}
                totalGeral={documentsConverted.length}
            />

            {loading ? (
                <div className="p-6 space-y-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="flex gap-4 animate-pulse">
                            <div className="w-10 h-10 bg-slate-100 dark:bg-slate-800 rounded-xl" />
                            <div className="flex-1 space-y-2 py-1">
                                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded w-1/3" />
                                <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded w-1/4" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <DocumentsTable 
                    documentosPaginados={documentosPaginados}
                    handleEdit={handleEdit}
                    handleView={handleView}
                    openDeleteModal={openDeleteModal}
                />
            )}

            <PaginationControls 
                startIndex={startIndex}
                totalFiltrados={documentosFiltrados.length}
                validCurrentPage={validCurrentPage}
                totalPages={totalPages}
                handlePreviousPage={handlePreviousPage}
                handleNextPage={handleNextPage}
                handlePageInput={handlePageInput}
            />

            <UploadModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onUpload={handleUpload} />
            
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
            
            <ConfirmDeleteModal
                isOpen={deleteModalOpen}
                documentName={documentsConverted.find(d => d.id === documentToDelete)?.nome || 'Documento'}
                onConfirm={handleConfirmDelete}
                onCancel={() => {
                    setDeleteModalOpen(false);
                    setDocumentToDelete(null);
                    setDeleteError(null);
                }}
                isDeleting={deleteLoading}
                error={deleteError}
            />

            <EditDocumentModal
                isOpen={editModalOpen}
                document={documentsConverted.find(d => d.id === documentToEdit) || null}
                onClose={() => {
                    setEditModalOpen(false);
                    setDocumentToEdit(null);
                }}
                onSave={handleSaveEdit}
                isLoading={loading}
            />

            <OperationConfirmationModal
                isOpen={showEditConfirmation}
                title="Documento Atualizado!"
                subtitle="As alterações foram salvas com sucesso."
                documentName={editedDocumentName}
                label="O documento foi atualizado como:"
                onClose={() => setShowEditConfirmation(false)}
                onCloseAll={() => setShowEditConfirmation(false)}
                isLoading={loading}
            />

            <PDFModal isOpen={isViewModalOpen} onClose={() => setIsViewModalOpen(false)} pdfUrl={selectedPdfUrl} title={selectedPdfTitle} />
        </div>
    );
};

export default TransparencyAdmin;