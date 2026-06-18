import React from 'react';
import { FileText, Globe, Eye, Lock, Edit, Trash2 } from 'lucide-react';

interface LegacyDoc {
  id: string;
  nome: string;
  url: string;
  categoria: string;
  ano: string;
  visibilidade: string;
}

interface DocumentsTableProps {
  documentosPaginados: LegacyDoc[];
  handleEdit: (id: string) => void;
  handleView: (url: string, name: string) => void;
  openDeleteModal: (id: string) => void;
}

const DocumentsTable: React.FC<DocumentsTableProps> = ({
  documentosPaginados,
  handleEdit,
  handleView,
  openDeleteModal,
}) => {
  const renderVisibilidadeBadge = (visibilidade: string) => {
    const styles = {
      'Público': 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300',
      'Privado': 'bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-300',
      'Restrito': 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
    };

    const icons = {
      'Público': <Globe size={14} className="inline mr-1" />,
      'Privado': <Eye size={14} className="inline mr-1" />,
      'Restrito': <Lock size={14} className="inline mr-1" />
    };

    return (
      <span className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold ${styles[visibilidade as keyof typeof styles] || styles['Público']}`}>
        {icons[visibilidade as keyof typeof icons]}
        {visibilidade}
      </span>
    );
  };

  return (
    <>
      {/* Visualização em Tabela para Desktop */}
      <div className="hidden lg:block bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 text-xs uppercase tracking-widest">
              <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold">Arquivo</th>
              <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold">Categoria / Ano</th>
              <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold">Visibilidade</th>
              <th className="px-4 sm:px-8 py-4 sm:py-5 font-bold text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {documentosPaginados.length > 0 ? (
              documentosPaginados.map((doc) => (
                <tr key={doc.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group">
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <div className="flex items-center gap-3">
                      <FileText className="text-red-500 shrink-0" size={20} />
                      <span className="font-bold text-slate-700 dark:text-slate-200 truncate">{doc.nome}</span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <div className="flex flex-col gap-1">
                      <span className="text-xs font-bold text-blue-600 dark:text-blue-400 uppercase">
                        {doc.categoria || '—'}
                      </span>
                      <span className="text-sm text-slate-400 font-medium">
                        {doc.ano ? `${doc.ano}` : '—'}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    {renderVisibilidadeBadge(doc.visibilidade)}
                  </td>
                  <td className="px-4 sm:px-8 py-4 sm:py-5">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(doc.id)}
                        className="p-2 text-slate-400 hover:text-amber-500 transition-colors cursor-pointer" 
                        title="Editar"
                      >
                        <Edit size={18}/>
                      </button>
                      <button 
                        onClick={() => handleView(doc.url, doc.nome)}
                        className="p-2 text-slate-400 hover:text-blue-500 transition-colors cursor-pointer" 
                        title="Visualizar"
                      >
                        <Eye size={18}/>
                      </button>
                      <button 
                        onClick={() => openDeleteModal(doc.id)}
                        className="p-2 text-slate-400 hover:text-red-500 transition-colors cursor-pointer" 
                        title="Excluir"
                      >
                        <Trash2 size={18}/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-4 sm:px-8 py-12 text-center">
                  <div className="flex flex-col items-center gap-3">
                    <FileText size={40} className="text-slate-300 dark:text-slate-700" />
                    <p className="text-slate-500 dark:text-slate-400 font-semibold">Nenhum documento encontrado</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">Tente ajustar seus filtros</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Cards para Dispositivos Móveis */}
      <div className="lg:hidden space-y-3">
        {documentosPaginados.length > 0 ? (
          documentosPaginados.map((doc) => (
            <div key={doc.id} className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex items-start gap-3 mb-3">
                <FileText className="text-red-500 shrink-0 mt-1" size={20} />
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-slate-900 dark:text-white truncate text-sm md:text-base">{doc.nome}</h3>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <span className="text-xs md:text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-2 py-1 rounded">
                      {doc.categoria || '—'}
                    </span>
                    <span className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                      {doc.ano ? `${doc.ano}` : '—'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-slate-100 dark:border-slate-800 my-3"></div>

              <div className="flex flex-col gap-3">
                <div>{renderVisibilidadeBadge(doc.visibilidade)}</div>
                <div className="flex gap-2 justify-start">
                  <button 
                    onClick={() => handleEdit(doc.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    <Edit size={16}/> Editar
                  </button>
                  <button 
                    onClick={() => handleView(doc.url, doc.nome)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    <Eye size={16}/> Ver
                  </button>
                  <button 
                    onClick={() => openDeleteModal(doc.id)}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm font-semibold cursor-pointer"
                  >
                    <Trash2 size={16}/> Excluir
                  </button>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-8 text-center shadow-sm">
            <FileText size={40} className="text-slate-300 dark:text-slate-700 mx-auto mb-3" />
            <p className="text-slate-500 dark:text-slate-400 font-semibold mb-1">Nenhum documento encontrado</p>
            <p className="text-xs text-slate-400 dark:text-slate-500">Tente ajustar seus filtros</p>
          </div>
        )}
      </div>
    </>
  );
};

export default DocumentsTable;