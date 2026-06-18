import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { FileText, Download, ShieldCheck, Search, FilterX, ChevronRight, Menu } from 'lucide-react';
import { firebaseDocumentService } from '@/services/firebase/documents';
import type { DocumentMetadata } from '@/services/api/documents';

interface DocumentItem {
    id: string;
    title: string;
    year: string;
    fileUrl: string;
}

interface Category {
    id: string;
    title: string;
    shortTitle: string; // Título curto para o menu lateral
    description: string;
    items: DocumentItem[];
}

const Transparency: React.FC = () => {
    const [activeTab, setActiveTab] = useState(0);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(true);

    // Definir estrutura base de categorias (com descrições)
    const baseCategories = useMemo(() => [
        {
            id: 'ensa',
            title: "Documentos – ENSA",
            shortTitle: "Institucional",
            description: "Estatutos, atas de eleição e documentos oficiais da entidade.",
        },
        {
            id: 'social',
            title: "Promoção Social",
            shortTitle: "Promoção Social",
            description: "Relatórios de atividades e demonstrativos financeiros da assistência.",
        },
        {
            id: 'cpfl',
            title: "Parceria CPFL",
            shortTitle: "Convênio CPFL",
            description: "Documentos e prestações de contas do projeto CPFL.",
        },
        {
            id: 'educacao',
            title: "Educação",
            shortTitle: "Educação",
            description: "Relatórios pedagógicos e convênios da área educacional.",
        }
    ] as Omit<Category, 'items'>[], []);

    // Inicializar com categorias base vazias
    const [categories, setCategories] = useState<Category[]>(
        baseCategories.map(cat => ({ ...cat, items: [] }))
    );
    const [lastUploadCheck, setLastUploadCheck] = useState<number | null>(null);

    // Memoizar a função de carregamento para evitar recriações desnecessárias
    const loadDocumentsFromFirestore = useCallback(async () => {
        try {
            setLoading(true);
            // Mapear IDs para nomes de categorias do Firestore
            const categoryMap: Record<string, string> = {
                'ensa': 'Institucional',
                'social': 'Promoção Social',
                'cpfl': 'Convênio CPFL',
                'educacao': 'Educação'
            };

            // Carregar apenas documentos públicos
            const result = await firebaseDocumentService.listDocuments({ public: true });
            
            // --- ONDE A MUDANÇA FOI FEITA ---
            // Ordena a lista bruta recebida do Firestore de forma decrescente com base no 'uploadedAt' ou 'updatedAt'
            const sortedDocuments = [...result.documents].sort((a: DocumentMetadata, b: DocumentMetadata) => {
                // Validação estrita para o documento A
                const timeA = a.uploadedAt && typeof a.uploadedAt === 'object' && 'toMillis' in a.uploadedAt
                    ? (a.uploadedAt as { toMillis: () => number }).toMillis()
                    : a.uploadedAt instanceof Date 
                        ? a.uploadedAt.getTime() 
                        : new Date((a.uploadedAt as unknown as string) || 0).getTime();

                // Validação estrita para o documento B
                const timeB = b.uploadedAt && typeof b.uploadedAt === 'object' && 'toMillis' in b.uploadedAt
                    ? (b.uploadedAt as { toMillis: () => number }).toMillis()
                    : b.uploadedAt instanceof Date 
                        ? b.uploadedAt.getTime() 
                        : new Date((b.uploadedAt as unknown as string) || 0).getTime();

                return timeB - timeA; // Inverte para decrescente (mais recente no topo)
            });

            // Agrupar documentos já ordenados por categoria
            const grouped: Record<string, DocumentItem[]> = {};
            
            sortedDocuments.forEach((doc: DocumentMetadata) => {
                const fireCat = doc.category || 'Geral';
                if (!grouped[fireCat]) {
                    grouped[fireCat] = [];
                }
                
                // Conversão segura da data para pegar o ano
                const rawDate = doc.uploadedAt;
                let parsedTime = 0;

                if (rawDate) {
                    if (typeof rawDate === 'object' && 'toMillis' in rawDate) {
                        parsedTime = (rawDate as { toMillis: () => number }).toMillis();
                    } else if (rawDate instanceof Date) {
                        parsedTime = rawDate.getTime();
                    } else {
                        parsedTime = new Date((rawDate as unknown as string) || '').getTime();
                    }
                }

const parsedDate = new Date(parsedTime);
const year = doc.tags?.[0] || (parsedTime !== 0 && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear().toString() : 'N/A');
                
                grouped[fireCat].push({
                    id: doc.id,
                    title: doc.name,
                    year: year,
                    fileUrl: doc.fileUrl || doc.url || ''
                });
            });
            // ---------------------------------

            // Combinar com estrutura base
            const updatedCategories = baseCategories.map(baseCat => ({
                ...baseCat,
                items: grouped[categoryMap[baseCat.id]] || []
            }));

            setCategories(updatedCategories);
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            // Erro ao carregar documentos
            // Manter categorias vazias em caso de erro
            setCategories(baseCategories.map(cat => ({ ...cat, items: [] })));
        } finally {
            setLoading(false);
        }
    }, [baseCategories]);

    // Carregar documentos ao montar
    useEffect(() => {
        loadDocumentsFromFirestore();
    }, [loadDocumentsFromFirestore]);

    // Monitorar novos uploads e edições via localStorage
    useEffect(() => {
        const checkForChanges = () => {
            const lastUpload = localStorage.getItem('lastDocumentUpload');
            const lastUpdate = localStorage.getItem('lastDocumentUpdate');
            
            const uploadTime = lastUpload ? parseInt(lastUpload) : null;
            const updateTime = lastUpdate ? parseInt(lastUpdate) : null;
            const latestChange = Math.max(uploadTime || 0, updateTime || 0);
            
            if (latestChange && (!lastUploadCheck || latestChange > lastUploadCheck)) {
                setLastUploadCheck(latestChange);
                // Recarregar documentos quando há um novo upload ou edição
                loadDocumentsFromFirestore();
            }
        };

        // Verificar imediatamente
        checkForChanges();

        // E verificar a cada 2 segundos também
        const interval = setInterval(checkForChanges, 2000);

        return () => clearInterval(interval);
    }, [lastUploadCheck, loadDocumentsFromFirestore]);

    const filteredItems = useMemo(() => {
        const currentCategory = categories[activeTab];
        if (!currentCategory) return [];
        return currentCategory.items.filter(doc =>
            doc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            doc.year.includes(searchTerm)
        );
    }, [activeTab, categories, searchTerm]);

    return (
        <main className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 transition-colors duration-300">
            {/* Cabeçalho */}
            <div className="bg-blue-900 px-6 py-16 text-white text-center md:text-left">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center gap-6">
                    <div className="p-4 bg-white/10 rounded-3xl backdrop-blur-sm">
                        <ShieldCheck size={40} className="text-orange-400" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight">Transparência</h1>
                        <p className="text-blue-200 text-lg">Prestação de contas e governança institucional.</p>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    
                    {/* MENU LATERAL (SIDEBAR) */}
                    <aside className="lg:w-72 shrink-0">
                        <div className="sticky top-28">
                            <div className="flex items-center gap-2 mb-4 px-4 text-slate-400 dark:text-slate-500">
                                <Menu size={16} />
                                <span className="text-xs font-black uppercase tracking-widest">Categorias</span>
                            </div>
                            <nav className="space-y-2 flex flex-row lg:flex-col overflow-x-auto lg:overflow-visible no-scrollbar pb-4 lg:pb-0 gap-2 lg:gap-2">
                                {categories.map((cat, idx) => (
                                    <button
                                        key={cat.id}
                                        onClick={() => { setActiveTab(idx); setSearchTerm(''); }}
                                        aria-expanded={activeTab === idx}
                                        aria-controls="documents-panel"
                                        className={`flex items-center justify-between px-5 py-4 rounded-2xl transition-all whitespace-nowrap lg:whitespace-normal text-left shrink-0 lg:shrink ${
                                            activeTab === idx 
                                            ? "bg-blue-900 text-white shadow-xl shadow-blue-900/20" 
                                            : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700"
                                        } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500`}
                                    >
                                        <span className="font-bold text-sm leading-tight">{cat.shortTitle}</span>
                                        <ChevronRight size={16} className={`hidden lg:block ${activeTab === idx ? "opacity-100" : "opacity-0"}`} />
                                    </button>
                                ))}
                            </nav>
                        </div>
                    </aside>

                    {/* CONTEÚDO PRINCIPAL */}
                    <div className="flex-1 space-y-6">
                        {/* Barra de Busca */}
                        <div className="bg-white dark:bg-slate-800 p-2 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
                            <div className="relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" size={20} />
                                <input 
                                    type="text"
                                    placeholder={`Buscar em ${categories[activeTab].shortTitle}...`}
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    className="w-full pl-12 pr-4 py-3 bg-slate-50 dark:bg-slate-900 border-none rounded-2xl focus:ring-2 focus:ring-blue-500 transition-all outline-none text-slate-700 dark:text-slate-200"
                                />
                            </div>
                        </div>

                        {/* Listagem de Documentos com scroll inteligente */}
                        <div id="documents-panel" className="bg-white dark:bg-slate-800 rounded-[2.5rem] border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden flex flex-col" role="region" aria-label={categories[activeTab].title}>
                            {/* Cabeçalho fixo */}
                            <div className="p-6 md:p-10 border-b border-slate-50 dark:border-slate-700 bg-white dark:bg-slate-800">
                                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">
                                    {categories[activeTab].title}
                                </h2>
                                <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">
                                    {categories[activeTab].description}
                                </p>
                            </div>

                            {/* Área com altura máxima e scroll automático */}
                            <div className="p-6 md:p-10 overflow-y-auto max-h-150 custom-scrollbar bg-slate-50/20 dark:bg-slate-900/30">
                                {loading ? (
                                    <div className="flex items-center justify-center py-20">
                                        <div className="text-center text-slate-500 dark:text-slate-400">
                                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                                            <p className="font-bold">Carregando documentos...</p>
                                        </div>
                                    </div>
                                ) : filteredItems.length > 0 ? (
                                    <div className="grid gap-3">
                                        {filteredItems.map((doc) => (
                                            <div
                                                key={doc.id}
                                                tabIndex={0}
                                                className="flex items-center justify-between p-4 md:p-6 rounded-3xl border border-slate-100 dark:border-slate-700 bg-white dark:bg-slate-800 hover:border-blue-400 dark:hover:border-blue-500 hover:shadow-lg transition-all group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className="p-3 bg-slate-50 dark:bg-slate-700 rounded-2xl text-slate-400 dark:text-slate-500 group-hover:bg-blue-600 group-hover:text-white transition-all shadow-sm">
                                                        <FileText size={24} />
                                                    </div>
                                                    <div>
                                                        <h3 className="font-bold text-slate-800 dark:text-white text-sm md:text-base">{doc.title}</h3>
                                                        <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 mt-1 uppercase tracking-widest bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded w-fit">
                                                            Exercício {doc.year}
                                                        </p>
                                                    </div>
                                                </div>
                                                <a 
                                                    href={doc.fileUrl} 
                                                    download 
                                                    className="flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-600 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                                >
                                                    <Download size={18} />
                                                    <span className="hidden sm:inline">BAIXAR</span>
                                                </a>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-20 text-center text-slate-400">
                                        <FilterX size={48} className="mb-4 opacity-20" />
                                        <p className="font-bold">Nenhum arquivo encontrado.</p>
                                        <button
                                            onClick={() => setSearchTerm('')}
                                            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-50 text-blue-700 font-bold text-xs tracking-wide hover:bg-blue-600 hover:text-white transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
                                        >
                                            Limpar filtros
                                        </button>
                                    </div>
                                )}
                            </div>

                            {/* Rodapé fixo */}
                            <div className="px-10 py-4 bg-slate-50 dark:bg-slate-900 border-t border-slate-100 dark:border-slate-700 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest" aria-live="polite">
                                {filteredItems.length} documento(s) encontrado(s) nesta categoria
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    );
};

export default Transparency;